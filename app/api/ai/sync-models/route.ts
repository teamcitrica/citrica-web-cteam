import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST - Sincronizar modelos disponibles desde la API de Gemini
 * Obtiene la lista real de modelos desde Gemini API
 */
export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Obtener API key configurada
    const { data: apiConfig } = await supabase
      .from("api_config")
      .select("api_key, is_active")
      .eq("provider", "gemini")
      .eq("is_active", true)
      .single();

    if (!apiConfig || !apiConfig.api_key) {
      return NextResponse.json(
        { error: "No hay API key configurada" },
        { status: 400 }
      );
    }

    const apiKey = apiConfig.api_key;

    // Obtener lista de modelos desde Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || "Error al obtener modelos" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Lista blanca de modelos Gemini que queremos sincronizar
    const allowedModels = [
      // Serie 3.1 (experimental/preview)
      'gemini-3.1-flash-lite-preview',

      // Serie 3.0 (experimental/preview)
      'gemini-3-pro-preview',
      'gemini-3.0-flash',
      'gemini-3.0-flash-preview',
      'gemini-3.0-flash-exp',
      'gemini-3.0-pro',
      'gemini-3.0-pro-preview',
      'gemini-3.0-pro-exp',

      // Serie 2.5 (más recientes)
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro',

      // Serie 2.0
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash-thinking-exp',
      'gemini-2.0-flash-thinking-exp-1219',

      // Serie 1.5
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash-8b-001',
      'gemini-1.5-flash-8b-latest',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-002',
      'gemini-1.5-pro-latest',

      // Versiones latest que se auto-actualizan
      'gemini-flash-lite-latest',
      'gemini-pro-latest',
    ];

    // Filtrar solo modelos permitidos y generativos
    const generativeModels = data.models.filter((model: any) => {
      const modelId = model.name.replace('models/', '');
      return (
        model.supportedGenerationMethods?.includes('generateContent') &&
        allowedModels.includes(modelId) // Solo modelos en la lista blanca
      );
    });

    const results = [];

    // Costos y descripciones personalizadas por modelo
    const modelInfo: { [key: string]: { input: number; output: number; description: string } } = {
      // Serie 3.1 (experimental/preview)
      "gemini-3.1-flash-lite-preview": {
        input: 0.0,
        output: 0.0,
        description: "⚡ Gemini 3.1 Flash-Lite Preview - Versión ultra-ligera de próxima generación. Máxima velocidad y eficiencia. Gratis durante preview."
      },

      // Serie 3.0 (experimental/preview)
      "gemini-3-pro-preview": {
        input: 0.0,
        output: 0.0,
        description: "🚀 Gemini 3 Pro Preview - Modelo premium de próxima generación. Capacidades avanzadas de razonamiento. Gratis durante preview."
      },
      "gemini-3.0-flash": {
        input: 0.0,
        output: 0.0,
        description: "⚡ Gemini 3 Flash - Versión preview de próxima generación. Mejoras significativas en velocidad y calidad. Gratis durante preview."
      },
      "gemini-3.0-flash-preview": {
        input: 0.0,
        output: 0.0,
        description: "⚡ Gemini 3 Flash Preview - Acceso anticipado a Gemini 3. Puede cambiar sin previo aviso. Gratis durante preview."
      },
      "gemini-3.0-flash-exp": {
        input: 0.0,
        output: 0.0,
        description: "⚡ Gemini 3 Flash Experimental - Versión experimental con las últimas mejoras. Gratis durante fase experimental."
      },
      "gemini-3.0-pro": {
        input: 0.0,
        output: 0.0,
        description: "🚀 Gemini 3 Pro - Modelo premium de próxima generación. Capacidades avanzadas de razonamiento. Preview gratuito."
      },
      "gemini-3.0-pro-preview": {
        input: 0.0,
        output: 0.0,
        description: "🚀 Gemini 3 Pro Preview - Acceso anticipado al modelo Pro más avanzado. Preview gratuito."
      },
      "gemini-3.0-pro-exp": {
        input: 0.0,
        output: 0.0,
        description: "🚀 Gemini 3 Pro Experimental - Versión experimental con capacidades de vanguardia. Gratis durante preview."
      },

      // Serie 2.5
      "gemini-2.5-flash": {
        input: 0.075,
        output: 0.30,
        description: "Equilibrado y rápido. Ideal para uso general con 1M tokens de contexto. Soporta multimodalidad (texto, imagen, audio, video)."
      },
      "gemini-2.5-flash-lite": {
        input: 0.04,
        output: 0.15,
        description: "Versión optimizada más económica. Excelente relación calidad-precio para tareas frecuentes. Ideal para tier gratuito."
      },
      "gemini-2.5-pro": {
        input: 1.25,
        output: 5.00,
        description: "Modelo premium con razonamiento avanzado. Ideal para tareas complejas que requieren análisis profundo. Requiere billing habilitado."
      },

      // Serie 2.0
      "gemini-2.0-flash": {
        input: 0.075,
        output: 0.30,
        description: "Versión anterior estable. Multimodalidad nativa y 1M tokens. Requiere billing habilitado para algunos tiers."
      },
      "gemini-2.0-flash-exp": {
        input: 0.0,
        output: 0.0,
        description: "Versión experimental de 2.0 Flash. Gratis mientras esté en preview. Puede cambiar sin aviso."
      },
      "gemini-2.0-flash-thinking-exp": {
        input: 0.0,
        output: 0.0,
        description: "🧠 Modo Thinking - Muestra su proceso de razonamiento paso a paso. Ideal para problemas complejos. Experimental y gratuito."
      },
      "gemini-2.0-flash-thinking-exp-1219": {
        input: 0.0,
        output: 0.0,
        description: "🧠 Modo Thinking (versión 12/19) - Snapshot específico del modelo thinking. Experimental y gratuito."
      },

      // Serie 1.5
      "gemini-1.5-flash": {
        input: 0.075,
        output: 0.30,
        description: "Generación versátil y rápida. Alta disponibilidad en tier gratuito. Soporta documentos largos."
      },
      "gemini-1.5-flash-001": {
        input: 0.075,
        output: 0.30,
        description: "Versión estable 001 de 1.5 Flash. Modelo congelado que no cambiará."
      },
      "gemini-1.5-flash-002": {
        input: 0.075,
        output: 0.30,
        description: "Versión estable 002 de 1.5 Flash. Mejoras sobre la versión 001."
      },
      "gemini-1.5-flash-8b": {
        input: 0.0375,
        output: 0.15,
        description: "Versión compacta de 1.5 Flash. Más rápido y económico para tareas simples. Excelente para chatbots básicos."
      },
      "gemini-1.5-flash-8b-001": {
        input: 0.0375,
        output: 0.15,
        description: "Versión estable 001 del modelo 8b. Modelo congelado."
      },
      "gemini-1.5-flash-8b-latest": {
        input: 0.0375,
        output: 0.15,
        description: "Última versión del modelo 8b. Se actualiza automáticamente."
      },
      "gemini-1.5-flash-latest": {
        input: 0.075,
        output: 0.30,
        description: "Última versión de 1.5 Flash. Se actualiza automáticamente con mejoras."
      },
      "gemini-1.5-pro": {
        input: 1.25,
        output: 5.00,
        description: "Modelo avanzado de la serie 1.5. Superior en razonamiento complejo y documentos extensos. Requiere billing."
      },
      "gemini-1.5-pro-001": {
        input: 1.25,
        output: 5.00,
        description: "Versión estable 001 de 1.5 Pro. Modelo congelado."
      },
      "gemini-1.5-pro-002": {
        input: 1.25,
        output: 5.00,
        description: "Versión estable 002 de 1.5 Pro. Mejoras sobre la versión 001."
      },
      "gemini-1.5-pro-latest": {
        input: 1.25,
        output: 5.00,
        description: "Última versión de 1.5 Pro. Se actualiza automáticamente."
      },

      // Versiones latest
      "gemini-flash-lite-latest": {
        input: 0.04,
        output: 0.15,
        description: "Última versión de Flash-Lite. Se actualiza automáticamente con las mejoras más recientes. Bajo costo."
      },
      "gemini-pro-latest": {
        input: 1.25,
        output: 5.00,
        description: "Última versión de Pro. Se actualiza automáticamente a la versión Pro más reciente."
      },
    };

    // Probar disponibilidad real de cada modelo
    for (const model of generativeModels) {
      const modelId = model.name.replace('models/', '');
      const isAvailable = await testModel(apiKey, modelId);

      const info = modelInfo[modelId] || {
        input: 0,
        output: 0,
        description: model.description || `Modelo ${modelId}`
      };

      // Insertar o actualizar en la BD
      const { error } = await supabase
        .from("ai_model_config")
        .upsert({
          model_id: modelId,
          display_name: model.displayName || modelId,
          description: info.description,
          provider: "gemini",
          input_token_limit: model.inputTokenLimit || 1048576,
          output_token_limit: model.outputTokenLimit || 8192,
          is_active: isAvailable,
          is_default: false, // Lo estableceremos después
          cost_per_1m_input_tokens: info.input,
          cost_per_1m_output_tokens: info.output,
          supports_file_api: true,
          supports_streaming: true,
          config: {
            temperature: model.temperature || 0.7,
            topP: model.topP || 0.95,
            topK: model.topK || 64,
          },
        }, {
          onConflict: "model_id"
        });

      results.push({
        model_id: modelId,
        display_name: model.displayName,
        available: isAvailable,
        error: error?.message,
      });
    }

    // Desactivar modelos que no están en la lista blanca
    await supabase
      .from("ai_model_config")
      .update({ is_active: false })
      .eq("provider", "gemini")
      .not("model_id", "in", `(${allowedModels.map(m => `"${m}"`).join(',')})`);

    // Establecer el primer modelo disponible como default
    const availableModels = results.filter(r => r.available);
    if (availableModels.length > 0) {
      await supabase
        .from("ai_model_config")
        .update({ is_default: false })
        .eq("provider", "gemini");

      // Preferir gemini-2.5-flash-lite si está disponible, sino el primero
      const preferredModel = availableModels.find(m => m.model_id === "gemini-2.5-flash-lite") || availableModels[0];

      await supabase
        .from("ai_model_config")
        .update({ is_default: true })
        .eq("model_id", preferredModel.model_id);
    }

    return NextResponse.json({
      success: true,
      total_tested: generativeModels.length,
      available: availableModels.length,
      results,
    });
  } catch (error: any) {
    console.error("Error syncing models:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Helper: Probar si un modelo está disponible
 */
async function testModel(apiKey: string, modelId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "test" }]
          }]
        })
      }
    );

    // Si responde OK o si el error no es de cuota/permisos, el modelo existe
    if (response.ok) {
      return true;
    }

    const data = await response.json();

    // Si el error es 429 (quota exceeded) con limit: 0, significa que existe pero no está disponible en el tier
    if (response.status === 429 && data.error?.message?.includes("limit: 0")) {
      return false;
    }

    // Si el error es 404, el modelo no existe
    if (response.status === 404) {
      return false;
    }

    // Otros errores (400, 403) pueden significar que el modelo existe pero hay otro problema
    // Lo marcamos como no disponible por seguridad
    return false;
  } catch (error) {
    console.error(`Error testing model ${modelId}:`, error);
    return false;
  }
}
