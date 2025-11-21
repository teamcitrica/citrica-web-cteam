"use client";
import { useEffect, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface Project {
  id: string;
  name: string | null;
  company_id: number | null;
  status: string | null;
  nombre_responsable: string | null;
  email_responsable: string | null;
  phone_responsable: string | null;
  tabla: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
}

export type ProjectInput = Omit<Project, "id">;

export const useProjectCRUD = () => {
  const { supabase } = useSupabase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Leer: Traer todos los proyectos de la tabla
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*");

      if (error) {
        console.error("Error al obtener proyectos:", error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar los proyectos",
          color: "danger",
        });
        return;
      }
      setProjects(data || []);
    } catch (err) {
      console.error("Error en fetchProjects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Obtener proyecto por ID
  const fetchProjectById = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener proyecto:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error en fetchProjectById:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Crear proyecto
  const createProject = async (newProject: ProjectInput) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .insert([newProject])
        .select();

      if (error) {
        console.error("Error al crear proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudo crear el proyecto",
          color: "danger",
        });
        return null;
      }

      addToast({
        title: "Proyecto creado",
        description: "El proyecto ha sido creado correctamente",
        color: "success",
      });

      await fetchProjects();
      return data;
    } catch (err) {
      console.error("Error en createProject:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar proyecto
  const updateProject = async (id: string, updatedFields: Partial<ProjectInput>) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error al actualizar proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudo actualizar el proyecto",
          color: "danger",
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("Actualización sin datos retornados");
        throw new Error("No se pudo actualizar el proyecto");
      }

      addToast({
        title: "Proyecto actualizado",
        description: "El proyecto ha sido actualizado correctamente",
        color: "success",
      });

      await fetchProjects();
      return data;
    } catch (err) {
      console.error("Error en updateProject:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar proyecto
  const deleteProject = async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar el proyecto",
          color: "danger",
        });
        throw error;
      }

      addToast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado correctamente",
        color: "success",
      });

      await fetchProjects();
      return { success: true };
    } catch (err) {
      console.error("Error en deleteProject:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function
  const refreshProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    isLoading,
    fetchProjects,
    refreshProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
  };
};
