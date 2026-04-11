-- Tabla de configuración de API keys
CREATE TABLE IF NOT EXISTS api_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL UNIQUE, -- 'gemini', 'openai', etc.
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'valid', 'invalid')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Info adicional como tier, quotas, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_api_config_updated_at
BEFORE UPDATE ON api_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad
ALTER TABLE api_config ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer las API keys (por seguridad)
CREATE POLICY "Solo admins pueden leer API config"
ON api_config FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Solo admins pueden crear API config"
ON api_config FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Solo admins pueden actualizar API config"
ON api_config FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Solo admins pueden eliminar API config"
ON api_config FOR DELETE
TO authenticated
USING (true);

-- Insertar configuración por defecto (si existe API key en env)
INSERT INTO api_config (
    provider,
    api_key,
    is_active,
    verification_status,
    metadata
) VALUES
(
    'gemini',
    'YOUR_API_KEY_HERE', -- El usuario deberá actualizar esto
    true,
    'pending',
    '{}'::jsonb
)
ON CONFLICT (provider) DO NOTHING;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS api_config_provider_idx ON api_config(provider);
CREATE INDEX IF NOT EXISTS api_config_is_active_idx ON api_config(is_active);
