import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
 * GET - Descargar archivo original desde Supabase Storage
 */
export async function GET(request: Request) {
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

    console.log("📥 Descargando archivo:", fileId);

    // ================================================================
    // 1. OBTENER METADATA DEL ARCHIVO
    // ================================================================

    const { data: file, error: fetchError } = await supabase
      .from("storage_files")
      .select("file_url, file_name, file_type")
      .eq("id", fileId)
      .single();

    if (fetchError || !file) {
      console.error("Error fetching file:", fetchError);
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    if (!file.file_url) {
      return NextResponse.json(
        { error: "File URL not available" },
        { status: 404 }
      );
    }

    console.log("📄 Archivo encontrado:", file.file_name);

    // ================================================================
    // 2. EXTRAER PATH Y DESCARGAR DE SUPABASE STORAGE
    // ================================================================

    const filePath = extractPathFromUrl(file.file_url);

    if (!filePath) {
      console.error("No se pudo extraer path del file_url:", file.file_url);
      return NextResponse.json(
        { error: "Invalid file URL" },
        { status: 400 }
      );
    }

    console.log("🔹 Descargando de Supabase Storage:", filePath);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("rag-documents")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Error downloading file:", downloadError);
      return NextResponse.json(
        { error: "Error downloading file from storage" },
        { status: 500 }
      );
    }

    console.log("✅ Archivo descargado correctamente:", file.file_name);

    // ================================================================
    // 3. CONVERTIR BLOB A ARRAYBUFFER Y RETORNAR
    // ================================================================

    const arrayBuffer = await fileData.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": file.file_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.file_name)}"`,
        "Cache-Control": "no-cache",
      },
    });

  } catch (error: any) {
    console.error("❌ Error downloading file:", error);
    return NextResponse.json(
      { error: error.message || "Error downloading file" },
      { status: 500 }
    );
  }
}
