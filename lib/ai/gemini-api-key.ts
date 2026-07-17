import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resuelve la API key de Gemini que usa todo el sistema:
 * 1. La key SELECCIONADA en /admin/ia/config (api_config.is_selected) si es válida
 * 2. Cualquier otra key válida y activa del proveedor
 * 3. GEMINI_API_KEY del entorno como último fallback
 */
export async function getGeminiApiKey(supabase: SupabaseClient): Promise<string | null> {
  const { data: keys } = await supabase
    .from("api_config")
    .select("api_key, is_selected")
    .eq("provider", "gemini")
    .eq("is_active", true)
    .eq("verification_status", "valid")
    .order("is_selected", { ascending: false });

  return keys?.[0]?.api_key || process.env.GEMINI_API_KEY || null;
}
