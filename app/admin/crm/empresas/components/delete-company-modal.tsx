"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Company } from "@/hooks/companies/use-companies";

interface DeleteCompanyModalProps {
  company: Company;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteCompanyModal({
  company,
  onConfirm,
  onCancel,
}: DeleteCompanyModalProps) {
  return (
    <Modal isOpen={true} onClose={onCancel} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Confirmar Eliminación
          </h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-700">
            ¿Está seguro que desea eliminar la empresa{" "}
            <strong>{company.name}</strong>? Esta acción no se puede deshacer.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onCancel}>
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
