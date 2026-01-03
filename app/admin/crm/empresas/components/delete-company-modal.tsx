"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from "@heroui/react";

import { Company } from "@/hooks/companies/use-companies";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import { Icon, Text } from "@/shared/components/citrica-ui";

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
        <ModalHeader className="flex flex-col gap-1 mt-4">
          <div className="flex items-center justify-center mb-2">
            <Icon size={28} className=" text-red-500" name="TriangleAlert" />
          </div>
          <h2 className="text-center">
            <Text variant="title" color="#F04242" weight="bold">Confirmar Eliminación</Text>
          </h2>
        </ModalHeader>
        <ModalBody>
          <p>
            <Text variant="body" color="#16305A">¿Está seguro que desea eliminar la empresa{" "}
            <strong>{company.name}</strong>?</Text>
          </p>
          <p className="mb-2">
            <Text variant="label" color="#16305A">Esta acción no se puede deshacer.</Text>
          </p>  
          <Divider className="bg-[#A7BDE2]" />
        </ModalBody>
        <ModalFooter>
        <div className="flex gap-3 justify-end">
          <ButtonCitricaAdmin
            variant="modalv2"
            className="w-[162px]"
            onPress={onCancel}
          >
            Cancelar
          </ButtonCitricaAdmin>
          <ButtonCitricaAdmin
            variant="primary"
            className="bg-[#F04242] w-[162px] !border-0"
            onPress={onConfirm}
          >
            Eliminar
          </ButtonCitricaAdmin>
        </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
