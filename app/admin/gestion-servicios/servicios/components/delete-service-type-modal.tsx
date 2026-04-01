"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Divider } from "@heroui/divider";

import { Text, Button, Icon } from "citrica-ui-toolkit";

import type { ServiceType } from "@/hooks/services/use-service-types";

interface DeleteServiceTypeModalProps {
  serviceType: ServiceType;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteServiceTypeModal({
  serviceType,
  onConfirm,
  onCancel,
}: DeleteServiceTypeModalProps) {
  return (
    <Modal isOpen={true} size="md" onClose={onCancel}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 mt-4">
          <div className="flex items-center justify-center mb-2">
            <Icon color="#F04242" name="TriangleAlert" size={28} />
          </div>
          <Text as="h2" className="text-center" color="#F04242" variant="title" weight="bold">
            Eliminar Tipo de Servicio
          </Text>
        </ModalHeader>
        <ModalBody>
          <Text as="p" color="#1F1F1F" variant="body">
            ¿Estás seguro de que deseas eliminar el tipo{" "}
            <span className="font-semibold">{serviceType.name}</span>?
          </Text>
          <Text as="p" className="mb-2" color="#1F1F1F" variant="label">
            Si hay servicios con este tipo, no se podrá eliminar.
          </Text>
          <Divider className="bg-[#94A3B8]" />
        </ModalBody>
        <ModalFooter>
          <div className="flex gap-3 justify-end">
            <Button
              isAdmin
              className="w-[162px]"
              variant="secondary"
              onPress={onCancel}
            >
              Cancelar
            </Button>
            <Button
              isAdmin
              className="bg-[#F04242] w-[162px] !border-0"
              variant="primary"
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
