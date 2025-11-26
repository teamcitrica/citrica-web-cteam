"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Asset } from "@/hooks/assets/use-assets";

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
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Confirmar Eliminación
          </h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-700">
            ¿Está seguro de que desea eliminar el asset{" "}
            <span className="font-semibold">{asset.name || "Sin nombre"}</span>?
          </p>
          <p className="text-gray-600 text-sm mt-2">
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
