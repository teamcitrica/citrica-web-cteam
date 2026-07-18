import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Exige sesión válida en rutas de sales-analytics.
 * Retorna el usuario o una respuesta 401 lista para devolver.
 */
export async function requireSession(): Promise<
  { user: { id: string }; errorResponse: null } | { user: null; errorResponse: NextResponse }
> {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return { user: { id: user.id }, errorResponse: null };
}

/**
 * Cliente service-role por request (nunca a nivel módulo).
 * Única variable válida: SUPABASE_SERVICE_ROLE_KEY.
 */
export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno"
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
