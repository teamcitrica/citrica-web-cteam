# 🚀 Plan Final: Sistema Sales Analytics RAG Multi-Proyecto

## 📋 Resumen Ejecutivo

Sistema centralizado de análisis de ventas con IA para múltiples restaurantes, completamente administrado desde Citrica.

**Estrategia:** PLUG & PLAY - Citrica extrae data directamente del Supabase del restaurante sin necesidad de edge functions ni código adicional en el restaurante.

**Objetivo:** Onboarding de nuevos restaurantes en 2-5 minutos, sin cambios en su código.

---

## 🎯 Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                  CITRICA ADMIN PANEL                         │
│          (citrica-web-frontend - Supabase RAG)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 PROYECTOS CONECTADOS                                    │
│  ├─ 🍕 Delix Cafe (RestorApp)                               │
│  ├─ 🍔 Restaurante Futuro 1 (Sistema Custom)                │
│  └─ 🌮 Restaurante Futuro 2 (Sistema Nuevo)                 │
│                                                              │
│  🔧 EDGE FUNCTION: sales-analytics-cron-master               │
│  └─ Ejecuta cada minuto                                     │
│     └─ Evalúa configuración de cada proyecto                │
│        └─ Extrae data directamente de restaurante           │
│           └─ Genera análisis con Gemini                     │
│              └─ Envía WhatsApp                              │
│                                                              │
│  🤖 API ROUTES                                               │
│  ├─ /api/sales-analytics/projects (CRUD)                    │
│  ├─ /api/sales-analytics/detect-schema (Auto-detección)     │
│  ├─ /api/sales-analytics/generate-report (Análisis IA)      │
│  ├─ /api/sales-analytics/chat (Chat interactivo)            │
│  └─ /api/sales-analytics/prompts (Gestión prompts)          │
│                                                              │
│  💾 BASE DE DATOS (9 Tablas Nuevas)                         │
│  ├─ sales_projects                                           │
│  ├─ sales_model_config                                       │
│  ├─ sales_api_config                                         │
│  ├─ sales_prompts                                            │
│  ├─ sales_data_snapshots                                     │
│  ├─ sales_weekly_reports                                     │
│  ├─ sales_whatsapp_recipients                                │
│  ├─ sales_chat_conversations                                 │
│  └─ sales_cron_logs                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓ ↑
              Conexión vía Anon Key (RPC/SELECT)
                          ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│              RESTAURANTE (Delix Cafe - RestorApp)            │
│                 Supabase: svafhmdwyrvfbpwmmnos               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Ya existe:                                               │
│  ├─ Tabla: sales_analytics (migración 155)                  │
│  ├─ RPC: get_sales_data_for_export()                        │
│  ├─ RPC: mark_sales_as_exported()                           │
│  └─ Triggers: Alimentación automática                       │
│                                                              │
│  ❌ NO necesita:                                             │
│  ├─ Edge functions nuevas                                   │
│  ├─ Cron jobs                                                │
│  └─ Cambios en código                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Métodos de Extracción de Data

### Método 1: RPC Call (Para RestorApp/Delix)

**Aplicable cuando:**
- El restaurante tiene tabla `sales_analytics`
- El restaurante tiene RPC `get_sales_data_for_export()`

**Código en Edge Function de Citrica:**
```typescript
// supabase/functions/sales-analytics-cron-master/index.ts

async function extractDataViaRPC(project: SalesProject, startDate: string, endDate: string) {
  // Conectar al Supabase del restaurante con su anon key
  const restaurantSupabase = createClient(
    project.supabase_url,
    decrypt(project.supabase_anon_key)
  );

  // Ejecutar el RPC que YA existe en el restaurante
  const { data, error } = await restaurantSupabase.rpc(
    'get_sales_data_for_export',
    {
      p_start_date: startDate,
      p_end_date: endDate
    }
  );

  if (error) {
    throw new Error(`Error ejecutando RPC: ${error.message}`);
  }

  return data;
}
```

**Ventajas:**
- ✅ Data ya agregada y optimizada
- ✅ Sin overhead de transformación
- ✅ Performance óptimo

**Configuración en BD:**
```sql
-- En tabla sales_projects
{
  data_extraction_strategy: 'rpc',
  rpc_name: 'get_sales_data_for_export',
  requires_setup: false -- Ya está listo
}
```

---

### Método 2: SELECT Directo (Para Sistemas con orders/order_items)

**Aplicable cuando:**
- El restaurante tiene tablas `orders` y `order_items` estándar
- NO tiene `sales_analytics`

**Código en Edge Function de Citrica:**
```typescript
async function extractDataViaDirectQuery(project: SalesProject, startDate: string, endDate: string) {
  const restaurantSupabase = createClient(
    project.supabase_url,
    decrypt(project.supabase_anon_key)
  );

  // Query dinámico basado en column_mapping configurado en onboarding
  const { data, error } = await restaurantSupabase
    .from('orders')
    .select(`
      id,
      ${project.column_mapping.created_at} as created_at,
      ${project.column_mapping.total} as total,
      ${project.column_mapping.customer_name} as customer_name,
      ${project.column_mapping.order_type} as order_type,
      ${project.column_mapping.payment_status} as payment_status,
      order_items!inner (
        id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .gte(project.column_mapping.created_at, startDate)
    .lte(project.column_mapping.created_at, endDate);

  if (error) {
    throw new Error(`Error en SELECT: ${error.message}`);
  }

  // Transformar a formato estándar (en memoria, dentro de Citrica)
  return transformOrdersToSalesAnalytics(data, project);
}

function transformOrdersToSalesAnalytics(orders: any[], project: SalesProject) {
  const salesData = [];

  for (const order of orders) {
    for (const item of order.order_items) {
      salesData.push({
        sale_date: new Date(order.created_at).toISOString().split('T')[0],
        order_id: order.id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_item_price: item.total_price,
        customer_name: order.customer_name,
        order_type: order.order_type,
        payment_status: order.payment_status,
        // ... más campos según necesidad
      });
    }
  }

  return salesData;
}
```

**Ventajas:**
- ✅ No requiere cambios en el restaurante
- ✅ Compatible con cualquier sistema que tenga orders
- ✅ Transformación en Citrica (control total)

**Configuración en BD:**
```sql
-- En tabla sales_projects
{
  data_extraction_strategy: 'direct_query',
  column_mapping: {
    created_at: 'created_at',
    total: 'total',
    customer_name: 'customer_name',
    order_type: 'order_type',
    payment_status: 'payment_status_id'
  },
  requires_setup: false -- Tablas ya existen
}
```

---

### Método 3: Script de Setup Manual (Para Sistemas Nuevos)

**Aplicable cuando:**
- El restaurante NO tiene `sales_analytics`
- El restaurante NO tiene tablas `orders` estándar
- Es un sistema completamente nuevo

**Flujo:**

1. **Citrica genera script SQL automáticamente**
2. **Admin del restaurante lo ejecuta manualmente 1 vez**
3. **Citrica verifica instalación**
4. **Después usa Método 1 (RPC)**

**Código de generación de script:**
```typescript
// API Route: /api/sales-analytics/projects/generate-setup-script

