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
import { validateRagFile, prepareForIndexing } from "@/lib/ai/rag-file-support";

// El poll de indexación puede tardar hasta 2 minutos
export const maxDuration = 300;

/**
 * POST - Subir documento al RAG
 * Flujo:
 * 1. Guardar archivo en Supabase Storage (respaldo, permite reindexar)
 * 2. Registrar fila en storage_files (PROCESSING) — antes de Gemini, así
 *    un fallo de indexación nunca deja archivos huérfanos en el bucket
 * 3. Indexar en el File Search store del storage (embeddings por Gemini)
 * 4. Actualizar fila con el resultado
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Leer el form ANTES del try: el catch necesita storageId, y el body
  // solo puede consumirse una vez
  let storageId: string | null = null;
  let file: File | null = null;
  try {
    const formData = await request.formData();
    storageId = formData.get("storageId") as string;
    file = formData.get("file") as File;
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  if (!storageId || !file) {
    return NextResponse.json(
      { error: "Storage ID and file are required" },
      { status: 400 }
    );
  }

  // Validación espejo de la del cliente (formato + tamaño)
  const validationError = validateRagFile(file.name, file.size);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  let fileRecordId: string | null = null;

  try {
    console.log("📦 Processing file:", file.name, "for storage:", storageId);

    const apiKey = await getGeminiApiKey(supabase);
    if (!apiKey) {
      return NextResponse.json(
        { error: "No hay API key de Gemini configurada. Configura una en /admin/ia/config" },
        { status: 400 }
      );
    }

    // Actualizar estado del storage a "processing"
    await supabase
      .from("document_storages")
      .update({ status: "processing" })
      .eq("id", storageId);

    // ================================================================
    // 1. GUARDAR ARCHIVO EN SUPABASE STORAGE (respaldo)
    // ================================================================

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const bucketPath = `${storageId}/${Date.now()}_${file.name}`;
    const mimeType = resolveMimeType(file.name, file.type);

    console.log("💾 Guardando archivo en Supabase Storage...");
    const { error: uploadError } = await supabase.storage
      .from("rag-documents")
      .upload(bucketPath, fileBuffer, {
        contentType: mimeType,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Error uploading to Supabase Storage:", uploadError);
      throw new Error(`Error guardando archivo: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("rag-documents").getPublicUrl(bucketPath);

    console.log("✅ Archivo guardado en Supabase:", publicUrl);

    // ================================================================
    // 2. ASEGURAR FILE SEARCH STORE REAL
    // ================================================================

    const { data: storageData } = await supabase
      .from("document_storages")
      .select("gemini_vector_store_id, name")
      .eq("id", storageId)
      .single();

    let storeName = storageData?.gemini_vector_store_id;

    if (!isRealStoreName(storeName)) {
      storeName = await createFileSearchStore(apiKey, storageData?.name || "Unnamed Storage");
      await supabase
        .from("document_storages")
        .update({ gemini_vector_store_id: storeName })
        .eq("id", storageId);
    }

    // ================================================================
    // 3. REGISTRAR FILA ANTES DE INDEXAR (evita huérfanos en bucket)
    // ================================================================

    const estimatedTokens = Math.ceil(file.size / 4); // estimación; File Search no reporta tokens exactos
    const estimatedCost = (estimatedTokens / 1_000_000) * FILE_SEARCH_INDEXING_PER_1M;

    const { data: fileRecord, error: fileError } = await supabase
      .from("storage_files")
      .insert({
        storage_id: storageId,
        file_name: file.name,
        file_size: file.size,
        file_type: mimeType,
        file_url: publicUrl,
        gemini_file_state: "PROCESSING",
        processed: false,
        tokens_used: estimatedTokens,
        processing_cost_usd: estimatedCost,
      })
      .select()
      .single();

    if (fileError) {
      console.error("Error creating file record:", fileError);
      throw fileError;
    }
    fileRecordId = fileRecord.id;

    // ================================================================
    // 4. INDEXAR EN FILE SEARCH (chunking + embeddings por Gemini)
    // Excel se convierte a texto CSV por hoja; el original queda en el bucket
    // ================================================================

    const indexable = await prepareForIndexing(fileBuffer, file.name, mimeType);

    const { documentName, state } = await uploadToFileSearchStore(apiKey, {
      storeName: storeName as string,
      buffer: indexable.buffer,
      displayName: indexable.displayName,
      mimeType: indexable.mimeType,
    });

    await supabase
      .from("storage_files")
      .update({
        gemini_document_name: documentName,
        gemini_file_state: state,
        processed: state === "ACTIVE",
        error_message: null,
      })
      .eq("id", fileRecord.id);

    // Actualizar contadores del storage
    await supabase.rpc("increment_storage_usage", {
      p_storage_id: storageId,
      p_tokens: estimatedTokens,
      p_cost: estimatedCost,
    });

    await supabase
      .from("document_storages")
      .update({ status: "ready" })
      .eq("id", storageId);

    console.log("✅ Upload completado exitosamente");

    return NextResponse.json({
      success: true,
      file: { ...fileRecord, gemini_document_name: documentName, gemini_file_state: state },
      vectorStoreId: storeName,
      tokensUsed: estimatedTokens,
      estimatedCost,
    });
  } catch (error: any) {
    console.error("❌ Error uploading document:", error);

    // Marcar el archivo como FAILED (si alcanzó a registrarse) y el storage en error
    try {
      if (fileRecordId) {
        await supabase
          .from("storage_files")
          .update({
            gemini_file_state: "FAILED",
            processed: false,
            error_message: friendlyAIError(error),
          })
          .eq("id", fileRecordId);
      }
      await supabase
        .from("document_storages")
        .update({ status: "error" })
        .eq("id", storageId);
    } catch (e) {
      console.error("Error updating storage status:", e);
    }

    return NextResponse.json(
      { error: error.message || "Error processing document" },
      { status: 500 }
    );
  }
}
