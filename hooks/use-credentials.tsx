"use client";
import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface CredentialType {
  id: number;
  supabase_url: string;
  supabase_anon_key: string;
  table_name: string;
  role_id: number;
  name?: string;
  created_at?: string;
  // Datos del rol relacionado
  role?: {
    id: number;
    name: string;
    description: string;
  };
}

export const useCredentials = () => {
  const { supabase } = useSupabase();
  const [credentials, setCredentials] = useState<CredentialType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCredentials = useCallback(async () => {
    try {
      setIsLoading(true);
      // Hacemos un join con la tabla roles para obtener la información del rol
      const { data, error } = await supabase
        .from("credentials")
        .select(`
          *,
          role:roles(id, name, description)
        `);

      if (error) {
        console.error("Error al obtener credenciales:", error);
        console.error("Detalles del error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return;
      }

      setCredentials(data || []);
    } catch (err) {
      console.error("Error en fetchCredentials:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const updateCredential = useCallback(async (
    credentialId: number,
    credentialData: {
      supabase_url: string;
      supabase_anon_key: string;
      table_name: string;
      role_id: number;
    }
  ) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("credentials")
        .update(credentialData)
        .eq("id", credentialId)
        .select();

      if (error) {
        console.error("Error al actualizar credencial:", error);
        addToast({
          title: "Error",
          description: "No se pudo actualizar la credencial",
          color: "danger",
        });
        return { success: false, error };
      }

      addToast({
        title: "Éxito",
        description: "Credencial actualizada correctamente",
        color: "success",
      });

      // Actualizar la lista de credenciales
      await fetchCredentials();

      return { success: true, data };
    } catch (err) {
      console.error("Error en updateCredential:", err);
      addToast({
        title: "Error",
        description: "Ocurrió un error al actualizar la credencial",
        color: "danger",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchCredentials]);

  const deleteCredential = useCallback(async (credentialId: number) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("credentials")
        .delete()
        .eq("id", credentialId);

      if (error) {
        console.error("Error al eliminar credencial:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar la credencial",
          color: "danger",
        });
        return { success: false, error };
      }

      addToast({
        title: "Éxito",
        description: "Credencial eliminada correctamente",
        color: "success",
      });

      // Actualizar la lista de credenciales
      await fetchCredentials();

      return { success: true };
    } catch (err) {
      console.error("Error en deleteCredential:", err);
      addToast({
        title: "Error",
        description: "Ocurrió un error al eliminar la credencial",
        color: "danger",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchCredentials]);

  return {
    credentials,
    isLoading,
    fetchCredentials,
    updateCredential,
    deleteCredential,
  };
};
