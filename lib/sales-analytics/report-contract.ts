/**
 * Contrato ÚNICO del análisis generado por IA.
 * Las claves coinciden con el JSON que pide el prompt default
 * (DEFAULT_USER_PROMPT_TEMPLATE en types/sales-analytics.ts) y con las
 * columnas de sales_weekly_reports (ai_analysis, recommendations,
 * key_insights, top_products, worst_products, trends).
 * Generador, visor y chat leen/escriben ESTE contrato — nada de analysis_json.
 */

export interface ReportProduct {
  name: string;
  revenue?: number;
  quantity?: number;
  [key: string]: unknown;
}

export interface ReportAnalysis {
  analysis: string;
  recommendations: string[];
  keyInsights: Record<string, unknown>;
  topProducts: ReportProduct[];
  worstProducts: ReportProduct[];
  trends: Record<string, unknown>;
}

/**
 * Gemini a veces emite saltos de línea/tabs literales dentro de strings JSON
 * (inválido según spec — JSON.parse lanza "Bad control character").
 * Recorre el texto y escapa esos caracteres solo dentro de strings.
 */
function escapeControlCharsInStrings(json: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (const ch of json) {
    if (!inString) {
      if (ch === '"') inString = true;
      out += ch;
      continue;
    }
    if (escaped) {
      out += ch;
      escaped = false;
    } else if (ch === "\\") {
      out += ch;
      escaped = true;
    } else if (ch === '"') {
      inString = false;
      out += ch;
    } else if (ch === "\n") {
      out += "\\n";
    } else if (ch === "\r") {
      out += "\\r";
    } else if (ch === "\t") {
      out += "\\t";
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Extrae el análisis del texto del modelo: fence ```json → objeto {} → texto plano.
 */
export function parseAnalysisJson(text: string): ReportAnalysis {
  const empty: ReportAnalysis = {
    analysis: text,
    recommendations: [],
    keyInsights: {},
    topProducts: [],
    worstProducts: [],
    trends: {},
  };

  try {
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return empty;

    const raw = jsonMatch[1] || jsonMatch[0];
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(escapeControlCharsInStrings(raw));
    }

    return {
      analysis: typeof parsed.analysis === "string" ? parsed.analysis : text,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      keyInsights: parsed.keyInsights && typeof parsed.keyInsights === "object" ? parsed.keyInsights : {},
      topProducts: Array.isArray(parsed.topProducts) ? parsed.topProducts : [],
      worstProducts: Array.isArray(parsed.worstProducts) ? parsed.worstProducts : [],
      trends: parsed.trends && typeof parsed.trends === "object" ? parsed.trends : {},
    };
  } catch {
    return empty;
  }
}
