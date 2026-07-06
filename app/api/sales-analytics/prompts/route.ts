// =============================================
// API Route: /api/sales-analytics/prompts
// CRUD de prompts de Sales Analytics
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;

// =============================================
// GET - Obtener prompts de un proyecto
// =============================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    const { data: prompt, error } = await supabase
      .from('sales_prompts')
      .insert({
        project_id,
        version_name: version_name || `v${Date.now()}`,
        system_prompt,
        user_prompt_template,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 4000,
        is_active: is_active !== undefined ? is_active : false,
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
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { success: false, error: 'id y updates son requeridos' },
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
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
