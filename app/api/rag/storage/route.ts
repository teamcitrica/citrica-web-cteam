import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

// DELETE - Eliminar storage
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("id");

    if (!storageId) {
      return NextResponse.json({ error: "Storage ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("document_storages")
      .delete()
      .eq("id", storageId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting storage:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
