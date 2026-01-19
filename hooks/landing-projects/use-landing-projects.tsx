"use client";
import { useEffect, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface TechnologyItem {
  name: string;
  icon: string;
  color: string;
}

export interface LandingProject {
  id: string;
  slug: string;
  hero_category: string;
  hero_title: string;
  hero_subtitle: string | null;
  hero_button_label: string | null;
  hero_image: string | null;
  description_section_title: string | null;
  description_main_title: string | null;
  description_text: string | null;
  description_title_color: string | null;
  description_text_color: string | null;
  description_bg_color: string | null;
  description_border_color: string | null;
  challenge_section_title: string | null;
  challenge_image: string | null;
  challenge_description: string | null;
  challenge_title_color: string | null;
  challenge_text_color: string | null;
  solution_section_title: string | null;
  solution_image: string | null;
  solution_description: string | null;
  solution_title_color: string | null;
  solution_text_color: string | null;
  services: ServiceItem[];
  technologies: TechnologyItem[];
  is_active: boolean;
  featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export type LandingProjectInput = Omit<LandingProject, "id" | "created_at" | "updated_at">;

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export const useLandingProjects = () => {
  const { supabase } = useSupabase();
  const [projects, setProjects] = useState<LandingProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("landing_projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener proyectos landing:", error);
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

  const fetchActiveProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("landing_projects")
        .select("*")
        .eq("is_active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener proyectos activos:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error en fetchActiveProjects:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const fetchProjectBySlug = useCallback(async (slug: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("landing_projects")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error al obtener proyecto por slug:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error en fetchProjectBySlug:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const fetchProjectById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("landing_projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener proyecto por id:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error en fetchProjectById:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const createProject = async (newProject: LandingProjectInput) => {
    try {
      setIsLoading(true);

      const projectData = {
        ...newProject,
        slug: newProject.slug || generateSlug(newProject.hero_title),
      };

      const { data, error } = await supabase
        .from("landing_projects")
        .insert([projectData])
        .select();

      if (error) {
        console.error("Error al crear proyecto:", error);
        addToast({
          title: "Error",
          description: error.message.includes("duplicate")
            ? "Ya existe un proyecto con ese slug"
            : "No se pudo crear el proyecto",
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
      return data?.[0] || null;
    } catch (err) {
      console.error("Error en createProject:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (id: string, updatedFields: Partial<LandingProjectInput>) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("landing_projects")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error al actualizar proyecto:", error);
        addToast({
          title: "Error",
          description: error.message.includes("duplicate")
            ? "Ya existe un proyecto con ese slug"
            : "No se pudo actualizar el proyecto",
          color: "danger",
        });
        throw error;
      }

      addToast({
        title: "Proyecto actualizado",
        description: "El proyecto ha sido actualizado correctamente",
        color: "success",
      });

      await fetchProjects();
      return data?.[0] || null;
    } catch (err) {
      console.error("Error en updateProject:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("landing_projects")
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

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateProject(id, { is_active: isActive });
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    return updateProject(id, { featured });
  };

  const getFeaturedProjects = useCallback(() => {
    return projects.filter((p) => p.featured && p.is_active);
  }, [projects]);

  const getProjectStats = useCallback(() => {
    return {
      total: projects.length,
      active: projects.filter((p) => p.is_active).length,
      inactive: projects.filter((p) => !p.is_active).length,
      featured: projects.filter((p) => p.featured).length,
    };
  }, [projects]);

  const refreshProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    fetchProjects,
    fetchActiveProjects,
    fetchProjectBySlug,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    toggleActive,
    toggleFeatured,
    getFeaturedProjects,
    getProjectStats,
    refreshProjects,
    generateSlug,
  };
};
