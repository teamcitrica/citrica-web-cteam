"use client";

import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface ServiceType {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceTypeInput {
  name: string;
  description?: string;
  is_active?: boolean;
}

export function useServiceTypes() {
  const { supabase } = useSupabase();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("service_types")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;

      setServiceTypes(data || []);
    } catch (err: any) {
      console.error("Error fetching service types:", err);
      setError(err.message || "Error al cargar tipos de servicio");
      addToast({
        title: "Error",
        description: "Error al cargar tipos de servicio",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const createServiceType = useCallback(
    async (data: ServiceTypeInput): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const { error: insertError } = await supabase
          .from("service_types")
          .insert([
            {
              name: data.name.trim(),
              description: data.description?.trim() || null,
              is_active: data.is_active !== false,
            },
          ]);

        if (insertError) throw insertError;

        addToast({
          title: "Tipo creado",
          description: "El tipo de servicio se ha creado exitosamente",
          color: "success",
        });
        await fetchServiceTypes();

        return true;
      } catch (err: any) {
        console.error("Error creating service type:", err);
        setError(err.message || "Error al crear tipo de servicio");
        addToast({
          title: "Error",
          description: err.message?.includes("duplicate")
            ? "Ya existe un tipo de servicio con ese nombre"
            : "Error al crear tipo de servicio",
          color: "danger",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchServiceTypes],
  );

  const updateServiceType = useCallback(
    async (id: number, data: ServiceTypeInput): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("service_types")
          .update({
            name: data.name.trim(),
            description: data.description?.trim() || null,
            is_active: data.is_active !== false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) throw updateError;

        addToast({
          title: "Tipo actualizado",
          description: "El tipo de servicio se ha actualizado exitosamente",
          color: "success",
        });
        await fetchServiceTypes();

        return true;
      } catch (err: any) {
        console.error("Error updating service type:", err);
        setError(err.message || "Error al actualizar tipo de servicio");
        addToast({
          title: "Error",
          description: err.message?.includes("duplicate")
            ? "Ya existe un tipo de servicio con ese nombre"
            : "Error al actualizar tipo de servicio",
          color: "danger",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchServiceTypes],
  );

  const deleteServiceType = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from("service_types")
          .delete()
          .eq("id", id);

        if (deleteError) {
          if (deleteError.code === "23503") {
            throw new Error(
              "No se puede eliminar el tipo porque tiene servicios asociados",
            );
          }
          throw deleteError;
        }

        addToast({
          title: "Tipo eliminado",
          description: "El tipo de servicio se ha eliminado exitosamente",
          color: "success",
        });
        await fetchServiceTypes();

        return true;
      } catch (err: any) {
        console.error("Error deleting service type:", err);
        setError(err.message || "Error al eliminar tipo de servicio");
        addToast({
          title: "Error",
          description: err.message || "Error al eliminar tipo de servicio",
          color: "danger",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchServiceTypes],
  );

  const toggleActive = useCallback(
    async (id: number, isActive: boolean): Promise<boolean> => {
      // Actualización optimista
      setServiceTypes((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_active: isActive } : t,
        ),
      );

      try {
        const { error: updateError } = await supabase
          .from("service_types")
          .update({
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) throw updateError;

        return true;
      } catch (err: any) {
        console.error("Error toggling service type status:", err);
        // Revertir si falla
        setServiceTypes((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, is_active: !isActive } : t,
          ),
        );

        return false;
      }
    },
    [supabase],
  );

  return {
    serviceTypes,
    isLoading,
    error,
    fetchServiceTypes,
    createServiceType,
    updateServiceType,
    deleteServiceType,
    toggleActive,
  };
}
