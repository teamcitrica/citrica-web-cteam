import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createFileSearchStore,
  uploadToFileSearchStore,
  isRealStoreName,
  resolveMimeType,
  friendlyAIError,
  FILE_SEARCH_INDEXING_PER_1M,
} from "@/lib/ai/gemini-service";
import { getGeminiApiKey } from "@/lib/ai/gemini-api-key";
import { prepareForIndexing } from "@/lib/ai/rag-file-support";

// Reindexar varios archivos puede tardar varios minutos
export const maxDuration = 300;

/**
 * POST - Reprocesar un storage: reindexa en File Search todos los archivos
 * pendientes usando los originales guardados en el bucket rag-documents.
 * Cura:
 * - Archivos legacy del File API (URIs caducados a las 48h) → reindexados
 * - Archivos huérfanos en bucket sin fila en storage_files → fila creada + indexado
 * - Filas sin respaldo en bucket → marcadas FAILED (requieren re-subida manual)
 *
 * Body: { storageId: string, force?: boolean }  (force reindexa también los ACTIVE)
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  let storageId: string | null = null;
  let force = false;
  try {
    const body = await request.json();
    storageId = body.storageId;
    force = !!body.force;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!storageId) {
    return NextResponse.json({ error: "Storage ID is required" }, { status: 400 });
  }

  const results: { fileName: string; state: string; error?: string }[] = [];
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const apiKey = await getGeminiApiKey(supabase);
    if (!apiKey) {
      return NextResponse.json(
        { error: "No hay API key de Gemini configurada. Configura una en /admin/ia/config" },
        { status: 400 }
      );
    }

    const { data: storage, error: storageError } = await supabase
      .from("document_storages")
      .select("id, name, gemini_vector_store_id")
      .eq("id", storageId)
      .single();

    if (storageError || !storage) {
      return NextResponse.json({ error: "Storage not found" }, { status: 404 });
    }

    console.log(`🔄 Reprocesando storage "${storage.name}"...`);
    await supabase.from("document_storages").update({ status: "processing" }).eq("id", storageId);

    // ================================================================
    // 1. ASEGURAR FILE SEARCH STORE REAL
    // ================================================================

    let storeName = storage.gemini_vector_store_id;
    if (!isRealStoreName(storeName)) {
      storeName = await createFileSearchStore(apiKey, storage.name);
      await supabase
        .from("document_storages")
        .update({ gemini_vector_store_id: storeName })
        .eq("id", storageId);
    }

    // ================================================================
    // 2. INVENTARIO: OBJETOS DEL BUCKET + FILAS EN DB
    // ================================================================

    const { data: bucketObjects, error: listError } = await supabase.storage
      .from("rag-documents")
      .list(storageId);

    if (listError) {
      console.error("Error listando bucket:", listError);
    }

    const { data: dbFiles } = await supabase
      .from("storage_files")
      .select("*")
      .eq("storage_id", storageId);

    const rows = dbFiles || [];
    const objects = (bucketObjects || []).filter((o) => o.name && !o.name.startsWith("."));

    // Objetos del bucket sin fila en DB → crear fila (caso "Conecta con Marcas")
    for (const obj of objects) {
      const bucketPath = `${storageId}/${obj.name}`;
      const matched = rows.find(
        (r) => (r.file_url && r.file_url.includes(obj.name)) || r.file_name === obj.name.replace(/^\d+_/, "")
      );

      if (!matched) {
        const originalName = obj.name.replace(/^\d+_/, "");
        const {
          data: { publicUrl },
        } = supabase.storage.from("rag-documents").getPublicUrl(bucketPath);

        const { data: newRow, error: insertError } = await supabase
          .from("storage_files")
          .insert({
            storage_id: storageId,
            file_name: originalName,
            file_size: (obj.metadata as any)?.size || 0,
            file_type: resolveMimeType(originalName, (obj.metadata as any)?.mimetype),
            file_url: publicUrl,
            gemini_file_state: "PENDING",
            processed: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error registrando huérfano ${originalName}:`, insertError);
        } else if (newRow) {
          console.log(`🩹 Archivo huérfano registrado: ${originalName}`);
          rows.push(newRow);
        }
      }
    }

    // ================================================================
    // 3. REINDEXAR CADA FILA PENDIENTE (secuencial)
    // ================================================================

    for (const row of rows) {
      const needsIndexing =
        force || row.gemini_file_state !== "ACTIVE" || !row.gemini_document_name;

      if (!needsIndexing) {
        skipped++;
        results.push({ fileName: row.file_name, state: "ACTIVE (skip)" });
        continue;
      }

      // Localizar el respaldo en el bucket
      const bucketObj = objects.find(
        (o) =>
          (row.file_url && row.file_url.includes(o.name)) ||
          o.name.replace(/^\d+_/, "") === row.file_name
      );

      if (!bucketObj) {
        // Sin respaldo (caso "lista-utiles.txt" / "Captación") → FAILED, re-subida manual
        await supabase
          .from("storage_files")
          .update({
            gemini_file_state: "FAILED",
            processed: false,
            error_message: "Sin respaldo en el bucket; vuelve a subir el archivo",
          })
          .eq("id", row.id);
        failed++;
        results.push({
          fileName: row.file_name,
          state: "FAILED",
          error: "Sin respaldo en bucket; vuelve a subir el archivo",
        });
        continue;
      }

      try {
        const bucketPath = `${storageId}/${bucketObj.name}`;
        const { data: blob, error: downloadError } = await supabase.storage
          .from("rag-documents")
          .download(bucketPath);

        if (downloadError || !blob) {
          throw new Error(downloadError?.message || "No se pudo descargar del bucket");
        }

        const buffer = Buffer.from(await blob.arrayBuffer());
        const mimeType = resolveMimeType(row.file_name, row.file_type);
        // Excel se convierte a texto CSV por hoja antes de indexar
        const indexable = await prepareForIndexing(buffer, row.file_name, mimeType);

        await supabase
          .from("storage_files")
          .update({ gemini_file_state: "PROCESSING" })
          .eq("id", row.id);

        const { documentName, state } = await uploadToFileSearchStore(apiKey, {
          storeName: storeName as string,
          buffer: indexable.buffer,
          displayName: indexable.displayName,
          mimeType: indexable.mimeType,
        });

        const estimatedTokens = Math.ceil(buffer.length / 4);
        const estimatedCost = (estimatedTokens / 1_000_000) * FILE_SEARCH_INDEXING_PER_1M;

        await supabase
          .from("storage_files")
          .update({
            gemini_document_name: documentName,
            gemini_file_state: state,
            processed: state === "ACTIVE",
            tokens_used: estimatedTokens,
            processing_cost_usd: estimatedCost,
            error_message: null,
          })
          .eq("id", row.id);

        await supabase.rpc("increment_storage_usage", {
          p_storage_id: storageId,
          p_tokens: estimatedTokens,
          p_cost: estimatedCost,
        });

        processed++;
        results.push({ fileName: row.file_name, state });
      } catch (error: any) {
        console.error(`❌ Error reindexando ${row.file_name}:`, error.message);
        await supabase
          .from("storage_files")
          .update({
            gemini_file_state: "FAILED",
            processed: false,
            error_message: friendlyAIError(error),
          })
          .eq("id", row.id);
        failed++;
        results.push({ fileName: row.file_name, state: "FAILED", error: error.message });
      }
    }

    // ================================================================
    // 4. ESTADO FINAL DEL STORAGE
    // ================================================================

    const { data: activeFiles } = await supabase
      .from("storage_files")
      .select("id")
      .eq("storage_id", storageId)
      .eq("gemini_file_state", "ACTIVE");

    const finalStatus = (activeFiles?.length || 0) > 0 ? "ready" : "error";
    await supabase.from("document_storages").update({ status: finalStatus }).eq("id", storageId);

    console.log(`✅ Reproceso completado: ${processed} indexados, ${skipped} sin cambios, ${failed} fallidos`);

    return NextResponse.json({
      success: failed === 0,
      processed,
      skipped,
      failed,
      files: results,
    });
  } catch (error: any) {
    console.error("❌ Error reprocesando storage:", error);
    await supabase.from("document_storages").update({ status: "error" }).eq("id", storageId);
    return NextResponse.json(
      { error: error.message || "Error reprocessing storage", processed, skipped, failed, files: results },
      { status: 500 }
    );
  }
}
