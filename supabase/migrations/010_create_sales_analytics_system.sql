-- =============================================
-- MIGRACIÓN 010: Sistema Sales Analytics RAG Multi-Proyecto
-- =============================================
-- Descripción: Sistema centralizado de análisis de ventas con IA
-- Fecha: Abril 2026
-- Versión: 1.0
-- =============================================

-- =============================================
-- 1. TABLA: sales_model_config
-- Configuración de modelos de IA (Gemini)
-- =============================================

CREATE TABLE IF NOT EXISTS sales_model_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación del modelo
  model_id TEXT NOT NULL UNIQUE, -- 'gemini-2.5-flash', 'gemini-2.5-pro'
  display_name TEXT NOT NULL,
  description TEXT,
  provider TEXT DEFAULT 'gemini' NOT NULL,

  -- Límites técnicos
  input_token_limit INTEGER,
  output_token_limit INTEGER,

  -- Costos (por millón de tokens)
  cost_per_1m_input_tokens DECIMAL(10, 6) DEFAULT 0.0,
  cost_per_1m_output_tokens DECIMAL(10, 6) DEFAULT 0.0,

  -- Capacidades
  supports_streaming BOOLEAN DEFAULT true,
  supports_json_mode BOOLEAN DEFAULT true,

  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Configuración JSON (temperature, topP, topK, etc.)
  config JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sales_model_config_is_active ON sales_model_config(is_active);
CREATE INDEX idx_sales_model_config_is_default ON sales_model_config(is_default);

-- RLS
ALTER TABLE sales_model_config ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admin puede gestionar modelos
CREATE POLICY "Admin full access to sales_model_config"
  ON sales_model_config
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- 2. TABLA: sales_api_config
-- Configuración de API Keys (encriptadas)
-- =============================================

CREATE TABLE IF NOT EXISTS sales_api_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  provider TEXT NOT NULL UNIQUE, -- 'gemini', 'openai', etc.
  api_key TEXT NOT NULL, -- Encriptado con AES-256

  is_active BOOLEAN DEFAULT true,

  -- Verificación
  last_verified_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'valid', 'invalid')),
  error_message TEXT,

  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sales_api_config_provider ON sales_api_config(provider);
CREATE INDEX idx_sales_api_config_is_active ON sales_api_config(is_active);

-- RLS
ALTER TABLE sales_api_config ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admin puede gestionar API keys
CREATE POLICY "Admin full access to sales_api_config"
  ON sales_api_config
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- 3. TABLA: sales_projects
-- Proyectos de restaurantes conectados
-- =============================================

