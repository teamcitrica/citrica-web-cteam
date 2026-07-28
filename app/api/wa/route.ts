import { NextRequest, NextResponse, after } from "next/server";
import { getServiceClient } from "@/lib/sales-analytics/api-helpers";
import {
  verifyWebhookSignature,
  parseIncomingMessages,
  describeNonTextMessage,
  type IncomingWaMessage,
} from "@/lib/whatsapp/webhook";
import { sendWhatsAppText } from "@/lib/whatsapp/graph-api";
import { generateWhatsAppReply } from "@/lib/whatsapp/generate-reply";

/**
 * Webhook de WhatsApp Cloud API — https://citrica.dev/api/wa
 *
 * GET  : verificación del webhook (hub.challenge) al configurarlo en Meta.
 * POST : recepción de mensajes. Responde 200 de inmediato y procesa en after()
 *        porque Meta reintenta el envío si no recibe el ack rápido.
 *
 * Nunca se loguea el contenido de los mensajes (PII de clientes).
 */

export const runtime = "nodejs"; // crypto (firma HMAC) + after()
export const maxDuration = 300; // el trabajo de after() corre dentro de este límite

// ================================================================
// GET — verificación del webhook
// ================================================================
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_BOT_VERIFY_TOKEN;

  if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) {
    console.log("✅ Webhook de WhatsApp verificado");
    // Meta espera el challenge en texto plano, no JSON
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("⚠️ Verificación de webhook rechazada");
  return new Response("Forbidden", { status: 403 });
}

// ================================================================
// POST — recepción de mensajes
// ================================================================
export async function POST(request: NextRequest) {
  // El raw body es obligatorio: la firma se calcula sobre los bytes exactos
  const rawBody = await request.text();

  const appSecret = process.env.WHATSAPP_BOT_APP_SECRET;
  if (!appSecret) {
    console.error("❌ Falta WHATSAPP_BOT_APP_SECRET: no se puede validar el webhook");
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  const valid = verifyWebhookSignature(
    rawBody,
    request.headers.get("x-hub-signature-256"),
    appSecret
  );

  if (!valid) {
    console.warn("⚠️ Firma de webhook inválida");
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const messages = parseIncomingMessages(payload);

  // Los eventos de status (entregado/leído) no traen mensajes: ack y fuera
  if (messages.length === 0) {
    return NextResponse.json({ received: true });
  }

  // Procesar después de responder: Meta reintenta si el 200 tarda
  after(() => processIncoming(messages));

  return NextResponse.json({ received: true });
}

// ================================================================
// Procesamiento (post-respuesta)
// ================================================================
async function processIncoming(messages: IncomingWaMessage[]) {
  for (const message of messages) {
    try {
      await processMessage(message);
    } catch (error: any) {
      console.error(`❌ Error procesando mensaje ${message.waMessageId}:`, error?.message);
    }
  }
}

async function processMessage(message: IncomingWaMessage) {
  const supabase = getServiceClient();
  const now = new Date().toISOString();
  const content = message.text ?? describeNonTextMessage(message.type);

  // ------------------------------------------------------------
  // 1. Conversación (upsert por número; preserva ai_enabled/storage_id)
  // ------------------------------------------------------------
  const { data: conversation, error: convError } = await supabase
    .from("wa_conversations")
    .upsert(
      {
        wa_id: message.from,
        ...(message.contactName ? { contact_name: message.contactName } : {}),
        last_message_at: now,
        last_user_message_at: now, // abre/renueva la ventana de 24h
        last_message_preview: content.slice(0, 120),
      },
      { onConflict: "wa_id" }
    )
    .select("id, ai_enabled, storage_id")
    .single();

  if (convError || !conversation) {
    console.error("❌ No se pudo resolver la conversación:", convError?.message);
    return;
  }

  // ------------------------------------------------------------
  // 2. Mensaje entrante + dedupe de reintentos de Meta
  // ------------------------------------------------------------
  const { data: inserted, error: insertError } = await supabase
    .from("wa_messages")
    .upsert(
      {
        conversation_id: conversation.id,
        direction: "in",
        sender_type: "user",
        content,
        wa_message_id: message.waMessageId,
        status: "received",
      },
      { onConflict: "wa_message_id", ignoreDuplicates: true }
    )
    .select("id");

  if (insertError) {
    console.error("❌ Error guardando mensaje entrante:", insertError.message);
    return;
  }

  // 0 filas = ya lo procesamos antes (reintento del webhook)
  if (!inserted || inserted.length === 0) {
    console.log(`↩️ Mensaje ${message.waMessageId} duplicado, ignorado`);
    return;
  }

  await supabase.rpc("increment_wa_unread", { p_conversation_id: conversation.id });

  // ------------------------------------------------------------
  // 3. ¿Responde la IA?
  // ------------------------------------------------------------
  if (!message.text) {
    console.log(`📎 Mensaje no textual (${message.type}): sin respuesta automática`);
    return;
  }

  const { data: settings } = await supabase
    .from("wa_settings")
    .select("ai_enabled, default_storage_id")
    .eq("id", 1)
    .single();

  if (!settings?.ai_enabled) {
    console.log("🤖 IA global desactivada");
    return;
  }

  if (!conversation.ai_enabled) {
    console.log("👤 Takeover humano activo en esta conversación");
    return;
  }

  const storageId = conversation.storage_id || settings.default_storage_id;
  if (!storageId) {
    console.warn("⚠️ Sin storage RAG asignado (ni override ni default): no se responde");
    return;
  }

  // ------------------------------------------------------------
  // 4. Generar y enviar
  // ------------------------------------------------------------
  const reply = await generateWhatsAppReply(supabase, {
    conversationId: conversation.id,
    storageId,
    userText: message.text,
  });

  if (!reply.ok) {
    // El error técnico no se le envía al cliente; queda en logs para el admin
    console.error("❌ Generación fallida:", reply.error);
    return;
  }

  const sent = await sendWhatsAppText(message.from, reply.text);
  const totalTokens = reply.promptTokens + reply.completionTokens;

  await supabase.from("wa_messages").insert({
    conversation_id: conversation.id,
    direction: "out",
    sender_type: "ai",
    content: reply.text,
    wa_message_id: sent.waMessageId,
    status: sent.error ? "failed" : "sent",
    error_message: sent.error,
    model: reply.model,
    prompt_tokens: reply.promptTokens,
    completion_tokens: reply.completionTokens,
    total_tokens: totalTokens,
    cost_usd: reply.costUsd,
  });

  await supabase
    .from("wa_conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: reply.text.slice(0, 120),
    })
    .eq("id", conversation.id);

  // Consumo contra el mismo contador que usa el chat RAG del admin
  await supabase.rpc("increment_storage_usage", {
    p_storage_id: storageId,
    p_tokens: totalTokens,
    p_cost: reply.costUsd,
  });

  console.log(
    `💬 Respuesta enviada (${reply.model}) | tokens: ${totalTokens} | $${reply.costUsd.toFixed(6)}`
  );
}
