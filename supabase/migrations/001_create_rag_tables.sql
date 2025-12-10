-- Habilitar la extensión pgvector para búsqueda vectorial
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla de storages (contenedores de documentos)
CREATE TABLE IF NOT EXISTS document_storages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    embedding_model TEXT DEFAULT 'text-embedding-004',
    status TEXT DEFAULT 'ready' CHECK (status IN ('ready', 'processing', 'error')),
    total_tokens_used BIGINT DEFAULT 0,
    total_cost_usd DECIMAL(10, 6) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de archivos subidos
CREATE TABLE IF NOT EXISTS storage_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    storage_id UUID REFERENCES document_storages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT,
    processed BOOLEAN DEFAULT FALSE,
    tokens_used BIGINT DEFAULT 0,
    processing_cost_usd DECIMAL(10, 6) DEFAULT 0.0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de chunks de documentos con embeddings vectoriales
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    storage_id UUID REFERENCES document_storages(id) ON DELETE CASCADE,
    file_id UUID REFERENCES storage_files(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(768), -- text-embedding-004 genera vectores de 768 dimensiones
    metadata JSONB, -- Para guardar info adicional: página, posición, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para tracking de conversaciones del chat (control de tokens)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    storage_id UUID REFERENCES document_storages(id) ON DELETE SET NULL,
    user_message TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    cost_usd DECIMAL(10, 6) NOT NULL,
    model TEXT DEFAULT 'gemini-2.5-flash',
    sources_used JSONB, -- Array de fuentes consultadas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para chat_conversations
CREATE INDEX IF NOT EXISTS chat_conversations_storage_idx
ON chat_conversations(storage_id);

CREATE INDEX IF NOT EXISTS chat_conversations_created_idx
ON chat_conversations(created_at DESC);

-- Índice para búsqueda vectorial eficiente usando HNSW (Hierarchical Navigable Small World)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
ON document_chunks
USING hnsw (embedding vector_cosine_ops);

-- Índice para búsquedas por storage_id
CREATE INDEX IF NOT EXISTS document_chunks_storage_idx
ON document_chunks(storage_id);

-- Índice para búsquedas por file_id
CREATE INDEX IF NOT EXISTS document_chunks_file_idx
ON document_chunks(file_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en document_storages
CREATE TRIGGER update_document_storages_updated_at
BEFORE UPDATE ON document_storages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Función para buscar documentos similares usando similitud coseno
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(768),
    match_storage_id UUID DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    storage_id UUID,
    file_id UUID,
    content TEXT,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.storage_id,
        dc.file_id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity,
        dc.metadata
    FROM document_chunks dc
    WHERE
        (match_storage_id IS NULL OR dc.storage_id = match_storage_id)
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Función para incrementar el uso de tokens en un storage
CREATE OR REPLACE FUNCTION increment_storage_usage(
    p_storage_id UUID,
    p_tokens BIGINT,
    p_cost DECIMAL(10, 6)
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE document_storages
    SET
        total_tokens_used = total_tokens_used + p_tokens,
        total_cost_usd = total_cost_usd + p_cost
    WHERE id = p_storage_id;
END;
$$;

-- Políticas de seguridad (Row Level Security)
ALTER TABLE document_storages ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden leer
CREATE POLICY "Usuarios autenticados pueden leer storages"
ON document_storages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden leer archivos"
ON storage_files FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden leer chunks"
ON document_chunks FOR SELECT
TO authenticated
USING (true);

-- Política: Todos los usuarios autenticados pueden crear
CREATE POLICY "Usuarios autenticados pueden crear storages"
ON document_storages FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden crear archivos"
ON storage_files FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden crear chunks"
ON document_chunks FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Todos los usuarios autenticados pueden actualizar
CREATE POLICY "Usuarios autenticados pueden actualizar storages"
ON document_storages FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden actualizar archivos"
ON storage_files FOR UPDATE
TO authenticated
USING (true);

-- Política: Todos los usuarios autenticados pueden eliminar
CREATE POLICY "Usuarios autenticados pueden eliminar storages"
ON document_storages FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar archivos"
ON storage_files FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar chunks"
ON document_chunks FOR DELETE
TO authenticated
USING (true);

-- Políticas para chat_conversations
CREATE POLICY "Usuarios autenticados pueden leer conversaciones"
ON chat_conversations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear conversaciones"
ON chat_conversations FOR INSERT
TO authenticated
WITH CHECK (true);
