"use client";
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin/button-citrica-admin";
import { Text } from "citrica-ui-toolkit";
import { Divider } from "@heroui/react";

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  exportFormat: string;
  fileName: string;
  onFileNameChange: (value: string) => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  exportFormat,
  fileName,
  onFileNameChange,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} className="w-[360px]">
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1 h-[64px] bg-white">
              <Text variant="subtitle" weight="bold" color="#16305A">EXPORTAR TABLA</Text>
            </ModalHeader>
            <ModalBody className="bg-[#EDF1F7] h-[156px]">
              <div className="flex flex-col gap-4">
                <p>
                  <Text variant="body" weight="bold" color="#265197">Formato seleccionado:{" "}</Text>
                  <Text variant="body" weight="bold" color="#265197" className="!uppercase">{exportFormat}</Text>
                </p>
                <Divider className="bg-[#A7BDE2]"/>
                <div className="mb-4">
                  <InputCitricaAdmin
                    label="Nombre del archivo"
                    placeholder="Ingrese el nombre del archivo"
                    value={fileName}
                    onChange={(e) => onFileNameChange(e.target.value)}
                  />
                  <span className="bg-[#EDF1F7] block">
                    <Text variant="label" color="#678CC5">El nombre por defecto incluye la fecha actual.</Text>
                  </span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="h-[72px] flex justify-center">
              <ButtonCitricaAdmin variant="modalv2" onPress={onCloseModal} isDisabled={isLoading}>
                Cancelar
              </ButtonCitricaAdmin>
              <ButtonCitricaAdmin
                variant="modal"
                className="bg-[#265197]"
                onPress={onConfirm}
                isDisabled={!fileName.trim() || isLoading}
                isLoading={isLoading}
              >
                {isLoading ? "Exportando..." : "Exportar"}
              </ButtonCitricaAdmin>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;
