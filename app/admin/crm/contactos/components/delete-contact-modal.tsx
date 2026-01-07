"use client";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Divider } from "@heroui/divider";
import { Contact } from "@/hooks/contact/use-contact";
import { Icon } from "@/shared/components/citrica-ui";
import { Text, Button } from "citrica-ui-toolkit";

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
        <ModalHeader className="flex flex-col gap-1 mt-4">
          <div className="flex items-center justify-center mb-2">
            <Icon size={28} className=" text-red-500" name="TriangleAlert" />
          </div>
          <h2 className="text-center">
            <Text variant="title" color="#F04242" weight="bold">Eliminar Contacto</Text>
          </h2>
        </ModalHeader>
        <ModalBody>
          <p>
            <Text variant="body" color="#16305A">¿Estás seguro de que deseas eliminar el contacto{" "}
            <span className="font-semibold">{contact.name || "este contacto"}</span>?</Text>
          </p>
          <p className="mb-2">
            <Text variant="label" color="#16305A">Esta acción no se puede deshacer.</Text>
          </p>
        <Divider className="bg-[#A7BDE2]" />
        </ModalBody>
        <ModalFooter>
        <div className="flex gap-3 justify-end">
          <Button
            isAdmin
            variant="secondary"
            className="w-[162px]"
            onPress={onCancel}
          >
            Cancelar
          </Button>
          <Button
            isAdmin
            variant="primary"
            className="bg-[#F04242] w-[162px] !border-0"
            onPress={onConfirm}
          >
            Eliminar
          </Button>
        </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
