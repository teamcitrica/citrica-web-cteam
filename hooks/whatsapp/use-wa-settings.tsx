"use client";
import { useEffect, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface WaSettings {
  id: number;
  ai_enabled: boolean;
  default_storage_id: string | null;
  system_prompt: string | null;
  updated_at: string;
}

export interface WaStorageOption {
  id: string;
  name: string;
}

export const useWaSettings = () => {
  const { supabase } = useSupabase();
  const [settings, setSettings] = useState<WaSettings | null>(null);
  const [storages, setStorages] = useState<WaStorageOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);

      const [settingsResult, storagesResult] = await Promise.all([
        supabase.from("wa_settings").select("*").eq("id", 1).single(),
        supabase.from("document_storages").select("id, name").order("name"),
      ]);

      if (settingsResult.error) {
        console.error("Error al obtener settings de WhatsApp:", settingsResult.error);
        addToast({
          title: "Error",
          description: "No se pudo cargar la configuración de WhatsApp",
          color: "danger",
        });
      } else {
        setSettings(settingsResult.data);
      }

      if (storagesResult.error) {
        console.error("Error al obtener storages:", storagesResult.error);
      } else {
        setStorages(storagesResult.data || []);
      }
    } catch (err) {
      console.error("Error en fetchSettings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<Omit<WaSettings, "id" | "updated_at">>) => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("wa_settings")
          .update(updates)
          .eq("id", 1)
          .select()
          .single();

        if (error) {
          console.error("Error al guardar configuración:", error);
          addToast({
            title: "Error",
            description: "No se pudo guardar la configuración",
            color: "danger",
          });
          return false;
        }

        // Cambió el storage default: resetear la memoria de las conversaciones
        // que lo usan (las que no tienen override propio)
        if (
          "default_storage_id" in updates &&
          updates.default_storage_id !== settings?.default_storage_id
        ) {
          await supabase
            .from("wa_conversations")
            .update({ context_since: new Date().toISOString() })
            .is("storage_id", null);
        }

        setSettings(data);
        addToast({
          title: "Configuración guardada",
          description: "Los cambios se aplican a los próximos mensajes",
          color: "success",
        });
        return true;
      } catch (err) {
        console.error("Error en updateSettings:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, settings?.default_storage_id]
  );

  return { settings, storages, isLoading, fetchSettings, updateSettings };
};
