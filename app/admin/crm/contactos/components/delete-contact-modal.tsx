"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Contact } from "@/hooks/contacts-clients/use-contacts-clients";

interface DeleteContactModalProps {
  contact: Contact;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteContactModal({
  contact,
  onConfirm,
  onCancel,
}: DeleteContactModalProps) {
  return (
    <Modal isOpen={true} onClose={onCancel} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Eliminar Contacto
          </h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar el contacto{" "}
            <span className="font-semibold">{contact.name || "este contacto"}</span>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onCancel}>
            Cancelar
          </Button>
          <Button color="danger" onPress={onConfirm}>
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
