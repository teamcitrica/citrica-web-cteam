import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { GoogleGenAI } from "@google/genai";
import {
  getResponseConfig,
  isRealStoreName,
  calculateCost,
  friendlyAIError,
  isQuotaError,
  type ResponseProfile,
} from "@/lib/ai/gemini-service";
import { getGeminiApiKey } from "@/lib/ai/gemini-api-key";

// Límite defensivo de stores por request para "todas las bases"
// (el máximo real por request no está documentado)
const MAX_STORES = 10;

// Instrucción base: prioriza documentos, permite conocimiento general
// siempre que se distinga la fuente (anti-atribución falsa)
const BASE_RAG_INSTRUCTION =
  "Prioriza la información de los documentos recuperados como fuente principal. " +
  "Puedes complementar con tu conocimiento general cuando aporte valor, pero " +
  "distingue con claridad qué proviene de los documentos y qué es conocimiento general. " +
  "Nunca atribuyas a los documentos información que no contienen; si algo no está en ellos, dilo.";

// Instrucción cuando el storage tiene strict_mode activado (reemplaza a la base:
// combinarlas se contradice — la base permite conocimiento general)
const STRICT_RAG_INSTRUCTION =
  "MODO ESTRICTO: El documento es tu única fuente y tu guion. " +
  "Sigue su estructura y sus secciones en el orden exacto en que aparecen, al pie de la letra. " +
  "No agregues preguntas, temas ni contenido que no estén escritos en el documento. " +
  "Si el usuario pide algo fuera del documento, responde que no está contemplado en el documento.";

// Temperature baja en modo estricto para minimizar improvisación
const STRICT_TEMPERATURE = 0.3;

