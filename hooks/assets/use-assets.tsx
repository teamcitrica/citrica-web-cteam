"use client";
import { useEffect, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface Asset {
  id: string;
  name: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  assets_options: Record<string, any> | null;
  project_id: string | null;
  tabla: string | null;
  created_at?: string;
  updated_at?: string;
}

export type AssetInput = Omit<Asset, "id" | "created_at" | "updated_at">;

export const useAssetCRUD = () => {
  const { supabase } = useSupabase();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Leer: Traer todos los assets de la tabla
  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener assets:", error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar los assets",
          color: "danger",
        });
        return;
      }
      setAssets(data || []);
    } catch (err) {
      console.error("Error en fetchAssets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Obtener assets por project_id
  const fetchAssetsByProjectId = async (projectId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener assets del proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar los assets del proyecto",
          color: "danger",
        });
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error en fetchAssetsByProjectId:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener asset por ID
  const fetchAssetById = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener asset:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error en fetchAssetById:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Crear asset
  const createAsset = async (newAsset: AssetInput) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("assets")
        .insert([newAsset])
        .select();

      if (error) {
        console.error("Error al crear asset:", error);
        addToast({
          title: "Error",
          description: "No se pudo crear el asset",
          color: "danger",
        });
        return null;
      }

      addToast({
        title: "Asset creado",
        description: "El asset ha sido creado correctamente",
        color: "success",
      });

      await fetchAssets();
      return data;
    } catch (err) {
      console.error("Error en createAsset:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar asset
  const updateAsset = async (id: string, updatedFields: Partial<AssetInput>) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("assets")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error al actualizar asset:", error);
        addToast({
          title: "Error",
          description: "No se pudo actualizar el asset",
          color: "danger",
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("Actualización sin datos retornados");
        throw new Error("No se pudo actualizar el asset");
      }

      addToast({
        title: "Asset actualizado",
        description: "El asset ha sido actualizado correctamente",
        color: "success",
      });

      await fetchAssets();
      return data;
    } catch (err) {
      console.error("Error en updateAsset:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar asset
  const deleteAsset = async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar asset:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar el asset",
          color: "danger",
        });
        throw error;
      }

      addToast({
        title: "Asset eliminado",
        description: "El asset ha sido eliminado correctamente",
        color: "success",
      });

      await fetchAssets();
      return { success: true };
    } catch (err) {
      console.error("Error en deleteAsset:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function
  const refreshAssets = useCallback(async () => {
    await fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    fetchAssets();
  }, []);

  return {
    assets,
    isLoading,
    fetchAssets,
    refreshAssets,
    fetchAssetById,
    fetchAssetsByProjectId,
    createAsset,
    updateAsset,
    deleteAsset,
  };
};
