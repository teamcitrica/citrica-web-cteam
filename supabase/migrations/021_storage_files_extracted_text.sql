-- Texto extraído de cada documento, cacheado para el "modo guion" del bot WhatsApp.
-- En storages con strict_mode el retrieval de File Search es una decisión del
-- modelo y con system prompt suele NO ejecutarse (verificado: 0 chunks en todas
-- las variantes de prompt). Para seguir un guion al pie de la letra, el texto
-- completo se inyecta en el system prompt; se extrae una sola vez con Gemini
-- (lee el archivo original del bucket) y queda cacheado aquí.

ALTER TABLE storage_files
  ADD COLUMN IF NOT EXISTS extracted_text TEXT;

COMMENT ON COLUMN storage_files.extracted_text IS
  'Transcripción completa del documento (cache); usada por el bot WhatsApp en modo estricto para inyectar el guion al prompt en vez de depender de File Search';
