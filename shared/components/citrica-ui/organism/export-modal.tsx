"use client";
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin/button-citrica-admin";

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
            <ModalHeader className="flex flex-col gap-1 h-[64px] text-[#16305A] bg-white">
              EXPORTAR TABLA
            </ModalHeader>
            <ModalBody className="bg-[#EDF1F7] h-[156px]">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-[#265197] font-bold">
                  Formato seleccionado:{" "}
                  <span className="font-semibold uppercase">{exportFormat}</span>
                </p>
                <div>
                  <InputCitricaAdmin
                    label="Nombre del archivo"
                    placeholder="Ingrese el nombre del archivo"
                    value={fileName}
                    onChange={(e) => onFileNameChange(e.target.value)}
                  />
                  <span className="text-label !text-[12px] text-[#678CC5] bg-[#EDF1F7] block mt-1">
                    El nombre por defecto incluye la fecha actual.
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
