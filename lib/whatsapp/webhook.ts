import crypto from "crypto";

/**
 * Verificación de firma y parseo del payload del webhook de Meta.
 */

export interface IncomingWaMessage {
  waMessageId: string;
  from: string; // wa_id (E.164 sin "+")
  contactName: string | null;
  text: string | null; // null si el mensaje no es de texto
  type: string;
}

/**
 * Valida X-Hub-Signature-256 = HMAC-SHA256(rawBody, appSecret).
 * El rawBody debe ser el cuerpo EXACTO recibido (sin re-serializar).
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false;

  const received = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  const receivedBuffer = Buffer.from(received, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  // timingSafeEqual lanza si las longitudes difieren
  if (receivedBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

/**
 * Extrae los mensajes entrantes del payload.
 * Ignora value.statuses[] (acuses de entrega/lectura) — no son mensajes.
 */
export function parseIncomingMessages(payload: any): IncomingWaMessage[] {
  const result: IncomingWaMessage[] = [];

  for (const entry of payload?.entry || []) {
    for (const change of entry?.changes || []) {
      if (change?.field !== "messages") continue;

      const value = change.value || {};
      const messages = value.messages || [];
      if (!messages.length) continue;

      // contacts[] trae el nombre de perfil; se mapea por wa_id
      const names = new Map<string, string>();
      for (const contact of value.contacts || []) {
        if (contact?.wa_id && contact?.profile?.name) {
          names.set(contact.wa_id, contact.profile.name);
        }
      }

      for (const message of messages) {
        if (!message?.id || !message?.from) continue;

        result.push({
          waMessageId: message.id,
          from: message.from,
          contactName: names.get(message.from) || null,
          text: message.type === "text" ? message.text?.body || null : null,
          type: message.type || "unknown",
        });
      }
    }
  }

  return result;
}

/**
 * Texto a guardar cuando el mensaje no es de texto (imagen, audio, etc.).
 * Estos mensajes se registran pero no disparan a la IA.
 */
export function describeNonTextMessage(type: string): string {
  const labels: Record<string, string> = {
    image: "imagen",
    audio: "audio",
    video: "video",
    document: "documento",
    sticker: "sticker",
    location: "ubicación",
    contacts: "contacto",
    button: "botón",
    interactive: "respuesta interactiva",
    reaction: "reacción",
  };

  return `[mensaje de tipo ${labels[type] || type} — no soportado por el bot]`;
}
