import type { SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  getResponseConfig,
  isRealStoreName,
  calculateCost,
  friendlyAIError,
  isQuotaError,
  retryWithBackoff,
} from "@/lib/ai/gemini-service";
import { getGeminiApiKey } from "@/lib/ai/gemini-api-key";
import {
  getRagPromptDefaults,
  resolveRagSystemPrompt,
  STRICT_TEMPERATURE,
} from "@/lib/ai/rag-prompts";

/**
 * Genera la respuesta del bot de WhatsApp reutilizando el RAG existente
 * (misma resolución de API key, modelo, File Search store y prompts que
 * app/api/rag/chat/route.ts) pero SIN streaming: WhatsApp recibe un texto único.
 */

// Cuántos mensajes previos se mandan como memoria conversacional
const HISTORY_LIMIT = 20;

// Tope de salida: WhatsApp corta en 4096 chars y las respuestas largas se leen mal
const MAX_OUTPUT_TOKENS = 1024;

// Instrucción fija del canal: WhatsApp no renderiza Markdown de encabezados/tablas
const CHANNEL_INSTRUCTION =
  "Estás respondiendo por WhatsApp. Escribe mensajes breves y conversacionales " +
  "(máximo 2 o 3 párrafos cortos). No uses Markdown de encabezados, tablas, ni bloques de código: " +
  "WhatsApp solo admite *negrita*, _cursiva_ y listas con guiones. " +
  "No menciones que consultas documentos ni describas tu funcionamiento interno.";

export interface GenerateReplyParams {
  conversationId: string;
  storageId: string;
  userText: string;
}

export type GenerateReplyResult =
  | {
      ok: true;
      text: string;
      model: string;
      promptTokens: number;
      completionTokens: number;
      costUsd: number;
    }
  | { ok: false; error: string };

interface HistoryRow {
  sender_type: string;
  content: string;
}

/**
 * Historial reciente de la conversación como `contents` de Gemini.
 * El mensaje entrante actual ya está insertado en la tabla, así que queda al final.
 * Los mensajes del agente humano entran como "model" para que la IA tenga contexto
 * del takeover y no repita lo que ya dijo una persona.
 * Solo se incluyen mensajes desde context_since: cambiar la base de conocimiento
 * resetea ese marcador para que el guion del documento anterior no contamine.
 */
