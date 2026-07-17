-- Motivo del último fallo de indexación, visible en la UI (modal de archivos)
ALTER TABLE storage_files ADD COLUMN IF NOT EXISTS error_message TEXT;
COMMENT ON COLUMN storage_files.error_message IS 'Motivo del último fallo de indexación (visible en la UI cuando gemini_file_state = FAILED)';
