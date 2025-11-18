"use client";
import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";
import { Contact } from "@/hooks/contacts/use-contacts";

export interface ProjectContact {
  id: string;
  project_id: string;
  contact_id: string;
  created_at: string;
}

export interface ProjectContactWithDetails extends ProjectContact {
  contact_clients: Contact;
}

export const useProjectContacts = () => {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  // Obtener todos los contactos de un proyecto específico
  const getProjectContacts = useCallback(
    async (projectId: string): Promise<Contact[]> => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("project_contacts")
          .select(`
            contact_id,
            contact_clients (
              id,
              name,
              cargo,
              tipo,
              email,
              address,
              phone,
              company_id
            )
          `)
          .eq("project_id", projectId);

        if (error) {
          console.error("Error al obtener contactos del proyecto:", error);
          return [];
        }

        // Extraer solo los datos de contact_clients
        const contacts = data
          .map((item: any) => item.contact_clients)
          .filter(Boolean);

        return contacts as Contact[];
      } catch (err) {
        console.error("Error en getProjectContacts:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  // Agregar un contacto a un proyecto
  const addContactToProject = async (
    projectId: string,
    contactId: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("project_contacts")
        .insert([{ project_id: projectId, contact_id: contactId }]);

      if (error) {
        // Verificar si es un error de duplicado
        if (error.code === "23505") {
          addToast({
            title: "Aviso",
            description: "Este contacto ya está asociado al proyecto",
            color: "warning",
          });
          return false;
        }

        console.error("Error al agregar contacto al proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudo agregar el contacto al proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Contacto agregado",
        description: "El contacto ha sido asociado al proyecto correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en addContactToProject:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un contacto de un proyecto
  const removeContactFromProject = async (
    projectId: string,
    contactId: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("project_contacts")
        .delete()
        .eq("project_id", projectId)
        .eq("contact_id", contactId);

      if (error) {
        console.error("Error al eliminar contacto del proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar el contacto del proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Contacto eliminado",
        description: "El contacto ha sido removido del proyecto correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en removeContactFromProject:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar múltiples contactos a un proyecto
  const addMultipleContactsToProject = async (
    projectId: string,
    contactIds: string[]
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const insertData = contactIds.map((contactId) => ({
        project_id: projectId,
        contact_id: contactId,
      }));

      const { error } = await supabase
        .from("project_contacts")
        .insert(insertData);

      if (error) {
        console.error("Error al agregar contactos al proyecto:", error);
        addToast({
          title: "Error",
          description: "No se pudieron agregar los contactos al proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Contactos agregados",
        description: "Los contactos han sido asociados al proyecto correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en addMultipleContactsToProject:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar contactos de un proyecto (elimina los que no están en la lista y agrega los nuevos)
  const syncProjectContacts = async (
    projectId: string,
    contactIds: string[]
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Primero eliminamos todas las relaciones existentes
      const { error: deleteError } = await supabase
        .from("project_contacts")
        .delete()
        .eq("project_id", projectId);

      if (deleteError) {
        console.error("Error al eliminar contactos previos:", deleteError);
        return false;
      }

      // Si no hay contactos nuevos, terminamos aquí
      if (contactIds.length === 0) {
        addToast({
          title: "Contactos actualizados",
          description: "Se han actualizado los contactos del proyecto",
          color: "success",
        });
        return true;
      }

      // Agregamos los nuevos contactos
      const insertData = contactIds.map((contactId) => ({
        project_id: projectId,
        contact_id: contactId,
      }));

      const { error: insertError } = await supabase
        .from("project_contacts")
        .insert(insertData);

      if (insertError) {
        console.error("Error al agregar nuevos contactos:", insertError);
        addToast({
          title: "Error",
          description: "No se pudieron actualizar los contactos del proyecto",
          color: "danger",
        });
        return false;
      }

      addToast({
        title: "Contactos actualizados",
        description: "Los contactos del proyecto han sido actualizados correctamente",
        color: "success",
      });

      return true;
    } catch (err) {
      console.error("Error en syncProjectContacts:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getProjectContacts,
    addContactToProject,
    removeContactFromProject,
    addMultipleContactsToProject,
    syncProjectContacts,
  };
};