CREATE TABLE IF NOT EXISTS sales_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información básica
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'delix-cafe', 'restaurante-xyz'
  description TEXT,
  company_id INTEGER, -- FK opcional a tabla company (si existe)
  logo_url TEXT,

  -- Conexión a Supabase del restaurante
  supabase_url TEXT NOT NULL,
  supabase_anon_key TEXT NOT NULL, -- Encriptado con AES-256
  auth_token_hash TEXT, -- Hashed con bcrypt (para validar requests si se usa método push)

  -- Estrategia de extracción de data
  data_extraction_strategy TEXT NOT NULL DEFAULT 'rpc'
    CHECK (data_extraction_strategy IN ('rpc', 'direct_query', 'custom_query')),

  -- Configuración según estrategia
  rpc_name TEXT, -- Nombre del RPC (ej: 'get_sales_data_for_export')
  column_mapping JSONB, -- Mapeo de columnas para direct_query
  custom_query TEXT, -- Query SQL personalizado

  -- Estado de setup
  requires_setup BOOLEAN DEFAULT false,
  setup_status TEXT DEFAULT 'completed'
    CHECK (setup_status IN ('pending', 'in_progress', 'completed', 'failed')),
  setup_script TEXT, -- Script SQL generado para el restaurante
  last_connection_check TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'pending'
    CHECK (connection_status IN ('pending', 'connected', 'error')),
  connection_error TEXT,

  -- Configuración de reportes
  report_frequency TEXT DEFAULT 'weekly'
    CHECK (report_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')),
  cron_expression TEXT NOT NULL DEFAULT '0 9 * * 1', -- Lunes 9am UTC
  timezone TEXT NOT NULL DEFAULT 'UTC',
  last_report_generated_at TIMESTAMPTZ,
  next_scheduled_execution TIMESTAMPTZ,

  -- Configuración de IA
  ai_model_id UUID REFERENCES sales_model_config(id) ON DELETE SET NULL,
  use_custom_api_key BOOLEAN DEFAULT false,
  custom_api_key TEXT, -- Encriptado (opcional por proyecto)

  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false, -- Pausar temporalmente sin desactivar

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_sales_projects_is_active ON sales_projects(is_active);
CREATE INDEX idx_sales_projects_slug ON sales_projects(slug);
CREATE INDEX idx_sales_projects_company_id ON sales_projects(company_id);
CREATE INDEX idx_sales_projects_next_execution ON sales_projects(next_scheduled_execution)
  WHERE is_active = true AND is_paused = false;
CREATE INDEX idx_sales_projects_connection_status ON sales_projects(connection_status);

-- RLS
ALTER TABLE sales_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios autenticados pueden ver sus proyectos
CREATE POLICY "Users can view sales_projects"
  ON sales_projects
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Admin puede gestionar proyectos
CREATE POLICY "Admin can manage sales_projects"
  ON sales_projects
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- 4. TABLA: sales_prompts
-- Prompts editables por proyecto con versionado
-- =============================================

CREATE TABLE IF NOT EXISTS sales_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,

  -- Prompts
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL, -- Con placeholders: {salesData}, {period}, etc.

  -- Configuración de generación
  response_format TEXT DEFAULT 'json'
    CHECK (response_format IN ('json', 'markdown', 'text')),
  temperature DECIMAL(2, 1) DEFAULT 0.7
    CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 4096,

  -- Versionado
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_sales_prompts_project_id ON sales_prompts(project_id);
CREATE INDEX idx_sales_prompts_is_active ON sales_prompts(is_active);
CREATE INDEX idx_sales_prompts_version ON sales_prompts(project_id, version);

-- RLS
ALTER TABLE sales_prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver prompts
CREATE POLICY "Users can view sales_prompts"
  ON sales_prompts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Usuarios pueden gestionar prompts
CREATE POLICY "Users can manage sales_prompts"
  ON sales_prompts
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- 5. TABLA: sales_data_snapshots
-- Snapshots de data de ventas extraída
-- =============================================

CREATE TABLE IF NOT EXISTS sales_data_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,

  -- Período
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Data completa (JSON del restaurante)
  sales_data JSONB NOT NULL,

  -- Métricas agregadas (para búsqueda rápida sin parsear JSON)
  total_revenue NUMERIC(10, 2),
  total_orders INTEGER,
  total_customers INTEGER,
  avg_order_value NUMERIC(10, 2),

  -- Metadata
  received_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'cron'
    CHECK (source IN ('cron', 'manual', 'api')),

  -- Constraint: 1 snapshot por proyecto/período
  CONSTRAINT unique_snapshot_per_project_period
    UNIQUE (project_id, period_start, period_end)
);

-- Índices
CREATE INDEX idx_sales_snapshots_project_id ON sales_data_snapshots(project_id);
CREATE INDEX idx_sales_snapshots_period ON sales_data_snapshots(period_start, period_end);
CREATE INDEX idx_sales_snapshots_project_period ON sales_data_snapshots(project_id, period_start, period_end);
CREATE INDEX idx_sales_snapshots_received_at ON sales_data_snapshots(received_at DESC);

