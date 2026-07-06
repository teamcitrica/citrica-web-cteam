import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET - Obtener configuración de API actual
 */
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: config, error } = await supabase
      .from("api_config")
      .select("*")
      .eq("provider", "gemini")
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // No devolver la API key completa por seguridad, solo los últimos 4 caracteres
    if (config && config.api_key) {
      const maskedKey = `${config.api_key.slice(0, 7)}...${config.api_key.slice(-4)}`;
      return NextResponse.json({
        config: {
          ...config,
          api_key: maskedKey,
          api_key_full: config.api_key, // Solo para uso interno
        }
      });
    }

    return NextResponse.json({ config: null });
  } catch (error: any) {
    console.error("Error fetching API config:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Crear o actualizar configuración de API
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const { api_key } = body;

    if (!api_key) {
      return NextResponse.json(
        { error: "api_key is required" },
        { status: 400 }
      );
    }

    // Verificar que la API key funciona
    const verificationResult = await verifyApiKey(api_key);

    const { data: config, error } = await supabase
      .from("api_config")
      .upsert({
        provider: "gemini",
        api_key,
        is_active: verificationResult.isValid,
        last_verified_at: new Date().toISOString(),
        verification_status: verificationResult.isValid ? "valid" : "invalid",
        error_message: verificationResult.error || null,
        metadata: verificationResult.metadata || {},
      }, {
        onConflict: "provider"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      config,
      verification: verificationResult
    });
  } catch (error: any) {
    console.error("Error saving API config:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Helper: Verificar que la API key funciona
 * Usa el endpoint de listado de modelos de Gemini
 */
async function verifyApiKey(apiKey: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();

    if (response.ok && data.models) {
      // Filtrar solo modelos generativos (que soportan generateContent)
      const generativeModels = data.models.filter((model: any) =>
        model.supportedGenerationMethods?.includes('generateContent')
      );

      return {
        isValid: true,
        metadata: {
          verified_at: new Date().toISOString(),
          available_models: generativeModels.map((m: any) => m.name.replace('models/', '')),
          total_models: generativeModels.length,
          status: "success"
        }
      };
    } else {
      return {
        isValid: false,
        error: data.error?.message || "API key verification failed",
        metadata: {
          verified_at: new Date().toISOString(),
          status: "failed",
          error_code: data.error?.code
        }
      };
    }
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || "Network error during verification",
      metadata: {
        verified_at: new Date().toISOString(),
        status: "error"
      }
    };
  }
}
