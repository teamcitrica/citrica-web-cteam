"use client";
import { useEffect, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface Contact {
  id: string;
  company_id: number | null;
  cargo: string | null;
  tipo: string | null;
  email: string | null;
  address: string | null;
  phone: string | null;
  name: string | null;
}

export type ContactInput = Omit<Contact, "id">;

export const useContactCRUD = () => {
  const { supabase } = useSupabase();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Leer: Traer todos los contactos de la tabla
  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("contact_clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error al obtener contactos:", error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar los contactos",
          color: "danger",
        });
        return;
      }
      setContacts(data || []);
    } catch (err) {
      console.error("Error en fetchContacts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Obtener contacto por ID
  const fetchContactById = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("contact_clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener contacto:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error en fetchContactById:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Crear contacto
  const createContact = async (newContact: ContactInput) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("contact_clients")
        .insert([newContact])
        .select();

      if (error) {
        console.error("Error al crear contacto:", error);
        addToast({
          title: "Error",
          description: "No se pudo crear el contacto",
          color: "danger",
        });
        return null;
      }

      addToast({
        title: "Contacto creado",
        description: "El contacto ha sido creado correctamente",
        color: "success",
      });

      await fetchContacts();
      return data;
    } catch (err) {
      console.error("Error en createContact:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar contacto
  const updateContact = async (id: string, updatedFields: Partial<ContactInput>) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("contact_clients")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error al actualizar contacto:", error);
        addToast({
          title: "Error",
          description: "No se pudo actualizar el contacto",
          color: "danger",
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("Actualización sin datos retornados");
        throw new Error("No se pudo actualizar el contacto");
      }

      addToast({
        title: "Contacto actualizado",
        description: "El contacto ha sido actualizado correctamente",
        color: "success",
      });

      await fetchContacts();
      return data;
    } catch (err) {
      console.error("Error en updateContact:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar contacto
  const deleteContact = async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("contact_clients")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar contacto:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar el contacto",
          color: "danger",
        });
        throw error;
      }

      addToast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente",
        color: "success",
      });

      await fetchContacts();
      return { success: true };
    } catch (err) {
      console.error("Error en deleteContact:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function
  const refreshContacts = useCallback(async () => {
    await fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    isLoading,
    fetchContacts,
    refreshContacts,
    fetchContactById,
    createContact,
    updateContact,
    deleteContact,
  };
};
