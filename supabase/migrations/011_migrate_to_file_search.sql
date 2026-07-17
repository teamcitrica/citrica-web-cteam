-- ================================================================
-- Migración 011: File API (48h) → Gemini File Search stores
-- - gemini_vector_store_id pasa a guardar nombres reales "fileSearchStores/..."
--   (antes: IDs falsos "vs_<timestamp>_<nombre>" generados por un stub)
-- - storage_files.gemini_document_name: documento dentro del store
-- - gemini_file_uri / gemini_file_name quedan DEPRECATED (File API legacy)
-- ================================================================

-- 1. Nueva columna: nombre del documento en File Search
ALTER TABLE storage_files ADD COLUMN IF NOT EXISTS gemini_document_name TEXT;
CREATE INDEX IF NOT EXISTS storage_files_gemini_document_idx ON storage_files(gemini_document_name);

-- 2. Invalidar store ids falsos generados por el stub
UPDATE document_storages
SET gemini_vector_store_id = NULL
WHERE gemini_vector_store_id LIKE 'vs\_%' ESCAPE '\';

-- 3. Archivos legacy (URIs de File API muertos a las 48h) → pendientes de reindexar
UPDATE storage_files
SET gemini_file_state = 'PENDING', processed = FALSE
WHERE gemini_document_name IS NULL;

-- 4. Sanear storages atascados en processing (bug del catch en upload)
UPDATE document_storages SET status = 'error' WHERE status = 'processing';

-- 5. Documentar el nuevo significado de las columnas
COMMENT ON COLUMN document_storages.gemini_vector_store_id IS 'Nombre del File Search store de Gemini (fileSearchStores/...). NULL = aún no creado.';
COMMENT ON COLUMN storage_files.gemini_document_name IS 'Nombre del documento en el File Search store (fileSearchStores/.../documents/...).';
COMMENT ON COLUMN storage_files.gemini_file_uri IS 'DEPRECATED: URI del File API legacy (caducaba a las 48h). Solo lectura histórica.';
COMMENT ON COLUMN storage_files.gemini_file_name IS 'DEPRECATED: nombre del File API legacy.';
