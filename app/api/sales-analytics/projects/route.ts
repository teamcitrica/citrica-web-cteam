// =============================================
// API Route: /api/sales-analytics/projects
// CRUD de proyectos de Sales Analytics
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/sales-analytics/encryptionHelpers';
import { requireSession, getServiceClient } from '@/lib/sales-analytics/api-helpers';
import {
  generateCronExpression,
  getNextExecution,
  slugify,
} from '@/lib/sales-analytics/cronHelpers';
import type { CreateProjectRequest } from '@/types/sales-analytics';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_PROMPT_TEMPLATE } from '@/types/sales-analytics';

// =============================================
// GET: Listar proyectos
// =============================================

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;
  const citricaSupabase = getServiceClient();

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    // Si hay ID, obtener proyecto específico
    if (projectId) {
      const { data, error } = await citricaSupabase
        .from('sales_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, project: data });
    }

    // Listar todos los proyectos
    const { data: projects, error } = await citricaSupabase
      .from('sales_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// POST: Crear proyecto
// =============================================

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;
  const citricaSupabase = getServiceClient();

  try {
    const formData: CreateProjectRequest = await request.json();

    // Validaciones
    if (!formData.name || !formData.supabase_url || !formData.supabase_anon_key) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Generar slug único
    let slug = slugify(formData.name);
    let slugSuffix = 1;
    let isSlugUnique = false;

    while (!isSlugUnique) {
      const { data } = await citricaSupabase
        .from('sales_projects')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!data) {
        isSlugUnique = true;
      } else {
        slug = `${slugify(formData.name)}-${slugSuffix}`;
        slugSuffix++;
      }
    }

    // Encriptar credencial del Supabase externo
    const encryptedAnonKey = encrypt(formData.supabase_anon_key);

    // Generar cron expression
    const cronExpression = generateCronExpression(
      formData.report_frequency,
      formData.report_day,
      formData.report_time
    );

    // Calcular próxima ejecución
    const nextExecution = getNextExecution(cronExpression, formData.timezone);

    // Usuario real de la sesión (no headers falsificables)
    const userId = session.user!.id;

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
        data_extraction_strategy: 'rpc', // v1: solo estrategia RPC
        report_frequency: formData.report_frequency,
        cron_expression: cronExpression,
        timezone: formData.timezone,
        next_scheduled_execution: nextExecution,
        ai_model: formData.ai_model || null, // NULL = modelo default del sistema
        is_active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Crear prompt default
    await citricaSupabase.from('sales_prompts').insert({
      project_id: project.id,
      system_prompt: DEFAULT_SYSTEM_PROMPT,
      user_prompt_template: DEFAULT_USER_PROMPT_TEMPLATE,
      response_format: 'json',
      temperature: 0.7,
      max_tokens: 4096,
      version: 1,
      version_name: 'Prompt inicial',
      is_active: true,
      created_by: userId,
    });

    // (WhatsApp fuera de alcance por ahora; la tabla sales_whatsapp_recipients
    // queda disponible para cuando se integre un proveedor de envío)

    return NextResponse.json({
      success: true,
      projectId: project.id,
      slug: project.slug,
      requiresSetup: project.requires_setup,
      setupStatus: project.setup_status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// PATCH: Actualizar proyecto
// =============================================

export async function PATCH(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;
  const citricaSupabase = getServiceClient();

  try {
    const { id, updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de proyecto requerido' },
        { status: 400 }
      );
    }

    // Encriptar credencial si se actualiza
    if (updates.supabase_anon_key) {
      updates.supabase_anon_key = encrypt(updates.supabase_anon_key);
    }

    // Actualizar cron expression si cambia la configuración
    if (
      updates.report_frequency ||
      updates.report_day ||
      updates.report_time
    ) {
      // Obtener proyecto actual para valores faltantes
      const { data: currentProject } = await citricaSupabase
        .from('sales_projects')
        .select('report_frequency, cron_expression, timezone')
        .eq('id', id)
        .single();

      const cronExpression = generateCronExpression(
        updates.report_frequency || currentProject?.report_frequency,
        updates.report_day,
        updates.report_time
      );

      updates.cron_expression = cronExpression;
      updates.next_scheduled_execution = getNextExecution(
        cronExpression,
        updates.timezone || currentProject?.timezone || 'UTC'
      );
    }

    const { data, error } = await citricaSupabase
      .from('sales_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, project: data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE: Eliminar proyecto
// =============================================

export async function DELETE(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;
  const citricaSupabase = getServiceClient();

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'ID de proyecto requerido' },
        { status: 400 }
      );
    }

    // Soft delete: marcar como inactivo
    const { error } = await citricaSupabase
      .from('sales_projects')
      .update({ is_active: false })
      .eq('id', projectId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Proyecto desactivado exitosamente',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
