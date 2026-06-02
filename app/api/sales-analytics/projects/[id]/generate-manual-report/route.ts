// =============================================
// API Route: POST /api/sales-analytics/projects/[id]/generate-manual-report
// Generar reporte manual (extrae data + genera análisis IA)
// =============================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const citricaSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // =============================================
    // 1. Obtener proyecto
    // =============================================

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

    // =============================================
    // 2. Calcular período (últimos 7 días)
    // =============================================

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Ayer
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7); // Hace 7 días

    const periodStart = startDate.toISOString().split('T')[0];
    const periodEnd = endDate.toISOString().split('T')[0];

    // =============================================
    // 3. Extraer data de ventas del restaurante
    // =============================================

    let salesData: any[] = [];

    try {
      if (project.data_extraction_strategy === 'rpc') {
        // Conectar al Supabase del restaurante
        const restaurantSupabase = createClient(
          project.supabase_url,
          project.supabase_anon_key // TODO: Desencriptar cuando implementes encriptación
        );

        // Ejecutar RPC
        const { data, error } = await restaurantSupabase.rpc(
          project.rpc_name || 'get_sales_data_for_export',
          {
            p_start_date: periodStart,
            p_end_date: periodEnd,
          }
        );

        if (error) {
          throw new Error(`Error ejecutando RPC: ${error.message}`);
        }

        salesData = data || [];
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `Estrategia ${project.data_extraction_strategy} no implementada aún`,
          },
          { status: 400 }
        );
      }
    } catch (extractError: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Error extrayendo data: ${extractError.message}`,
        },
        { status: 500 }
      );
    }

    // =============================================
    // 4. Calcular métricas agregadas
    // =============================================

    const totalRevenue = salesData.reduce(
      (sum, item) => sum + parseFloat(item.total_revenue || 0),
      0
    );
    const uniqueOrders = new Set(salesData.map((item) => item.order_id || item.product_name));
    const totalOrders = uniqueOrders.size;
    const totalCustomers = salesData.reduce(
      (sum, item) => sum + parseInt(item.customer_count || 0),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // =============================================
    // 5. Guardar snapshot
    // =============================================

    const { data: snapshot, error: snapshotError } = await citricaSupabase
      .from('sales_data_snapshots')
      .insert({
        project_id: projectId,
        period_start: periodStart,
        period_end: periodEnd,
        sales_data: salesData,
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_customers: totalCustomers,
        avg_order_value: avgOrderValue,
        source: 'manual',
      })
      .select()
      .single();

    // Si ya existe un snapshot para este período, actualizarlo
    if (snapshotError && snapshotError.code === '23505') {
      const { data: updatedSnapshot } = await citricaSupabase
        .from('sales_data_snapshots')
        .update({
          sales_data: salesData,
          total_revenue: totalRevenue,
          total_orders: totalOrders,
          total_customers: totalCustomers,
          avg_order_value: avgOrderValue,
          received_at: new Date().toISOString(),
          source: 'manual',
        })
        .eq('project_id', projectId)
        .eq('period_start', periodStart)
        .eq('period_end', periodEnd)
        .select()
        .single();

      if (!updatedSnapshot) {
        return NextResponse.json(
          { success: false, error: 'Error actualizando snapshot' },
          { status: 500 }
        );
      }

      // Usar snapshot actualizado
      const snapshotId = updatedSnapshot.id;

      // =============================================
      // 6. Generar análisis con IA
      // =============================================

      const analysisResponse = await fetch(
        `${process.env.CITRICA_API_URL || 'http://localhost:3000'}/api/sales-analytics/generate-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            snapshotId,
            mode: 'manual',
          }),
        }
      );

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        return NextResponse.json(
          {
            success: false,
            error: `Error generando análisis: ${errorData.error || 'Unknown'}`,
          },
          { status: 500 }
        );
      }

      const analysis = await analysisResponse.json();

      // =============================================
      // 7. Guardar reporte
      // =============================================

      const now = new Date();
      const weekOfYear = getWeekNumber(now);
      const year = now.getFullYear();

      const { data: report, error: reportError } = await citricaSupabase
        .from('sales_weekly_reports')
        .insert({
          project_id: projectId,
          snapshot_id: snapshotId,
          period_start: periodStart,
          period_end: periodEnd,
          week_of_year: weekOfYear,
          year: year,
          ai_analysis: analysis.analysis || '',
          recommendations: analysis.recommendations || [],
          key_insights: analysis.keyInsights || {},
          top_products: analysis.topProducts || [],
          worst_products: analysis.worstProducts || [],
          trends: analysis.trends || {},
          generated_by: 'manual',
          model_used: analysis.modelUsed || '',
          prompt_version: analysis.promptVersion || 1,
          prompt_tokens: analysis.usage?.promptTokens || 0,
          completion_tokens: analysis.usage?.completionTokens || 0,
          total_tokens: analysis.usage?.totalTokens || 0,
          cost_usd: analysis.usage?.costUsd || 0,
        })
        .select()
        .single();

      // Si ya existe reporte, actualizar
      if (reportError && reportError.code === '23505') {
        const { data: updatedReport } = await citricaSupabase
          .from('sales_weekly_reports')
          .update({
            ai_analysis: analysis.analysis || '',
            recommendations: analysis.recommendations || [],
            key_insights: analysis.keyInsights || {},
            top_products: analysis.topProducts || [],
            worst_products: analysis.worstProducts || [],
            trends: analysis.trends || {},
            generated_by: 'manual',
            model_used: analysis.modelUsed || '',
            prompt_version: analysis.promptVersion || 1,
            prompt_tokens: analysis.usage?.promptTokens || 0,
            completion_tokens: analysis.usage?.completionTokens || 0,
            total_tokens: analysis.usage?.totalTokens || 0,
            cost_usd: analysis.usage?.costUsd || 0,
            generated_at: new Date().toISOString(),
          })
          .eq('project_id', projectId)
          .eq('period_start', periodStart)
          .eq('period_end', periodEnd)
          .select()
          .single();

        return NextResponse.json({
          success: true,
          report: updatedReport,
          snapshot: updatedSnapshot,
          message: 'Reporte actualizado exitosamente',
        });
      }

      if (reportError) {
        return NextResponse.json(
          { success: false, error: `Error guardando reporte: ${reportError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        report,
        snapshot: updatedSnapshot,
        message: 'Reporte generado exitosamente',
      });
    }

    if (snapshotError) {
      return NextResponse.json(
        { success: false, error: `Error creando snapshot: ${snapshotError.message}` },
        { status: 500 }
      );
    }

    // =============================================
    // 6. Generar análisis con IA
    // =============================================

    const analysisResponse = await fetch(
      `${process.env.CITRICA_API_URL || 'http://localhost:3000'}/api/sales-analytics/generate-report`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          snapshotId: snapshot.id,
          mode: 'manual',
        }),
      }
    );

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      return NextResponse.json(
        {
          success: false,
          error: `Error generando análisis: ${errorData.error || 'Unknown'}`,
        },
        { status: 500 }
      );
    }

    const analysis = await analysisResponse.json();

    // =============================================
    // 7. Guardar reporte
    // =============================================

    const now = new Date();
    const weekOfYear = getWeekNumber(now);
    const year = now.getFullYear();

    const { data: report, error: reportError } = await citricaSupabase
      .from('sales_weekly_reports')
      .insert({
        project_id: projectId,
        snapshot_id: snapshot.id,
        period_start: periodStart,
        period_end: periodEnd,
        week_of_year: weekOfYear,
        year: year,
        ai_analysis: analysis.analysis || '',
        recommendations: analysis.recommendations || [],
        key_insights: analysis.keyInsights || {},
        top_products: analysis.topProducts || [],
        worst_products: analysis.worstProducts || [],
        trends: analysis.trends || {},
        generated_by: 'manual',
        model_used: analysis.modelUsed || '',
        prompt_version: analysis.promptVersion || 1,
        prompt_tokens: analysis.usage?.promptTokens || 0,
        completion_tokens: analysis.usage?.completionTokens || 0,
        total_tokens: analysis.usage?.totalTokens || 0,
        cost_usd: analysis.usage?.costUsd || 0,
      })
      .select()
      .single();

    if (reportError) {
      return NextResponse.json(
        { success: false, error: `Error guardando reporte: ${reportError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
      snapshot,
      message: 'Reporte generado exitosamente',
    });
  } catch (error: any) {
    console.error('Error generando reporte manual:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error generando reporte manual',
      },
      { status: 500 }
    );
  }
}

// =============================================
// Helper: Calcular número de semana
// =============================================

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
