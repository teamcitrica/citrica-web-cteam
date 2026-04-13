// =============================================
// API Route: /api/sales-analytics/projects/generate-setup-script
// Generar script SQL para setup manual
// =============================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { GenerateScriptResponse } from '@/types/sales-analytics';

const citricaSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'ID de proyecto requerido' },
        { status: 400 }
      );
    }

    // Obtener proyecto
    const { data: project, error: projectError } = await citricaSupabase
      .from('sales_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    // Leer migración 155 de RestorApp (template)
    const migration155Path = join(
      process.cwd(),
      '..',
      '..',
      'RestorAppV2',
      'delixcafe-frontend-cteam',
      'docs',
      'migrations',
      '155_create_sales_analytics_system.sql'
    );

    let migration155Content: string;
    try {
      migration155Content = await readFile(migration155Path, 'utf-8');
    } catch (err) {
      // Si no se puede leer el archivo, usar template inline
      migration155Content = SALES_ANALYTICS_TABLE_SQL;
    }

    // Generar script personalizado
    const setupScript = `
-- =============================================
-- Script de Setup para ${project.name}
-- Generado automáticamente por Citrica Sales Analytics
-- Fecha: ${new Date().toISOString()}
-- Proyecto ID: ${project.id}
-- =============================================

${migration155Content}

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Paso 1: Verificar tabla creada
SELECT COUNT(*) as table_exists
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'sales_analytics';

-- Paso 2: Verificar función RPC
SELECT COUNT(*) as rpc_exists
FROM pg_proc
WHERE proname = 'get_sales_data_for_export';

-- Paso 3: Probar RPC con data de prueba
SELECT * FROM get_sales_data_for_export('2026-01-01', '2026-01-02');

-- =============================================
-- ✅ Si las 3 verificaciones funcionan, la instalación fue exitosa
-- Vuelve a Citrica y haz clic en "Verificar Instalación"
-- =============================================
    `.trim();

    // Guardar script en BD
    await citricaSupabase
      .from('sales_projects')
      .update({
        setup_script: setupScript,
        setup_status: 'pending',
      })
      .eq('id', projectId);

    const response: GenerateScriptResponse = {
      script: setupScript,
      instructions: [
        '1. Copiar el script completo (usar botón "Copiar")',
        '2. Ir a Supabase del restaurante → SQL Editor',
        '3. Pegar el script completo',
        '4. Hacer clic en RUN',
        '5. Esperar a que termine (puede tomar 10-30 segundos)',
        '6. Verificar que las 3 consultas de verificación funcionen',
        '7. Volver a Citrica y hacer clic en "Verificar Instalación"',
      ],
    };

    return NextResponse.json({ success: true, ...response });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// Template SQL inline (fallback si no se encuentra archivo)
// =============================================

const SALES_ANALYTICS_TABLE_SQL = `
-- =============================================
-- TABLA: sales_analytics
-- =============================================

CREATE TABLE IF NOT EXISTS sales_analytics (
  id BIGSERIAL PRIMARY KEY,
  sale_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Dimensión: Orden
  order_id BIGINT NOT NULL,
  order_number TEXT NOT NULL,
  order_type TEXT NOT NULL,
  order_status_id INTEGER,
  order_status_name TEXT,
  payment_status_id INTEGER,
  payment_status_name TEXT,

  -- Dimensión: Producto
  product_id BIGINT,
  product_name TEXT NOT NULL,
  category_id BIGINT,
  category_name TEXT,

  -- Dimensión: Cliente
  customer_account_id BIGINT,
  customer_name TEXT,
  is_generic_customer BOOLEAN DEFAULT false,

  -- Dimensión: Empleado
  waiter_id UUID,
  waiter_name TEXT,
  created_by_id UUID,
  created_by_name TEXT,

  -- Dimensión: Caja
  cash_register_id BIGINT,

  -- Métricas
  quantity NUMERIC(10, 2) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_item_price NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,

  -- Dimensión Temporal
  sale_date DATE NOT NULL,
  sale_hour INTEGER,
  sale_day_of_week INTEGER,
  sale_week_of_year INTEGER,
  sale_month INTEGER,
  sale_year INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  exported_at TIMESTAMPTZ,
  is_exported BOOLEAN DEFAULT false
);

-- Índices
CREATE INDEX idx_sales_analytics_sale_date ON sales_analytics(sale_date);
CREATE INDEX idx_sales_analytics_product_id ON sales_analytics(product_id);
CREATE INDEX idx_sales_analytics_order_id ON sales_analytics(order_id);
CREATE INDEX idx_sales_analytics_customer_id ON sales_analytics(customer_account_id);
CREATE INDEX idx_sales_analytics_is_exported ON sales_analytics(is_exported);

-- =============================================
-- FUNCIÓN RPC: get_sales_data_for_export
-- =============================================

CREATE OR REPLACE FUNCTION get_sales_data_for_export(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  product_name TEXT,
  category_name TEXT,
  total_quantity_sold NUMERIC,
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
    SUM(sa.quantity) as total_quantity_sold,
    SUM(sa.total_item_price) as total_revenue,
    AVG(sa.unit_price) as avg_unit_price,
    COUNT(DISTINCT sa.order_id) as order_count,
    COUNT(DISTINCT sa.customer_account_id) FILTER (WHERE NOT sa.is_generic_customer) as customer_count,
    sa.order_type,
    p_start_date as period_start,
    p_end_date as period_end
  FROM sales_analytics sa
  WHERE sa.sale_date BETWEEN p_start_date AND p_end_date
  GROUP BY sa.product_name, sa.category_name, sa.order_type
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGER: Poblar sales_analytics automáticamente
-- =============================================

CREATE OR REPLACE FUNCTION populate_sales_analytics()
RETURNS TRIGGER AS $$
DECLARE
  v_order RECORD;
  v_product RECORD;
  v_category RECORD;
  v_customer RECORD;
  v_waiter RECORD;
  v_creator RECORD;
  v_sale_timestamp TIMESTAMPTZ;
BEGIN
  -- Obtener datos de la orden
  SELECT * INTO v_order FROM orders WHERE id = NEW.order_id;

  -- Obtener datos del producto
  SELECT * INTO v_product FROM products WHERE id = NEW.product_id;

  -- Obtener categoría
  IF v_product.categories_id IS NOT NULL THEN
    SELECT * INTO v_category FROM categories WHERE id = v_product.categories_id;
  END IF;

  -- Obtener cliente
  IF v_order.customer_account_id IS NOT NULL THEN
    SELECT * INTO v_customer FROM customer_accounts WHERE id = v_order.customer_account_id;
  END IF;

  -- Obtener mesero
  IF v_order.waiter_id IS NOT NULL THEN
    SELECT * INTO v_waiter FROM users WHERE id = v_order.waiter_id;
  END IF;

  -- Obtener creador
  IF v_order.created_by IS NOT NULL THEN
    SELECT * INTO v_creator FROM users WHERE id = v_order.created_by;
  END IF;

  v_sale_timestamp := COALESCE(v_order.delivered_at, v_order.created_at);

  -- Insertar registro
  INSERT INTO sales_analytics (
    sale_timestamp,
    order_id,
    order_number,
    order_type,
    order_status_id,
    payment_status_id,
    product_id,
    product_name,
    category_id,
    category_name,
    customer_account_id,
    customer_name,
    is_generic_customer,
    waiter_id,
    waiter_name,
    created_by_id,
    created_by_name,
    cash_register_id,
    quantity,
    unit_price,
    total_item_price,
    discount_amount,
    sale_date,
    sale_hour,
    sale_day_of_week,
    sale_week_of_year,
    sale_month,
    sale_year
  ) VALUES (
    v_sale_timestamp,
    NEW.order_id,
    v_order.order_number,
    v_order.order_type,
    v_order.status_id,
    v_order.payment_status_id,
    NEW.product_id,
    NEW.product_name,
    v_product.categories_id,
    v_category.name,
    v_order.customer_account_id,
    COALESCE(v_customer.customer_name, v_order.customer_name, 'Genérico'),
    (v_order.customer_name IN ('Genérico', 'Cliente Genérico') OR v_order.customer_account_id IS NULL),
    v_order.waiter_id,
    CONCAT(v_waiter.first_name, ' ', v_waiter.last_name),
    v_order.created_by,
    CONCAT(v_creator.first_name, ' ', v_creator.last_name),
    v_order.cash_register_id,
    NEW.quantity,
    NEW.unit_price,
    NEW.total_price,
    COALESCE(NEW.discount_amount, 0),
    DATE(v_sale_timestamp),
    EXTRACT(HOUR FROM v_sale_timestamp)::INTEGER,
    EXTRACT(DOW FROM v_sale_timestamp)::INTEGER,
    EXTRACT(WEEK FROM v_sale_timestamp)::INTEGER,
    EXTRACT(MONTH FROM v_sale_timestamp)::INTEGER,
    EXTRACT(YEAR FROM v_sale_timestamp)::INTEGER
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_populate_sales_analytics ON order_items;

CREATE TRIGGER trigger_populate_sales_analytics
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION populate_sales_analytics();

-- =============================================
-- FIN DEL SETUP
-- =============================================
`;
