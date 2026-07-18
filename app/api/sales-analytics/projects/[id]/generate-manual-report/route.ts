// =============================================
// API Route: /api/sales-analytics/projects/[id]/generate-manual-report
// Genera un reporte semanal bajo demanda (mismo núcleo que el cron)
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getServiceClient } from '@/lib/sales-analytics/api-helpers';
import { runWeeklyReport } from '@/lib/sales-analytics/report-service';

export const maxDuration = 300;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;

  const { id: projectId } = await params;
  if (!projectId) {
    return NextResponse.json(
      { success: false, error: 'ID de proyecto requerido' },
      { status: 400 }
    );
  }

  try {
    const supabase = getServiceClient();
    const result = await runWeeklyReport({ supabase, projectId, source: 'manual' });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error, snapshotId: result.snapshotId },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      reportId: result.reportId,
      snapshotId: result.snapshotId,
      usage: result.usage,
    });
  } catch (error: any) {
    console.error('Error generando reporte manual:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error generando reporte' },
      { status: 500 }
    );
  }
}