async function buildContents(
  supabase: SupabaseClient,
  conversationId: string
): Promise<{ role: string; parts: { text: string }[] }[]> {
  const { data: conv } = await supabase
    .from("wa_conversations")
    .select("context_since")
    .eq("id", conversationId)
    .single();

  let query = supabase
    .from("wa_messages")
    .select("sender_type, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  if (conv?.context_since) query = query.gte("created_at", conv.context_since);

  const { data } = await query;

  const rows = ((data || []) as HistoryRow[]).reverse();

  return rows.map((row) => ({
    role: row.sender_type === "user" ? "user" : "model",
    parts: [{ text: row.content }],
  }));
}

export async function generateWhatsAppReply(
  supabase: SupabaseClient,
  params: GenerateReplyParams
): Promise<GenerateReplyResult> {
  const { conversationId, storageId, userText } = params;

  try {
    // ================================================================
    // 1. API KEY Y MODELO (misma resolución que el chat RAG del admin)
    // ================================================================
    const apiKey = await getGeminiApiKey(supabase);
    if (!apiKey) {
      return { ok: false, error: "No hay API key de Gemini configurada (/admin/ia/config)" };
    }

    let selectedModel = "gemini-2.5-flash";
    const { data: defaultModel } = await supabase
      .from("ai_model_config")
      .select("model_id")
      .eq("is_default", true)
      .eq("is_active", true)
      .single();

    if (defaultModel?.model_id) selectedModel = defaultModel.model_id;

    // ================================================================
    // 2. STORAGE + FILE SEARCH STORE
    // ================================================================
    const { data: storage, error: storageError } = await supabase
      .from("document_storages")
      .select("id, name, gemini_vector_store_id, strict_mode, custom_prompt")
      .eq("id", storageId)
      .single();

    if (storageError || !storage) {
      return { ok: false, error: `Storage ${storageId} no encontrado` };
    }

    const { data: activeFiles } = await supabase
      .from("storage_files")
      .select("file_name")
      .eq("storage_id", storageId)
      .eq("gemini_file_state", "ACTIVE");

    const storeNames: string[] =
      isRealStoreName(storage.gemini_vector_store_id) && (activeFiles?.length || 0) > 0
        ? [storage.gemini_vector_store_id]
        : [];

    // ================================================================
    // 3. PROMPT: RAG resuelto + prompt de canal + instrucción fija
    // ================================================================
    const promptDefaults = await getRagPromptDefaults(supabase);
    const ragPrompt = resolveRagSystemPrompt(promptDefaults, storage);

    const { data: settings } = await supabase
      .from("wa_settings")
      .select("system_prompt")
      .eq("id", 1)
      .single();

    const systemInstruction = [ragPrompt, settings?.system_prompt?.trim(), CHANNEL_INSTRUCTION]
      .filter(Boolean)
      .join("\n\n");

    const profileConfig = getResponseConfig("concise");
    const temperature = storage.strict_mode
      ? Math.min(profileConfig.temperature, STRICT_TEMPERATURE)
      : profileConfig.temperature;

    const contents = await buildContents(supabase, conversationId);
    if (contents.length === 0) {
      contents.push({ role: "user", parts: [{ text: userText }] });
    }

    // ================================================================
    // 4. GENERACIÓN (con store: File Search; sin store: chat simple)
    // ================================================================
    const runWithStore = async (model: string) => {
      const ai = new GoogleGenAI({ apiKey });
      const response = await retryWithBackoff(() =>
        ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            tools: [{ fileSearch: { fileSearchStoreNames: storeNames } }],
            temperature,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        })
      );

      return {
        text: response.text || "",
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      };
    };

    const runWithoutStore = async (model: string) => {
      const googleProvider = createGoogleGenerativeAI({ apiKey });
      const result = await generateText({
        model: googleProvider(model),
        system: systemInstruction,
        messages: contents.map((c) => ({
          role: c.role === "model" ? ("assistant" as const) : ("user" as const),
          content: c.parts[0].text,
        })),
        temperature,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      });

      // AI SDK v5+ usa inputTokens/outputTokens; lectura dual por compatibilidad
      const usage: any = result.usage;
      return {
        text: result.text || "",
        promptTokens: usage?.inputTokens ?? usage?.promptTokens ?? 0,
        completionTokens: usage?.outputTokens ?? usage?.completionTokens ?? 0,
      };
    };

    const run = storeNames.length > 0 ? runWithStore : runWithoutStore;

    let usedModel = selectedModel;
    let generated: { text: string; promptTokens: number; completionTokens: number };

    try {
      generated = await run(selectedModel);
    } catch (error: any) {
      // Cuota agotada (429): reintentar una vez con otro modelo activo
      if (!isQuotaError(error)) throw error;

      const { data: fallbackModel } = await supabase
        .from("ai_model_config")
        .select("model_id")
        .eq("is_active", true)
        .neq("model_id", selectedModel)
        .order("is_default", { ascending: false })
        .limit(1)
        .single();

      if (!fallbackModel?.model_id) throw error;

      console.log(`⚠️ ${selectedModel} sin cuota. Reintentando con ${fallbackModel.model_id}`);
      usedModel = fallbackModel.model_id;
      generated = await run(usedModel);
    }

    const text = generated.text.trim();
    if (!text) {
      return { ok: false, error: "El modelo devolvió una respuesta vacía" };
    }

    return {
      ok: true,
      text,
      model: usedModel,
      promptTokens: generated.promptTokens,
      completionTokens: generated.completionTokens,
      costUsd: calculateCost(generated.promptTokens, generated.completionTokens),
    };
  } catch (error: any) {
    console.error("❌ Error generando respuesta WhatsApp:", error?.message);
    return { ok: false, error: friendlyAIError(error) };
  }
}
