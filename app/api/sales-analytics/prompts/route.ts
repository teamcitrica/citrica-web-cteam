// =============================================
// API Route: /api/sales-analytics/prompts
// CRUD de prompts de Sales Analytics
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getServiceClient } from '@/lib/sales-analytics/api-helpers';

// =============================================
// GET - Obtener prompts de un proyecto
// =============================================

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;

  try {
    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const promptId = searchParams.get('id');

    // Si se pide un prompt específico
    if (promptId) {
      const { data: prompt, error } = await supabase
        .from('sales_prompts')
        .select('*')
        .eq('id', promptId)
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, prompt });
    }

    // Obtener todos los prompts de un proyecto
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'project_id es requerido' },
        { status: 400 }
      );
    }

    const { data: prompts, error } = await supabase
      .from('sales_prompts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo prompts:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, prompts });
  } catch (error: any) {
    console.error('Error en GET /api/sales-analytics/prompts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// POST - Crear prompt
// =============================================

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;

  try {
    const supabase = getServiceClient();
    const body = await request.json();

    const {
      project_id,
      version_name,
      system_prompt,
      user_prompt_template,
      temperature,
      max_tokens,
      is_active,
    } = body;

    if (!project_id || !system_prompt || !user_prompt_template) {
      return NextResponse.json(
        {
          success: false,
          error: 'project_id, system_prompt y user_prompt_template son requeridos',
        },
        { status: 400 }
      );
    }

    // Versión incremental server-side
    const { data: lastVersion } = await supabase
      .from('sales_prompts')
      .select('version')
      .eq('project_id', project_id)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (lastVersion?.[0]?.version || 0) + 1;

    const { data: prompt, error } = await supabase
      .from('sales_prompts')
      .insert({
        project_id,
        version: nextVersion,
        version_name: version_name || `Versión ${nextVersion}`,
        system_prompt,
        user_prompt_template,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 4000,
        is_active: is_active !== undefined ? is_active : false,
        created_by: session.user!.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando prompt:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, prompt });
  } catch (error: any) {
    console.error('Error en POST /api/sales-analytics/prompts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// PATCH - Actualizar prompt
// =============================================

export async function PATCH(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;

  try {
    const supabase = getServiceClient();
    const body = await request.json();
    const { id, updates, action } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id es requerido' },
        { status: 400 }
      );
    }

    // Activación atómica server-side (reemplaza el N+1 del cliente).
    // Orden importa: primero desactivar todos (respeta el índice único parcial)
    if (action === 'activate') {
      const { data: target } = await supabase
        .from('sales_prompts')
        .select('project_id')
        .eq('id', id)
        .single();

      if (!target) {
        return NextResponse.json(
          { success: false, error: 'Prompt no encontrado' },
          { status: 404 }
        );
      }

      await supabase
        .from('sales_prompts')
        .update({ is_active: false })
        .eq('project_id', target.project_id);

      const { data: activated, error: activateError } = await supabase
        .from('sales_prompts')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single();

      if (activateError) throw activateError;
      return NextResponse.json({ success: true, prompt: activated });
    }

    if (!updates) {
      return NextResponse.json(
        { success: false, error: 'updates es requerido' },
        { status: 400 }
      );
    }

    const { data: prompt, error } = await supabase
      .from('sales_prompts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando prompt:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, prompt });
  } catch (error: any) {
    console.error('Error en PATCH /api/sales-analytics/prompts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE - Eliminar prompt
// =============================================

export async function DELETE(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;

  try {
    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('id');

    if (!promptId) {
      return NextResponse.json(
        { success: false, error: 'id es requerido' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('sales_prompts')
      .delete()
      .eq('id', promptId);

    if (error) {
      console.error('Error eliminando prompt:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en DELETE /api/sales-analytics/prompts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
