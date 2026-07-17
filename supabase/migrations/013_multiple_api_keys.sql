-- Soporte para múltiples API keys por proveedor con selector de key activa
ALTER TABLE api_config ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Principal';
ALTER TABLE api_config ADD COLUMN IF NOT EXISTS is_selected BOOLEAN NOT NULL DEFAULT false;

-- Una key por (provider, name) en vez de una por provider
ALTER TABLE api_config DROP CONSTRAINT IF EXISTS api_config_provider_key;
CREATE UNIQUE INDEX IF NOT EXISTS api_config_provider_name_idx ON api_config(provider, name);

-- Solo una key seleccionada por provider
CREATE UNIQUE INDEX IF NOT EXISTS api_config_one_selected_idx ON api_config(provider) WHERE is_selected;

-- La key existente pasa a ser la seleccionada
UPDATE api_config SET is_selected = true WHERE provider = 'gemini';

COMMENT ON COLUMN api_config.name IS 'Nombre legible de la key (ej: "Cuenta principal", "Free tier backup")';
COMMENT ON COLUMN api_config.is_selected IS 'Key en uso por el sistema (solo una por provider)';
