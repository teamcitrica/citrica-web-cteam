"use client";
import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";
import { UserType } from "@/shared/types/types";

export interface ProjectAccess {
  id: string;
  users_id: string;
  project_id: string;
  created_at: string;
}

export interface ProjectAccessWithDetails extends ProjectAccess {
  users: UserType;
}

export const useUserProjects = () => {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  // Obtener todos los usuarios asignados a un proyecto específico
  const getProjectUsers = useCallback(
    async (projectId: string): Promise<UserType[]> => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("proyect_acces")
          .select(`
            users_id,
            users (
              id,
              email,
              first_name,
              last_name,
              role_id,
              created_at
            )
          `)
          .eq("project_id", projectId);

        if (error) {
          // Solo log si es un error real, no si simplemente no hay datos
          if (error.code !== 'PGRST116') {
            console.log("Información: No hay usuarios para este proyecto o error menor:", error.message);
          }
          return [];
        }

        // Extraer solo los datos de users
        const users = data
          .map((item: any) => item.users)
          .filter(Boolean);

        return users as UserType[];
      } catch (err: any) {
        console.log("No se pudieron cargar usuarios del proyecto:", err?.message || "");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  // Obtener todos los proyectos asignados a un usuario específico
  const getUserProjects = useCallback(
    async (userId: string): Promise<string[]> => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("proyect_acces")
          .select("project_id")
          .eq("users_id", userId);

        if (error) {
          console.error("Error al obtener proyectos del usuario:", error);
          return [];
        }

        return data.map((item) => item.project_id);
      } catch (err) {
        console.error("Error en getUserProjects:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  // Asignar un usuario a un proyecto
  const assignUserToProject = async (
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
            description: "Este usuario ya está asignado al proyecto",
            color: "warning",
          });
          return false;
        }

        console.error("Error al asignar usuario al proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudo asignar el usuario al proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Usuario asignado",
        description: "El usuario ha sido asignado al proyecto correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en assignUserToProject:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remover un usuario de un proyecto
  const removeUserFromProject = async (
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
        console.error("Error al remover usuario del proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudo remover el usuario del proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Usuario removido",
        description: "El usuario ha sido removido del proyecto correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en removeUserFromProject:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Asignar múltiples usuarios a un proyecto
  const assignMultipleUsersToProject = async (
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
        console.error("Error al asignar usuarios al proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudieron asignar los usuarios al proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Usuarios asignados",
        description: "Los usuarios han sido asignados al proyecto correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en assignMultipleUsersToProject:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar usuarios de un proyecto (elimina los que no están en la lista y agrega los nuevos)
  const syncProjectUsers = async (
    projectId: string,
    userIds: string[]
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Primero eliminamos todas las asignaciones existentes
      const { error: deleteError } = await supabase
        .from("proyect_acces")
        .delete()
        .eq("project_id", projectId);

      if (deleteError) {
        console.error("Error al eliminar asignaciones previas:", deleteError);
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
      console.error("Error en syncProjectUsers:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getProjectUsers,
    getUserProjects,
    assignUserToProject,
    removeUserFromProject,
    assignMultipleUsersToProject,
    syncProjectUsers,
  };
};
