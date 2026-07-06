// =============================================
// Types: Sales Analytics System
// =============================================

export type DataExtractionStrategy = 'rpc' | 'direct_query' | 'custom_query';
export type SetupStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type ConnectionStatus = 'pending' | 'connected' | 'error';
export type ReportFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
export type SnapshotSource = 'cron' | 'manual' | 'api';
export type ReportGeneratedBy = 'system' | 'manual';
export type CronLogStatus = 'success' | 'error' | 'skipped';
export type VerificationStatus = 'pending' | 'valid' | 'invalid';
export type ResponseFormat = 'json' | 'markdown' | 'text';
export type WhatsAppRole = 'owner' | 'manager' | 'admin';

// =============================================
// Model Config
// =============================================

export interface SalesModelConfig {
  id: string;
  model_id: string;
  display_name: string;
  description?: string;
  provider: string;
  input_token_limit?: number;
  output_token_limit?: number;
  cost_per_1m_input_tokens: number;
  cost_per_1m_output_tokens: number;
  supports_streaming: boolean;
  supports_json_mode: boolean;
  is_active: boolean;
  is_default: boolean;
  config: {
    temperature?: number;
    topP?: number;
    topK?: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

// =============================================
// API Config
// =============================================

export interface SalesApiConfig {
  id: string;
  provider: string;
  api_key: string; // Encrypted
  is_active: boolean;
  last_verified_at?: string;
  verification_status: VerificationStatus;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// =============================================
// Projects
// =============================================

export interface ColumnMapping {
  created_at: string;
  total: string;
  customer_name: string;
  order_type: string;
  payment_status: string;
  [key: string]: string;
}

export interface SalesProject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  company_id?: number;
  logo_url?: string;

  // Conexión
  supabase_url: string;
  supabase_anon_key: string; // Encrypted
  auth_token_hash?: string;

  // Estrategia
  data_extraction_strategy: DataExtractionStrategy;
  rpc_name?: string;
  column_mapping?: ColumnMapping;
  custom_query?: string;

  // Setup
  requires_setup: boolean;
  setup_status: SetupStatus;
  setup_script?: string;
  last_connection_check?: string;
  connection_status: ConnectionStatus;
  connection_error?: string;

  // Reportes
  report_frequency: ReportFrequency;
  cron_expression: string;
  timezone: string;
  last_report_generated_at?: string;
  next_scheduled_execution?: string;

  // IA
  ai_model_id?: string;
  use_custom_api_key: boolean;
  custom_api_key?: string; // Encrypted

  // Estado
  is_active: boolean;
  is_paused: boolean;

  created_at: string;
  updated_at: string;
  created_by?: string;
}

// =============================================
// Prompts
// =============================================

export interface SalesPrompt {
  id: string;
  project_id: string;
  version_name?: string; // Nombre de la versión (opcional)
  system_prompt: string;
  user_prompt_template: string;
  response_format?: ResponseFormat;
  temperature: number;
  max_tokens: number;
  version?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

// =============================================
// Data Snapshots
// =============================================

export interface SalesDataSnapshot {
  id: string;
  project_id: string;
  period_start: string; // DATE
  period_end: string; // DATE
  sales_data: any[]; // JSONB - array de registros de ventas
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  avg_order_value: number;
  received_at: string;
  source: SnapshotSource;
}

// =============================================
// Weekly Reports
// =============================================

export interface SalesWeeklyReport {
  id: string;
  project_id: string;
  snapshot_id?: string;
  period_start: string;
  period_end: string;
  week_of_year?: number;
  year?: number;
  ai_analysis?: string;
  analysis_json?: Record<string, any>; // JSON completo del análisis
  recommendations?: string[];
  key_insights?: Record<string, any>;
  top_products?: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  worst_products?: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  trends?: Record<string, any>;
  generated_at?: string;
  created_at: string; // Timestamp de creación
  generated_by?: ReportGeneratedBy;
  model_used?: string;
  prompt_version?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost_usd?: number;
  total_cost?: number; // Alias de cost_usd
  sent_to_whatsapp?: boolean;
  whatsapp_sent?: boolean; // Alias de sent_to_whatsapp
  sent_at?: string;
}

// =============================================
// WhatsApp Recipients
// =============================================

export interface SalesWhatsAppRecipient {
  id: string;
  project_id: string;
  name: string;
  phone: string;
  role: WhatsAppRole;
  is_active: boolean;
  receive_reports: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// Chat Conversations
// =============================================

export interface SalesChatConversation {
  id: string;
  project_id: string;
  title?: string; // Título de la conversación
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface SalesChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  model_used?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_cost?: number;
  created_at: string;
}

// =============================================
// Cron Logs
// =============================================

export interface SalesCronLog {
  id: string;
  project_id: string;
  status: CronLogStatus;
  error_message?: string;
  execution_time_ms?: number;
  executed_at: string;
}

// =============================================
// API Request/Response Types
// =============================================

export interface CreateProjectRequest {
  name: string;
  description?: string;
  company_id?: number;
  supabase_url: string;
  supabase_anon_key: string;
  report_frequency: ReportFrequency;
  report_day?: string; // 'monday', 'tuesday', etc.
  report_time: string; // "09:00"
  timezone: string;
  ai_model_id: string;
  use_custom_api_key?: boolean;
  custom_api_key?: string;
  whatsapp_recipients?: Array<{
    name: string;
    phone: string;
    role: WhatsAppRole;
  }>;
}

export interface DetectSchemaResponse {
  strategy: DataExtractionStrategy;
  message: string;
  rpc_name?: string;
  available_columns?: string[];
  requires_mapping?: boolean;
  requires_setup: boolean;
  requires_script?: boolean;
  ready: boolean;
}

export interface GenerateScriptResponse {
  script: string;
  instructions: string[];
}

export interface VerifySetupResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface GenerateReportRequest {
  projectId: string;
  snapshotId: string;
  mode: 'scheduled' | 'manual';
}

export interface GenerateReportResponse {
  success: boolean;
  analysis: string;
  recommendations: string[];
  keyInsights: Record<string, any>;
  topProducts: Array<{ name: string; revenue: number }>;
  worstProducts: Array<{ name: string; revenue: number }>;
  trends: Record<string, any>;
  modelUsed: string;
  promptVersion: number;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
  };
}

// =============================================
// Default Prompts
// =============================================

export const DEFAULT_SYSTEM_PROMPT = `Eres un consultor de negocios especializado en análisis de ventas para restaurantes. Tu tarea es analizar datos de ventas y generar insights accionables que ayuden al negocio a crecer.

Debes ser:
- Específico: Cita números exactos y porcentajes
- Accionable: Cada recomendación debe ser implementable
- Priorizado: Ordena por impacto esperado
- Realista: Considera el contexto de restaurantes

Formato de respuesta: JSON con estructura definida.`;

export const DEFAULT_USER_PROMPT_TEMPLATE = `Analiza los siguientes datos de ventas del restaurante {projectName} para el período {periodStart} - {periodEnd}:

**Data de ventas:**
{salesData}

**Métricas clave:**
- Revenue total: {totalRevenue}
- Órdenes totales: {totalOrders}
- Clientes únicos: {totalCustomers}
- Ticket promedio: {avgOrderValue}

Genera un análisis en formato JSON con esta estructura exacta:

\`\`\`json
{
  "analysis": "Resumen ejecutivo en 2-3 párrafos del desempeño del período",
  "recommendations": [
    "Recomendación específica 1 con acción clara",
    "Recomendación específica 2 con acción clara",
    "Recomendación específica 3 con acción clara"
  ],
  "keyInsights": {
    "revenue_trend": "Análisis de tendencia de ingresos",
    "customer_behavior": "Análisis de comportamiento de clientes",
    "product_performance": "Análisis de desempeño de productos"
  },
  "topProducts": [
    {"name": "Producto 1", "revenue": 1500.00, "quantity": 120},
    {"name": "Producto 2", "revenue": 1200.00, "quantity": 95}
  ],
  "worstProducts": [
    {"name": "Producto X", "revenue": 50.00, "quantity": 5},
    {"name": "Producto Y", "revenue": 75.00, "quantity": 8}
  ],
  "trends": {
    "peak_hours": "Análisis de horas pico",
    "order_type_distribution": "Distribución de tipos de orden (mesa vs delivery)",
    "weekly_pattern": "Patrón semanal detectado"
  }
}
\`\`\`

**IMPORTANTE:** Devuelve SOLO el JSON, sin texto adicional antes o después.`;
