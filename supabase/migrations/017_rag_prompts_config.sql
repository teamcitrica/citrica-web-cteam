-- Prompts RAG configurables: defaults globales editables + prompt custom por storage

CREATE TABLE IF NOT EXISTS rag_prompt_defaults (
  key TEXT PRIMARY KEY CHECK (key IN ('base', 'strict')),
  prompt TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rag_prompt_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read rag_prompt_defaults"
  ON rag_prompt_defaults FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth manage rag_prompt_defaults"
  ON rag_prompt_defaults FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed con los textos hasta ahora hardcodeados en app/api/rag/chat/route.ts
INSERT INTO rag_prompt_defaults (key, prompt) VALUES
  ('base', 'Prioriza la información de los documentos recuperados como fuente principal. Puedes complementar con tu conocimiento general cuando aporte valor, pero distingue con claridad qué proviene de los documentos y qué es conocimiento general. Nunca atribuyas a los documentos información que no contienen; si algo no está en ellos, dilo.'),
  ('strict', 'MODO ESTRICTO: El documento es tu única fuente y tu guion. Sigue su estructura y sus secciones en el orden exacto en que aparecen, al pie de la letra. No agregues preguntas, temas ni contenido que no estén escritos en el documento. Si el usuario pide algo fuera del documento, responde que no está contemplado en el documento.')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE document_storages ADD COLUMN IF NOT EXISTS custom_prompt TEXT;

COMMENT ON COLUMN document_storages.custom_prompt IS
  'Prompt de sistema personalizado del storage; NULL = usar el default global según strict_mode';

-- El chat unificado ("all") se elimina de la UI: sus conversaciones
-- (storage_id NULL) quedan inaccesibles y se purgan.
DELETE FROM chat_conversations WHERE storage_id IS NULL;
