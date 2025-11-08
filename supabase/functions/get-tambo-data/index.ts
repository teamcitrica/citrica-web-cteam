// supabase/functions/get-tambo-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Obtener token del usuario autenticado
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Cliente Supabase principal (tu proyecto Cítrica)
    const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPA_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseMain = createClient(SUPA_URL, SUPA_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Validar usuario actual
    const { data: userData, error: userErr } = await supabaseMain.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid or missing user" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = userData.user;

    // Obtener el role_id desde la tabla de usuarios usando la función RPC
    const { data: userInfoData, error: userInfoErr } = await supabaseMain
      .rpc('get_user_with_role', { user_id: user.id });

    if (userInfoErr || !userInfoData || userInfoData.length === 0) {
      return new Response(JSON.stringify({ error: "User not found in database" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const role_id = userInfoData[0]?.role_id;

    // Solo rol 4 puede acceder
    if (role_id !== 4 && role_id !== "4") {
      return new Response(JSON.stringify({ error: "Forbidden - not role 4" }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Cliente Supabase Tambo (la base de datos externa)
    const TAMBO_URL = Deno.env.get("TAMBO_SUPABASE_URL");
    const TAMBO_SERVICE_KEY = Deno.env.get("TAMBO_SUPABASE_SERVICE_ROLE_KEY");

    if (!TAMBO_URL || !TAMBO_SERVICE_KEY) {
      throw new Error("Missing Tambo credentials");
    }

    const supabaseTambo = createClient(TAMBO_URL, TAMBO_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });

    // Consulta a la tabla `sorteos_tambo` con bypass de RLS
    // Primero obtenemos el count total
    const { count, error: countError } = await supabaseTambo
      .from("sorteos_tambo")
      .select("*", { count: 'exact', head: true });

    if (countError) throw countError;

    console.log(`Total de registros en sorteos_tambo: ${count}`);

    // Traer TODOS los datos usando paginación interna
    const allData: any[] = [];
    const pageSize = 1000; // Supabase limit per request
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const start = page * pageSize;
      const end = start + pageSize - 1;

      const { data: pageData, error: pageError } = await supabaseTambo
        .from("sorteos_tambo")
        .select("*")
        .range(start, end);

      if (pageError) throw pageError;

      if (pageData && pageData.length > 0) {
        allData.push(...pageData);
        console.log(`Página ${page + 1}: obtenidos ${pageData.length} registros (total acumulado: ${allData.length})`);
        page++;

        // Si obtuvimos menos que el pageSize, ya no hay más datos
        if (pageData.length < pageSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }

      // Seguridad: evitar loops infinitos (10000 páginas = 10 millones de registros)
      if (page > 10000) {
        console.error("Demasiadas páginas, deteniendo...");
        break;
      }
    }

    console.log(`Total final de registros obtenidos: ${allData.length}`);
    const data = allData;

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("get-tambo-data error:", err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