/**
 * POST - Chat RAG con Gemini File Search (retrieval administrado por Gemini)
 * Flujo:
 * 1. Resolver File Search stores del storage seleccionado (o de todos)
 * 2. Si hay stores: generateContentStream con tool fileSearch — Gemini hace
 *    retrieval de los chunks relevantes (embeddings gemini-embedding-001)
 * 3. Si no hay stores: chat simple vía AI SDK
 * 4. Guardar conversación + fuentes (groundingMetadata) al finalizar
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const {
      messages = [], // Historial de mensajes (para memoria conversacional)
      storageId,
      profile = "balanced",
      modelId, // ID del modelo a usar (opcional, usa el default si no se especifica)
    } = body;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ================================================================
    // 0. OBTENER API KEY Y MODELO A USAR
    // ================================================================
    const apiKey = await getGeminiApiKey(supabase);

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No hay API key configurada. Configura una en /admin/ia/config" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let selectedModel = modelId || "gemini-2.5-flash"; // Default fallback

    if (!modelId) {
      const { data: defaultModel } = await supabase
        .from("ai_model_config")
        .select("model_id")
        .eq("is_default", true)
        .eq("is_active", true)
        .single();

      if (defaultModel) {
        selectedModel = defaultModel.model_id;
      }
    }

    console.log("💬 Procesando chat request con streaming...");
    console.log("📦 Storage ID:", storageId || "TODOS");
    console.log("🔍 Mensajes:", messages.length);
    console.log("🤖 Modelo:", selectedModel);

    const profileConfig = getResponseConfig(profile as ResponseProfile);
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // ================================================================
    // 1. RESOLVER FILE SEARCH STORES DEL STORAGE SELECCIONADO
    // ================================================================

    let storeNames: string[] = [];
    let sources: any[] = [];

    const storageQuery = supabase
      .from("document_storages")
      .select("id, name, gemini_vector_store_id, strict_mode, storage_files!inner(file_name, gemini_file_state)")
      .like("gemini_vector_store_id", "fileSearchStores/%")
      .eq("storage_files.gemini_file_state", "ACTIVE");

    const { data: storagesWithFiles, error: storagesError } =
      storageId && storageId !== "all"
        ? await storageQuery.eq("id", storageId)
        : await storageQuery;

    if (storagesError) {
      console.error("Error resolviendo stores:", storagesError);
      throw storagesError;
    }

    let strictMode = false;
    const strictFlags: boolean[] = [];

    for (const storage of storagesWithFiles || []) {
      if (isRealStoreName(storage.gemini_vector_store_id)) {
        storeNames.push(storage.gemini_vector_store_id);
        strictFlags.push(!!(storage as any).strict_mode);
        for (const f of (storage as any).storage_files || []) {
          sources.push({ document: f.file_name, storage: storage.name });
        }
      }
    }

    // Estricto solo si TODAS las bases consultadas lo son (en "todas las bases"
    // no se fuerza el guion de una sobre las demás)
    strictMode = strictFlags.length > 0 && strictFlags.every(Boolean);

    if (storeNames.length > MAX_STORES) {
      console.warn(`⚠️ ${storeNames.length} stores; se usan solo los primeros ${MAX_STORES}`);
      storeNames = storeNames.slice(0, MAX_STORES);
    }

    console.log(`📚 File Search stores activos: ${storeNames.length}`);

    // Guardar conversación (usado por ambas ramas)
    const persistConversation = async (params: {
      text: string;
      promptTokens: number;
      completionTokens: number;
      usedModel: string;
      usedSources: any[];
    }) => {
      const targetStorageId = !storageId || storageId === "all" ? null : storageId;
      const totalTokens = params.promptTokens + params.completionTokens;
      const estimatedCost = calculateCost(params.promptTokens, params.completionTokens);

      await supabase.from("chat_conversations").insert({
        storage_id: targetStorageId,
        user_message: lastUserMessage,
        assistant_response: params.text,
        prompt_tokens: params.promptTokens,
        completion_tokens: params.completionTokens,
        total_tokens: totalTokens,
        cost_usd: estimatedCost,
        model: params.usedModel,
        sources_used: params.usedSources,
      });

      if (targetStorageId) {
        await supabase.rpc("increment_storage_usage", {
          p_storage_id: targetStorageId,
          p_tokens: totalTokens,
          p_cost: estimatedCost,
        });
      }

      console.log(`💬 Chat completado (${params.usedModel})`);
      console.log(`📊 Tokens: ${totalTokens} | Costo: $${estimatedCost.toFixed(6)}`);
    };

    // ================================================================
    // 2. RAMA CON STORES: File Search retrieval + streaming
    // ================================================================

    if (storeNames.length > 0) {
      const ai = new GoogleGenAI({ apiKey });
      const encoder = new TextEncoder();

      // Historial completo (el chat anterior solo mandaba el último mensaje)
      const contents = messages.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const systemInstruction = strictMode
        ? STRICT_RAG_INSTRUCTION
        : BASE_RAG_INSTRUCTION;

      const temperature = strictMode
        ? Math.min(profileConfig.temperature, STRICT_TEMPERATURE)
        : profileConfig.temperature;

      console.log(`🎯 Modo estricto: ${strictMode ? "ON" : "OFF"}`);

      const generate = (model: string) =>
        ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction,
            tools: [{ fileSearch: { fileSearchStoreNames: storeNames } }],
            temperature,
            maxOutputTokens: profileConfig.maxOutputTokens,
          },
        });

      const stream = new ReadableStream({
        async start(controller) {
          let fullText = "";
          let usageMetadata: any = null;
          let groundingMetadata: any = null;
          let usedModel = selectedModel;

          const consume = async (model: string) => {
            const responseStream = await generate(model);
            for await (const chunk of responseStream) {
              const chunkText = chunk.text; // en @google/genai es propiedad, no método
              if (chunkText) {
                fullText += chunkText;
                controller.enqueue(encoder.encode(chunkText));
              }
              if (chunk.usageMetadata) usageMetadata = chunk.usageMetadata;
              const grounding = chunk.candidates?.[0]?.groundingMetadata;
              if (grounding) groundingMetadata = grounding;
            }
          };

          try {
            try {
              await consume(selectedModel);
            } catch (error: any) {
              // Si falla por cuota (429), intentar con el modelo default
              if (isQuotaError(error)) {
                const { data: fallbackModel } = await supabase
                  .from("ai_model_config")
                  .select("model_id")
                  .eq("is_default", true)
                  .eq("is_active", true)
                  .neq("model_id", selectedModel)
                  .single();

                if (fallbackModel) {
                  console.log(`⚠️ Modelo ${selectedModel} agotó su cuota. Intentando con ${fallbackModel.model_id}...`);
                  usedModel = fallbackModel.model_id;
                  await consume(usedModel);
                } else {
                  throw error;
                }
              } else {
                throw error;
              }
            }

            // Fuentes reales del retrieval (fallback: lista derivada de DB)
            let usedSources = sources;
            const chunks = groundingMetadata?.groundingChunks;
            if (Array.isArray(chunks) && chunks.length > 0) {
              const fromGrounding = chunks
                .map((c: any) => c.retrievedContext)
                .filter(Boolean)
                .map((rc: any) => ({
                  document: rc.title || "documento",
                  snippet: typeof rc.text === "string" ? rc.text.slice(0, 300) : undefined,
                }));
              if (fromGrounding.length > 0) usedSources = fromGrounding;
            }

            await persistConversation({
              text: fullText,
              promptTokens: usageMetadata?.promptTokenCount || 0,
              completionTokens: usageMetadata?.candidatesTokenCount || 0,
              usedModel,
              usedSources,
            });
          } catch (error) {
            console.error("❌ Error en streaming File Search:", error);
            // Enviar el error como texto visible en vez de cortar el stream en silencio
            controller.enqueue(encoder.encode(`${fullText ? "\n\n" : ""}${friendlyAIError(error)}`));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Sources": JSON.stringify(sources),
          "X-Has-Context": "true",
          "X-Storage-Id": storageId || "all",
        },
      });
    }

    // ================================================================
    // 3. RAMA SIN STORES: chat simple vía AI SDK
    // ================================================================
    {
      const encoder = new TextEncoder();

      // Usar la misma API key resuelta arriba (DB con prioridad, luego .env) —
      // google() a secas solo lee GOOGLE_GENERATIVE_AI_API_KEY del env
      const googleProvider = createGoogleGenerativeAI({ apiKey });

      // streamText enmascara errores del stream (textStream termina sin lanzar);
      // onError es la única forma de capturarlos para re-lanzarlos
      const startStream = (modelId: string, onError: (error: any) => void) =>
        streamText({
          model: googleProvider(modelId),
          onError: ({ error }: { error: any }) => onError(error),
          messages: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: profileConfig.temperature,
          maxOutputTokens: profileConfig.maxOutputTokens,

          onFinish: async ({ text, usage }: { text: string; usage: any }) => {
            await persistConversation({
              text,
              promptTokens: usage?.promptTokens || usage?.inputTokens || 0,
              completionTokens: usage?.completionTokens || usage?.outputTokens || 0,
              usedModel: modelId,
              usedSources: sources,
            });
          },
        });

      const stream = new ReadableStream({
        async start(controller) {
          try {
            let streamError: any = null;
            const result = startStream(selectedModel, (e) => { streamError = e; });
            for await (const chunk of result.textStream) {
              controller.enqueue(encoder.encode(chunk));
            }
            if (streamError) throw streamError;
          } catch (error: any) {
            console.error("❌ Error streaming (sin stores):", error);
            let handled = false;

            // Si falla por cuota (429), intentar con el modelo default
            if (isQuotaError(error)) {
              const { data: fallbackModel } = await supabase
                .from("ai_model_config")
                .select("model_id")
                .eq("is_default", true)
                .eq("is_active", true)
                .neq("model_id", selectedModel)
                .single();

              if (fallbackModel) {
                try {
                  console.log(`⚠️ Modelo ${selectedModel} agotó su cuota. Intentando con ${fallbackModel.model_id}...`);
                  let fallbackStreamError: any = null;
                  const fallbackResult = startStream(fallbackModel.model_id, (e) => { fallbackStreamError = e; });
                  for await (const chunk of fallbackResult.textStream) {
                    controller.enqueue(encoder.encode(chunk));
                  }
                  if (fallbackStreamError) throw fallbackStreamError;
                  handled = true;
                } catch (fallbackError) {
                  console.error("❌ Fallback también falló:", fallbackError);
                }
              }
            }

            if (!handled) {
              controller.enqueue(encoder.encode(friendlyAIError(error)));
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Sources": JSON.stringify(sources),
          "X-Has-Context": "false",
          "X-Storage-Id": storageId || "all",
        },
      });
    }

  } catch (error: any) {
    console.error("❌ Error generating chat response:", error);
    const status = error?.status === 429 || error?.statusCode === 429 ? 429 : 500;
    return new Response(
      JSON.stringify({
        error: friendlyAIError(error),
        details: error.toString(),
      }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }
}
