/**
 * Cliente mínimo de la WhatsApp Cloud API (Meta Graph).
 * Solo mensajes de texto: es lo único que el bot y el takeover humano envían.
 */

const GRAPH_VERSION = "v25.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// Límite duro de WhatsApp para el cuerpo de un mensaje de texto
export const WA_TEXT_LIMIT = 4096;

// Código de error de Meta cuando la ventana de servicio de 24h ya cerró
const OUT_OF_WINDOW_CODES = [131047, 131026];

export interface SendResult {
  waMessageId: string | null;
  error: string | null;
}

/**
 * Parte un texto largo en trozos de <= WA_TEXT_LIMIT respetando párrafos/espacios.
 */
export function splitWhatsAppText(text: string, limit: number = WA_TEXT_LIMIT): string[] {
  if (text.length <= limit) return [text];

  const parts: string[] = [];
  let rest = text;

  while (rest.length > limit) {
    const window = rest.slice(0, limit);
    // Cortar en el último salto de párrafo, línea o espacio dentro del límite
    let cut = window.lastIndexOf("\n\n");
    if (cut < limit * 0.5) cut = window.lastIndexOf("\n");
    if (cut < limit * 0.5) cut = window.lastIndexOf(" ");
    if (cut <= 0) cut = limit;

    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) parts.push(rest);
  return parts;
}

function readEnv(): { token: string; phoneNumberId: string } | null {
  const token = process.env.WHATSAPP_BOT_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_BOT_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return null;
  return { token, phoneNumberId };
}

/**
 * Traduce el error de Meta a algo accionable para el admin.
 */
function describeGraphError(payload: any, status: number): string {
  const err = payload?.error;
  const code = err?.code;

  if (OUT_OF_WINDOW_CODES.includes(code)) {
    return "Fuera de la ventana de 24h: WhatsApp solo permite texto libre dentro de las 24h posteriores al último mensaje del cliente. Debe escribir él primero.";
  }
  if (status === 401 || code === 190) {
    return "Token de WhatsApp inválido o expirado. Revisa WHATSAPP_BOT_ACCESS_TOKEN.";
  }
  if (code === 131030) {
    return "El número destino no está en la lista de destinatarios permitidos (app en modo desarrollo).";
  }

  return err?.message || `Error de WhatsApp (HTTP ${status})`;
}

/**
 * Envía un mensaje de texto. Si excede el límite, lo manda en varias partes
 * y devuelve el id de la última. Nunca lanza: devuelve { error } legible.
 */
export async function sendWhatsAppText(to: string, body: string): Promise<SendResult> {
  const env = readEnv();
  if (!env) {
    return {
      waMessageId: null,
      error: "Faltan WHATSAPP_BOT_ACCESS_TOKEN o WHATSAPP_BOT_PHONE_NUMBER_ID en el entorno",
    };
  }

  const trimmed = (body || "").trim();
  if (!trimmed) {
    return { waMessageId: null, error: "El mensaje está vacío" };
  }

  const parts = splitWhatsAppText(trimmed);
  let lastId: string | null = null;

  for (const part of parts) {
    try {
      const response = await fetch(`${GRAPH_BASE}/${env.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body: part },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = describeGraphError(payload, response.status);
        console.error("❌ Error enviando mensaje WhatsApp:", message);
        return { waMessageId: lastId, error: message };
      }

      lastId = payload?.messages?.[0]?.id || null;
    } catch (error: any) {
      console.error("❌ Fallo de red enviando a WhatsApp:", error?.message);
      return { waMessageId: lastId, error: error?.message || "Fallo de red al enviar a WhatsApp" };
    }
  }

  return { waMessageId: lastId, error: null };
}
