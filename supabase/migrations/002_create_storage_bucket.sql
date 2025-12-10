-- Crear bucket para almacenar documentos RAG
INSERT INTO storage.buckets (id, name, public)
VALUES ('rag-documents', 'rag-documents', false);

-- Políticas de acceso para el bucket
CREATE POLICY "Usuarios autenticados pueden subir archivos RAG"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rag-documents');

CREATE POLICY "Usuarios autenticados pueden leer archivos RAG"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'rag-documents');

CREATE POLICY "Usuarios autenticados pueden actualizar archivos RAG"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'rag-documents');

CREATE POLICY "Usuarios autenticados pueden eliminar archivos RAG"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'rag-documents');
