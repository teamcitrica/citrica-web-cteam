import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET - Obtener todos los modelos configurados
 * Query params opcionales:
 * - active_only: boolean - Solo modelos activos
 */
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active_only") === "true";

    let query = supabase
      .from("ai_model_config")
      .select("*")
      .order("is_default", { ascending: false })
      .order("display_name", { ascending: true });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data: models, error } = await query;

    if (error) throw error;

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error("Error fetching models:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - Crear nuevo modelo
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const {
      model_id,
      display_name,
      description,
      provider = "gemini",
      input_token_limit,
      output_token_limit,
      is_active = true,
      is_default = false,
      cost_per_1m_input_tokens = 0.0,
      cost_per_1m_output_tokens = 0.0,
      supports_file_api = true,
      supports_streaming = true,
      config = {},
    } = body;

    if (!model_id || !display_name) {
      return NextResponse.json(
        { error: "model_id and display_name are required" },
        { status: 400 }
      );
    }

    // Si se marca como default, desmarcar los demás
    if (is_default) {
      await supabase
        .from("ai_model_config")
        .update({ is_default: false })
        .eq("provider", provider);
    }

    const { data: model, error } = await supabase
      .from("ai_model_config")
      .insert({
        model_id,
        display_name,
        description,
        provider,
        input_token_limit,
        output_token_limit,
        is_active,
        is_default,
        cost_per_1m_input_tokens,
        cost_per_1m_output_tokens,
        supports_file_api,
        supports_streaming,
        config,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ model });
  } catch (error: any) {
    console.error("Error creating model:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH - Actualizar modelo existente
 */
export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Si se marca como default, desmarcar los demás
    if (updates.is_default === true) {
      const { data: currentModel } = await supabase
        .from("ai_model_config")
        .select("provider")
        .eq("id", id)
        .single();

      if (currentModel) {
        await supabase
          .from("ai_model_config")
          .update({ is_default: false })
          .eq("provider", currentModel.provider)
          .neq("id", id);
      }
    }

    const { data: model, error } = await supabase
      .from("ai_model_config")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ model });
  } catch (error: any) {
    console.error("Error updating model:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE - Eliminar modelo
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // No permitir eliminar el modelo por defecto
    const { data: model } = await supabase
      .from("ai_model_config")
      .select("is_default")
      .eq("id", id)
      .single();

    if (model?.is_default) {
      return NextResponse.json(
        { error: "No se puede eliminar el modelo por defecto" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("ai_model_config")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting model:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
