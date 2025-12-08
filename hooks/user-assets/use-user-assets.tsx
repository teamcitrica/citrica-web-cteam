"use client";
import { useState, useEffect } from "react";

import { useSupabase } from "@/shared/context/supabase-context";

export interface UserAsset {
  id: string;
  name: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  tabla: string | null;
  assets_options: {
    columns?: string[];
    [key: string]: any;
  } | null;
  project_id: string | null;
  project_name?: string | null;
}

export function useUserAssets(userId?: string) {
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();
  useEffect(() => {
    const fetchUserAssets = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 1. Obtener los proyectos asignados al usuario
        const { data: projectAccess, error: accessError } = await supabase
          .from("proyect_acces")
          .select("project_id")
          .eq("users_id", userId);

        if (accessError) {
          throw accessError;
        }

        if (!projectAccess || projectAccess.length === 0) {
          setAssets([]);
          setIsLoading(false);
          return;
        }

        const projectIds = projectAccess.map((access) => access.project_id);

        // 2. Obtener los assets de esos proyectos
        const { data: assetsData, error: assetsError } = await supabase
          .from("assets")
          .select(`
            id,
            name,
            supabase_url,
            supabase_anon_key,
            tabla,
            assets_options,
            project_id,
            projects (
              name
            )
          `)
          .in("project_id", projectIds);

        if (assetsError) {
          throw assetsError;
        }

        // Mapear los datos para incluir el nombre del proyecto
        const mappedAssets: UserAsset[] = (assetsData || []).map((asset: any) => ({
          id: asset.id,
          name: asset.name,
          supabase_url: asset.supabase_url,
          supabase_anon_key: asset.supabase_anon_key,
          tabla: asset.tabla,
          assets_options: asset.assets_options,
          project_id: asset.project_id,
          project_name: asset.projects?.name || null,
        }));

        setAssets(mappedAssets);
      } catch (err: any) {
        console.error("Error al obtener assets del usuario:", err);
        setError(err.message || "Error desconocido");
        setAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAssets();
  }, [userId]);

  return { assets, isLoading, error };
}
