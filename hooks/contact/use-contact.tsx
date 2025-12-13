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
  user_id: string | null;
  type_id: number | null;
  code: string | null;
  email_access: string | null;
  last_name: string | null;
  types_contact?: {
    id: number;
    name: string;
    description: string | null;
  };
}

export type ContactInput = Omit<Contact, "id" | "types_contact" | "tipo">;

export const useContactCRUD = () => {
  const { supabase } = useSupabase();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Leer: Traer todos los contactos de la tabla
  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("contact")
        .select(`
          *,
          types_contact (
            id,
            name,
            description
          )
        `)
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
        .from("contact")
        .select(`
          *,
          types_contact (
            id,
            name,
            description
          )
        `)
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
        .from("contact")
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
        .from("contact")
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
        .from("contact")
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

  // Activar acceso al sistema para un contacto
  const activateContactAccess = async (contactId: string, userData?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    role_id?: number;
    avatar_url?: string;
  }) => {
    try {
      setIsLoading(true);

      console.log('📤 Enviando solicitud para activar acceso:', {
        contact_id: contactId,
        user_data: userData,
      });

      const response = await fetch('/api/admin/activate-contact-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contactId,
          user_data: userData,
        }),
      });

      const result = await response.json();

      console.log('📥 Respuesta del servidor:', {
        status: response.status,
        ok: response.ok,
        result,
      });

      if (!response.ok) {
        console.error('❌ Error en la respuesta:', result);
        throw new Error(result.error || 'Error al activar acceso');
      }

      addToast({
        title: "Acceso activado",
        description: `Contraseña temporal: ${result.temporary_password}`,
        color: "success",
        timeout: 10000, // 10 segundos para que tengan tiempo de copiar la contraseña
      });

      await fetchContacts();

      return {
        success: true,
        temporaryPassword: result.temporary_password,
      };
    } catch (err: any) {
      console.error("❌ Error completo al activar acceso:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);

      addToast({
        title: "Error al activar acceso",
        description: err.message || "No se pudo activar el acceso",
        color: "danger",
        timeout: 8000,
      });
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Desactivar acceso al sistema para un contacto
  const deactivateContactAccess = async (contactId: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/admin/activate-contact-access', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact_id: contactId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al desactivar acceso');
      }

      addToast({
        title: "Acceso desactivado",
        description: "El contacto ya no puede acceder al sistema",
        color: "success",
      });

      await fetchContacts();

      return { success: true };
    } catch (err: any) {
      console.error("Error al desactivar acceso:", err);
      addToast({
        title: "Error",
        description: err.message || "No se pudo desactivar el acceso",
        color: "danger",
      });
      return { success: false, error: err.message };
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
  }, [fetchContacts]);

  return {
    contacts,
    isLoading,
    fetchContacts,
    refreshContacts,
    fetchContactById,
    createContact,
    updateContact,
    deleteContact,
    activateContactAccess,
    deactivateContactAccess,
  };
};
