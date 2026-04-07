"use client";

import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

import type { Recurrence, PaymentStatus } from "@/app/admin/gestion-servicios/servicios-contratados/types";

export type { Recurrence, PaymentStatus };

export interface ContractedService {
  id: number;
  contact_id: string;
  company_id: number;
  service_name: string;
  service_type_name: string;
  amount: number;
  start_date: string;
  end_date: string | null;
  recurrence: Recurrence;
  periods: number;
  is_indefinite: boolean;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  contact?: {
    id: string;
    name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  };
  company?: {
    id: number;
    name: string | null;
  };
}

export interface ContractedServiceInput {
  contact_id: string;
  company_id: number;
  service_name: string;
  service_type_name: string;
  amount: number;
  start_date: string;
  end_date: string | null;
  recurrence: Recurrence;
  periods: number;
  is_indefinite: boolean;
  status: PaymentStatus;
}

export function useContractedServices() {
  const { supabase } = useSupabase();
  const [contractedServices, setContractedServices] = useState<ContractedService[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContractedServices = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("contracted_services")
        .select(`
          *,
          contact:contact(id, name, last_name, email, phone),
          company:company(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setContractedServices(data || []);
    } catch (err: any) {
      console.error("Error fetching contracted services:", err);
      addToast({
        title: "Error",
        description: "Error al cargar servicios contratados",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const createContractedService = useCallback(
    async (data: ContractedServiceInput): Promise<number | null> => {
      try {
        setIsLoading(true);

        const { data: inserted, error } = await supabase
          .from("contracted_services")
          .insert([{
            contact_id: data.contact_id,
            company_id: data.company_id,
            service_name: data.service_name,
            service_type_name: data.service_type_name,
            amount: data.amount,
            start_date: data.start_date,
            end_date: data.end_date,
            recurrence: data.recurrence,
            periods: data.periods,
            is_indefinite: data.is_indefinite,
            status: data.status,
          }])
          .select("id")
          .single();

        if (error) throw error;

        addToast({
          title: "Servicio contratado creado",
          description: "El registro se ha creado exitosamente",
          color: "success",
        });
        await fetchContractedServices();

        return inserted?.id || null;
      } catch (err: any) {
        console.error("Error creating contracted service:", err);
        addToast({
          title: "Error",
          description: "Error al crear servicio contratado",
          color: "danger",
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchContractedServices],
  );

  const updateContractedService = useCallback(
    async (id: number, data: ContractedServiceInput): Promise<boolean> => {
      try {
        setIsLoading(true);

        const { error } = await supabase
          .from("contracted_services")
          .update({
            contact_id: data.contact_id,
            company_id: data.company_id,
            service_name: data.service_name,
            service_type_name: data.service_type_name,
            amount: data.amount,
            start_date: data.start_date,
            end_date: data.end_date,
            recurrence: data.recurrence,
            periods: data.periods,
            is_indefinite: data.is_indefinite,
            status: data.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        addToast({
          title: "Servicio contratado actualizado",
          description: "El registro se ha actualizado exitosamente",
          color: "success",
        });
        await fetchContractedServices();

        return true;
      } catch (err: any) {
        console.error("Error updating contracted service:", err);
        addToast({
          title: "Error",
          description: "Error al actualizar servicio contratado",
          color: "danger",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchContractedServices],
  );

  const deleteContractedService = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setIsLoading(true);

        const { error } = await supabase
          .from("contracted_services")
          .delete()
          .eq("id", id);

        if (error) throw error;

        addToast({
          title: "Servicio contratado eliminado",
          description: "El registro se ha eliminado exitosamente",
          color: "success",
        });
        await fetchContractedServices();

        return true;
      } catch (err: any) {
        console.error("Error deleting contracted service:", err);
        addToast({
          title: "Error",
          description: "Error al eliminar servicio contratado",
          color: "danger",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchContractedServices],
  );

  return {
    contractedServices,
    isLoading,
    fetchContractedServices,
    createContractedService,
    updateContractedService,
    deleteContractedService,
  };
}
