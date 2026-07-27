import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";

// Fallbacks si la DB no tiene filas en rag_prompt_defaults (seed en migración 017).
// Instrucción base: prioriza documentos, permite conocimiento general
// siempre que se distinga la fuente (anti-atribución falsa)
export const FALLBACK_BASE_RAG_INSTRUCTION =
  "Prioriza la información de los documentos recuperados como fuente principal. " +
  "Puedes complementar con tu conocimiento general cuando aporte valor, pero " +
  "distingue con claridad qué proviene de los documentos y qué es conocimiento general. " +
  "Nunca atribuyas a los documentos información que no contienen; si algo no está en ellos, dilo.";

// Instrucción cuando el storage tiene strict_mode activado (reemplaza a la base:
// combinarlas se contradice — la base permite conocimiento general)
export const FALLBACK_STRICT_RAG_INSTRUCTION =
  "MODO ESTRICTO: El documento es tu única fuente y tu guion. " +
  "Sigue su estructura y sus secciones en el orden exacto en que aparecen, al pie de la letra. " +
  "No agregues preguntas, temas ni contenido que no estén escritos en el documento. " +
  "Si el usuario pide algo fuera del documento, responde que no está contemplado en el documento.";

// Temperature baja en modo estricto para minimizar improvisación
export const STRICT_TEMPERATURE = 0.3;

export interface RagPromptDefaults {
  base: string;
  strict: string;
}

export const RAG_PROMPT_FALLBACKS: RagPromptDefaults = {
  base: FALLBACK_BASE_RAG_INSTRUCTION,
  strict: FALLBACK_STRICT_RAG_INSTRUCTION,
};

export async function getRagPromptDefaults(
  supabase: SupabaseClient
): Promise<RagPromptDefaults> {
  const defaults: RagPromptDefaults = { ...RAG_PROMPT_FALLBACKS };

  const { data, error } = await supabase
    .from("rag_prompt_defaults")
    .select("key, prompt");

  if (error) {
    console.error("Error leyendo rag_prompt_defaults, usando fallbacks:", error);
    return defaults;
  }

  for (const row of data || []) {
    if ((row.key === "base" || row.key === "strict") && row.prompt?.trim()) {
      defaults[row.key as keyof RagPromptDefaults] = row.prompt;
    }
  }

  return defaults;
}

// custom_prompt del storage gana; si no hay, default según strict_mode
export function resolveRagSystemPrompt(
  defaults: RagPromptDefaults,
  storage: { strict_mode?: boolean | null; custom_prompt?: string | null }
): string {
  const custom = storage.custom_prompt?.trim();
  if (custom) return custom;
  return storage.strict_mode ? defaults.strict : defaults.base;
}
