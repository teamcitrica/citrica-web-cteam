"use client";
import { useEffect, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface Company {
  id: number;
  name: string | null;
  description: string | null;
  created_at: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  ruc: string | null;
  country: string | null;
  departament: string | null;
  district: string | null;
  street_or_avenue: string | null;
  address_number: string | null;
  contact_position: string | null;
}

export type CompanyInput = Omit<Company, "id" | "created_at">;

export const useCompanyCRUD = () => {
  const { supabase } = useSupabase();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Leer: Traer todas las empresas de la tabla
  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("company")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener empresas:", error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar las empresas",
          color: "danger",
        });
        return;
      }
      setCompanies(data || []);
    } catch (err) {
      console.error("Error en fetchCompanies:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Obtener empresa por ID
  const fetchCompanyById = async (id: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("company")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener empresa:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error en fetchCompanyById:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Crear empresa
  const createCompany = async (newCompany: CompanyInput) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("company")
        .insert([newCompany])
        .select();

      if (error) {
        console.error("Error al crear empresa:", error);
        addToast({
          title: "Error",
          description: "No se pudo crear la empresa",
          color: "danger",
        });
        return null;
      }

      addToast({
        title: "Empresa creada",
        description: "La empresa ha sido creada correctamente",
        color: "success",
      });

      await fetchCompanies();
      return data;
    } catch (err) {
      console.error("Error en createCompany:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar empresa
  const updateCompany = async (id: number, updatedFields: Partial<CompanyInput>) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("company")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error al actualizar empresa:", error);
        addToast({
          title: "Error",
          description: "No se pudo actualizar la empresa",
          color: "danger",
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("Actualización sin datos retornados");
        throw new Error("No se pudo actualizar la empresa");
      }

      addToast({
        title: "Empresa actualizada",
        description: "La empresa ha sido actualizada correctamente",
        color: "success",
      });

      await fetchCompanies();
      return data;
    } catch (err) {
      console.error("Error en updateCompany:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar empresa
  const deleteCompany = async (id: number) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("company")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar empresa:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar la empresa",
          color: "danger",
        });
        throw error;
      }

      addToast({
        title: "Empresa eliminada",
        description: "La empresa ha sido eliminada correctamente",
        color: "success",
      });

      await fetchCompanies();
      return { success: true };
    } catch (err) {
      console.error("Error en deleteCompany:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function
  const refreshCompanies = useCallback(async () => {
    await fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    isLoading,
    fetchCompanies,
    refreshCompanies,
    fetchCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
