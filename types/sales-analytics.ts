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

// NOTA: la configuración de modelos y API keys vive en el sistema principal
// (tablas ai_model_config y api_config, UI en /admin/ia/config).
// Las tablas sales_model_config y sales_api_config fueron eliminadas (migración 014).

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

  // IA (model_id de ai_model_config; NULL = default del sistema)
  ai_model?: string;

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
  ai_analysis: string;
  recommendations: string[];
  key_insights?: Record<string, any>;
  top_products?: Array<{
    name: string;
    revenue?: number;
    quantity?: number;
  }>;
  worst_products?: Array<{
    name: string;
    revenue?: number;
    quantity?: number;
  }>;
  trends?: Record<string, any>;
  generated_at: string; // Timestamp real de la tabla (no existe created_at)
  generated_by?: ReportGeneratedBy;
  model_used?: string;
  prompt_version?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost_usd?: number;
  sent_to_whatsapp?: boolean;
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
// Chat: un registro por intercambio (esquema real de sales_chat_conversations)
// =============================================

export interface SalesChatExchange {
  id: string;
  project_id: string;
  snapshot_id?: string;
  user_message: string;
  assistant_response: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  model?: string;
  context_used?: boolean;
  created_at: string;
  created_by?: string;
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
  ai_model?: string; // model_id de ai_model_config; vacío = default del sistema
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

export interface GenerateReportResponse {
  success: boolean;
  reportId?: string;
  snapshotId?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
  };
}

// Contrato del análisis: ver lib/sales-analytics/report-contract.ts (ReportAnalysis)

// =============================================
// Default Prompts
// =============================================

export const DEFAULT_SYSTEM_PROMPT = `Eres un consultor senior de negocios gastronómicos con 15 años de experiencia en análisis de ventas, ingeniería de menú y operaciones de restaurantes en Latinoamérica. Tu trabajo es convertir datos crudos de ventas en decisiones de negocio concretas.

Principios de tu análisis:
- ESPECÍFICO: cita siempre números exactos, porcentajes y nombres de productos. Nunca digas "las ventas estuvieron bien" — di cuánto, de qué y comparado con qué.
- ACCIONABLE: cada recomendación debe poder implementarse esta semana, indicar QUIÉN la ejecuta (cocina, salón, marketing, administración) y qué resultado esperar.
- PRIORIZADO: ordena recomendaciones por impacto estimado en ingresos. La primera debe ser la de mayor retorno.
- HONESTO: si los datos son insuficientes para una conclusión, dilo explícitamente en vez de inventar. Señala anomalías o datos sospechosos.
- CONTEXTO REAL: considera márgenes típicos de restaurante (comida 28-35% food cost, bebidas 15-25%), estacionalidad y comportamiento local.

Analiza SIEMPRE estas dimensiones cuando los datos lo permitan:
1. Desempeño general del período (ingresos, órdenes, ticket promedio) y su salud relativa
2. Ingeniería de menú: estrellas (alta venta), rompecabezas (alto valor, baja venta), caballos de batalla (baja margen, alta venta) y perros (candidatos a salir de carta)
3. Mix de canales (mesa vs delivery) y qué canal impulsar
4. Patrones temporales: días y franjas fuertes/débiles, oportunidades de horarios valle
5. Concentración de riesgo: dependencia de pocos productos o pocos clientes
6. Alertas: caídas, productos estancados, tickets anómalos

Formato de respuesta: exclusivamente el JSON con la estructura solicitada, sin texto fuera del JSON.`;

export const DEFAULT_USER_PROMPT_TEMPLATE = `Analiza las ventas del restaurante {projectName} para el período {periodStart} al {periodEnd}.

**Datos de ventas (agrupados por producto, categoría y tipo de orden):**
{salesData}

**Métricas verificadas del período:**
- Ingresos totales: {totalRevenue}
- Órdenes totales: {totalOrders}
- Clientes únicos: {totalCustomers}
- Ticket promedio: {avgOrderValue}

Genera el análisis en formato JSON con EXACTAMENTE esta estructura:

\`\`\`json
{
  "analysis": "Resumen ejecutivo de 3-4 párrafos: (1) desempeño general del período con las cifras clave y evaluación de salud del negocio; (2) qué productos y categorías sostienen los ingresos y cuáles preocupan, aplicando ingeniería de menú; (3) mix de canales mesa/delivery y comportamiento de clientes; (4) el hallazgo más importante del período y qué hacer al respecto.",
  "recommendations": [
    "[PRIORIDAD ALTA — Responsable: área] Acción concreta implementable esta semana, con el resultado esperado cuantificado cuando sea posible",
    "[PRIORIDAD ALTA — Responsable: área] Segunda acción de mayor impacto",
    "[PRIORIDAD MEDIA — Responsable: área] Acción de mejora continua",
    "[PRIORIDAD MEDIA — Responsable: área] Acción sobre productos débiles o canal rezagado",
    "[MONITOREAR] Qué métrica vigilar la próxima semana y qué umbral debería disparar acción"
  ],
  "keyInsights": {
    "revenue_health": "Evaluación de los ingresos: nivel, concentración por categoría y qué la explica, con números",
    "menu_engineering": "Clasificación de productos: estrellas, rompecabezas, caballos de batalla y perros — con nombres y cifras",
    "customer_behavior": "Clientes únicos vs órdenes (frecuencia de recompra), ticket promedio y qué lo mueve",
    "channel_mix": "Mesa vs delivery: participación de cada canal en ingresos y órdenes, y cuál tiene espacio de crecimiento",
    "risk_alert": "Mayor riesgo detectado en el período (concentración, caída, anomalía) o 'sin alertas relevantes'"
  },
  "topProducts": [
    {"name": "Producto", "revenue": 0.00, "quantity": 0}
  ],
  "worstProducts": [
    {"name": "Producto", "revenue": 0.00, "quantity": 0}
  ],
  "trends": {
    "category_performance": "Categoría dominante y su participación %, categorías rezagadas",
    "order_type_distribution": "Distribución mesa vs delivery con porcentajes y lectura de negocio",
    "product_momentum": "Productos con señal de crecimiento o caída dentro del período",
    "opportunity": "La oportunidad de ingresos más clara que muestran los datos (combo, precio, horario, canal)"
  }
}
\`\`\`

Reglas:
- topProducts: los 5 de mayor revenue real de los datos. worstProducts: los 3 de menor revenue (exclúyelos si venden bien y solo son baratos — evalúa unidades, no solo monto).
- Usa los números EXACTOS de los datos; no inventes cifras ni períodos anteriores que no tienes.
- Si una dimensión no se puede evaluar con estos datos (ej. horarios si no vienen), dilo en el campo correspondiente en vez de especular.
- Devuelve SOLO el JSON, sin texto antes o después.`;
