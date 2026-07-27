import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET - Obtener historial de conversaciones por storage
 */
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId");

    if (!storageId) {
      return NextResponse.json({ error: "storageId is required" }, { status: 400 });
    }

    console.log("📜 Obteniendo historial para storage:", storageId);

    const { data: conversations, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("storage_id", storageId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error obteniendo historial:", error);
      throw error;
    }

    console.log(`✅ ${conversations?.length || 0} conversaciones encontradas`);

    // Convertir conversaciones a formato de mensajes
    const messages = conversations?.flatMap((conv) => [
      {
        id: `${conv.id}-user`,
        content: conv.user_message,
        role: "user" as const,
        timestamp: new Date(conv.created_at),
      },
      {
        id: `${conv.id}-assistant`,
        content: conv.assistant_response,
        role: "assistant" as const,
        timestamp: new Date(conv.created_at),
        sources: conv.sources_used || [],
        usage: {
          promptTokens: conv.prompt_tokens,
          completionTokens: conv.completion_tokens,
          totalTokens: conv.total_tokens,
          estimatedCost: conv.cost_usd,
        },
      },
    ]) || [];

    return NextResponse.json({
      messages,
      count: conversations?.length || 0,
    });
  } catch (error: any) {
    console.error("❌ Error fetching chat history:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar historial de conversaciones por storage
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId");

    if (!storageId) {
      return NextResponse.json({ error: "storageId is required" }, { status: 400 });
    }

    console.log("🗑️ Eliminando historial para storage:", storageId);

    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("storage_id", storageId);

    if (error) {
      console.error("Error eliminando historial:", error);
      throw error;
    }

    console.log(`✅ Historial eliminado exitosamente`);

    return NextResponse.json({
      success: true,
      message: "Historial eliminado exitosamente",
    });
  } catch (error: any) {
    console.error("❌ Error deleting chat history:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
