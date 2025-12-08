"use client";
import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

import { useSupabase } from "@/shared/context/supabase-context";

export interface RoleCredentials {
  id: string;
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
  table_name: string;
  role_id: number;
}

export const useRoleData = (roleId: number | undefined) => {
  const { supabase } = useSupabase();
  const [credentials, setCredentials] = useState<RoleCredentials | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las credenciales del rol
  const fetchRoleCredentials = useCallback(async () => {
    if (!roleId || roleId < 5) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("credentials")
        .select("*")
        .eq("role_id", roleId)
        .single();

      if (error) {
        console.error("Error al obtener credenciales del rol:", error);
        return null;
      }

      return data as RoleCredentials;
    } catch (err) {
      console.error("Error en fetchRoleCredentials:", err);
      return null;
    }
  }, [roleId, supabase]);

  // Función para obtener datos de la tabla externa con filtros
  const fetchTableData = useCallback(async (creds: RoleCredentials, filters: any[] = []) => {
    if (!creds.supabase_url || !creds.supabase_anon_key || !creds.table_name) {
      setError("Credenciales incompletas");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Crear cliente de Supabase externo
      const externalSupabase = createClient(
        creds.supabase_url,
        creds.supabase_anon_key
      );

      // Iniciar la consulta
      let query = externalSupabase
        .from(creds.table_name)
        .select("*");

      // Aplicar filtros dinámicos
      filters.forEach((filter) => {
        const { column, operator, value } = filter;

        switch (operator) {
          case "eq":
            query = query.eq(column, value);
            break;
          case "neq":
            query = query.neq(column, value);
            break;
          case "gt":
            query = query.gt(column, value);
            break;
          case "gte":
            query = query.gte(column, value);
            break;
          case "lt":
            query = query.lt(column, value);
            break;
          case "lte":
            query = query.lte(column, value);
            break;
          case "contains":
            query = query.ilike(column, `%${value}%`);
            break;
          case "not_contains":
            query = query.not(column, "ilike", `%${value}%`);
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
            query = query.not(column, "is", null);
            break;
        }
      });

      // Limitar resultados
      query = query.limit(1000);

      const { data, error } = await query;

      if (error) {
        console.error("Error al obtener datos de tabla externa:", error);
        setError(`Error al consultar tabla: ${error.message}`);
        setTableData([]);
        return;
      }

      setTableData(data || []);
    } catch (err: any) {
      console.error("Error en fetchTableData:", err);
      setError(err.message || "Error al obtener datos");
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para refrescar los datos con filtros opcionales
  const refreshData = useCallback(async (filters: any[] = []) => {
    const creds = await fetchRoleCredentials();
    if (creds) {
      setCredentials(creds);
      await fetchTableData(creds, filters);
    }
  }, [fetchRoleCredentials, fetchTableData]);

  // Función para aplicar filtros
  const applyFilters = useCallback(async (filters: any[]) => {
    if (credentials) {
      await fetchTableData(credentials, filters);
    }
  }, [credentials, fetchTableData]);

  // Cargar credenciales inicialmente, pero NO los datos de la tabla
  useEffect(() => {
    const loadCredentials = async () => {
      if (roleId && roleId >= 5) {
        const creds = await fetchRoleCredentials();
        if (creds) {
          setCredentials(creds);
        }
      } else {
        setCredentials(null);
        setTableData([]);
        setError(null);
      }
    };

    loadCredentials();
  }, [roleId, fetchRoleCredentials]);

  return {
    credentials,
    tableData,
    isLoading,
    error,
    refreshData,
    applyFilters,
  };
};
