import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fileSearchStoreExists, isRealStoreName } from "@/lib/ai/gemini-service";

function maskKey(key: string): string {
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

/**
 * GET - Listar todas las API keys configuradas (enmascaradas)
 */
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: configs, error } = await supabase
      .from("api_config")
      .select("id, provider, name, api_key, is_active, is_selected, verification_status, last_verified_at, error_message, metadata, updated_at")
      .eq("provider", "gemini")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const keys = (configs || []).map((c) => ({
      ...c,
      api_key: maskKey(c.api_key),
      models_count: c.metadata?.total_models ?? null,
      available_models: c.metadata?.available_models ?? [],
    }));

    // Compatibilidad con consumidores del formato viejo: config = key seleccionada
    const selected = keys.find((k) => k.is_selected) || null;

    return NextResponse.json({ keys, config: selected });
  } catch (error: any) {
    console.error("Error fetching API config:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Agregar una API key: verifica contra Gemini, detecta sus modelos y guarda.
 * Body: { api_key: string, name?: string }
 * Si es la primera key del proveedor, queda seleccionada automáticamente.
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const { api_key, name } = body;

    if (!api_key) {
      return NextResponse.json(
        { error: "api_key is required" },
        { status: 400 }
      );
    }

    const keyName = (name || "Principal").trim();

    // Verificar que la API key funciona y qué modelos tiene
    const verificationResult = await verifyApiKey(api_key);

    // ¿Es la primera key del proveedor? → seleccionarla
    const { count } = await supabase
      .from("api_config")
      .select("id", { count: "exact", head: true })
      .eq("provider", "gemini");

    const isFirst = (count || 0) === 0;

    const { data: config, error } = await supabase
      .from("api_config")
      .upsert({
        provider: "gemini",
        name: keyName,
        api_key,
        is_active: verificationResult.isValid,
        is_selected: isFirst,
        last_verified_at: new Date().toISOString(),
        verification_status: verificationResult.isValid ? "valid" : "invalid",
        error_message: verificationResult.error || null,
        metadata: verificationResult.metadata || {},
      }, {
        onConflict: "provider,name",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      config: { ...config, api_key: maskKey(config.api_key) },
      verification: verificationResult,
    });
  } catch (error: any) {
    console.error("Error saving API config:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH - Seleccionar qué key usa el sistema.
 * Body: { id: string }
 */
export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { data: target, error: fetchError } = await supabase
      .from("api_config")
      .select("id, provider, verification_status, api_key")
      .eq("id", id)
      .single();

    if (fetchError || !target) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    if (target.verification_status !== "valid") {
      return NextResponse.json(
        { error: "No se puede seleccionar una key inválida. Verifícala primero." },
        { status: 400 }
      );
    }

    // Deseleccionar todas y seleccionar la elegida
    await supabase
      .from("api_config")
      .update({ is_selected: false })
      .eq("provider", target.provider);

    const { error: selectError } = await supabase
      .from("api_config")
      .update({ is_selected: true })
      .eq("id", id);

    if (selectError) throw selectError;

    // ¿La nueva key ve los índices RAG existentes? Los File Search stores
    // pertenecen al proyecto Google de la key que los creó — una key de
    // otro proyecto no los ve y las bases requieren reindexado
    let needsReindex = false;
    let storagesWithIndex = 0;

    const { data: storagesWithStore } = await supabase
      .from("document_storages")
      .select("id, gemini_vector_store_id")
      .like("gemini_vector_store_id", "fileSearchStores/%");

    const realStores = (storagesWithStore || []).filter((s) =>
      isRealStoreName(s.gemini_vector_store_id)
    );
    storagesWithIndex = realStores.length;

    if (realStores.length > 0) {
      const accessible = await fileSearchStoreExists(
        target.api_key,
        realStores[0].gemini_vector_store_id!
      );
      needsReindex = !accessible;
    }

    return NextResponse.json({ success: true, needsReindex, storagesWithIndex });
  } catch (error: any) {
    console.error("Error selecting API key:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE - Eliminar una key (?id=...). No permite borrar la seleccionada.
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { data: target } = await supabase
      .from("api_config")
      .select("id, is_selected")
      .eq("id", id)
      .single();

    if (!target) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    if (target.is_selected) {
      return NextResponse.json(
        { error: "No puedes eliminar la key en uso. Selecciona otra primero." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("api_config").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting API key:", error);
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