-- RLS
ALTER TABLE sales_data_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver snapshots
CREATE POLICY "Users can view sales_data_snapshots"
  ON sales_data_snapshots
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Sistema puede insertar snapshots
CREATE POLICY "System can insert sales_data_snapshots"
  ON sales_data_snapshots
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 6. TABLA: sales_weekly_reports
-- Reportes generados por IA
-- =============================================

CREATE TABLE IF NOT EXISTS sales_weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES sales_data_snapshots(id) ON DELETE SET NULL,

  -- Período
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  week_of_year INTEGER,
  year INTEGER,

  -- Análisis generado por IA
  ai_analysis TEXT NOT NULL,
  recommendations TEXT[] NOT NULL,
  key_insights JSONB,
  top_products JSONB,
  worst_products JSONB,
  trends JSONB,

  -- Metadata de generación
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by TEXT DEFAULT 'system'
    CHECK (generated_by IN ('system', 'manual')),
  model_used TEXT,
  prompt_version INTEGER,

  -- Tokens y costo
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_usd DECIMAL(10, 6),

  -- WhatsApp
  sent_to_whatsapp BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,

  -- Constraint: 1 reporte por proyecto/período
  CONSTRAINT unique_report_per_project_period
    UNIQUE (project_id, period_start, period_end)
);

-- Índices
CREATE INDEX idx_sales_reports_project_id ON sales_weekly_reports(project_id);
CREATE INDEX idx_sales_reports_snapshot_id ON sales_weekly_reports(snapshot_id);
CREATE INDEX idx_sales_reports_period ON sales_weekly_reports(period_start, period_end);
CREATE INDEX idx_sales_reports_project_period ON sales_weekly_reports(project_id, period_start, period_end);
CREATE INDEX idx_sales_reports_generated_at ON sales_weekly_reports(generated_at DESC);
CREATE INDEX idx_sales_reports_week_year ON sales_weekly_reports(year, week_of_year);

-- RLS
ALTER TABLE sales_weekly_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver reportes
CREATE POLICY "Users can view sales_weekly_reports"
  ON sales_weekly_reports
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Sistema puede insertar reportes
CREATE POLICY "System can insert sales_weekly_reports"
  ON sales_weekly_reports
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 7. TABLA: sales_whatsapp_recipients
-- Destinatarios de reportes por WhatsApp
-- =============================================

CREATE TABLE IF NOT EXISTS sales_whatsapp_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'manager', 'admin')),

  is_active BOOLEAN DEFAULT true,
  receive_reports BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: 1 teléfono por proyecto
  CONSTRAINT unique_phone_per_project UNIQUE (project_id, phone)
);

-- Índices
CREATE INDEX idx_sales_whatsapp_project_id ON sales_whatsapp_recipients(project_id);
CREATE INDEX idx_sales_whatsapp_is_active ON sales_whatsapp_recipients(is_active);

-- RLS
ALTER TABLE sales_whatsapp_recipients ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden gestionar destinatarios
CREATE POLICY "Users can manage sales_whatsapp_recipients"
  ON sales_whatsapp_recipients
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- 8. TABLA: sales_chat_conversations
-- Chat interactivo con IA sobre datos de ventas
-- =============================================

CREATE TABLE IF NOT EXISTS sales_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES sales_data_snapshots(id) ON DELETE SET NULL,

  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,

  -- Tokens y costo
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,

  model TEXT,
  context_used JSONB, -- Data de ventas usada en el contexto

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_sales_chat_project_id ON sales_chat_conversations(project_id);
CREATE INDEX idx_sales_chat_snapshot_id ON sales_chat_conversations(snapshot_id);
CREATE INDEX idx_sales_chat_created_at ON sales_chat_conversations(created_at DESC);
CREATE INDEX idx_sales_chat_created_by ON sales_chat_conversations(created_by);

-- RLS
ALTER TABLE sales_chat_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver sus conversaciones
CREATE POLICY "Users can view their sales_chat_conversations"
  ON sales_chat_conversations
  FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

