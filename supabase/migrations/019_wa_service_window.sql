-- Ventana de servicio de 24h de WhatsApp: solo los mensajes DEL CLIENTE la abren.
-- last_message_at se pisa con cada respuesta (IA/agente), así que la ventana
-- necesita su propio timestamp del último mensaje entrante.

ALTER TABLE wa_conversations
  ADD COLUMN IF NOT EXISTS last_user_message_at TIMESTAMPTZ;

COMMENT ON COLUMN wa_conversations.last_user_message_at IS
  'Último mensaje del cliente; la ventana de 24h de WhatsApp expira 24h después de esto';

-- Backfill desde los mensajes existentes
UPDATE wa_conversations c
SET last_user_message_at = m.max_at
FROM (
  SELECT conversation_id, MAX(created_at) AS max_at
  FROM wa_messages
  WHERE sender_type = 'user'
  GROUP BY conversation_id
) m
WHERE m.conversation_id = c.id;
