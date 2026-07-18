// =============================================
// API Route: /api/sales-analytics/chat
// Chat interactivo sobre las ventas del proyecto.
// Contexto = últimos reportes generados. Persistencia = un registro
// por intercambio en sales_chat_conversations (esquema real de la tabla).
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { requireSession, getServiceClient } from '@/lib/sales-analytics/api-helpers';
import { getGeminiApiKey } from '@/lib/ai/gemini-api-key';
import { calculateCost } from '@/lib/ai/gemini-service';

// =============================================
// POST - Enviar mensaje al chat
// =============================================

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;

  try {
    const supabase = getServiceClient();
    const body = await request.json();

    const { project_id, message, include_context = true } = body;

    if (!project_id || !message) {
      return NextResponse.json(
        { success: false, error: 'project_id y message son requeridos' },
        { status: 400 }
      );
    }

    // 1. Proyecto
    const { data: project, error: projectError } = await supabase
      .from('sales_projects')
      .select('id, name, ai_model')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    // 2. Contexto: últimos 3 reportes (contrato real: ai_analysis, key_insights...)
    let context = '';
    let contextUsed = false;

    if (include_context) {
      const { data: reports } = await supabase
        .from('sales_weekly_reports')
        .select('period_start, period_end, ai_analysis, recommendations, key_insights, top_products')
        .eq('project_id', project_id)
        .order('generated_at', { ascending: false })
        .limit(3);

      if (reports && reports.length > 0) {
        contextUsed = true;
        context = reports
          .map(
            (r) =>
              `Reporte ${r.period_start} a ${r.period_end}:\n` +
              `Análisis: ${r.ai_analysis}\n` +
              `Insights: ${JSON.stringify(r.key_insights)}\n` +
              `Top productos: ${JSON.stringify(r.top_products)}\n` +
              `Recomendaciones: ${(r.recommendations || []).join('; ')}`
          )
          .join('\n\n---\n\n');
      }
    }

    // 3. Historial reciente para memoria conversacional
    const { data: history } = await supabase
      .from('sales_chat_conversations')
      .select('user_message, assistant_response')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false })
      .limit(5);

    const historyText = (history || [])
      .reverse()
      .map((h) => `Usuario: ${h.user_message}\nAsistente: ${h.assistant_response}`)
      .join('\n');

    // 4. Key y modelo del sistema principal
    const apiKey = await getGeminiApiKey(supabase);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'No hay API key de Gemini configurada (Admin > IA > Configuración)' },
        { status: 400 }
      );
    }

    let modelId: string = project.ai_model;
    let modelCosts: { input: number; output: number } | null = null;

    const { data: modelRow } = modelId
      ? await supabase
          .from('ai_model_config')
          .select('model_id, cost_per_1m_input_tokens, cost_per_1m_output_tokens')
          .eq('is_active', true)
          .eq('model_id', modelId)
          .single()
      : await supabase
          .from('ai_model_config')
          .select('model_id, cost_per_1m_input_tokens, cost_per_1m_output_tokens')
          .eq('is_active', true)
          .eq('is_default', true)
          .single();

    if (modelRow) {
      modelId = modelRow.model_id;
      modelCosts = {
        input: Number(modelRow.cost_per_1m_input_tokens) || 0,
        output: Number(modelRow.cost_per_1m_output_tokens) || 0,
      };
    } else if (!modelId) {
      modelId = 'gemini-2.5-flash';
    }

    // 5. Generar respuesta
    const googleProvider = createGoogleGenerativeAI({ apiKey });

    const systemPrompt =
      `Eres un analista de ventas del proyecto "${project.name}". ` +
      `Responde en español, claro y accionable, basándote en los reportes disponibles.` +
      (context ? `\n\nContexto de reportes recientes:\n${context}` : '') +
      (historyText ? `\n\nConversación previa:\n${historyText}` : '');

    const result = await generateText({
      model: googleProvider(modelId),
      system: systemPrompt,
      prompt: message,
      temperature: 0.7,
    });

    // Tokens: AI SDK v5+ usa inputTokens/outputTokens; lectura dual por compatibilidad
    const usage: any = result.usage;
    const promptTokens = usage?.inputTokens ?? usage?.promptTokens ?? 0;
    const completionTokens = usage?.outputTokens ?? usage?.completionTokens ?? 0;
    const totalTokens = usage?.totalTokens ?? promptTokens + completionTokens;
    const costUsd = modelCosts
      ? (promptTokens / 1_000_000) * modelCosts.input + (completionTokens / 1_000_000) * modelCosts.output
      : calculateCost(promptTokens, completionTokens);

    // 6. Persistir el intercambio (una fila por pregunta+respuesta)
    const { data: exchange, error: insertError } = await supabase
      .from('sales_chat_conversations')
      .insert({
        project_id,
        user_message: message,
        assistant_response: result.text,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        cost_usd: costUsd,
        model: modelId,
        context_used: contextUsed,
        created_by: session.user!.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error guardando intercambio de chat:', insertError);
    }

    return NextResponse.json({
      success: true,
      response: result.text,
      exchange_id: exchange?.id || null,
      tokens: totalTokens,
      cost: costUsd,
      context_used: contextUsed,
    });
  } catch (error: any) {
    console.error('Error en chat de ventas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error en el chat' },
      { status: 500 }
    );
  }
}

// =============================================
// GET - Historial de intercambios del proyecto
// =============================================

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;

  try {
    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'project_id es requerido' },
        { status: 400 }
      );
    }

    const { data: exchanges, error } = await supabase
      .from('sales_chat_conversations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ success: true, exchanges: exchanges || [] });
  } catch (error: any) {
    console.error('Error obteniendo historial de chat:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE - Borrar historial (por intercambio o proyecto completo)
// =============================================

export async function DELETE(request: NextRequest) {
  const session = await requireSession();
  if (session.errorResponse) return session.errorResponse;

  try {
    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const exchangeId = searchParams.get('id');
    const projectId = searchParams.get('project_id');

    if (!exchangeId && !projectId) {
      return NextResponse.json(
        { success: false, error: 'id o project_id es requerido' },
        { status: 400 }
      );
    }

    const query = supabase.from('sales_chat_conversations').delete();
    const { error } = exchangeId
      ? await query.eq('id', exchangeId)
      : await query.eq('project_id', projectId!);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error borrando historial de chat:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