export async function POST(request: Request) {
  const { projectId } = await request.json();

  const project = await getProject(projectId);

  // Generar script SQL personalizado
  const setupScript = `
-- =============================================
-- Script de Setup para ${project.name}
-- Generado automáticamente por Citrica
-- =============================================

-- PASO 1: Crear tabla sales_analytics
${SALES_ANALYTICS_TABLE_SQL} -- Contenido de migración 155

-- PASO 2: Crear índices
${SALES_ANALYTICS_INDEXES_SQL}

-- PASO 3: Crear función de exportación
CREATE OR REPLACE FUNCTION get_sales_data_for_export(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  product_name TEXT,
  category_name TEXT,
  total_quantity_sold BIGINT,
  total_revenue NUMERIC,
  avg_unit_price NUMERIC,
  order_count BIGINT,
  customer_count BIGINT,
  order_type TEXT,
  period_start DATE,
  period_end DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.product_name,
    sa.category_name,
    SUM(sa.quantity)::BIGINT as total_quantity_sold,
    SUM(sa.total_item_price) as total_revenue,
    AVG(sa.unit_price) as avg_unit_price,
    COUNT(DISTINCT sa.order_id)::BIGINT as order_count,
    COUNT(DISTINCT sa.customer_account_id) FILTER (WHERE NOT sa.is_generic_customer)::BIGINT as customer_count,
    sa.order_type,
    p_start_date as period_start,
    p_end_date as period_end
  FROM sales_analytics sa
  WHERE sa.sale_date BETWEEN p_start_date AND p_end_date
  GROUP BY sa.product_name, sa.category_name, sa.order_type
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 4: Crear trigger de población (si tienes orders/order_items)
-- (Incluir lógica de trigger de migración 155)

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
  `;

  return new Response(
    JSON.stringify({
      script: setupScript,
      instructions: [
        '1. Copiar el script completo',
        '2. Ir a Supabase del restaurante → SQL Editor',
        '3. Pegar el script completo',
        '4. Hacer clic en RUN',
        '5. Volver a Citrica y hacer clic en "Verificar Instalación"'
      ]
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
```

**Configuración en BD:**
```sql
-- En tabla sales_projects
{
  data_extraction_strategy: 'rpc',
  rpc_name: 'get_sales_data_for_export',
  requires_setup: true, -- Necesita ejecutar script primero
  setup_status: 'pending' -- pending → completed
}
```

---

## 📊 Base de Datos (Citrica Supabase)

### Migración: `010_create_sales_analytics_system.sql`

**Tablas a crear:**

#### 1. `sales_projects` - Proyectos de Restaurantes Conectados

```sql
CREATE TABLE IF NOT EXISTS sales_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información básica
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'delix-cafe', 'restaurante-xyz'
  description TEXT,
  company_id INTEGER REFERENCES company(id) ON DELETE SET NULL,
  logo_url TEXT,

  -- Conexión a Supabase del restaurante
  supabase_url TEXT NOT NULL,
  supabase_anon_key TEXT NOT NULL, -- Encriptado con AES-256
  auth_token_hash TEXT, -- Para validar requests (si se usa método push)

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
  setup_script TEXT, -- Script generado para el restaurante
  last_connection_check TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'pending'
    CHECK (connection_status IN ('pending', 'connected', 'error')),
  connection_error TEXT,

  -- Configuración de reportes
  report_frequency TEXT DEFAULT 'weekly'
    CHECK (report_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')),
  cron_expression TEXT NOT NULL DEFAULT '0 9 * * 1', -- Lunes 9am
  timezone TEXT NOT NULL DEFAULT 'UTC',
  last_report_generated_at TIMESTAMPTZ,
  next_scheduled_execution TIMESTAMPTZ,

  -- Configuración de IA
  ai_model_id UUID REFERENCES sales_model_config(id),
  use_custom_api_key BOOLEAN DEFAULT false,
  custom_api_key TEXT, -- Encriptado

  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_sales_projects_is_active ON sales_projects(is_active);
CREATE INDEX idx_sales_projects_slug ON sales_projects(slug);
CREATE INDEX idx_sales_projects_next_execution ON sales_projects(next_scheduled_execution)
  WHERE is_active = true AND is_paused = false;
```

#### 2. `sales_model_config` - Configuración de Modelos Gemini

```sql
CREATE TABLE IF NOT EXISTS sales_model_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id TEXT NOT NULL UNIQUE, -- 'gemini-2.5-flash', 'gemini-2.5-pro'
  display_name TEXT NOT NULL,
  description TEXT,
  provider TEXT DEFAULT 'gemini' NOT NULL,

  -- Límites
  input_token_limit INTEGER,
  output_token_limit INTEGER,

  -- Costos
  cost_per_1m_input_tokens DECIMAL(10, 6) DEFAULT 0.0,
  cost_per_1m_output_tokens DECIMAL(10, 6) DEFAULT 0.0,

  -- Capacidades
  supports_streaming BOOLEAN DEFAULT true,
  supports_json_mode BOOLEAN DEFAULT true,

  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Configuración
  config JSONB DEFAULT '{}'::jsonb, -- temperature, topP, topK

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data inicial
INSERT INTO sales_model_config (model_id, display_name, description, input_token_limit, output_token_limit, is_default, cost_per_1m_input_tokens, cost_per_1m_output_tokens)
VALUES
('gemini-2.5-flash', 'Gemini 2.5 Flash', 'Modelo rápido y eficiente', 1048576, 65536, true, 0.075, 0.30),
('gemini-2.5-pro', 'Gemini 2.5 Pro', 'Modelo premium con mejor razonamiento', 1048576, 65536, false, 1.25, 5.00);
```

#### 3. `sales_api_config` - Configuración de API Keys

```sql
CREATE TABLE IF NOT EXISTS sales_api_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE, -- 'gemini'
  api_key TEXT NOT NULL, -- Encriptado
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'valid', 'invalid')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `sales_prompts` - Prompts Editables por Proyecto

```sql
CREATE TABLE IF NOT EXISTS sales_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,

  -- Prompts
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL, -- Con placeholders: {salesData}, {period}, etc.

  -- Configuración
  response_format TEXT DEFAULT 'json'
    CHECK (response_format IN ('json', 'markdown', 'text')),
  temperature DECIMAL(2, 1) DEFAULT 0.7
    CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 4096,

  -- Versión
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Solo 1 prompt activo por proyecto
  CONSTRAINT unique_active_prompt_per_project
    UNIQUE (project_id, is_active)
    DEFERRABLE INITIALLY DEFERRED
);

-- Prompt default
INSERT INTO sales_prompts (project_id, system_prompt, user_prompt_template, version)
VALUES (
  NULL, -- Se usará como template
  'Eres un consultor de negocios especializado en análisis de ventas para restaurantes. Tu tarea es analizar datos de ventas y generar insights accionables.',
  'Analiza los siguientes datos de ventas del restaurante {projectName} para el período {periodStart} - {periodEnd}:\n\nData de ventas:\n{salesData}\n\nMétricas:\n- Revenue total: ${totalRevenue}\n- Órdenes totales: {totalOrders}\n- Clientes únicos: {totalCustomers}\n- Ticket promedio: ${avgOrderValue}\n\nGenera un análisis en formato JSON con:\n1. analysis: string (resumen ejecutivo)\n2. recommendations: array de strings (sugerencias accionables)\n3. keyInsights: objeto (insights clave)\n4. topProducts: array (top 5 productos)\n5. worstProducts: array (bottom 5 productos)\n6. trends: objeto (tendencias detectadas)',
  1
);
```

#### 5. `sales_data_snapshots` - Snapshots de Data de Ventas

```sql
CREATE TABLE IF NOT EXISTS sales_data_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,

  -- Período
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Data completa (JSON del restaurante)
  sales_data JSONB NOT NULL,

  -- Métricas agregadas (para búsqueda rápida)
  total_revenue NUMERIC(10, 2),
  total_orders INTEGER,
  total_customers INTEGER,
  avg_order_value NUMERIC(10, 2),

  -- Metadata
  received_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'cron'
    CHECK (source IN ('cron', 'manual', 'api')),

  CONSTRAINT unique_snapshot_per_project_period
    UNIQUE (project_id, period_start, period_end)
);

CREATE INDEX idx_sales_snapshots_project_period
  ON sales_data_snapshots(project_id, period_start, period_end);
```

#### 6. `sales_weekly_reports` - Reportes Generados

```sql
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

  CONSTRAINT unique_report_per_project_period
    UNIQUE (project_id, period_start, period_end)
);

CREATE INDEX idx_sales_reports_project_period
  ON sales_weekly_reports(project_id, period_start, period_end);
CREATE INDEX idx_sales_reports_generated_at
  ON sales_weekly_reports(generated_at DESC);
```

#### 7. `sales_whatsapp_recipients` - Destinatarios WhatsApp

```sql
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

  CONSTRAINT unique_phone_per_project UNIQUE (project_id, phone)
);
```

#### 8. `sales_chat_conversations` - Chat Interactivo

```sql
CREATE TABLE IF NOT EXISTS sales_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES sales_data_snapshots(id) ON DELETE SET NULL,

  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,

  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,

  model TEXT,
  context_used JSONB, -- Data de ventas usada

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_sales_chat_project_id
  ON sales_chat_conversations(project_id);
CREATE INDEX idx_sales_chat_created_at
  ON sales_chat_conversations(created_at DESC);
```

#### 9. `sales_cron_logs` - Logs de Ejecución

```sql
CREATE TABLE IF NOT EXISTS sales_cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES sales_projects(id) ON DELETE CASCADE,

  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
  error_message TEXT,
  execution_time_ms INTEGER,

  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_cron_logs_project_id
  ON sales_cron_logs(project_id);
CREATE INDEX idx_sales_cron_logs_executed_at
  ON sales_cron_logs(executed_at DESC);
```

---

## 🔄 Flujo de Onboarding de Proyecto

### Paso 1: Crear Proyecto en UI de Citrica

**Ruta:** `/sales-analytics/projects/new`

**Formulario:**
```typescript
interface NewProjectForm {
  // Paso 1: Info básica
  name: string; // "Delix Cafe"
  description?: string;
  company_id?: number; // Opcional

  // Paso 2: Conexión Supabase
  supabase_url: string; // "https://svafhmdwyrvfbpwmmnos.supabase.co"
  supabase_anon_key: string; // Anon key

  // Paso 3: Config reportes
  report_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  report_day?: string; // 'monday', 'tuesday', etc.
  report_time: string; // "09:00"
  timezone: string; // "America/Caracas"

  // Paso 4: Config IA
  ai_model_id: string; // FK a sales_model_config
  use_custom_api_key?: boolean;
  custom_api_key?: string;

  // Paso 5: Destinatarios
  whatsapp_recipients: Array<{
    name: string;
    phone: string;
    role: 'owner' | 'manager' | 'admin';
  }>;
}
```

### Paso 2: Auto-Detección de Schema

**API Route:** `POST /api/sales-analytics/projects/detect-schema`

```typescript
export async function POST(request: Request) {
  const { supabaseUrl, supabaseAnonKey } = await request.json();

  const restaurantSupabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Probar si existe sales_analytics
  const { data: salesAnalytics, error: salesError } = await restaurantSupabase
    .from('sales_analytics')
    .select('*')
    .limit(1);

  if (!salesError && salesAnalytics) {
    // 2. Verificar si existe RPC
    const { error: rpcError } = await restaurantSupabase.rpc(
      'get_sales_data_for_export',
      { p_start_date: '2026-01-01', p_end_date: '2026-01-02' }
    );

    if (!rpcError) {
      return {
        strategy: 'rpc',
        message: '✅ Sistema compatible detectado (RestorApp)',
        rpc_name: 'get_sales_data_for_export',
        requires_setup: false,
        ready: true
      };
    }
  }

  // 3. Si no existe sales_analytics, buscar orders
  const { data: orders, error: ordersError } = await restaurantSupabase
    .from('orders')
    .select('*')
    .limit(1);

  if (!ordersError && orders && orders.length > 0) {
    const columns = Object.keys(orders[0]);

    return {
      strategy: 'direct_query',
      message: '⚠️ Se detectaron tablas estándar (orders/order_items)',
      available_columns: columns,
      requires_mapping: true,
      requires_setup: false,
      ready: false // Requiere mapeo de columnas
    };
  }

  // 4. No se detectó nada
  return {
    strategy: 'custom_query',
    message: '❌ No se detectaron tablas compatibles',
    requires_setup: true,
    requires_script: true,
    ready: false
  };
}
```

### Paso 3: Mapeo de Columnas (Si es Direct Query)

**UI: Modal de Mapeo**

```
┌──────────────────────────────────────────────┐
│ Mapeo de Columnas Detectadas                 │
├──────────────────────────────────────────────┤
│ Columnas disponibles: created_at, total,     │
│ customer_name, order_type, payment_status_id │
│                                               │
│ Fecha de venta:                              │
│ [created_at          ▼]                      │
│                                               │
│ Monto total:                                 │
│ [total               ▼]                      │
│                                               │
│ Nombre cliente:                              │
│ [customer_name       ▼]                      │
│                                               │
│ Tipo de orden:                               │
│ [order_type          ▼]                      │
│                                               │
│ Estado de pago:                              │
│ [payment_status_id   ▼]                      │
│                                               │
│ [💾 Guardar Mapeo]                           │
└──────────────────────────────────────────────┘
```

### Paso 4: Generar Script SQL (Si es Nuevo)

**API Route:** `POST /api/sales-analytics/projects/generate-setup-script`

```typescript
export async function POST(request: Request) {
  const { projectId } = await request.json();

  const project = await getProject(projectId);

  // Leer template de migración 155
  const migration155Content = await readFile('migrations/155_create_sales_analytics_system.sql');

  // Generar script personalizado
  const setupScript = `
-- =============================================
-- Script de Setup para ${project.name}
-- Generado automáticamente por Citrica Sales Analytics
-- Fecha: ${new Date().toISOString()}
-- =============================================

${migration155Content}

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

-- ✅ Verificación:
-- 1. Ejecutar: SELECT COUNT(*) FROM sales_analytics;
-- 2. Ejecutar: SELECT * FROM get_sales_data_for_export('2026-01-01', '2026-01-02');
-- 3. Si ambos funcionan, la instalación fue exitosa.
  `;

  // Guardar script en BD para futuras referencias
  await updateProject(projectId, {
    setup_script: setupScript,
    setup_status: 'pending'
  });

  return {
    script: setupScript,
    instructions: [
      '1. Copiar el script completo',
      '2. Ir a Supabase del restaurante → SQL Editor',
      '3. Pegar el script',
      '4. Hacer clic en RUN',
      '5. Volver a Citrica y hacer clic en "Verificar Instalación"'
    ]
  };
}
```

### Paso 5: Verificar Instalación

**API Route:** `POST /api/sales-analytics/projects/verify-setup`

```typescript
export async function POST(request: Request) {
  const { projectId } = await request.json();

  const project = await getProject(projectId);
  const restaurantSupabase = createClient(
    project.supabase_url,
    decrypt(project.supabase_anon_key)
  );

  // 1. Verificar tabla
  const { data: tableCheck } = await restaurantSupabase
    .from('sales_analytics')
    .select('id')
    .limit(1);

  if (!tableCheck) {
    return {
      success: false,
      error: 'Tabla sales_analytics no encontrada'
    };
  }

  // 2. Verificar RPC
  const { error: rpcError } = await restaurantSupabase.rpc(
    'get_sales_data_for_export',
    { p_start_date: '2026-01-01', p_end_date: '2026-01-02' }
  );

  if (rpcError) {
    return {
      success: false,
      error: `RPC no funciona: ${rpcError.message}`
    };
  }

  // 3. Marcar como completado
  await updateProject(projectId, {
    setup_status: 'completed',
    connection_status: 'connected',
    data_extraction_strategy: 'rpc',
    rpc_name: 'get_sales_data_for_export',
    requires_setup: false
  });

  return {
    success: true,
    message: '✅ Proyecto configurado correctamente'
  };
}
```

### Paso 6: Guardar Proyecto

```typescript
// API Route: POST /api/sales-analytics/projects

export async function POST(request: Request) {
  const formData = await request.json();

  // Generar slug
  const slug = slugify(formData.name);

  // Encriptar credenciales
  const encryptedAnonKey = encrypt(formData.supabase_anon_key);
  const encryptedApiKey = formData.custom_api_key
    ? encrypt(formData.custom_api_key)
    : null;

  // Generar cron expression
  const cronExpression = generateCronExpression(
    formData.report_frequency,
    formData.report_day,
    formData.report_time
  );

  // Calcular próxima ejecución
  const nextExecution = getNextExecution(cronExpression, formData.timezone);

  // Insertar proyecto
  const { data: project, error } = await citricaSupabase
    .from('sales_projects')
    .insert({
      name: formData.name,
      slug,
      description: formData.description,
      company_id: formData.company_id,
      supabase_url: formData.supabase_url,
      supabase_anon_key: encryptedAnonKey,
      data_extraction_strategy: formData.strategy,
      rpc_name: formData.rpc_name,
      column_mapping: formData.column_mapping,
      requires_setup: formData.requires_setup,
      report_frequency: formData.report_frequency,
      cron_expression: cronExpression,
      timezone: formData.timezone,
      next_scheduled_execution: nextExecution,
      ai_model_id: formData.ai_model_id,
      use_custom_api_key: formData.use_custom_api_key,
      custom_api_key: encryptedApiKey,
      is_active: true,
      created_by: userInfo.id
    })
    .select()
    .single();

  if (error) throw error;

  // Crear prompt default
  await citricaSupabase.from('sales_prompts').insert({
    project_id: project.id,
    system_prompt: DEFAULT_SYSTEM_PROMPT,
    user_prompt_template: DEFAULT_USER_PROMPT_TEMPLATE,
    response_format: 'json',
    temperature: 0.7,
    max_tokens: 4096,
    version: 1,
    is_active: true,
    created_by: userInfo.id
  });

  // Guardar destinatarios WhatsApp
  if (formData.whatsapp_recipients?.length > 0) {
    await citricaSupabase.from('sales_whatsapp_recipients').insert(
      formData.whatsapp_recipients.map(r => ({
        project_id: project.id,
        name: r.name,
        phone: r.phone,
        role: r.role,
        is_active: true,
        receive_reports: true
      }))
    );
  }

  return {
    success: true,
    projectId: project.id,
    slug: project.slug,
    requiresSetup: project.requires_setup,
    setupStatus: project.setup_status
  };
}
```

---

## ⏰ Cron Maestro (Edge Function)

### Archivo: `supabase/functions/sales-analytics-cron-master/index.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { CronTime } from 'cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const citricaSupabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const startTime = Date.now();
  console.log('🔄 Ejecutando cron maestro de Sales Analytics...');

  try {
    // 1. Obtener proyectos activos
    const { data: projects, error } = await citricaSupabase
      .from('sales_projects')
      .select('*')
      .eq('is_active', true)
      .eq('is_paused', false)
      .eq('connection_status', 'connected');

    if (error) throw error;

    console.log(`📊 Proyectos activos: ${projects.length}`);

    const now = dayjs();
    const executedProjects: string[] = [];
    const errors: Array<{ project: string; error: string }> = [];

    // 2. Evaluar cada proyecto
    for (const project of projects) {
      try {
        console.log(`\n📋 Evaluando: ${project.name}`);
        console.log(`   Cron: ${project.cron_expression}`);
        console.log(`   Timezone: ${project.timezone}`);

        // Convertir a timezone del proyecto
        const nowInProjectTz = now.tz(project.timezone);
        const currentMinute = nowInProjectTz.format('YYYY-MM-DD HH:mm');

        // Evaluar cron expression
        const cronTime = new CronTime(project.cron_expression, project.timezone);
        const nextExecution = cronTime.sendAt();
        const nextExecutionFormatted = dayjs(nextExecution.toDate())
          .tz(project.timezone)
          .format('YYYY-MM-DD HH:mm');

        console.log(`   Ahora: ${currentMinute}`);
        console.log(`   Próxima ejecución: ${nextExecutionFormatted}`);

        // Verificar si debe ejecutarse AHORA
        if (currentMinute === nextExecutionFormatted) {
          // Evitar duplicados (verificar última ejecución)
          if (project.last_report_generated_at) {
            const lastExecution = dayjs(project.last_report_generated_at);
            const minutesSinceLastExecution = now.diff(lastExecution, 'minute');

            if (minutesSinceLastExecution < 1) {
              console.log(`   ⏭️  Ya ejecutado recientemente. Saltando.`);
              continue;
            }
          }

          console.log(`   ✅ ¡Debe ejecutarse ahora!`);

          // Ejecutar generación de reporte
          await generateReport(project);

          executedProjects.push(project.name);

          // Actualizar last_report_generated_at
          await citricaSupabase
            .from('sales_projects')
            .update({
              last_report_generated_at: now.toISOString(),
              next_scheduled_execution: dayjs(cronTime.sendAt().toDate()).toISOString()
            })
            .eq('id', project.id);

        } else {
          console.log(`   ⏭️  No debe ejecutarse ahora.`);
        }

      } catch (error: any) {
        console.error(`   ❌ Error en proyecto ${project.name}:`, error.message);
        errors.push({ project: project.name, error: error.message });

        // Registrar error
        await citricaSupabase.from('sales_cron_logs').insert({
          project_id: project.id,
          status: 'error',
          error_message: error.message,
          executed_at: now.toISOString()
        });
      }
    }

    const executionTime = Date.now() - startTime;
    console.log(`\n✅ Cron maestro completado en ${executionTime}ms`);
    console.log(`   Proyectos ejecutados: ${executedProjects.length}`);
    console.log(`   Errores: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        executedProjects,
        totalProjects: projects.length,
        errors,
        executionTimeMs: executionTime
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error fatal en cron maestro:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// =============================================
// Función: Generar Reporte
// =============================================

async function generateReport(project: any) {
  console.log(`🚀 Generando reporte para ${project.name}...`);

  // 1. Calcular período
  const endDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const startDate = dayjs().subtract(7, 'days').format('YYYY-MM-DD');

  console.log(`   Período: ${startDate} - ${endDate}`);

  // 2. Extraer data de ventas
  const salesData = await extractSalesData(project, startDate, endDate);

  console.log(`   ✅ Data extraída: ${salesData?.length || 0} registros`);

  // 3. Guardar snapshot
  const snapshot = await saveSnapshot(project.id, startDate, endDate, salesData);

  // 4. Generar análisis con IA
  const analysis = await generateAIAnalysis(project, snapshot);

  // 5. Guardar reporte
  const report = await saveReport(project.id, snapshot.id, startDate, endDate, analysis);

  // 6. Enviar WhatsApp
  await sendWhatsAppReports(project, report);

  console.log(`   ✅ Reporte generado: ${report.id}`);
}

// =============================================
// Función: Extraer Data de Ventas
// =============================================

async function extractSalesData(project: any, startDate: string, endDate: string) {
  const restaurantSupabase = createClient(
    project.supabase_url,
    decrypt(project.supabase_anon_key)
  );

  if (project.data_extraction_strategy === 'rpc') {
    // Método 1: RPC Call
    const { data, error } = await restaurantSupabase.rpc(
      project.rpc_name,
      { p_start_date: startDate, p_end_date: endDate }
    );

    if (error) throw new Error(`Error en RPC: ${error.message}`);
    return data;
  }

  if (project.data_extraction_strategy === 'direct_query') {
    // Método 2: SELECT directo
    const { data, error } = await restaurantSupabase
      .from('orders')
      .select(`
        id,
        ${project.column_mapping.created_at} as created_at,
        ${project.column_mapping.total} as total,
        ${project.column_mapping.customer_name} as customer_name,
        ${project.column_mapping.order_type} as order_type,
        order_items!inner (
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .gte(project.column_mapping.created_at, startDate)
      .lte(project.column_mapping.created_at, endDate);

    if (error) throw new Error(`Error en SELECT: ${error.message}`);

    // Transformar a formato estándar
    return transformOrdersToSalesAnalytics(data, project);
  }

  throw new Error(`Estrategia no soportada: ${project.data_extraction_strategy}`);
}

// =============================================
// Función: Guardar Snapshot
// =============================================

async function saveSnapshot(projectId: string, startDate: string, endDate: string, salesData: any[]) {
  const totalRevenue = salesData.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);
  const totalOrders = new Set(salesData.map(item => item.order_id)).size;
  const totalCustomers = new Set(salesData.map(item => item.customer_name)).size;
  const avgOrderValue = totalRevenue / totalOrders;

  const { data, error } = await citricaSupabase
    .from('sales_data_snapshots')
    .insert({
      project_id: projectId,
      period_start: startDate,
      period_end: endDate,
      sales_data: salesData,
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      total_customers: totalCustomers,
      avg_order_value: avgOrderValue
    })
    .select()
    .single();

  if (error) {
    // Si ya existe, actualizar
    if (error.code === '23505') {
      const { data: updated } = await citricaSupabase
        .from('sales_data_snapshots')
        .update({
          sales_data: salesData,
          total_revenue: totalRevenue,
          total_orders: totalOrders,
          total_customers: totalCustomers,
          avg_order_value: avgOrderValue,
          received_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .eq('period_start', startDate)
        .eq('period_end', endDate)
        .select()
        .single();

      return updated;
    }
    throw error;
  }

  return data;
}

// =============================================
// Función: Generar Análisis con IA
// =============================================

async function generateAIAnalysis(project: any, snapshot: any) {
  // Llamar a API route de Citrica
  const response = await fetch(
    `${Deno.env.get('CITRICA_API_URL')}/api/sales-analytics/generate-report`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('CITRICA_INTERNAL_API_KEY')}`
      },
      body: JSON.stringify({
        projectId: project.id,
        snapshotId: snapshot.id,
        mode: 'scheduled'
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Error generando análisis: ${response.statusText}`);
  }

  return await response.json();
}

// =============================================
// Función: Guardar Reporte
// =============================================

async function saveReport(projectId: string, snapshotId: string, startDate: string, endDate: string, analysis: any) {
  const { data, error } = await citricaSupabase
    .from('sales_weekly_reports')
    .insert({
      project_id: projectId,
      snapshot_id: snapshotId,
      period_start: startDate,
      period_end: endDate,
      week_of_year: dayjs(endDate).isoWeek(),
      year: dayjs(endDate).year(),
      ai_analysis: analysis.analysis,
      recommendations: analysis.recommendations,
      key_insights: analysis.keyInsights,
      top_products: analysis.topProducts,
      worst_products: analysis.worstProducts,
      trends: analysis.trends,
      generated_by: 'system',
      model_used: analysis.modelUsed,
      prompt_version: analysis.promptVersion,
      prompt_tokens: analysis.usage.promptTokens,
      completion_tokens: analysis.usage.completionTokens,
      total_tokens: analysis.usage.totalTokens,
      cost_usd: analysis.usage.costUsd
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================
// Función: Enviar WhatsApp
// =============================================

async function sendWhatsAppReports(project: any, report: any) {
  // Obtener destinatarios
  const { data: recipients } = await citricaSupabase
    .from('sales_whatsapp_recipients')
    .select('*')
    .eq('project_id', project.id)
    .eq('is_active', true)
    .eq('receive_reports', true);

  if (!recipients || recipients.length === 0) {
    console.log('   ⏭️  No hay destinatarios configurados');
    return;
  }

  // Formatear mensaje
  const message = formatWhatsAppMessage(project, report);

  // Enviar a cada destinatario
  for (const recipient of recipients) {
    try {
      await sendWhatsApp(recipient.phone, message);
      console.log(`   ✅ WhatsApp enviado a ${recipient.name}`);
    } catch (error: any) {
      console.error(`   ❌ Error enviando WhatsApp a ${recipient.name}:`, error.message);
    }
  }

  // Marcar reporte como enviado
  await citricaSupabase
    .from('sales_weekly_reports')
    .update({
      sent_to_whatsapp: true,
      sent_at: new Date().toISOString()
    })
    .eq('id', report.id);
}

function formatWhatsAppMessage(project: any, report: any): string {
  const top3 = report.top_products.slice(0, 3);

  return `
📊 *Reporte Semanal de Ventas*
🏪 ${project.name}

📅 Período: ${report.period_start} - ${report.period_end}

💰 *Métricas Clave:*
• Revenue: $${report.snapshot.total_revenue.toFixed(2)}
• Órdenes: ${report.snapshot.total_orders}
• Clientes: ${report.snapshot.total_customers}
• Ticket Promedio: $${report.snapshot.avg_order_value.toFixed(2)}

🔝 *Top 3 Productos:*
${top3.map((p, i) => `${i + 1}. ${p.name} - $${p.revenue.toFixed(2)}`).join('\n')}

💡 *Recomendaciones:*
${report.recommendations.slice(0, 3).map(r => `• ${r}`).join('\n')}

📄 Ver análisis completo: ${Deno.env.get('CITRICA_WEB_URL')}/sales-analytics/projects/${project.slug}/reports/${report.id}

_Generado automáticamente por Citrica Sales Analytics_
  `.trim();
}

async function sendWhatsApp(phone: string, message: string) {
  // Integración con API de WhatsApp (Twilio, Meta, etc.)
  // Por implementar según proveedor
  console.log(`📱 Enviando WhatsApp a ${phone}:`, message);
}

// =============================================
// Helpers
// =============================================

function decrypt(encrypted: string): string {
  // Implementar desencriptación AES-256
  return encrypted; // Placeholder
}

function transformOrdersToSalesAnalytics(orders: any[], project: any): any[] {
  const salesData = [];

  for (const order of orders) {
    for (const item of order.order_items) {
      salesData.push({
        sale_date: new Date(order.created_at).toISOString().split('T')[0],
        order_id: order.id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_item_price: item.total_price,
        customer_name: order.customer_name,
        order_type: order.order_type
      });
    }
  }

  return salesData;
}
```

---

## 📝 API Route: Generar Análisis con IA

### Archivo: `app/api/sales-analytics/generate-report/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(request: Request) {
  try {
    const { projectId, snapshotId, mode } = await request.json();

    const citricaSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Obtener proyecto
    const { data: project } = await citricaSupabase
      .from('sales_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    // 2. Obtener snapshot
    const { data: snapshot } = await citricaSupabase
      .from('sales_data_snapshots')
      .select('*')
      .eq('id', snapshotId)
      .single();

    // 3. Obtener prompt activo
    const { data: promptConfig } = await citricaSupabase
      .from('sales_prompts')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    // 4. Obtener modelo
    const { data: modelConfig } = await citricaSupabase
      .from('sales_model_config')
      .select('*')
      .eq('id', project.ai_model_id)
      .single();

    // 5. Obtener API key
    let apiKey: string;
    if (project.use_custom_api_key && project.custom_api_key) {
      apiKey = decrypt(project.custom_api_key);
    } else {
      const { data: apiConfig } = await citricaSupabase
        .from('sales_api_config')
        .select('api_key')
        .eq('provider', 'gemini')
        .eq('is_active', true)
        .single();
      apiKey = decrypt(apiConfig.api_key);
    }

    // 6. Preparar contexto
    const context = {
      projectName: project.name,
      periodStart: snapshot.period_start,
      periodEnd: snapshot.period_end,
      salesData: JSON.stringify(snapshot.sales_data, null, 2),
      totalRevenue: snapshot.total_revenue,
      totalOrders: snapshot.total_orders,
      totalCustomers: snapshot.total_customers,
      avgOrderValue: snapshot.avg_order_value
    };

    // 7. Reemplazar placeholders en prompt
    const systemPrompt = promptConfig.system_prompt;
    const userPrompt = promptConfig.user_prompt_template
      .replace(/\{projectName\}/g, context.projectName)
      .replace(/\{periodStart\}/g, context.periodStart)
      .replace(/\{periodEnd\}/g, context.periodEnd)
      .replace(/\{salesData\}/g, context.salesData)
      .replace(/\{totalRevenue\}/g, context.totalRevenue)
      .replace(/\{totalOrders\}/g, context.totalOrders)
      .replace(/\{totalCustomers\}/g, context.totalCustomers)
      .replace(/\{avgOrderValue\}/g, context.avgOrderValue);

    // 8. Llamar a Gemini
    const result = await generateText({
      model: google(modelConfig.model_id, { apiKey }),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: promptConfig.temperature,
      maxTokens: promptConfig.max_tokens
    });

    // 9. Parsear respuesta JSON
    let analysisData: any;
    try {
      const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/) ||
                       result.text.match(/\{[\s\S]*\}/);
      analysisData = JSON.parse(jsonMatch?.[1] || jsonMatch?.[0] || result.text);
    } catch {
      analysisData = {
        analysis: result.text,
        recommendations: [],
        keyInsights: {},
        topProducts: [],
        worstProducts: [],
        trends: {}
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisData.analysis,
        recommendations: analysisData.recommendations,
        keyInsights: analysisData.keyInsights,
        topProducts: analysisData.topProducts,
        worstProducts: analysisData.worstProducts,
        trends: analysisData.trends,
        modelUsed: modelConfig.model_id,
        promptVersion: promptConfig.version,
        usage: {
          promptTokens: result.usage?.promptTokens,
          completionTokens: result.usage?.completionTokens,
          totalTokens: result.usage?.totalTokens,
          costUsd: calculateCost(result.usage, modelConfig)
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function calculateCost(usage: any, model: any): number {
  const promptCost = (usage.promptTokens / 1_000_000) * model.cost_per_1m_input_tokens;
  const completionCost = (usage.completionTokens / 1_000_000) * model.cost_per_1m_output_tokens;
  return promptCost + completionCost;
}

function decrypt(encrypted: string): string {
  // Implementar desencriptación AES-256
  return encrypted; // Placeholder
}
```

---

## 📊 Resumen de Casos de Uso

### Caso 1: Delix Cafe (RestorApp)

**Estado Actual:**
- ✅ Tabla `sales_analytics` ya existe
- ✅ RPC `get_sales_data_for_export()` ya existe
- ✅ Triggers automáticos ya funcionan

**Proceso de Onboarding:**
1. Admin crea proyecto en Citrica
2. Ingresa URL y Anon Key de Delix
3. Citrica detecta automáticamente: "✅ RestorApp detectado"
4. Admin configura cron (ej: Lunes 9am)
5. Admin configura modelo Gemini
6. Admin agrega destinatarios WhatsApp
7. **Listo** ✅

**Tiempo:** 2 minutos

**Cambios en Delix:** CERO

---

### Caso 2: Restaurante con Sistema Custom (tiene orders/order_items)

**Estado Actual:**
- ✅ Tabla `orders` ya existe
- ✅ Tabla `order_items` ya existe
- ❌ NO tiene `sales_analytics`

**Proceso de Onboarding:**
1. Admin crea proyecto en Citrica
2. Ingresa URL y Anon Key
3. Citrica detecta: "⚠️ Tablas estándar detectadas"
4. Admin mapea columnas en UI (created_at → sale_date, total → revenue, etc.)
5. Citrica genera query dinámico
6. Admin configura cron
7. Admin configura modelo Gemini
8. Admin agrega destinatarios WhatsApp
9. **Listo** ✅

**Tiempo:** 5 minutos

**Cambios en Restaurante:** CERO

---

### Caso 3: Restaurante Nuevo (sin tablas)

**Estado Actual:**
- ❌ NO tiene `sales_analytics`
- ❌ NO tiene `orders`

**Proceso de Onboarding:**
1. Admin crea proyecto en Citrica
2. Ingresa URL y Anon Key
3. Citrica detecta: "❌ Sin tablas compatibles"
4. Citrica genera script SQL personalizado
5. Admin del restaurante ejecuta script en Supabase (1 vez, 5 min)
6. Admin de Citrica hace clic en "Verificar Instalación"
7. Citrica verifica: "✅ Instalación correcta"
8. Admin configura cron
9. Admin configura modelo Gemini
10. Admin agrega destinatarios WhatsApp
11. **Listo** ✅

**Tiempo:** 10 minutos (5 min de setup + 5 min de configuración)

**Cambios en Restaurante:** Ejecutar 1 script SQL (1 vez)

---

## 🎯 Ventajas Finales del Sistema

### 1. **Centralización Total**
- ✅ 1 solo edge function (cron maestro en Citrica)
- ✅ 1 solo código de extracción
- ✅ 1 solo código de análisis
- ✅ Actualizaciones 1 vez para todos los proyectos

### 2. **Onboarding Ultra-Rápido**
- ✅ Delix: 2 minutos (0 cambios)
- ✅ Sistema custom: 5 minutos (0 cambios)
- ✅ Sistema nuevo: 10 minutos (1 script)

### 3. **Escalabilidad Ilimitada**
- ✅ Agregar 100 restaurantes = 100 x 2-10 min
- ✅ NO crece la complejidad operativa
- ✅ Todos comparten la misma infraestructura

### 4. **Flexibilidad**
- ✅ Prompts editables por proyecto
- ✅ Cron configurable por proyecto
- ✅ Modelo Gemini configurable por proyecto
- ✅ API key opcional por proyecto

### 5. **Mantenibilidad**
- ✅ Debugging centralizado (logs en Citrica)
- ✅ Actualizaciones sin tocar restaurantes
- ✅ Monitoreo unificado

### 6. **Seguridad**
- ✅ Credenciales encriptadas (AES-256)
- ✅ Anon keys guardadas en Citrica (no en restaurante)
- ✅ RLS en todas las tablas
- ✅ Tokens de auth hasheados (bcrypt)

---

## 📅 Plan de Implementación (Fases)

### FASE 1: Base de Datos (1-2 horas)
- [ ] Crear migración `010_create_sales_analytics_system.sql`
- [ ] Aplicar migración en Citrica Supabase
- [ ] Insertar modelos y API config default
- [ ] Verificar tablas y RLS

### FASE 2: API Routes Core (3-4 horas)
- [ ] `/api/sales-analytics/projects` (CRUD)
- [ ] `/api/sales-analytics/projects/detect-schema` (Auto-detección)
- [ ] `/api/sales-analytics/projects/generate-setup-script` (Script SQL)
- [ ] `/api/sales-analytics/projects/verify-setup` (Verificación)
- [ ] `/api/sales-analytics/generate-report` (Análisis IA)

### FASE 3: Edge Function (2-3 horas)
- [ ] `sales-analytics-cron-master/index.ts`
- [ ] Helpers de extracción (RPC, Direct Query)
- [ ] Helpers de encriptación/desencriptación
- [ ] Deploy a Supabase
- [ ] Configurar cron: `* * * * *`

### FASE 4: UI Admin - Onboarding (4-6 horas)
- [ ] `/sales-analytics/projects/new` (Wizard de 6 pasos)
- [ ] Componente de auto-detección
- [ ] Componente de mapeo de columnas
- [ ] Componente de generación de script
- [ ] Componente de verificación

### FASE 5: UI Admin - Gestión (3-4 horas)
- [ ] `/sales-analytics/projects` (Lista)
- [ ] `/sales-analytics/projects/[id]` (Detalle)
- [ ] `/sales-analytics/projects/[id]/settings` (Config cron)
- [ ] `/sales-analytics/projects/[id]/data` (Ver snapshots)
- [ ] `/sales-analytics/projects/[id]/reports` (Reportes históricos)

### FASE 6: UI Admin - Prompts (2-3 horas)
- [ ] `/sales-analytics/projects/[id]/prompts` (Editor de prompts)
- [ ] Componente de preview de prompt
- [ ] Versionado de prompts

### FASE 7: UI Admin - Chat (3-4 horas)
- [ ] `/sales-analytics/projects/[id]/chat` (Chat interactivo)
- [ ] `/api/sales-analytics/chat` (API route)
- [ ] Streaming de respuestas

### FASE 8: Configuración Global (2-3 horas)
- [ ] `/sales-analytics/config` (API keys y modelos)
- [ ] Gestión de modelos Gemini
- [ ] Gestión de API keys

### FASE 9: Testing (3-4 horas)
- [ ] Probar onboarding con Delix (Caso 1)
- [ ] Probar mapeo de columnas (Caso 2)
- [ ] Probar generación de script (Caso 3)
- [ ] Probar generación de reportes
- [ ] Probar envío de WhatsApp

### FASE 10: Documentación (2-3 horas)
- [ ] Guía de onboarding para admins
- [ ] Guía de configuración de prompts
- [ ] Troubleshooting común
- [ ] Video tutorial (opcional)

---

## 📝 Archivos a Crear

### Citrica Supabase
1. `supabase/migrations/010_create_sales_analytics_system.sql`

### Citrica Edge Functions
2. `supabase/functions/sales-analytics-cron-master/index.ts`
3. `supabase/functions/sales-analytics-cron-master/deno.json`

### Citrica API Routes
4. `app/api/sales-analytics/projects/route.ts` (CRUD)
5. `app/api/sales-analytics/projects/detect-schema/route.ts`
6. `app/api/sales-analytics/projects/generate-setup-script/route.ts`
7. `app/api/sales-analytics/projects/verify-setup/route.ts`
8. `app/api/sales-analytics/generate-report/route.ts`
9. `app/api/sales-analytics/prompts/route.ts`
10. `app/api/sales-analytics/chat/route.ts`

### Citrica UI Pages
11. `app/sales-analytics/page.tsx` (Dashboard)
12. `app/sales-analytics/projects/page.tsx` (Lista)
13. `app/sales-analytics/projects/new/page.tsx` (Wizard)
14. `app/sales-analytics/projects/[id]/page.tsx` (Detalle)
15. `app/sales-analytics/projects/[id]/settings/page.tsx`
16. `app/sales-analytics/projects/[id]/data/page.tsx`
17. `app/sales-analytics/projects/[id]/prompts/page.tsx`
18. `app/sales-analytics/projects/[id]/chat/page.tsx`
19. `app/sales-analytics/projects/[id]/reports/page.tsx`
20. `app/sales-analytics/config/page.tsx`

### Citrica Hooks
21. `hooks/sales-analytics/use-projects.ts`
22. `hooks/sales-analytics/use-prompts.ts`
23. `hooks/sales-analytics/use-reports.ts`
24. `hooks/sales-analytics/use-chat.ts`

### Citrica Types
25. `types/sales-analytics.ts`

### Citrica Utils
26. `lib/sales-analytics/cronHelpers.ts`
27. `lib/sales-analytics/encryptionHelpers.ts`
28. `lib/sales-analytics/queryBuilders.ts`

### Citrica Components
29-50. Componentes UI (wizards, tablas, formularios, etc.)

**Total Estimado:** ~50 archivos principales

---

## 🚀 Próximos Pasos

1. **Aprobar este plan**
2. **Comenzar con FASE 1** (Base de Datos)
3. **Iterar fases secuencialmente**
4. **Testing continuo**
5. **Deploy a producción**

---

**Documento creado:** Abril 2026
**Versión:** 1.0 FINAL
**Estrategia:** PLUG & PLAY - Extracción Directa desde Citrica
**Status:** ✅ LISTO PARA IMPLEMENTACIÓN
