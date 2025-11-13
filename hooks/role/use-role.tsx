"use client";
import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

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

  const fetchRoles = useCallback(async () => {
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
  }, [supabase]);

  const fetchRolesWithCredentials = useCallback(async () => {
    try {
      setIsLoading(true);

      // Primero, obtener los role_id que tienen credenciales
      const { data: credentialsData, error: credentialsError } = await supabase
        .from("credentials")
        .select("role_id");

      if (credentialsError) {
        console.error("Error al obtener credenciales:", credentialsError);
        setRoles([]);
        return;
      }

      // Extraer los role_id únicos
      const roleIdsWithCredentials = Array.from(
        new Set(credentialsData?.map((cred) => cred.role_id) || [])
      );

      if (roleIdsWithCredentials.length === 0) {
        setRoles([]);
        return;
      }

      // Obtener los roles que tienen credenciales
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .in("id", roleIdsWithCredentials);

      if (error) {
        console.error("Error al obtener roles con credenciales:", error);
        setRoles([]);
        return;
      }

      setRoles(data || []);
    } catch (err) {
      console.error("Error en fetchRolesWithCredentials:", err);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const createRole = useCallback(async (roleData: {
    name: string;
    description: string;
  }) => {
    try {
      setIsLoading(true);

      // Paso 1: Insertar en la tabla roles y obtener el role_id generado
      const { data: roleInserted, error: roleError } = await supabase
        .from("roles")
        .insert([{
          name: roleData.name,
          description: roleData.description,
        }])
        .select();

      if (roleError) {
        console.error("Error al crear rol:", roleError);
        addToast({
          title: "Error",
          description: "No se pudo crear el rol",
          color: "danger",
        });
        return { success: false, error: roleError };
      }

      const newRoleId = roleInserted[0].id;
      console.log("✅ Rol creado con ID:", newRoleId);

      addToast({
        title: "Éxito",
        description: "Rol creado correctamente",
        color: "success",
      });

      // Actualizar la lista de roles
      await fetchRoles();

      return { success: true, data: roleInserted };
    } catch (err) {
      console.error("Error en createRole:", err);
      addToast({
        title: "Error",
        description: "Ocurrió un error al crear el rol",
        color: "danger",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchRoles]);

  const updateRole = useCallback(async (roleId: number, roleData: {
    name: string;
    description: string;
  }) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("roles")
        .update(roleData)
        .eq("id", roleId)
        .select();

      if (error) {
        console.error("Error al actualizar rol:", error);
        addToast({
          title: "Error",
          description: "No se pudo actualizar el rol",
          color: "danger",
        });
        return { success: false, error };
      }

      addToast({
        title: "Éxito",
        description: "Rol actualizado correctamente",
        color: "success",
      });

      // Actualizar la lista de roles
      await fetchRoles();

      return { success: true, data };
    } catch (err) {
      console.error("Error en updateRole:", err);
      addToast({
        title: "Error",
        description: "Ocurrió un error al actualizar el rol",
        color: "danger",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchRoles]);

  const deleteRole = useCallback(async (roleId: number) => {
    try {
      setIsLoading(true);

      // Primero eliminar las credenciales asociadas al rol
      const { error: credentialsError } = await supabase
        .from("credentials")
        .delete()
        .eq("role_id", roleId);

      if (credentialsError) {
        console.error("Error al eliminar credenciales del rol:", credentialsError);
        addToast({
          title: "Error",
          description: "No se pudieron eliminar las credenciales asociadas",
          color: "danger",
        });
        return { success: false, error: credentialsError };
      }

      // Luego eliminar el rol
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", roleId);

      if (error) {
        console.error("Error al eliminar rol:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar el rol",
          color: "danger",
        });
        return { success: false, error };
      }

      addToast({
        title: "Éxito",
        description: "Rol y credenciales eliminados correctamente",
        color: "success",
      });

      // Actualizar la lista de roles
      await fetchRoles();

      return { success: true };
    } catch (err) {
      console.error("Error en deleteRole:", err);
      addToast({
        title: "Error",
        description: "Ocurrió un error al eliminar el rol",
        color: "danger",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchRoles]);

  return {
    roles,
    isLoading,
    fetchRoles,
    fetchRolesWithCredentials,
    createRole,
    updateRole,
    deleteRole,
  };
};
