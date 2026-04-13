// =============================================
// API Route: /api/sales-analytics/reports
// CRUD de reportes generados
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;

// =============================================
// GET - Obtener reportes de un proyecto
// =============================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const limit = searchParams.get('limit') || '50';

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'project_id es requerido' },
        { status: 400 }
      );
    }

    // Obtener reportes del proyecto
    const { data: reports, error } = await supabase
      .from('sales_weekly_reports')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Error obteniendo reportes:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error('Error en GET /api/sales-analytics/reports:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE - Eliminar un reporte
// =============================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'id es requerido' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('sales_weekly_reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      console.error('Error eliminando reporte:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en DELETE /api/sales-analytics/reports:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
