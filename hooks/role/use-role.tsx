"use client";
import { useState } from "react";

import { useSupabase } from "@/shared/context/supabase-context";

export interface RoleType {
  id: number;
  name: string;
  description: string;
  permissions?: any; // jsonb type
  created_at?: string;
}

export const useUserRole = () => {
  const { supabase } = useSupabase();
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("roles").select("*");

      if (error) {
        console.error("Error al obtener roles:", error);
        console.error("Detalles del error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        return;
      }
      setRoles(data || []);
    } catch (err) {
      console.error("Error en fetchRoles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    roles,
    isLoading,
    fetchRoles,
  };
};
