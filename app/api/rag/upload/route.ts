import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  uploadFileToGemini,
  createVectorStore,
} from "@/lib/ai/gemini-service";

/**
 * POST - Subir archivo a Gemini File API y Supabase Storage
 * Flujo:
 * 1. Guardar archivo en Supabase Storage (para recuperación futura)
 * 2. Subir archivo a Gemini File API (para RAG)
 * 3. Crear/asociar Vector Store si es necesario
 * 4. Guardar metadata en base de datos
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const formData = await request.formData();

    const storageId = formData.get("storageId") as string;
    const file = formData.get("file") as File;

    if (!storageId || !file) {
      return NextResponse.json(
        { error: "Storage ID and file are required" },
        { status: 400 }
      );
    }

    console.log("📦 Processing file:", file.name, "for storage:", storageId);

    // Actualizar estado del storage a "processing"
    await supabase
      .from("document_storages")
      .update({ status: "processing" })
      .eq("id", storageId);

    // ================================================================
    // 1. GUARDAR ARCHIVO EN SUPABASE STORAGE (para recuperación)
    // ================================================================

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${storageId}/${Date.now()}_${file.name}`;

    console.log("💾 Guardando archivo en Supabase Storage...");
    const { error: uploadError } = await supabase.storage
      .from("rag-documents")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Error uploading to Supabase Storage:", uploadError);
      throw new Error(`Error guardando archivo: ${uploadError.message}`);
    }

    // Obtener URL pública del archivo
    const {
      data: { publicUrl },
    } = supabase.storage.from("rag-documents").getPublicUrl(fileName);

    console.log("✅ Archivo guardado en Supabase:", publicUrl);

    // ================================================================
    // 2. VERIFICAR/CREAR VECTOR STORE EN GEMINI
    // ================================================================

    const { data: storageData } = await supabase
      .from("document_storages")
      .select("gemini_vector_store_id, name")
      .eq("id", storageId)
      .single();

    let vectorStoreId = storageData?.gemini_vector_store_id;

    // Si no existe Vector Store, crearlo
    if (!vectorStoreId) {
      console.log("🗄️ Creando nuevo Vector Store para este storage...");
      vectorStoreId = await createVectorStore(storageData?.name || "Unnamed Storage");

      // Guardar Vector Store ID en la base de datos
      await supabase
        .from("document_storages")
        .update({ gemini_vector_store_id: vectorStoreId })
        .eq("id", storageId);

      console.log("✅ Vector Store creado:", vectorStoreId);
    }

    // ================================================================
    // 3. SUBIR ARCHIVO A GEMINI FILE API
    // ================================================================

    console.log("📤 Subiendo archivo a Gemini File API...");
    const geminiFile = await uploadFileToGemini(
      fileBuffer,
      file.type || "text/plain",
      file.name
    );

    console.log("✅ Archivo subido a Gemini:", geminiFile.uri);

    // ================================================================
    // 4. GUARDAR METADATA EN BASE DE DATOS
    // ================================================================

    // Calcular tokens usados (aproximación basada en tamaño)
    const estimatedTokens = Math.ceil(parseInt(geminiFile.sizeBytes) / 4);
    const estimatedCost = estimatedTokens * 0.00001; // Costo aproximado

    // Crear registro del archivo
    const { data: fileRecord, error: fileError } = await supabase
      .from("storage_files")
      .insert({
        storage_id: storageId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: publicUrl,
        gemini_file_uri: geminiFile.uri,
        gemini_file_name: geminiFile.name,
        gemini_file_state: geminiFile.state,
        processed: geminiFile.state === "ACTIVE",
        tokens_used: estimatedTokens,
        processing_cost_usd: estimatedCost,
      })
      .select()
      .single();

    if (fileError) {
      console.error("Error creating file record:", fileError);
      throw fileError;
    }

    console.log("✅ Registro de archivo creado:", fileRecord.id);

    // Actualizar contadores del storage
    await supabase.rpc("increment_storage_usage", {
      p_storage_id: storageId,
      p_tokens: estimatedTokens,
      p_cost: estimatedCost,
    });

    // Actualizar estado del storage a "ready"
    await supabase
      .from("document_storages")
      .update({ status: "ready" })
      .eq("id", storageId);

    console.log("✅ Upload completado exitosamente");

    return NextResponse.json({
      success: true,
      file: fileRecord,
      geminiFile: {
        uri: geminiFile.uri,
        name: geminiFile.name,
        state: geminiFile.state,
      },
      vectorStoreId,
      tokensUsed: estimatedTokens,
      estimatedCost,
    });
  } catch (error: any) {
    console.error("❌ Error uploading document:", error);

    // Si hay error, actualizar estado del storage a "error"
    try {
      const formData = await request.formData();
      const storageId = formData.get("storageId") as string;

      if (storageId) {
        const supabase = createRouteHandlerClient({ cookies });
        await supabase
          .from("document_storages")
          .update({ status: "error" })
          .eq("id", storageId);
      }
    } catch (e) {
      console.error("Error updating storage status:", e);
    }

    return NextResponse.json(
      { error: error.message || "Error processing document" },
      { status: 500 }
    );
  }
}
