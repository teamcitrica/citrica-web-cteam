// =============================================
// API Route: /api/sales-analytics/chat
// Chat interactivo con IA y RAG
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;

// =============================================
// POST - Enviar mensaje al chat
// =============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const {
      project_id,
      message,
      conversation_id,
      include_context = true,
    } = body;

    if (!project_id || !message) {
      return NextResponse.json(
        { success: false, error: 'project_id y message son requeridos' },
        { status: 400 }
      );
    }

    // 1. Obtener configuración del proyecto
    const { data: project, error: projectError } = await supabase
      .from('sales_projects')
      .select('*, sales_model_config(*), sales_api_config(*)')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    // 2. Obtener prompt activo
    const { data: activePrompt } = await supabase
      .from('sales_prompts')
      .select('*')
      .eq('project_id', project_id)
      .eq('is_active', true)
      .single();

    // 3. Obtener contexto (últimos 3 reportes) si se requiere
    let contextText = '';
    if (include_context) {
      const { data: recentReports } = await supabase
        .from('sales_weekly_reports')
        .select('*')
        .eq('project_id', project_id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentReports && recentReports.length > 0) {
        contextText = '\n\n**Contexto de reportes recientes:**\n';
        recentReports.forEach((report, index) => {
          const analysis = report.analysis_json as any;
          contextText += `\n**Reporte ${index + 1} (${report.period_start} - ${report.period_end}):**\n`;
          if (analysis?.resumen_ejecutivo) {
            contextText += `${analysis.resumen_ejecutivo}\n`;
          }
          if (analysis?.metricas_clave) {
            contextText += `Métricas: ${JSON.stringify(analysis.metricas_clave)}\n`;
          }
        });
      }
    }

    // 4. Construir prompt del sistema
    const systemPrompt = activePrompt
      ? activePrompt.system_prompt
      : `Eres un asistente de análisis de ventas. Ayudas a responder preguntas sobre datos de ventas de restaurantes.
Tu objetivo es proporcionar insights útiles y recomendaciones accionables basadas en los datos disponibles.`;

    // 5. Construir mensaje del usuario con contexto
    const userMessage = `${message}${contextText}`;

    // 6. Obtener API key
    const modelConfig = project.sales_model_config;
    const apiConfig = project.sales_api_config;

    let apiKey: string;
    if (project.use_custom_api_key && apiConfig?.encrypted_api_key) {
      // Descifrar custom API key (por implementar en producción)
      apiKey = apiConfig.encrypted_api_key; // Por ahora sin descifrar
    } else if (apiConfig?.encrypted_api_key) {
      apiKey = apiConfig.encrypted_api_key;
    } else {
      return NextResponse.json(
        { success: false, error: 'No hay API key configurada' },
        { status: 400 }
      );
    }

    // 7. Configurar modelo de IA
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
    const geminiModel = google(modelConfig.model_id || 'gemini-2.0-flash-exp');

    // 8. Generar respuesta
    const result = await generateText({
      model: geminiModel,
      system: systemPrompt,
      prompt: userMessage,
      temperature: activePrompt?.temperature || 0.7,
    });

    const aiResponse = result.text;

    // 9. Calcular costo
    const usage = result.usage as any;
    const promptTokens = usage?.promptTokens || 0;
    const completionTokens = usage?.completionTokens || 0;
    const totalTokens = promptTokens + completionTokens;

    const inputCost = (promptTokens / 1_000_000) * modelConfig.input_cost_per_million;
    const outputCost = (completionTokens / 1_000_000) * modelConfig.output_cost_per_million;
    const totalCost = inputCost + outputCost;

    // 10. Guardar mensaje en conversación
    let conversationIdToUse = conversation_id;

    if (!conversationIdToUse) {
      // Crear nueva conversación
      const { data: newConversation, error: convError } = await supabase
        .from('sales_chat_conversations')
        .insert({
          project_id,
          title: message.substring(0, 100), // Primeros 100 chars como título
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creando conversación:', convError);
      } else {
        conversationIdToUse = newConversation.id;
      }
    }

    // Guardar mensaje del usuario
    await supabase.from('sales_chat_messages').insert({
      conversation_id: conversationIdToUse,
      role: 'user',
      content: message,
    });

    // Guardar respuesta de la IA
    await supabase.from('sales_chat_messages').insert({
      conversation_id: conversationIdToUse,
      role: 'assistant',
      content: aiResponse,
      model_used: modelConfig.model_id,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_cost: totalCost,
    });

    // 11. Retornar respuesta
    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversation_id: conversationIdToUse,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens,
      },
      cost: totalCost,
    });
  } catch (error: any) {
    console.error('Error en POST /api/sales-analytics/chat:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// GET - Obtener conversaciones o mensajes
// =============================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const conversationId = searchParams.get('conversation_id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'project_id es requerido' },
        { status: 400 }
      );
    }

    // Si se pide conversación específica, retornar sus mensajes
    if (conversationId) {
      const { data: messages, error } = await supabase
        .from('sales_chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, messages });
    }

    // Si no, retornar lista de conversaciones
    const { data: conversations, error } = await supabase
      .from('sales_chat_conversations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    console.error('Error en GET /api/sales-analytics/chat:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE - Eliminar conversación
// =============================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversation_id es requerido' },
        { status: 400 }
      );
    }

    // Eliminar mensajes primero (cascade debería hacerlo automáticamente)
    await supabase
      .from('sales_chat_messages')
      .delete()
      .eq('conversation_id', conversationId);

    // Eliminar conversación
    const { error } = await supabase
      .from('sales_chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en DELETE /api/sales-analytics/chat:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
