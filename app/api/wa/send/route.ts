import { NextRequest, NextResponse } from "next/server";
import { requireSession, getServiceClient } from "@/lib/sales-analytics/api-helpers";
import { sendWhatsAppText } from "@/lib/whatsapp/graph-api";

/**
 * POST - Envío manual desde el admin (takeover humano).
 * El token de WhatsApp vive solo en el servidor, por eso esta operación
 * no puede hacerse desde el hook cliente como el resto del CRUD.
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireSession();
  if (!user) return errorResponse;

  try {
    const { conversationId, text } = await request.json();

    if (!conversationId || !text?.trim()) {
      return NextResponse.json(
        { error: "conversationId y text son requeridos" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: conversation, error: convError } = await supabase
      .from("wa_conversations")
      .select("id, wa_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
    }

    const body = text.trim();
    const sent = await sendWhatsAppText(conversation.wa_id, body);

    // El mensaje se guarda aunque el envío falle (p.ej. ventana de 24h cerrada):
    // el admin necesita ver qué intentó mandar y por qué no salió.
    const { data: saved, error: insertError } = await supabase
      .from("wa_messages")
      .insert({
        conversation_id: conversation.id,
        direction: "out",
        sender_type: "agent",
        content: body,
        wa_message_id: sent.waMessageId,
        status: sent.error ? "failed" : "sent",
        error_message: sent.error,
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error guardando mensaje manual:", insertError.message);
    }

    if (!sent.error) {
      await supabase
        .from("wa_conversations")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: body.slice(0, 120),
        })
        .eq("id", conversation.id);
    }

    return NextResponse.json({
      ok: !sent.error,
      error: sent.error,
      message: saved || null,
    });
  } catch (error: any) {
    console.error("❌ Error en /api/wa/send:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Error enviando el mensaje" },
      { status: 500 }
    );
  }
}
