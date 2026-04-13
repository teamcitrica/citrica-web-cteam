// =============================================
// API Route: /api/sales-analytics/generate-report
// Generar análisis de ventas con IA (Gemini)
// =============================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { decrypt } from '@/lib/sales-analytics/encryptionHelpers';
import type { GenerateReportRequest, GenerateReportResponse } from '@/types/sales-analytics';

const citricaSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { projectId, snapshotId, mode }: GenerateReportRequest =
      await request.json();

    if (!projectId || !snapshotId) {
      return NextResponse.json(
        { success: false, error: 'projectId y snapshotId son requeridos' },
        { status: 400 }
      );
    }

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
    // 2. Obtener snapshot
    // =============================================

    const { data: snapshot, error: snapshotError } = await citricaSupabase
      .from('sales_data_snapshots')
      .select('*')
      .eq('id', snapshotId)
      .single();

    if (snapshotError || !snapshot) {
      return NextResponse.json(
        { success: false, error: 'Snapshot no encontrado' },
        { status: 404 }
      );
    }

    // =============================================
    // 3. Obtener prompt activo
    // =============================================

    const { data: promptConfig, error: promptError } = await citricaSupabase
      .from('sales_prompts')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    if (promptError || !promptConfig) {
      return NextResponse.json(
        { success: false, error: 'Prompt no encontrado' },
        { status: 404 }
      );
    }

    // =============================================
    // 4. Obtener modelo de IA
    // =============================================

    const { data: modelConfig, error: modelError } = await citricaSupabase
      .from('sales_model_config')
      .select('*')
      .eq('id', project.ai_model_id)
      .single();

    if (modelError || !modelConfig) {
      return NextResponse.json(
        { success: false, error: 'Modelo de IA no encontrado' },
        { status: 404 }
      );
    }

    // =============================================
    // 5. Obtener API key
    // =============================================

    let apiKey: string;

    if (project.use_custom_api_key && project.custom_api_key) {
      // API key personalizada del proyecto
      apiKey = decrypt(project.custom_api_key);
    } else {
      // API key global
      const { data: apiConfig, error: apiError } = await citricaSupabase
        .from('sales_api_config')
        .select('api_key')
        .eq('provider', 'gemini')
        .eq('is_active', true)
        .single();

      if (apiError || !apiConfig) {
        return NextResponse.json(
          { success: false, error: 'API key de Gemini no configurada' },
          { status: 500 }
        );
      }

      apiKey = decrypt(apiConfig.api_key);
    }

    // =============================================
    // 6. Preparar contexto
    // =============================================

    const context = {
      projectName: project.name,
      periodStart: snapshot.period_start,
      periodEnd: snapshot.period_end,
      salesData: JSON.stringify(snapshot.sales_data, null, 2),
      totalRevenue: snapshot.total_revenue?.toFixed(2) || '0.00',
      totalOrders: snapshot.total_orders?.toString() || '0',
      totalCustomers: snapshot.total_customers?.toString() || '0',
      avgOrderValue: snapshot.avg_order_value?.toFixed(2) || '0.00',
    };

    // =============================================
    // 7. Reemplazar placeholders en prompts
    // =============================================

    const systemPrompt = promptConfig.system_prompt;

    const userPrompt = promptConfig.user_prompt_template
      .replace(/\{projectName\}/g, context.projectName)
      .replace(/\{periodStart\}/g, context.periodStart)
      .replace(/\{periodEnd\}/g, context.periodEnd)
      .replace(/\{salesData\}/g, context.salesData)
      .replace(/\{totalRevenue\}/g, context.totalRevenue)
      .replace(/\{totalOrders\}/g, context.totalOrders)
      .replace(/\{totalCustomers\}/g, context.totalCustomers)
      .replace(/\{avgOrderValue\}/g, context.avgOrderValue);

    // =============================================
    // 8. Llamar a Gemini
    // =============================================

    // Configurar API key en variable de entorno temporalmente
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    const geminiModel = google(modelConfig.model_id);

    const result = await generateText({
      model: geminiModel,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: promptConfig.temperature,
    });

    // =============================================
    // 9. Parsear respuesta JSON
    // =============================================

    let analysisData: any;

    try {
      // Intentar extraer JSON del response
      const jsonMatch =
        result.text.match(/```json\n([\s\S]*?)\n```/) ||
        result.text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        analysisData = JSON.parse(jsonString);
      } else {
        // No se encontró JSON, usar texto plano
        analysisData = {
          analysis: result.text,
          recommendations: [],
          keyInsights: {},
          topProducts: [],
          worstProducts: [],
          trends: {},
        };
      }
    } catch (parseError) {
      // Error parseando JSON, usar texto plano
      analysisData = {
        analysis: result.text,
        recommendations: ['Error parseando respuesta JSON'],
        keyInsights: {},
        topProducts: [],
        worstProducts: [],
        trends: {},
      };
    }

    // =============================================
    // 10. Calcular costo
    // =============================================

    const usage = result.usage as any; // LanguageModelUsage type varies by SDK version
    const promptTokens = usage?.promptTokens || 0;
    const completionTokens = usage?.completionTokens || 0;
    const totalTokens = usage?.totalTokens || (promptTokens + completionTokens);

    const promptCost =
      (promptTokens / 1_000_000) *
      modelConfig.cost_per_1m_input_tokens;
    const completionCost =
      (completionTokens / 1_000_000) *
      modelConfig.cost_per_1m_output_tokens;
    const totalCost = promptCost + completionCost;

    // =============================================
    // 11. Construir respuesta
    // =============================================

    const response: GenerateReportResponse = {
      success: true,
      analysis: analysisData.analysis || '',
      recommendations: analysisData.recommendations || [],
      keyInsights: analysisData.keyInsights || {},
      topProducts: analysisData.topProducts || [],
      worstProducts: analysisData.worstProducts || [],
      trends: analysisData.trends || {},
      modelUsed: modelConfig.model_id,
      promptVersion: promptConfig.version,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd: totalCost,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error generando reporte:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error generando reporte con IA',
      },
      { status: 500 }
    );
  }
}
