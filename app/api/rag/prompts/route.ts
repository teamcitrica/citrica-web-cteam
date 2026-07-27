import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getRagPromptDefaults,
  RAG_PROMPT_FALLBACKS,
} from "@/lib/ai/rag-prompts";

// GET - Prompts default del chat RAG (base y estricto) + textos originales
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const defaults = await getRagPromptDefaults(supabase);

    return NextResponse.json({ defaults, fallbacks: RAG_PROMPT_FALLBACKS });
  } catch (error: any) {
    console.error("Error fetching rag prompts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar un prompt default: { key: 'base' | 'strict', prompt }
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { key, prompt } = body;

    if (key !== "base" && key !== "strict") {
      return NextResponse.json(
        { error: "key debe ser 'base' o 'strict'" },
        { status: 400 }
      );
    }

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "prompt no puede estar vacío" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rag_prompt_defaults")
      .upsert({
        key,
        prompt: prompt.trim(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ prompt: data });
  } catch (error: any) {
    console.error("Error updating rag prompt:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
