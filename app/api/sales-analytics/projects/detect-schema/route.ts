// =============================================
// API Route: /api/sales-analytics/projects/detect-schema
// Auto-detección de schema del restaurante
// =============================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { DetectSchemaResponse } from '@/types/sales-analytics';

export async function POST(request: NextRequest) {
  try {
    const { supabaseUrl, supabaseAnonKey } = await request.json();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'URL y Anon Key son requeridos' },
        { status: 400 }
      );
    }

    // Conectar al Supabase del restaurante
    const restaurantSupabase = createClient(supabaseUrl, supabaseAnonKey);

    // =============================================
    // ESTRATEGIA 1: Detectar si existe sales_analytics + RPC
    // =============================================

    try {
      const { data: salesAnalytics, error: salesError } =
        await restaurantSupabase
          .from('sales_analytics')
          .select('*')
          .limit(1);

      if (!salesError && salesAnalytics !== null) {
        // Tabla existe, verificar RPC
        try {
          const { error: rpcError } = await restaurantSupabase.rpc(
            'get_sales_data_for_export',
            {
              p_start_date: '2026-01-01',
              p_end_date: '2026-01-02',
            }
          );

          if (!rpcError) {
            const response: DetectSchemaResponse = {
              strategy: 'rpc',
              message: '✅ Sistema compatible detectado (RestorApp)',
              rpc_name: 'get_sales_data_for_export',
              requires_setup: false,
              ready: true,
            };

            return NextResponse.json({ success: true, ...response });
          }
        } catch (rpcError) {
          // RPC no existe, pero tabla sí
        }
      }
    } catch (err) {
      // sales_analytics no existe, continuar
    }

    // =============================================
    // ESTRATEGIA 2: Detectar tablas orders/order_items
    // =============================================

    try {
      const { data: orders, error: ordersError } = await restaurantSupabase
        .from('orders')
        .select('*')
        .limit(1);

      if (!ordersError && orders && orders.length > 0) {
        const columns = Object.keys(orders[0]);

        const response: DetectSchemaResponse = {
          strategy: 'direct_query',
          message:
            '⚠️ Se detectaron tablas estándar (orders/order_items). Requiere mapeo de columnas.',
          available_columns: columns,
          requires_mapping: true,
          requires_setup: false,
          ready: false,
        };

        return NextResponse.json({ success: true, ...response });
      }
    } catch (err) {
      // orders no existe, continuar
    }

    // =============================================
    // ESTRATEGIA 3: No se detectó nada compatible
    // =============================================

    const response: DetectSchemaResponse = {
      strategy: 'custom_query',
      message:
        '❌ No se detectaron tablas compatibles. Se requiere ejecutar script SQL.',
      requires_setup: true,
      requires_script: true,
      ready: false,
    };

    return NextResponse.json({ success: true, ...response });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
