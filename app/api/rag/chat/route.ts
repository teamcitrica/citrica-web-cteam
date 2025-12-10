import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  generateChatResponse,
  generateChatResponseWithFiles,
} from "@/lib/ai/gemini-service";

/**
 * POST - Generar respuesta de chat usando Gemini File Search (RAG nativo)
 * Flujo:
 * 1. Obtener archivos del storage seleccionado (gemini_file_uri)
 * 2. Llamar a Gemini con los archivos como contexto
 * 3. Gemini hace la búsqueda vectorial internamente
 * 4. Guardar conversación y tracking de tokens
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const {
      message,
      storageId,
      temperature,
      maxOutputTokens,
      profile = "balanced", // Perfil por defecto: balanced
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("💬 Procesando chat request...");
    console.log("📦 Storage ID:", storageId || "TODOS");
    console.log("🔍 Mensaje:", message);

    let response: string;
    let sources: any[] = [];
    let usage: any;
    let hasContext = false;

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
        // ✅ HAY ARCHIVOS - Usar Gemini File API directamente
        hasContext = true;

        const fileUris = files.map(f => f.gemini_file_uri!);
        console.log(`📚 Usando ${fileUris.length} archivos de Gemini File API...`);

        const result = await generateChatResponseWithFiles(
          `Basándote en los documentos proporcionados, responde la siguiente pregunta: ${message}`,
          fileUris,
          { temperature, maxOutputTokens, profile }
        );

        response = result.response;
        usage = result.usage;

        // Preparar fuentes
        sources = files.map((file) => ({
          document: file.file_name,
          geminiUri: file.gemini_file_uri,
        }));

        console.log("✅ Respuesta RAG generada con Gemini File API");
      } else {
        // ❌ NO HAY ARCHIVOS EN EL STORAGE
        console.log("⚠️ No hay archivos ACTIVE en el storage seleccionado");

        const result = await generateChatResponse(
          `${message}\n\nNota: El storage seleccionado no tiene documentos procesados. Responde con tu conocimiento general.`,
          { temperature, maxOutputTokens, profile }
        );

        response = result.response;
        usage = result.usage;
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
        // ✅ HAY ARCHIVOS - Usar Gemini File API directamente
        hasContext = true;

        const fileUris = allFiles.map(f => f.gemini_file_uri!);
        console.log(`📚 Usando ${fileUris.length} archivos de Gemini File API...`);

        const result = await generateChatResponseWithFiles(
          `Basándote en los documentos proporcionados, responde la siguiente pregunta: ${message}`,
          fileUris,
          { temperature, maxOutputTokens, profile }
        );

        response = result.response;
        usage = result.usage;

        sources = allFiles.map((file) => ({
          document: file.file_name,
          geminiUri: file.gemini_file_uri,
        }));

        console.log("✅ Respuesta RAG generada con todos los archivos");
      } else {
        // ❌ NO HAY ARCHIVOS EN NINGÚN STORAGE
        console.log("⚠️ No hay archivos procesados en ningún storage");

        const result = await generateChatResponse(
          `${message}\n\nNota: No hay documentos procesados. Responde con tu conocimiento general.`,
          { temperature, maxOutputTokens, profile }
        );

        response = result.response;
        usage = result.usage;
      }
    }

    // ================================================================
    // 2. GUARDAR CONVERSACIÓN PARA TRACKING
    // ================================================================

    const targetStorageId =
      !storageId || storageId === "all" ? null : storageId;

    const { error: insertError } = await supabase
      .from("chat_conversations")
      .insert({
        storage_id: targetStorageId,
        user_message: message,
        assistant_response: response,
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.totalTokens,
        cost_usd: usage.estimatedCost,
        model: "gemini-2.5-flash",
        sources_used: sources,
      });

    if (insertError) {
      console.error("⚠️ Error guardando conversación:", insertError);
    }

    // Actualizar contadores del storage
    if (targetStorageId) {
      await supabase.rpc("increment_storage_usage", {
        p_storage_id: targetStorageId,
        p_tokens: usage.totalTokens,
        p_cost: usage.estimatedCost,
      });
    }

    console.log("💬 Chat completado exitosamente");
    console.log(
      `📊 Tokens: ${usage.totalTokens} | Costo: $${usage.estimatedCost.toFixed(6)}`
    );

    return NextResponse.json({
      response,
      sources,
      hasContext,
      usage,
      debug: {
        storageId: targetStorageId,
        filesUsed: sources.length,
        model: "gemini-2.5-flash",
      },
    });
  } catch (error: any) {
    console.error("❌ Error generating chat response:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
