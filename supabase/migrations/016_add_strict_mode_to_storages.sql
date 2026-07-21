-- Modo estricto por storage: obliga al chat RAG a responder solo con el
-- contenido del documento y seguir su estructura (ej. guiones de entrevista).
ALTER TABLE document_storages
  ADD COLUMN IF NOT EXISTS strict_mode boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN document_storages.strict_mode IS
  'Si es true, el chat RAG no puede salirse del contenido/estructura de los documentos del storage';
