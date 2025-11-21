"use client";
import { useEffect, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface TypeContact {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
}

export type TypeContactInput = Omit<TypeContact, "id" | "created_at">;

export const useTypeContactCRUD = () => {
  const { supabase } = useSupabase();
  const [typesContact, setTypesContact] = useState<TypeContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Leer: Traer todos los tipos de contacto de la tabla
  const fetchTypesContact = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("types_contact")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error al obtener tipos de contacto:", error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar los tipos de contacto",
          color: "danger",
        });
        return;
      }
      setTypesContact(data || []);
    } catch (err) {
      console.error("Error en fetchTypesContact:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Obtener tipo de contacto por ID
  const fetchTypeContactById = async (id: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("types_contact")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener tipo de contacto:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error en fetchTypeContactById:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Crear tipo de contacto
  const createTypeContact = async (newTypeContact: TypeContactInput & { id: number }) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("types_contact")
        .insert([newTypeContact])
        .select();

      if (error) {
        console.error("Error al crear tipo de contacto:", error);
        addToast({
          title: "Error",
          description: "No se pudo crear el tipo de contacto",
          color: "danger",
        });
        return null;
      }

      addToast({
        title: "Tipo de contacto creado",
        description: "El tipo de contacto ha sido creado correctamente",
        color: "success",
      });

      await fetchTypesContact();
      return data;
    } catch (err) {
      console.error("Error en createTypeContact:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar tipo de contacto
  const updateTypeContact = async (
    id: number,
    updatedFields: Partial<TypeContactInput>
  ) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("types_contact")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error al actualizar tipo de contacto:", error);
        addToast({
          title: "Error",
          description: "No se pudo actualizar el tipo de contacto",
          color: "danger",
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("Actualización sin datos retornados");
        throw new Error("No se pudo actualizar el tipo de contacto");
      }

      addToast({
        title: "Tipo de contacto actualizado",
        description: "El tipo de contacto ha sido actualizado correctamente",
        color: "success",
      });

      await fetchTypesContact();
      return data;
    } catch (err) {
      console.error("Error en updateTypeContact:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar tipo de contacto
  const deleteTypeContact = async (id: number) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("types_contact")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar tipo de contacto:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar el tipo de contacto",
          color: "danger",
        });
        throw error;
      }

      addToast({
        title: "Tipo de contacto eliminado",
        description: "El tipo de contacto ha sido eliminado correctamente",
        color: "success",
      });

      await fetchTypesContact();
      return { success: true };
    } catch (err) {
      console.error("Error en deleteTypeContact:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function
  const refreshTypesContact = useCallback(async () => {
    await fetchTypesContact();
  }, [fetchTypesContact]);

  useEffect(() => {
    fetchTypesContact();
  }, []);

  return {
    typesContact,
    isLoading,
    fetchTypesContact,
    refreshTypesContact,
    fetchTypeContactById,
    createTypeContact,
    updateTypeContact,
    deleteTypeContact,
  };
};
