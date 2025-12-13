"use client";
import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface ProjectContact {
  id: string;
  project_id: string;
  users_id: string;
  created_at: string;
}

export interface ProjectContactWithDetails extends ProjectContact {
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
    company_id?: number;
  };
}

export const useProjectContacts = () => {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  // Obtener todos los usuarios de un proyecto específico
  const getProjectContacts = useCallback(
    async (projectId: string): Promise<any[]> => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("proyect_acces")
          .select(`
            users_id,
            users (
              id,
              first_name,
              last_name,
              email,
              role_id,
              company_id
            )
          `)
          .eq("project_id", projectId);

        if (error) {
          // Solo log si es un error real, no si simplemente no hay datos
          if (error.code !== 'PGRST116') {
            console.log("Información: No hay contactos para este proyecto o error menor:", error.message);
          }
          return [];
        }

        // Extraer solo los datos de users
        const users = data
          .map((item: any) => item.users)
          .filter(Boolean);

        return users;
      } catch (err: any) {
        console.log("No se pudieron cargar contactos del proyecto:", err?.message || "");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  // Agregar un usuario a un proyecto
  const addContactToProject = async (
    projectId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("proyect_acces")
        .insert([{ project_id: projectId, users_id: userId }]);

      if (error) {
        // Verificar si es un error de duplicado
        if (error.code === "23505") {
          addToast({
            title: "Aviso",
            description: "Este usuario ya está asociado al proyecto",
            color: "warning",
          });
          return false;
        }

        console.error("Error al agregar usuario al proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudo agregar el usuario al proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Usuario agregado",
        description: "El usuario ha sido asociado al proyecto correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en addContactToProject:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un usuario de un proyecto
  const removeContactFromProject = async (
    projectId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("proyect_acces")
        .delete()
        .eq("project_id", projectId)
        .eq("users_id", userId);

      if (error) {
        console.error("Error al eliminar usuario del proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar el usuario del proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Usuario eliminado",
        description: "El usuario ha sido removido del proyecto correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en removeContactFromProject:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar múltiples usuarios a un proyecto
  const addMultipleContactsToProject = async (
    projectId: string,
    userIds: string[]
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const insertData = userIds.map((userId) => ({
        project_id: projectId,
        users_id: userId,
      }));

      const { error } = await supabase
        .from("proyect_acces")
        .insert(insertData);

      if (error) {
        console.error("Error al agregar usuarios al proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudieron agregar los usuarios al proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Usuarios agregados",
        description: "Los usuarios han sido asociados al proyecto correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en addMultipleContactsToProject:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar usuarios de un proyecto (elimina los que no están en la lista y agrega los nuevos)
  const syncProjectContacts = async (
    projectId: string,
    userIds: string[]
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Primero eliminamos todas las relaciones existentes
      const { error: deleteError } = await supabase
        .from("proyect_acces")
        .delete()
        .eq("project_id", projectId);

      if (deleteError) {
        console.error("Error al eliminar usuarios previos:", {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code,
        });
        addToast({
          title: "Error",
          description: `No se pudieron eliminar usuarios previos: ${deleteError.message || 'Error de permisos'}`,
          color: "danger",
        });
        return false;
      }

      // Si no hay usuarios nuevos, terminamos aquí
      if (userIds.length === 0) {
        addToast({
          title: "Usuarios actualizados",
          description: "Se han actualizado los usuarios del proyecto",
          color: "success",
        });
        return true;
      }

      // Agregamos los nuevos usuarios
      const insertData = userIds.map((userId) => ({
        project_id: projectId,
        users_id: userId,
      }));

      const { error: insertError } = await supabase
        .from("proyect_acces")
        .insert(insertData);

      if (insertError) {
        console.error("Error al agregar nuevos usuarios:", insertError);
        addToast({
          title: "Error",
          description: "No se pudieron actualizar los usuarios del proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Usuarios actualizados",
        description: "Los usuarios del proyecto han sido actualizados correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en syncProjectContacts:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getProjectContacts,
    addContactToProject,
    removeContactFromProject,
    addMultipleContactsToProject,
    syncProjectContacts,
  };
};
