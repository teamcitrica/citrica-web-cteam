"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { Contact } from "@/hooks/contact/use-contact";

interface RevokeAccessModalProps {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RevokeAccessModal({
  isOpen,
  contact,
  onClose,
  onSuccess,
}: RevokeAccessModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!contact.user_id) {
      addToast({
        title: "Error",
        description: "Este contacto no tiene acceso al sistema",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Llamar al endpoint DELETE para desactivar acceso
      const response = await fetch('/api/admin/activate-contact-access', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contact.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error en la respuesta:', result);
        throw new Error(result.error || 'Error al desactivar acceso');
      }

      // Éxito - mostrar mensaje
      addToast({
        title: "Acceso desactivado",
        description: "El acceso al sistema ha sido revocado correctamente",
        color: "success",
        timeout: 5000,
      });

      // Refrescar la lista de contactos y cerrar el modal
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error al desactivar acceso:", error);
      addToast({
        title: "Error al desactivar acceso",
        description: error.message || "No se pudo desactivar el acceso",
        color: "danger",
        timeout: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Quitar Acceso al Sistema
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Estás seguro de que deseas quitar el acceso al sistema para <strong>{contact.name}</strong>?
            </p>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Nota:</strong> El usuario será desactivado pero no se eliminará. Podrás reactivar su acceso posteriormente.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-600">Nombre:</span>
                <p className="text-sm text-gray-800">{contact.name || "-"}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">Email:</span>
                <p className="text-sm text-gray-800">{contact.email || "-"}</p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-warning text-white"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Quitar Acceso
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
