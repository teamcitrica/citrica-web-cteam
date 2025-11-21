"use client";
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  exportFormat: string;
  fileName: string;
  onFileNameChange: (value: string) => void;
  onConfirm: () => void;
};

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  exportFormat,
  fileName,
  onFileNameChange,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Exportar tabla
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-600">
                  Formato seleccionado:{" "}
                  <span className="font-semibold uppercase">{exportFormat}</span>
                </p>
                <Input
                  label="Nombre del archivo"
                  placeholder="Ingrese el nombre del archivo"
                  value={fileName}
                  onChange={(e) => onFileNameChange(e.target.value)}
                  description="El nombre por defecto incluye la fecha actual"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCloseModal}>
                Cancelar
              </Button>
              <Button
                className="bg-[#5EA667] text-white"
                onPress={onConfirm}
                isDisabled={!fileName.trim()}
              >
                Exportar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;
