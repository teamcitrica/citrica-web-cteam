"use client";
import { Divider } from "@heroui/divider";
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Text, Button, Input } from "citrica-ui-toolkit";

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
              <Text isAdmin={true} variant="subtitle" weight="bold" color="#16305A">EXPORTAR TABLA</Text>
            </ModalHeader>
            <ModalBody className="bg-[#EDF1F7] h-[156px]">
              <div className="flex flex-col gap-4">
                <p>
                  <Text isAdmin={true} variant="body" weight="bold" color="#265197">Formato seleccionado:{" "}</Text>
                  <Text isAdmin={true} variant="body" weight="bold" color="#265197" className="!uppercase">{exportFormat}</Text>
                </p>
                <Divider className="bg-[#A7BDE2]"/>
                <div className="mb-4">
                  <Input
                    label="Nombre del archivo"
                    placeholder="Ingrese el nombre del archivo"
                    value={fileName}
                    onChange={(e) => onFileNameChange(e.target.value)}
                    variant="faded"
                    classNames={{
                      inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                      label: "!text-[#265197]",
                      input: "placeholder:text-[#A7BDE2] !text-[#265197]",
                      description: "!text-xs !text-[#678CC5]"
                    }}
                    //description="El nombre por defecto incluye la fecha actual."
                  />
                  <span className="bg-[#EDF1F7] block">
                    <Text isAdmin={true} variant="label" color="#678CC5">El nombre por defecto incluye la fecha actual.</Text>
                  </span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="h-[72px] flex justify-center">
              <Button isAdmin variant="secondary" onPress={onCloseModal} isDisabled={isLoading}>
                Cancelar
              </Button>
              <Button
                isAdmin
                variant="primary"
                className="bg-[#265197]"
                onPress={onConfirm}
                isDisabled={!fileName.trim() || isLoading}
                isLoading={isLoading}
              >
                {isLoading ? "Exportando..." : "Exportar"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;
