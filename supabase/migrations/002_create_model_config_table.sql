-- Tabla de configuración de modelos AI
CREATE TABLE IF NOT EXISTS ai_model_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    provider TEXT DEFAULT 'gemini' NOT NULL,
    input_token_limit INTEGER,
    output_token_limit INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    cost_per_1m_input_tokens DECIMAL(10, 6) DEFAULT 0.0,
    cost_per_1m_output_tokens DECIMAL(10, 6) DEFAULT 0.0,
    supports_file_api BOOLEAN DEFAULT true,
    supports_streaming BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb, -- Configuración adicional (temperature, topP, topK, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_ai_model_config_updated_at
BEFORE UPDATE ON ai_model_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad
ALTER TABLE ai_model_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden leer modelos"
ON ai_model_config FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear modelos"
ON ai_model_config FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar modelos"
ON ai_model_config FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar modelos"
ON ai_model_config FOR DELETE
TO authenticated
USING (true);

-- Insertar modelos por defecto
INSERT INTO ai_model_config (
    model_id,
    display_name,
    description,
    provider,
    input_token_limit,
    output_token_limit,
    is_default,
    cost_per_1m_input_tokens,
    cost_per_1m_output_tokens,
    supports_file_api,
    supports_streaming,
    config
) VALUES
(
    'gemini-2.5-flash',
    'Gemini 2.5 Flash',
    'Modelo equilibrado y rápido con soporte para 1M tokens. Ideal para uso general.',
    'gemini',
    1048576,
    65536,
    true,
    0.075,
    0.30,
    true,
    true,
    '{"temperature": 0.7, "topP": 0.95, "topK": 64}'::jsonb
),
(
    'gemini-2.5-pro',
    'Gemini 2.5 Pro',
    'Modelo más potente con mejor razonamiento. Recomendado para tareas complejas.',
    'gemini',
    1048576,
    65536,
    false,
    1.25,
    5.00,
    true,
    true,
    '{"temperature": 0.7, "topP": 0.95, "topK": 64}'::jsonb
),
(
    'gemini-2.0-flash',
    'Gemini 2.0 Flash',
    'Versión anterior estable y confiable.',
    'gemini',
    1048576,
    8192,
    false,
    0.075,
    0.30,
    true,
    true,
    '{"temperature": 0.7, "topP": 0.95, "topK": 40}'::jsonb
),
(
    'gemini-3-flash-preview',
    'Gemini 3 Flash Preview',
    'Preview del nuevo Gemini 3 Flash. Puede tener cambios.',
    'gemini',
    1048576,
    65536,
    false,
    0.075,
    0.30,
    true,
    true,
    '{"temperature": 0.7, "topP": 0.95, "topK": 64}'::jsonb
),
(
    'gemini-3-pro-preview',
    'Gemini 3 Pro Preview',
    'Preview del nuevo Gemini 3 Pro. Máxima capacidad.',
    'gemini',
    1048576,
    65536,
    false,
    1.25,
    5.00,
    true,
    true,
    '{"temperature": 0.7, "topP": 0.95, "topK": 64}'::jsonb
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS ai_model_config_is_active_idx ON ai_model_config(is_active);
CREATE INDEX IF NOT EXISTS ai_model_config_is_default_idx ON ai_model_config(is_default);
CREATE INDEX IF NOT EXISTS ai_model_config_provider_idx ON ai_model_config(provider);
