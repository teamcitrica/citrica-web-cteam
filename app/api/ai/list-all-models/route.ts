import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getGeminiApiKey } from "@/lib/ai/gemini-api-key";

/**
 * GET - Listar TODOS los modelos disponibles en la API de Gemini
 * (temporal para debugging)
 */
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Key seleccionada en configuración (fallback: env)
    const apiKey = await getGeminiApiKey(supabase);

    if (!apiKey) {
      return NextResponse.json(
        { error: "No hay API key configurada" },
        { status: 400 }
      );
    }

    // Obtener lista completa de modelos
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

    // Filtrar solo generativos y ordenar
    const generativeModels = data.models
      .filter((model: any) =>
        model.supportedGenerationMethods?.includes('generateContent')
      )
      .map((model: any) => ({
        model_id: model.name.replace('models/', ''),
        display_name: model.displayName,
        description: model.description,
        input_limit: model.inputTokenLimit,
        output_limit: model.outputTokenLimit,
      }))
      .sort((a: any, b: any) => a.model_id.localeCompare(b.model_id));

    return NextResponse.json({
      total: generativeModels.length,
      models: generativeModels,
    });
  } catch (error: any) {
    console.error("Error listing models:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
