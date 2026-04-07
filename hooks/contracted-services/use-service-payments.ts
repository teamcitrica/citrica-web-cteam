"use client";

import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

import type { Recurrence } from "@/app/admin/gestion-servicios/servicios-contratados/types";

export interface ServicePayment {
  id: number;
  contracted_service_id: number;
  period_number: number;
  due_date: string;
  payment_date: string | null;
  amount: number;
  status: "pagado" | "pendiente";
  created_at: string;
  updated_at: string;
}

const RECURRENCE_MONTHS: Record<Recurrence, number> = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

export function useServicePayments() {
  const { supabase } = useSupabase();
  const [payments, setPayments] = useState<ServicePayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPayments = useCallback(
    async (contractedServiceId: number) => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("service_payments")
          .select("*")
          .eq("contracted_service_id", contractedServiceId)
          .order("period_number", { ascending: true });

        if (error) throw error;

        setPayments(data || []);
      } catch (err: any) {
        console.error("Error fetching payments:", err);
        addToast({
          title: "Error",
          description: "Error al cargar historial de pagos",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const updateContractedServiceStatus = useCallback(
    async (contractedServiceId: number) => {
      try {
        const { data: allPayments, error: fetchError } = await supabase
          .from("service_payments")
          .select("due_date, status")
          .eq("contracted_service_id", contractedServiceId);

        if (fetchError) throw fetchError;

        const today = new Date().toISOString().split("T")[0];
        const hasOverdue = (allPayments || []).some(
          (p) => p.due_date <= today && p.status === "pendiente",
        );

        const newStatus = hasOverdue ? "pendiente_pago" : "al_dia";

        const { error: updateError } = await supabase
          .from("contracted_services")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contractedServiceId);

        if (updateError) throw updateError;
      } catch (err: any) {
        console.error("Error updating contracted service status:", err);
      }
    },
    [supabase],
  );

  const markAsPaid = useCallback(
    async (
      paymentId: number,
      paymentDate: string,
      contractedServiceId: number,
    ): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("service_payments")
          .update({
            status: "pagado",
            payment_date: paymentDate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentId);

        if (error) throw error;

        addToast({
          title: "Pago registrado",
          description: "El pago se ha marcado como pagado",
          color: "success",
        });

        await updateContractedServiceStatus(contractedServiceId);
        await fetchPayments(contractedServiceId);

        return true;
      } catch (err: any) {
        console.error("Error marking payment as paid:", err);
        addToast({
          title: "Error",
          description: "Error al registrar pago",
          color: "danger",
        });

        return false;
      }
    },
    [supabase, fetchPayments, updateContractedServiceStatus],
  );

  const markAsPending = useCallback(
    async (
      paymentId: number,
      contractedServiceId: number,
    ): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("service_payments")
          .update({
            status: "pendiente",
            payment_date: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentId);

        if (error) throw error;

        addToast({
          title: "Pago revertido",
          description: "El pago se ha marcado como pendiente",
          color: "warning",
        });

        await updateContractedServiceStatus(contractedServiceId);
        await fetchPayments(contractedServiceId);

        return true;
      } catch (err: any) {
        console.error("Error reverting payment:", err);
        addToast({
          title: "Error",
          description: "Error al revertir pago",
          color: "danger",
        });

        return false;
      }
    },
    [supabase, fetchPayments, updateContractedServiceStatus],
  );

  const generatePayments = useCallback(
    async (
      contractedServiceId: number,
      startDate: string,
      recurrence: Recurrence,
      periods: number,
      amount: number,
      isIndefinite: boolean = false,
    ): Promise<boolean> => {
      try {
        const monthsPerPeriod = RECURRENCE_MONTHS[recurrence];
        const effectivePeriods = isIndefinite ? 12 : periods;
        const paymentsToInsert = [];

        for (let i = 0; i < effectivePeriods; i++) {
          const dueDate = new Date(startDate + "T00:00:00");

          dueDate.setMonth(dueDate.getMonth() + monthsPerPeriod * i);

          paymentsToInsert.push({
            contracted_service_id: contractedServiceId,
            period_number: i + 1,
            due_date: dueDate.toISOString().split("T")[0],
            amount,
            status: "pendiente",
          });
        }

        const { error } = await supabase
          .from("service_payments")
          .insert(paymentsToInsert);

        if (error) throw error;

        return true;
      } catch (err: any) {
        console.error("Error generating payments:", err);
        addToast({
          title: "Error",
          description: "Error al generar periodos de pago",
          color: "danger",
        });

        return false;
      }
    },
    [supabase],
  );

  const regeneratePayments = useCallback(
    async (
      contractedServiceId: number,
      startDate: string,
      recurrence: Recurrence,
      periods: number,
      amount: number,
      isIndefinite: boolean = false,
    ): Promise<boolean> => {
      try {
        // Verificar si hay pagos pagados
        const { data: paidPayments, error: checkError } = await supabase
          .from("service_payments")
          .select("id")
          .eq("contracted_service_id", contractedServiceId)
          .eq("status", "pagado")
          .limit(1);

        if (checkError) throw checkError;

        if (paidPayments && paidPayments.length > 0) {
          addToast({
            title: "No se puede modificar",
            description:
              "Hay pagos registrados. Elimina el servicio y crea uno nuevo o revierte el pago antes de cambiar la fecha de inicio, recurrencia o cantidad de periodos.",
            color: "warning",
          });

          return false;
        }

        // Eliminar pagos existentes
        const { error: deleteError } = await supabase
          .from("service_payments")
          .delete()
          .eq("contracted_service_id", contractedServiceId);

        if (deleteError) throw deleteError;

        // Generar nuevos pagos
        await generatePayments(
          contractedServiceId,
          startDate,
          recurrence,
          periods,
          amount,
          isIndefinite,
        );

        return true;
      } catch (err: any) {
        console.error("Error regenerating payments:", err);
        addToast({
          title: "Error",
          description: "Error al regenerar periodos de pago",
          color: "danger",
        });

        return false;
      }
    },
    [supabase, generatePayments],
  );

  return {
    payments,
    isLoading,
    fetchPayments,
    markAsPaid,
    markAsPending,
    generatePayments,
    regeneratePayments,
  };
}
