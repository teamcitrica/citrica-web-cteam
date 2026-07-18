// =============================================
// Cron: /api/cron/sales-reports
// Scan diario (vercel.json) que ejecuta los reportes semanales vencidos.
// La semanalidad real la da next_scheduled_execution de cada proyecto;
// el scan diario auto-recupera corridas perdidas.
// Protegido por CRON_SECRET.
// =============================================

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/sales-analytics/api-helpers';
import { runWeeklyReport } from '@/lib/sales-analytics/report-service';
import { getNextExecution } from '@/lib/sales-analytics/cronHelpers';

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const results: { projectId: string; name: string; status: string; ms: number; error?: string }[] = [];

  try {
    const { data: dueProjects, error } = await supabase
      .from('sales_projects')
      .select('id, name, cron_expression, timezone')
      .eq('is_active', true)
      .eq('is_paused', false)
      .eq('connection_status', 'connected')
      .lte('next_scheduled_execution', new Date().toISOString());

    if (error) throw error;

    console.log(`⏰ Cron sales-reports: ${dueProjects?.length || 0} proyecto(s) vencido(s)`);

    for (const project of dueProjects || []) {
      const started = Date.now();
      let status: 'success' | 'error' = 'success';
      let errorMessage: string | null = null;

      try {
        const result = await runWeeklyReport({
          supabase,
          projectId: project.id,
          source: 'cron',
        });

        if (!result.ok) {
          status = 'error';
          errorMessage = result.error || 'Error desconocido';
        }
      } catch (e: any) {
        status = 'error';
        errorMessage = e.message || String(e);
      }

      const ms = Date.now() - started;

      await supabase.from('sales_cron_logs').insert({
        project_id: project.id,
        status,
        error_message: errorMessage,
        execution_time_ms: ms,
      });

      // Avanzar SIEMPRE la próxima ejecución (también en error, para no
      // martillar a diario un proyecto roto; el fallo queda en el log)
      await supabase
        .from('sales_projects')
        .update({
          next_scheduled_execution: getNextExecution(
            project.cron_expression || '0 9 * * 1',
            project.timezone || 'UTC'
          ),
        })
        .eq('id', project.id);

      results.push({
        projectId: project.id,
        name: project.name,
        status,
        ms,
        ...(errorMessage ? { error: errorMessage } : {}),
      });
    }

    const succeeded = results.filter((r) => r.status === 'success').length;

    return NextResponse.json({
      processed: results.length,
      succeeded,
      failed: results.length - succeeded,
      results,
    });
  } catch (error: any) {
    console.error('❌ Error en cron sales-reports:', error);
    return NextResponse.json(
      { error: error.message, results },
      { status: 500 }
    );
  }
}
