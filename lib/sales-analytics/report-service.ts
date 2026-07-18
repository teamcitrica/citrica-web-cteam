import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { decrypt } from "./encryptionHelpers";
import { parseAnalysisJson, type ReportAnalysis } from "./report-contract";
import { getGeminiApiKey } from "@/lib/ai/gemini-api-key";
import { calculateCost } from "@/lib/ai/gemini-service";

export interface RunReportResult {
  ok: boolean;
  reportId?: string;
  snapshotId?: string;
  error?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number; costUsd: number };
}

/**
 * Núcleo ÚNICO de generación de reportes semanales.
 * Lo usan la ruta manual y el cron — sin self-calls HTTP.
 *
 * Flujo: proyecto → datos del Supabase externo (RPC) → snapshot →
 * prompt activo → Gemini (key seleccionada del sistema) → sales_weekly_reports.
 */
export async function runWeeklyReport(params: {
  supabase: SupabaseClient; // cliente service-role de la DB citrica
  projectId: string;
  source: "cron" | "manual";
  periodStart?: string; // YYYY-MM-DD; default: 7 días cerrados ayer
  periodEnd?: string;
}): Promise<RunReportResult> {
  const { supabase, projectId, source } = params;

  // ================================================================
  // 1. PROYECTO
  // ================================================================
  const { data: project, error: projectError } = await supabase
    .from("sales_projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return { ok: false, error: "Proyecto no encontrado" };
  }
  if (!project.is_active) {
    return { ok: false, error: "El proyecto está inactivo" };
  }
  if (project.connection_status !== "connected") {
    return { ok: false, error: "El proyecto no está conectado. Verifica la conexión primero." };
  }
  if ((project.data_extraction_strategy || "rpc") !== "rpc") {
    return { ok: false, error: `Estrategia '${project.data_extraction_strategy}' no soportada (solo rpc)` };
  }

  // ================================================================
  // 2. PERÍODO: 7 días completos terminando ayer
  // ================================================================
  let periodStart = params.periodStart;
  let periodEnd = params.periodEnd;
  if (!periodStart || !periodEnd) {
    const end = new Date();
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    periodEnd = end.toISOString().slice(0, 10);
    periodStart = start.toISOString().slice(0, 10);
  }

  // ================================================================
  // 3. DATOS DEL SUPABASE EXTERNO (credencial descifrada)
  // ================================================================
  let externalKey: string;
  try {
    externalKey = decrypt(project.supabase_anon_key);
  } catch (e: any) {
    return { ok: false, error: `No se pudo descifrar la credencial del proyecto: ${e.message}` };
  }

  const external = createClient(project.supabase_url, externalKey, {
    auth: { persistSession: false },
  });

  const rpcName = project.rpc_name || "get_sales_data_for_export";
  const { data: salesRows, error: rpcError } = await external.rpc(rpcName, {
    p_start_date: periodStart,
    p_end_date: periodEnd,
  });

  if (rpcError) {
    return { ok: false, error: `Error consultando ventas externas (${rpcName}): ${rpcError.message}` };
  }
  if (!salesRows || salesRows.length === 0) {
    return { ok: false, error: `Sin datos de ventas en el período ${periodStart} a ${periodEnd}` };
  }

  // Totales: RPC de resumen si existe (exacto); si no, agregación aproximada
  // (las filas vienen agrupadas por producto — sumar order_count sobreconta órdenes)
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalCustomers = 0;

  const { data: summary, error: summaryError } = await external.rpc("get_sales_summary", {
    p_start_date: periodStart,
    p_end_date: periodEnd,
  });

  if (!summaryError && summary && summary.length > 0) {
    totalRevenue = Number(summary[0].total_revenue) || 0;
    totalOrders = Number(summary[0].total_orders) || 0;
    totalCustomers = Number(summary[0].total_customers) || 0;
  } else {
    totalRevenue = salesRows.reduce((sum: number, r: any) => sum + (Number(r.total_revenue) || 0), 0);
    totalOrders = salesRows.reduce((sum: number, r: any) => sum + (Number(r.order_count) || 0), 0);
    totalCustomers = Math.max(...salesRows.map((r: any) => Number(r.customer_count) || 0), 0);
    console.warn("⚠️ get_sales_summary no disponible; órdenes/clientes son aproximados");
  }

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // ================================================================
  // 4. SNAPSHOT (upsert por proyecto+período)
  // ================================================================
  const { data: snapshot, error: snapshotError } = await supabase
    .from("sales_data_snapshots")
    .upsert(
      {
        project_id: projectId,
        period_start: periodStart,
        period_end: periodEnd,
        sales_data: salesRows,
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_customers: totalCustomers,
        avg_order_value: avgOrderValue,
        source,
      },
      { onConflict: "project_id,period_start,period_end" }
    )
    .select()
    .single();

  if (snapshotError || !snapshot) {
    return { ok: false, error: `Error guardando snapshot: ${snapshotError?.message}` };
  }

  // ================================================================
  // 5. PROMPT ACTIVO
  // ================================================================
  const { data: promptConfig, error: promptError } = await supabase
    .from("sales_prompts")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .single();

  if (promptError || !promptConfig) {
    return { ok: false, error: "El proyecto no tiene prompt activo", snapshotId: snapshot.id };
  }

  const userPrompt = (promptConfig.user_prompt_template as string)
    .replace(/\{projectName\}/g, project.name)
    .replace(/\{periodStart\}/g, periodStart)
    .replace(/\{periodEnd\}/g, periodEnd)
    .replace(/\{salesData\}/g, JSON.stringify(salesRows, null, 2))
    .replace(/\{totalRevenue\}/g, totalRevenue.toFixed(2))
    .replace(/\{totalOrders\}/g, String(totalOrders))
    .replace(/\{totalCustomers\}/g, String(totalCustomers))
    .replace(/\{avgOrderValue\}/g, avgOrderValue.toFixed(2));

  // ================================================================
  // 6. MODELO + KEY (sistema principal: api_config seleccionada + ai_model_config)
  // ================================================================
  const apiKey = await getGeminiApiKey(supabase);
  if (!apiKey) {
    return { ok: false, error: "No hay API key de Gemini configurada (Admin > IA > Configuración)", snapshotId: snapshot.id };
  }

  let modelId: string = project.ai_model;
  let modelCosts: { input: number; output: number } | null = null;

  const modelQuery = supabase
    .from("ai_model_config")
    .select("model_id, cost_per_1m_input_tokens, cost_per_1m_output_tokens")
    .eq("is_active", true);

  const { data: modelRow } = modelId
    ? await modelQuery.eq("model_id", modelId).single()
    : await modelQuery.eq("is_default", true).single();

  if (modelRow) {
    modelId = modelRow.model_id;
    modelCosts = {
      input: Number(modelRow.cost_per_1m_input_tokens) || 0,
      output: Number(modelRow.cost_per_1m_output_tokens) || 0,
    };
  } else if (!modelId) {
    modelId = "gemini-2.5-flash";
  }

  // ================================================================
  // 7. GEMINI (key explícita, nunca mutar process.env)
  // ================================================================
  const googleProvider = createGoogleGenerativeAI({ apiKey });

  let resultText: string;
  let usage: any;
  try {
    const result = await generateText({
      model: googleProvider(modelId),
      system: promptConfig.system_prompt,
      prompt: userPrompt,
      temperature: promptConfig.temperature ?? 0.7,
    });
    resultText = result.text;
    usage = result.usage;
  } catch (e: any) {
    return { ok: false, error: `Error de Gemini: ${e.message}`, snapshotId: snapshot.id };
  }

  // Tokens: AI SDK v5+ usa inputTokens/outputTokens; lectura dual por compatibilidad
  const promptTokens = usage?.inputTokens ?? usage?.promptTokens ?? 0;
  const completionTokens = usage?.outputTokens ?? usage?.completionTokens ?? 0;
  const totalTokens = usage?.totalTokens ?? promptTokens + completionTokens;
  const costUsd = modelCosts
    ? (promptTokens / 1_000_000) * modelCosts.input + (completionTokens / 1_000_000) * modelCosts.output
    : calculateCost(promptTokens, completionTokens);

  // ================================================================
  // 8. GUARDAR REPORTE (contrato único, upsert por proyecto+período)
  // ================================================================
  const analysis: ReportAnalysis = parseAnalysisJson(resultText);

  const { data: report, error: reportError } = await supabase
    .from("sales_weekly_reports")
    .upsert(
      {
        project_id: projectId,
        snapshot_id: snapshot.id,
        period_start: periodStart,
        period_end: periodEnd,
        ai_analysis: analysis.analysis,
        recommendations: analysis.recommendations,
        key_insights: analysis.keyInsights,
        top_products: analysis.topProducts,
        worst_products: analysis.worstProducts,
        trends: analysis.trends,
        model_used: modelId,
        prompt_version: promptConfig.version || 1,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        cost_usd: costUsd,
        generated_by: source === "cron" ? "system" : "manual",
      },
      { onConflict: "project_id,period_start,period_end" }
    )
    .select()
    .single();

  if (reportError || !report) {
    return { ok: false, error: `Error guardando reporte: ${reportError?.message}`, snapshotId: snapshot.id };
  }

  await supabase
    .from("sales_projects")
    .update({ last_report_generated_at: new Date().toISOString() })
    .eq("id", projectId);

  console.log(`📊 Reporte ${source} generado para "${project.name}" (${periodStart} a ${periodEnd}) — ${totalTokens} tokens, $${costUsd.toFixed(6)}`);

  return {
    ok: true,
    reportId: report.id,
    snapshotId: snapshot.id,
    usage: { promptTokens, completionTokens, totalTokens, costUsd },
  };
}
