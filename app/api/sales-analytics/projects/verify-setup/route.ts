// =============================================
// API Route: /api/sales-analytics/projects/verify-setup
// Verificar instalación de script SQL
// =============================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/sales-analytics/encryptionHelpers';
import type { VerifySetupResponse } from '@/types/sales-analytics';

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

    // Desencriptar anon key
    const anonKey = decrypt(project.supabase_anon_key);

    // Conectar al Supabase del restaurante
    const restaurantSupabase = createClient(project.supabase_url, anonKey);

    // =============================================
    // PASO 1: Verificar tabla sales_analytics
    // =============================================

    let tableExists = false;
    try {
      const { data: tableCheck, error: tableError } = await restaurantSupabase
        .from('sales_analytics')
        .select('id')
        .limit(1);

      if (!tableError) {
        tableExists = true;
      }
    } catch (err) {
      // Tabla no existe
    }

    if (!tableExists) {
      const response: VerifySetupResponse = {
        success: false,
        error: 'Tabla sales_analytics no encontrada. Ejecuta el script primero.',
      };

      // Actualizar estado
      await citricaSupabase
        .from('sales_projects')
        .update({
          setup_status: 'failed',
          connection_status: 'error',
          connection_error: 'Tabla sales_analytics no encontrada',
        })
        .eq('id', projectId);

      return NextResponse.json(response);
    }

    // =============================================
    // PASO 2: Verificar RPC get_sales_data_for_export
    // =============================================

    let rpcWorks = false;
    let rpcError: string | null = null;

    try {
      const { data: rpcData, error: rpcErr } = await restaurantSupabase.rpc(
        'get_sales_data_for_export',
        {
          p_start_date: '2026-01-01',
          p_end_date: '2026-01-02',
        }
      );

      if (!rpcErr) {
        rpcWorks = true;
      } else {
        rpcError = rpcErr.message;
      }
    } catch (err: any) {
      rpcError = err.message || 'RPC no disponible';
    }

    if (!rpcWorks) {
      const response: VerifySetupResponse = {
        success: false,
        error: `RPC get_sales_data_for_export no funciona: ${rpcError}`,
      };

      // Actualizar estado
      await citricaSupabase
        .from('sales_projects')
        .update({
          setup_status: 'failed',
          connection_status: 'error',
          connection_error: `RPC no funciona: ${rpcError}`,
        })
        .eq('id', projectId);

      return NextResponse.json(response);
    }

    // =============================================
    // ✅ VERIFICACIÓN EXITOSA
    // =============================================

    await citricaSupabase
      .from('sales_projects')
      .update({
        setup_status: 'completed',
        connection_status: 'connected',
        connection_error: null,
        data_extraction_strategy: 'rpc',
        rpc_name: 'get_sales_data_for_export',
        requires_setup: false,
        last_connection_check: new Date().toISOString(),
      })
      .eq('id', projectId);

    const response: VerifySetupResponse = {
      success: true,
      message: '✅ Proyecto configurado correctamente. Sistema listo para generar reportes.',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
