import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteFileSearchDocument } from "@/lib/ai/gemini-service";
import { getGeminiApiKey } from "@/lib/ai/gemini-api-key";

/**
 * Helper: Extrae el path del archivo desde la publicUrl de Supabase
 */
function extractPathFromUrl(url: string): string {
  try {
    // URL format: https://{project}.supabase.co/storage/v1/object/public/rag-documents/{path}
    const parts = url.split("/rag-documents/");
    return parts[1] || "";
  } catch (error) {
    console.error("Error extracting path from URL:", url, error);
    return "";
  }
}

/**
 * GET - Obtener lista de archivos de un storage
 */
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId");

    if (!storageId) {
      return NextResponse.json(
        { error: "Storage ID is required" },
        { status: 400 }
      );
    }

    console.log("📂 Obteniendo archivos del storage:", storageId);

    const { data: files, error } = await supabase
      .from("storage_files")
      .select("*")
      .eq("storage_id", storageId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching files:", error);
      throw error;
    }

    console.log(`✅ ${files?.length || 0} archivos encontrados`);

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("❌ Error fetching files:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching files" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar archivo individual
 * Elimina de:
 * 1. Gemini File API
 * 2. Supabase Storage
 * 3. Database (storage_files)
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    console.log("🗑️ Eliminando archivo:", fileId);

    // ================================================================
    // 1. OBTENER METADATA DEL ARCHIVO
    // ================================================================

    const { data: file, error: fetchError } = await supabase
      .from("storage_files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fetchError || !file) {
      console.error("Error fetching file:", fetchError);
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    console.log("📄 Archivo encontrado:", file.file_name);

    // ================================================================
    // 2. ELIMINAR DEL FILE SEARCH STORE
    // ================================================================
    // Filas legacy (solo gemini_file_name, del File API de 48h) se saltan:
    // esos archivos caducaron en Gemini hace tiempo

    if (file.gemini_document_name) {
      try {
        const apiKey = await getGeminiApiKey(supabase);
        if (apiKey) {
          console.log("🔹 Eliminando del File Search store:", file.gemini_document_name);
          await deleteFileSearchDocument(apiKey, file.gemini_document_name);
        }
      } catch (geminiError: any) {
        console.error("⚠️ Error eliminando de Gemini:", geminiError.message);
        // Continuar aunque falle (puede que el documento ya no exista)
      }
    } else {
      console.log("⚠️ Sin gemini_document_name (archivo legacy), saltando eliminación de Gemini");
    }

    // ================================================================
    // 3. ELIMINAR DE SUPABASE STORAGE
    // ================================================================

    if (file.file_url) {
      try {
        const filePath = extractPathFromUrl(file.file_url);

        if (filePath) {
          console.log("🔹 Eliminando de Supabase Storage:", filePath);

          const { error: storageError } = await supabase.storage
            .from("rag-documents")
            .remove([filePath]);

          if (storageError) {
            console.error("⚠️ Error eliminando de Supabase Storage:", storageError);
            // Continuar aunque falle
          } else {
            console.log("✅ Eliminado de Supabase Storage");
          }
        } else {
          console.log("⚠️ No se pudo extraer path del file_url");
        }
      } catch (storageError: any) {
        console.error("⚠️ Error eliminando de Supabase Storage:", storageError);
        // Continuar aunque falle
      }
    } else {
      console.log("⚠️ No hay file_url, saltando eliminación de Supabase Storage");
    }

    // ================================================================
    // 4. ELIMINAR REGISTRO DE BASE DE DATOS
    // ================================================================

    const { error: deleteError } = await supabase
      .from("storage_files")
      .delete()
      .eq("id", fileId);

    if (deleteError) {
      console.error("Error deleting file record:", deleteError);
      throw deleteError;
    }

    console.log("✅ Archivo eliminado completamente:", file.file_name);

    return NextResponse.json({
      success: true,
      message: `Archivo "${file.file_name}" eliminado correctamente`,
    });

  } catch (error: any) {
    console.error("❌ Error deleting file:", error);
    return NextResponse.json(
      { error: error.message || "Error deleting file" },
      { status: 500 }
    );
  }
}
