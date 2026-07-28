-- Reset de memoria conversacional al cambiar la base de conocimiento.
-- El bot arma su historial con los últimos mensajes; si el chat venía hablando
-- del documento A y se le asigna el B, esa memoria contamina las respuestas
-- (con modo estricto sigue el guion viejo). context_since marca desde cuándo
-- el historial es válido: cambiar de storage lo resetea a NOW().

ALTER TABLE wa_conversations
  ADD COLUMN IF NOT EXISTS context_since TIMESTAMPTZ NOT NULL DEFAULT NOW();

COMMENT ON COLUMN wa_conversations.context_since IS
  'El historial que ve la IA empieza aquí; se resetea al cambiar el storage de la conversación (o el default global para las que no tienen override)';
