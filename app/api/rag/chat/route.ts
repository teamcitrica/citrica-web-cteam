import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { GoogleGenerativeAI, FileDataPart } from "@google/generative-ai";

// Perfiles de configuración
const RESPONSE_PROFILES: Record<string, { temperature: number; maxTokens: number }> = {
  concise: { temperature: 0.3, maxTokens: 512 },
  balanced: { temperature: 0.7, maxTokens: 2048 },
  detailed: { temperature: 0.8, maxTokens: 4096 },
  comprehensive: { temperature: 0.9, maxTokens: 8192 },
};

/**
 * POST - Generar respuesta de chat usando Gemini File Search (RAG nativo) con STREAMING
 * Flujo:
 * 1. Obtener archivos del storage seleccionado (gemini_file_uri)
 * 2. Construir mensajes con archivos como contexto
 * 3. Streamear respuesta de Gemini en tiempo real
 * 4. Guardar conversación completa al finalizar (mediante callback)
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
    // Obtener API key de la BD (prioridad) o del .env (fallback)
    const { data: apiConfig } = await supabase
      .from("api_config")
      .select("api_key")
      .eq("provider", "gemini")
      .eq("is_active", true)
      .eq("verification_status", "valid")
      .single();

    const apiKey = apiConfig?.api_key || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No hay API key configurada. Configura una en /admin/ia/config" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let selectedModel = modelId || "gemini-2.5-flash"; // Default fallback

    // Si no se especifica modelo, obtener el modelo por defecto de la BD
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
    console.log("🔑 API Key:", apiKey ? "Configurada" : "No configurada");

    const profileConfig = RESPONSE_PROFILES[profile] || RESPONSE_PROFILES.balanced;
    let sources: any[] = [];
    let fileUris: string[] = [];

    // ================================================================
    // 1. OBTENER ARCHIVOS GEMINI DEL STORAGE SELECCIONADO
    // ================================================================

    if (storageId && storageId !== "all") {
      // Buscar archivos específicos del storage
      const { data: files, error: filesError } = await supabase
        .from("storage_files")
        .select("gemini_file_uri, file_name, gemini_file_state")
        .eq("storage_id", storageId)
        .eq("gemini_file_state", "ACTIVE")
        .not("gemini_file_uri", "is", null);

      if (filesError) {
        console.error("Error obteniendo archivos:", filesError);
        throw filesError;
      }

      console.log(`📚 Archivos encontrados: ${files?.length || 0}`);

      if (files && files.length > 0) {
        fileUris = files.map(f => f.gemini_file_uri!);
        sources = files.map((file) => ({
          document: file.file_name,
          geminiUri: file.gemini_file_uri,
        }));
        console.log(`📚 Usando ${fileUris.length} archivos de Gemini File API...`);
      }
    } else {
      // storageId === "all" o no hay storage - Buscar todos los archivos ACTIVE
      const { data: allFiles, error: allFilesError } = await supabase
        .from("storage_files")
        .select("gemini_file_uri, file_name, gemini_file_state")
        .eq("gemini_file_state", "ACTIVE")
        .not("gemini_file_uri", "is", null);

      if (allFilesError) {
        console.error("Error obteniendo todos los archivos:", allFilesError);
        throw allFilesError;
      }

      console.log(`📚 Total de archivos ACTIVE: ${allFiles?.length || 0}`);

      if (allFiles && allFiles.length > 0) {
        fileUris = allFiles.map(f => f.gemini_file_uri!);
        sources = allFiles.map((file) => ({
          document: file.file_name,
          geminiUri: file.gemini_file_uri,
        }));
        console.log(`📚 Usando ${fileUris.length} archivos de Gemini File API...`);
      }
    }

    // ================================================================
    // 2. DECIDIR QUÉ SDK USAR SEGÚN SI HAY ARCHIVOS O NO
    // ================================================================

    // Si NO hay archivos, usar Vercel AI SDK (mejor streaming)
    // Si HAY archivos, usar Google SDK nativo (soporta fileUris correctamente)

    // ================================================================
    // 3. STREAMEAR RESPUESTA
    // ================================================================

    if (fileUris.length > 0) {
      // ✅ CASO CON ARCHIVOS: Usar Google SDK nativo
      const genAI = new GoogleGenerativeAI(apiKey);

      // Construir partes del mensaje con archivos
      const lastUserMessage = messages[messages.length - 1]?.content || "";
      const parts: any[] = [];

      // Agregar archivos como FileDataPart
      for (const uri of fileUris) {
        parts.push({
          fileData: {
            fileUri: uri,
            mimeType: "application/pdf",
          },
        });
      }

      // Agregar texto
      parts.push({
        text: `Basándote en los documentos proporcionados, responde: ${lastUserMessage}`,
      });

      // Intentar generar con el modelo seleccionado, con fallback si falla
      let result: any;
      let usedModel = selectedModel;

      try {
        const model = genAI.getGenerativeModel({
          model: selectedModel,
          generationConfig: {
            temperature: profileConfig.temperature,
            maxOutputTokens: profileConfig.maxTokens,
          },
        });
        result = await model.generateContentStream(parts);
      } catch (error: any) {
        // Si falla por cuota (429), intentar con el modelo default
        if (error.status === 429 || error.message?.includes("quota") || error.message?.includes("limit")) {
          console.log(`⚠️ Modelo ${selectedModel} agotó su cuota. Intentando con modelo default...`);

          const { data: fallbackModel } = await supabase
            .from("ai_model_config")
            .select("model_id")
            .eq("is_default", true)
            .eq("is_active", true)
            .neq("model_id", selectedModel) // Que no sea el mismo que falló
            .single();

          if (fallbackModel) {
            usedModel = fallbackModel.model_id;
            const modelFallback = genAI.getGenerativeModel({
              model: usedModel,
              generationConfig: {
                temperature: profileConfig.temperature,
                maxOutputTokens: profileConfig.maxTokens,
              },
            });
            result = await modelFallback.generateContentStream(parts);
          } else {
            throw error; // No hay fallback disponible
          }
        } else {
          throw error; // Otro tipo de error
        }
      }

      // Crear stream personalizado
      const encoder = new TextEncoder();
      let fullText = "";

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              fullText += chunkText;
              controller.enqueue(encoder.encode(chunkText));
            }

            // Obtener usage metadata
            const finalResponse = await result.response;
            const usageMetadata = (finalResponse as any).usageMetadata;

            // Guardar en DB
            const targetStorageId = !storageId || storageId === "all" ? null : storageId;
            const promptTokens = usageMetadata?.promptTokenCount || 0;
            const completionTokens = usageMetadata?.candidatesTokenCount || 0;
            const totalTokens = usageMetadata?.totalTokenCount || promptTokens + completionTokens;
            const estimatedCost = (promptTokens / 1_000_000) * 0.075 + (completionTokens / 1_000_000) * 0.30;

            await supabase.from("chat_conversations").insert({
              storage_id: targetStorageId,
              user_message: lastUserMessage,
              assistant_response: fullText,
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              total_tokens: totalTokens,
              cost_usd: estimatedCost,
              model: selectedModel,
              sources_used: sources,
            });

            if (targetStorageId) {
              await supabase.rpc("increment_storage_usage", {
                p_storage_id: targetStorageId,
                p_tokens: totalTokens,
                p_cost: estimatedCost,
              });
            }

            console.log("💬 Chat con archivos completado");
            console.log(`📊 Tokens: ${totalTokens} | Costo: $${estimatedCost.toFixed(6)}`);

            controller.close();
          } catch (error) {
            console.error("Error en streaming:", error);
            controller.error(error);
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

    } else {
      // ✅ CASO SIN ARCHIVOS: Usar Vercel AI SDK (mejor para chat simple)
      let usedModel = selectedModel;
      let result: any;

      try {
        result = await streamText({
          model: google(selectedModel),
          messages: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: profileConfig.temperature,
          maxOutputTokens: profileConfig.maxTokens,

          onFinish: async ({ text, usage }: { text: string; usage: any }) => {
            const targetStorageId = !storageId || storageId === "all" ? null : storageId;
            const userMessage = messages[messages.length - 1]?.content || "";

            const promptTokens = usage?.promptTokens || usage?.inputTokens || 0;
            const completionTokens = usage?.completionTokens || usage?.outputTokens || 0;
            const totalTokens = usage?.totalTokens || promptTokens + completionTokens;
            const estimatedCost = (promptTokens / 1_000_000) * 0.075 + (completionTokens / 1_000_000) * 0.30;

            await supabase.from("chat_conversations").insert({
              storage_id: targetStorageId,
              user_message: userMessage,
              assistant_response: text,
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              total_tokens: totalTokens,
              cost_usd: estimatedCost,
              model: usedModel,
              sources_used: sources,
            });

            if (targetStorageId) {
              await supabase.rpc("increment_storage_usage", {
                p_storage_id: targetStorageId,
                p_tokens: totalTokens,
                p_cost: estimatedCost,
              });
            }

            console.log("💬 Chat sin archivos completado");
            console.log(`📊 Tokens: ${totalTokens} | Costo: $${estimatedCost.toFixed(6)}`);
          },
        });
      } catch (error: any) {
        // Si falla por cuota (429), intentar con el modelo default
        if (error.status === 429 || error.message?.includes("quota") || error.message?.includes("limit")) {
          console.log(`⚠️ Modelo ${selectedModel} agotó su cuota. Intentando con modelo default...`);

          const { data: fallbackModel } = await supabase
            .from("ai_model_config")
            .select("model_id")
            .eq("is_default", true)
            .eq("is_active", true)
            .neq("model_id", selectedModel)
            .single();

          if (fallbackModel) {
            usedModel = fallbackModel.model_id;
            result = await streamText({
              model: google(usedModel),
              messages: messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
              })),
              temperature: profileConfig.temperature,
              maxOutputTokens: profileConfig.maxTokens,

              onFinish: async ({ text, usage }: { text: string; usage: any }) => {
                const targetStorageId = !storageId || storageId === "all" ? null : storageId;
                const userMessage = messages[messages.length - 1]?.content || "";

                const promptTokens = usage?.promptTokens || usage?.inputTokens || 0;
                const completionTokens = usage?.completionTokens || usage?.outputTokens || 0;
                const totalTokens = usage?.totalTokens || promptTokens + completionTokens;
                const estimatedCost = (promptTokens / 1_000_000) * 0.075 + (completionTokens / 1_000_000) * 0.30;

                await supabase.from("chat_conversations").insert({
                  storage_id: targetStorageId,
                  user_message: userMessage,
                  assistant_response: text,
                  prompt_tokens: promptTokens,
                  completion_tokens: completionTokens,
                  total_tokens: totalTokens,
                  cost_usd: estimatedCost,
                  model: usedModel,
                  sources_used: sources,
                });

                if (targetStorageId) {
                  await supabase.rpc("increment_storage_usage", {
                    p_storage_id: targetStorageId,
                    p_tokens: totalTokens,
                    p_cost: estimatedCost,
                  });
                }

                console.log(`💬 Chat sin archivos completado (fallback a ${usedModel})`);
                console.log(`📊 Tokens: ${totalTokens} | Costo: $${estimatedCost.toFixed(6)}`);
              },
            });
          } else {
            throw error; // No hay fallback disponible
          }
        } else {
          throw error; // Otro tipo de error
        }
      }

      return result.toTextStreamResponse({
        headers: {
          "X-Sources": JSON.stringify(sources),
          "X-Has-Context": "false",
          "X-Storage-Id": storageId || "all",
        },
      });
    }

  } catch (error: any) {
    console.error("❌ Error generating chat response:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
