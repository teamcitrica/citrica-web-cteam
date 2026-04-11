import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteFile } from "@/lib/ai/gemini-service";

/**
 * Helper: Extrae el path del archivo desde la publicUrl de Supabase
 */
function extractPathFromUrl(url: string): string {
  try {
    const parts = url.split("/rag-documents/");
    return parts[1] || "";
  } catch (error) {
    console.error("Error extracting path from URL:", url, error);
    return "";
  }
}

// GET - Obtener todos los storages
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: storages, error } = await supabase
      .from("document_storages")
      .select(
        `
        *,
        files:storage_files(count)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calcular estadísticas
    const storagesWithStats = await Promise.all(
      storages.map(async (storage) => {
        const { data: files } = await supabase
          .from("storage_files")
          .select("file_size")
          .eq("storage_id", storage.id);

        const totalSize = files?.reduce((sum, file) => sum + file.file_size, 0) || 0;
        const fileCount = files?.length || 0;

        return {
          ...storage,
          fileCount,
          totalSize,
        };
      })
    );

    return NextResponse.json({ storages: storagesWithStats });
  } catch (error: any) {
    console.error("Error fetching storages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Crear nuevo storage
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data: storage, error } = await supabase
      .from("document_storages")
      .insert({
        name,
        description,
        status: "ready",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ storage }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating storage:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Eliminar storage y todos sus archivos
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("id");

    if (!storageId) {
      return NextResponse.json({ error: "Storage ID is required" }, { status: 400 });
    }

    console.log("🗑️ Eliminando storage:", storageId);

    // ================================================================
    // 1. OBTENER TODOS LOS ARCHIVOS DEL STORAGE
    // ================================================================

    const { data: files, error: filesError } = await supabase
      .from("storage_files")
      .select("*")
      .eq("storage_id", storageId);

    if (filesError) {
      console.error("Error fetching files:", filesError);
      // Continuar aunque falle la obtención de archivos
    }

    console.log(`📂 ${files?.length || 0} archivos encontrados para eliminar`);

    // ================================================================
    // 2. ELIMINAR CADA ARCHIVO DE GEMINI Y SUPABASE STORAGE
    // ================================================================

    if (files && files.length > 0) {
      // Procesar eliminaciones en paralelo para mejor performance
      const deletionPromises = files.map(async (file) => {
        const errors = [];

        // Eliminar de Gemini File API
        if (file.gemini_file_name) {
          try {
            console.log(`🔹 Eliminando de Gemini: ${file.gemini_file_name}`);
            await deleteFile(file.gemini_file_name);
            console.log(`✅ Eliminado de Gemini: ${file.file_name}`);
          } catch (error: any) {
            console.error(`⚠️ Error eliminando de Gemini (${file.file_name}):`, error.message);
            errors.push(`Gemini: ${error.message}`);
            // Continuar aunque falle
          }
        }

        // Eliminar de Supabase Storage
        if (file.file_url) {
          try {
            const filePath = extractPathFromUrl(file.file_url);
            if (filePath) {
              console.log(`🔹 Eliminando de Supabase Storage: ${filePath}`);
              const { error: storageError } = await supabase.storage
                .from("rag-documents")
                .remove([filePath]);

              if (storageError) {
                console.error(`⚠️ Error eliminando de Supabase Storage (${file.file_name}):`, storageError);
                errors.push(`Storage: ${storageError.message}`);
              } else {
                console.log(`✅ Eliminado de Supabase Storage: ${file.file_name}`);
              }
            }
          } catch (error: any) {
            console.error(`⚠️ Error eliminando de Supabase Storage (${file.file_name}):`, error);
            errors.push(`Storage: ${error.message}`);
            // Continuar aunque falle
          }
        }

        return { fileName: file.file_name, errors };
      });

      // Esperar a que todas las eliminaciones terminen
      const results = await Promise.allSettled(deletionPromises);

      // Log de resultados
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const { fileName, errors } = result.value;
          if (errors.length > 0) {
            console.warn(`⚠️ ${fileName}: ${errors.join(", ")}`);
          }
        } else {
          console.error(`❌ Error procesando archivo:`, result.reason);
        }
      });
    }

    // ================================================================
    // 3. ELIMINAR STORAGE (CASCADE ELIMINA REGISTROS DE storage_files)
    // ================================================================

    const { error } = await supabase
      .from("document_storages")
      .delete()
      .eq("id", storageId);

    if (error) throw error;

    console.log("✅ Storage eliminado completamente");

    return NextResponse.json({
      success: true,
      filesDeleted: files?.length || 0,
    });
  } catch (error: any) {
    console.error("❌ Error deleting storage:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