-- Policy: Usuarios pueden crear conversaciones
CREATE POLICY "Users can create sales_chat_conversations"
  ON sales_chat_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- =============================================
-- 9. TABLA: sales_cron_logs
-- Logs de ejecución del cron maestro
-- =============================================

CREATE TABLE IF NOT EXISTS sales_cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,

  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
  error_message TEXT,
  execution_time_ms INTEGER,

  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sales_cron_logs_project_id ON sales_cron_logs(project_id);
CREATE INDEX idx_sales_cron_logs_executed_at ON sales_cron_logs(executed_at DESC);
CREATE INDEX idx_sales_cron_logs_status ON sales_cron_logs(status);

-- RLS
ALTER TABLE sales_cron_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver logs
CREATE POLICY "Users can view sales_cron_logs"
  ON sales_cron_logs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Modelos Gemini
INSERT INTO sales_model_config (model_id, display_name, description, input_token_limit, output_token_limit, is_default, cost_per_1m_input_tokens, cost_per_1m_output_tokens, config)
VALUES
  (
    'gemini-2.0-flash-exp',
    'Gemini 2.0 Flash (Experimental)',
    'Modelo experimental rápido y eficiente con contexto extendido',
    1048576,
    8192,
    true,
    0.0, -- Gratis en experimental
    0.0,
    '{"temperature": 0.7, "topP": 0.95, "topK": 40}'::jsonb
  ),
  (
    'gemini-1.5-flash',
    'Gemini 1.5 Flash',
    'Modelo rápido y económico para análisis de ventas',
    1048576,
    8192,
    false,
    0.075,
    0.30,
    '{"temperature": 0.7, "topP": 0.95, "topK": 40}'::jsonb
  ),
  (
    'gemini-1.5-pro',
    'Gemini 1.5 Pro',
    'Modelo premium con mejor razonamiento y análisis profundo',
    2097152,
    8192,
    false,
    1.25,
    5.00,
    '{"temperature": 0.7, "topP": 0.95, "topK": 40}'::jsonb
  )
ON CONFLICT (model_id) DO NOTHING;

-- =============================================
-- FUNCIONES AUXILIARES
-- =============================================

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_sales_model_config_updated_at
  BEFORE UPDATE ON sales_model_config
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_updated_at();

CREATE TRIGGER trigger_sales_api_config_updated_at
  BEFORE UPDATE ON sales_api_config
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_updated_at();

CREATE TRIGGER trigger_sales_projects_updated_at
  BEFORE UPDATE ON sales_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_updated_at();

CREATE TRIGGER trigger_sales_prompts_updated_at
  BEFORE UPDATE ON sales_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_updated_at();

CREATE TRIGGER trigger_sales_whatsapp_recipients_updated_at
  BEFORE UPDATE ON sales_whatsapp_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_updated_at();

-- =============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =============================================

COMMENT ON TABLE sales_model_config IS 'Configuración de modelos de IA (Gemini, OpenAI, etc.)';
COMMENT ON TABLE sales_api_config IS 'API keys encriptadas para proveedores de IA';
COMMENT ON TABLE sales_projects IS 'Proyectos de restaurantes conectados al sistema';
COMMENT ON TABLE sales_prompts IS 'Prompts editables por proyecto con versionado';
COMMENT ON TABLE sales_data_snapshots IS 'Snapshots de data de ventas extraída de restaurantes';
COMMENT ON TABLE sales_weekly_reports IS 'Reportes generados automáticamente por IA';
COMMENT ON TABLE sales_whatsapp_recipients IS 'Destinatarios de reportes por WhatsApp';
COMMENT ON TABLE sales_chat_conversations IS 'Conversaciones interactivas con IA sobre ventas';
COMMENT ON TABLE sales_cron_logs IS 'Logs de ejecución del cron maestro';

-- =============================================
-- FIN DE MIGRACIÓN
-- =============================================
