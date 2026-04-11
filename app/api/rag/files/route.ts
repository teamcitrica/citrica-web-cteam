import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteFile } from "@/lib/ai/gemini-service";

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
    // 2. ELIMINAR DE GEMINI FILE API
    // ================================================================

    if (file.gemini_file_name) {
      try {
        console.log("🔹 Eliminando de Gemini File API:", file.gemini_file_name);
        await deleteFile(file.gemini_file_name);
        console.log("✅ Eliminado de Gemini File API");
      } catch (geminiError: any) {
        console.error("⚠️ Error eliminando de Gemini:", geminiError.message);
        // Continuar aunque falle (puede que el archivo ya no exista en Gemini)
      }
    } else {
      console.log("⚠️ No hay gemini_file_name, saltando eliminación de Gemini");
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
