"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
} from "@heroui/react";

import { Asset } from "@/hooks/assets/use-assets";
import { Icon } from "@/shared/components/citrica-ui";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import { Text } from "citrica-ui-toolkit";

interface DeleteAssetModalProps {
  asset: Asset;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteAssetModal({
  asset,
  onConfirm,
  onCancel,
}: DeleteAssetModalProps) {
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
            <Text variant="body" color="#16305A">¿Está seguro de que desea eliminar el asset{" "}
              <span className="font-semibold">{asset.name || "Sin nombre"}</span>?</Text>
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
