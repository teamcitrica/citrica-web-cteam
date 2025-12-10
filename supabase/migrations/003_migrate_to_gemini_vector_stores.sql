-- ================================================================
-- Migración: Limpieza de tablas deprecadas (opcional)
-- Solo ejecutar si vienes de una versión anterior con pgvector
-- ================================================================

-- NOTA: Esta migración es OPCIONAL
-- Solo ejecutarla si ya tenías el sistema RAG híbrido instalado previamente
-- Si es una instalación nueva, NO ejecutar esta migración

-- 1. ELIMINAR TABLAS DEPRECADAS (si existen)
-- ================================================================

-- Eliminar políticas RLS de document_chunks (si existe)
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer chunks" ON document_chunks;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear chunks" ON document_chunks;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar chunks" ON document_chunks;

-- Eliminar índices de document_chunks (si existen)
DROP INDEX IF EXISTS document_chunks_embedding_idx;
DROP INDEX IF EXISTS document_chunks_storage_idx;
DROP INDEX IF EXISTS document_chunks_file_idx;

-- Eliminar tabla de chunks (si existe)
DROP TABLE IF EXISTS document_chunks CASCADE;

-- Eliminar función de búsqueda vectorial (si existe)
DROP FUNCTION IF EXISTS match_documents(vector(768), UUID, FLOAT, INT);
DROP FUNCTION IF EXISTS match_documents(vector, UUID, FLOAT, INT);

-- Eliminar extensión pgvector (si existe y no es usada por otras tablas)
-- COMENTADO por seguridad - descomentar solo si estás seguro
-- DROP EXTENSION IF EXISTS vector CASCADE;


-- 2. ACTUALIZAR TABLA document_storages (si columnas no existen)
-- ================================================================

-- Agregar columna para ID del Vector Store de Gemini (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'document_storages'
        AND column_name = 'gemini_vector_store_id'
    ) THEN
        ALTER TABLE document_storages
        ADD COLUMN gemini_vector_store_id TEXT;
    END IF;
END $$;

-- Eliminar columna embedding_model (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'document_storages'
        AND column_name = 'embedding_model'
    ) THEN
        ALTER TABLE document_storages
        DROP COLUMN embedding_model;
    END IF;
END $$;

-- Agregar índice para búsqueda por Vector Store ID (si no existe)
CREATE INDEX IF NOT EXISTS document_storages_vector_store_idx
ON document_storages(gemini_vector_store_id);


-- 3. ACTUALIZAR TABLA storage_files (si columnas no existen)
-- ================================================================

-- Agregar columnas para integración con Gemini File API (si no existen)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storage_files'
        AND column_name = 'gemini_file_uri'
    ) THEN
        ALTER TABLE storage_files
        ADD COLUMN gemini_file_uri TEXT,
        ADD COLUMN gemini_file_name TEXT,
        ADD COLUMN gemini_file_state TEXT DEFAULT 'PENDING'
            CHECK (gemini_file_state IN ('PENDING', 'PROCESSING', 'ACTIVE', 'FAILED'));
    END IF;
END $$;

-- Agregar índices para búsqueda eficiente (si no existen)
CREATE INDEX IF NOT EXISTS storage_files_gemini_uri_idx
ON storage_files(gemini_file_uri);

CREATE INDEX IF NOT EXISTS storage_files_state_idx
ON storage_files(gemini_file_state);


-- 4. COMENTARIOS DESCRIPTIVOS
-- ================================================================

COMMENT ON COLUMN document_storages.gemini_vector_store_id IS
'ID del Vector Store en Gemini AI (para uso futuro)';

COMMENT ON COLUMN storage_files.gemini_file_uri IS
'URI del archivo en Gemini File API (ej: files/abc123)';

COMMENT ON COLUMN storage_files.gemini_file_name IS
'Nombre del archivo en Gemini (puede diferir del original)';

COMMENT ON COLUMN storage_files.gemini_file_state IS
'Estado del archivo en Gemini: PENDING, PROCESSING, ACTIVE, FAILED';

COMMENT ON COLUMN storage_files.file_url IS
'URL del archivo en Supabase Storage (fuente principal de datos)';


-- 5. VERIFICACIÓN DE MIGRACIÓN
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración 003 completada';
    RAISE NOTICE 'Columnas agregadas: gemini_vector_store_id, gemini_file_uri, gemini_file_name, gemini_file_state';
    RAISE NOTICE 'Nota: Los archivos se guardan en Supabase Storage y opcionalmente en Gemini File API';
END $$;
