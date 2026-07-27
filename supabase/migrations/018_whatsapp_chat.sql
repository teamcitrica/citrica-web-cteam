-- Chat WhatsApp: bot RAG sobre WhatsApp Cloud API + takeover humano desde el admin.
-- El webhook (app/api/wa) escribe con service-role; el admin lee/escribe con sesión.

-- ============================================================
-- Settings globales del canal (fila única)
-- ============================================================
CREATE TABLE IF NOT EXISTS wa_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  default_storage_id UUID REFERENCES document_storages(id) ON DELETE SET NULL,
  system_prompt TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN wa_settings.default_storage_id IS
  'Storage RAG por defecto del canal; cada conversación puede sobrescribirlo';
COMMENT ON COLUMN wa_settings.system_prompt IS
  'Instrucciones extra del canal; se CONCATENAN al prompt RAG resuelto (no lo reemplazan)';

INSERT INTO wa_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Conversaciones (una por número de WhatsApp)
-- ============================================================
CREATE TABLE IF NOT EXISTS wa_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  storage_id UUID REFERENCES document_storages(id) ON DELETE SET NULL,
  ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  unread_count INT NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN wa_conversations.wa_id IS
  'Número en formato E.164 sin "+" — es el campo "to" de la Graph API';
COMMENT ON COLUMN wa_conversations.storage_id IS
  'Override del storage RAG; NULL = usar wa_settings.default_storage_id';
COMMENT ON COLUMN wa_conversations.ai_enabled IS
  'FALSE = takeover humano: el webhook guarda el mensaje pero no genera respuesta';

-- ============================================================
-- Mensajes
-- ============================================================
CREATE TABLE IF NOT EXISTS wa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES wa_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai', 'agent')),
  content TEXT NOT NULL,
  wa_message_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'sent', 'failed')),
  error_message TEXT,
  model TEXT,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN wa_messages.wa_message_id IS
  'ID de Meta (wamid.*). UNIQUE = dedupe de los reintentos del webhook; NULL permitido si el envío falló';
COMMENT ON COLUMN wa_messages.sender_type IS
  'user = cliente | ai = respuesta generada | agent = mensaje manual del admin';

CREATE INDEX IF NOT EXISTS wa_messages_conversation_idx
  ON wa_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS wa_conversations_last_msg_idx
  ON wa_conversations(last_message_at DESC);

-- ============================================================
-- Triggers updated_at (función definida en 001)
-- ============================================================
DROP TRIGGER IF EXISTS update_wa_settings_updated_at ON wa_settings;
CREATE TRIGGER update_wa_settings_updated_at
  BEFORE UPDATE ON wa_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wa_conversations_updated_at ON wa_conversations;
CREATE TRIGGER update_wa_conversations_updated_at
  BEFORE UPDATE ON wa_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS: authenticated gestiona; el webhook usa service-role (bypassa RLS)
-- ============================================================
ALTER TABLE wa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth manage wa_settings" ON wa_settings;
CREATE POLICY "auth manage wa_settings"
  ON wa_settings FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth manage wa_conversations" ON wa_conversations;
CREATE POLICY "auth manage wa_conversations"
  ON wa_conversations FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth manage wa_messages" ON wa_messages;
CREATE POLICY "auth manage wa_messages"
  ON wa_messages FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================
-- Realtime: el admin escucha inserts/updates para pintar el chat en vivo
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'wa_conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE wa_conversations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'wa_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE wa_messages;
  END IF;
END $$;

-- Incrementa unread_count de forma atómica (el webhook no puede leer-modificar-escribir
-- sin condición de carrera con mensajes consecutivos)
CREATE OR REPLACE FUNCTION increment_wa_unread(p_conversation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE wa_conversations
  SET unread_count = unread_count + 1
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql;
