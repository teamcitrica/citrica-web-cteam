"use client";

import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface Service {
  id: number;
  name: string;
  type_id: number;
  reference_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service_type?: {
    id: number;
    name: string;
  };
}

export interface ServiceInput {
  name: string;
  type_id: number;
  reference_amount?: number;
  is_active?: boolean;
}

export function useServices() {
  const { supabase } = useSupabase();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("services")
        .select(`
          *,
          service_type:service_types(id, name)
        `)
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;

      setServices(data || []);
    } catch (err: any) {
      console.error("Error fetching services:", err);
      setError(err.message || "Error al cargar servicios");
      addToast({
        title: "Error",
        description: "Error al cargar servicios",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const createService = useCallback(
    async (data: ServiceInput): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const { error: insertError } = await supabase
          .from("services")
          .insert([
            {
              name: data.name.trim(),
              type_id: data.type_id,
              reference_amount: data.reference_amount || 0,
              is_active: data.is_active !== false,
            },
          ]);

        if (insertError) throw insertError;

        addToast({
          title: "Servicio creado",
          description: "El servicio se ha creado exitosamente",
          color: "success",
        });
        await fetchServices();

        return true;
      } catch (err: any) {
        console.error("Error creating service:", err);
        setError(err.message || "Error al crear servicio");
        addToast({
          title: "Error",
          description: err.message?.includes("duplicate")
            ? "Ya existe un servicio con ese nombre"
            : "Error al crear servicio",
          color: "danger",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchServices],
  );

  const updateService = useCallback(
    async (id: number, data: ServiceInput): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("services")
          .update({
            name: data.name.trim(),
            type_id: data.type_id,
            reference_amount: data.reference_amount || 0,
            is_active: data.is_active !== false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) throw updateError;

        addToast({
          title: "Servicio actualizado",
          description: "El servicio se ha actualizado exitosamente",
          color: "success",
        });
        await fetchServices();

        return true;
      } catch (err: any) {
        console.error("Error updating service:", err);
        setError(err.message || "Error al actualizar servicio");
        addToast({
          title: "Error",
          description: err.message?.includes("duplicate")
            ? "Ya existe un servicio con ese nombre"
            : "Error al actualizar servicio",
          color: "danger",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchServices],
  );

  const deleteService = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from("services")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        addToast({
          title: "Servicio eliminado",
          description: "El servicio se ha eliminado exitosamente",
          color: "success",
        });
        await fetchServices();

        return true;
      } catch (err: any) {
        console.error("Error deleting service:", err);
        setError(err.message || "Error al eliminar servicio");
        addToast({
          title: "Error",
          description: err.message || "Error al eliminar servicio",
          color: "danger",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchServices],
  );

  const toggleActive = useCallback(
    async (id: number, isActive: boolean): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from("services")
          .update({
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) throw updateError;

        return true;
      } catch (err: any) {
        console.error("Error toggling service status:", err);

        return false;
      }
    },
    [supabase],
  );

  return {
    services,
    isLoading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleActive,
  };
}
