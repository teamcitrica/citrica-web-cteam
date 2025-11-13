// supabase/functions/get-tambo-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tipo para los filtros recibidos desde el frontend
interface Filter {
  column: string;
  operator: string;
  value: string;
}

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

    // Leer los filtros del body (si es POST)
    let filters: Filter[] = [];
    let orderBy = { column: "id", direction: "asc" };

    if (req.method === 'POST') {
      const body = await req.json();
      filters = body.filters || [];
      orderBy = body.orderBy || orderBy;
    }

    console.log("Filtros recibidos:", JSON.stringify(filters));
    console.log("Orden recibido:", JSON.stringify(orderBy));

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

    // Construir la consulta con filtros
    let query = supabaseTambo.from("sorteos_tambo").select("*");

    // Aplicar cada filtro
    filters.forEach((filter) => {
      const { column, operator, value } = filter;

      // Ignorar filtros sin valor (excepto is_null e is_not_null)
      if (!value && operator !== "is_null" && operator !== "is_not_null") {
        return;
      }

      switch (operator) {
        case "eq":
          query = query.eq(column, value);
          break;
        case "neq":
          query = query.neq(column, value);
          break;
        case "gt":
          query = query.gt(column, parseFloat(value));
          break;
        case "gte":
          query = query.gte(column, parseFloat(value));
          break;
        case "lt":
          query = query.lt(column, parseFloat(value));
          break;
        case "lte":
          query = query.lte(column, parseFloat(value));
          break;
        case "contains":
          query = query.ilike(column, `%${value}%`);
          break;
        case "not_contains":
          query = query.not(column, 'ilike', `%${value}%`);
          break;
        case "starts_with":
          query = query.ilike(column, `${value}%`);
          break;
        case "ends_with":
          query = query.ilike(column, `%${value}`);
          break;
        case "is_null":
          query = query.is(column, null);
          break;
        case "is_not_null":
          query = query.not(column, 'is', null);
          break;
      }
    });

    // Aplicar ordenamiento
    query = query.order(orderBy.column, { ascending: orderBy.direction === "asc" });

    // Traer TODOS los datos con paginación interna
    const allData: any[] = [];
    const pageSize = 1000;
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const start = page * pageSize;
      const end = start + pageSize - 1;

      const { data: pageData, error: pageError } = await query.range(start, end);

      if (pageError) throw pageError;

      if (pageData && pageData.length > 0) {
        allData.push(...pageData);
        console.log(`Página ${page + 1}: obtenidos ${pageData.length} registros (total acumulado: ${allData.length})`);
        page++;

        if (pageData.length < pageSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }

      // Seguridad: evitar loops infinitos
      if (page > 10000) {
        console.error("Demasiadas páginas, deteniendo...");
        break;
      }
    }

    console.log(`Total final de registros obtenidos: ${allData.length}`);

    return new Response(JSON.stringify({ data: allData }), {
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
