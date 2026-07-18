// =============================================
// API Route: /api/sales-analytics/projects/detect-schema
// Auto-detección de schema del restaurante
// =============================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/sales-analytics/api-helpers';
import type { DetectSchemaResponse } from '@/types/sales-analytics';

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;

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
    // Sin sistema instalado: se requiere ejecutar el script de setup
    // (v1 solo soporta la estrategia RPC; el script instala tabla + RPCs + trigger)
    // =============================================

    const response: DetectSchemaResponse = {
      strategy: 'rpc',
      message:
        '⚠️ El sistema de analytics no está instalado en esta base. Genera el script SQL, ejecútalo en el Supabase del proyecto y verifica la instalación.',
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
