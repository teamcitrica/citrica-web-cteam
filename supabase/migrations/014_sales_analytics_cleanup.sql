-- ================================================================
-- Migración 014: saneamiento sales-analytics
-- - Elimina el fork de configuración (sales_api_config / sales_model_config):
--   el sistema usa api_config (multi-key) + ai_model_config del app principal
-- - ai_model pasa a TEXT (NULL = modelo default de ai_model_config)
-- - version_name en prompts (el código y la UI ya lo usaban)
-- ================================================================

ALTER TABLE sales_projects DROP COLUMN IF EXISTS ai_model_id;
ALTER TABLE sales_projects ADD COLUMN IF NOT EXISTS ai_model TEXT;
COMMENT ON COLUMN sales_projects.ai_model IS 'model_id de ai_model_config a usar; NULL = el modelo default del sistema';

ALTER TABLE sales_projects DROP COLUMN IF EXISTS use_custom_api_key;
ALTER TABLE sales_projects DROP COLUMN IF EXISTS custom_api_key;

DROP TABLE IF EXISTS sales_api_config;
DROP TABLE IF EXISTS sales_model_config;

ALTER TABLE sales_prompts ADD COLUMN IF NOT EXISTS version_name TEXT;

-- Solo un prompt activo por proyecto (protege la activación contra carreras)
CREATE UNIQUE INDEX IF NOT EXISTS one_active_prompt_per_project
  ON sales_prompts(project_id) WHERE is_active;
