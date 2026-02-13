// ModalDeleteUser.tsx
import { Modal, ModalContent } from "@heroui/modal";
import { Divider } from "@heroui/divider";
import React from "react";
import { UserType } from "@/shared/types/types";
import { Text, Button, Icon } from "citrica-ui-toolkit";

interface ModalDeleteUserProps {
  user: UserType | null;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ModalDeleteUser: React.FC<ModalDeleteUserProps> = ({
  user,
  onConfirm,
  onCancel,
  isOpen,
}) => {
  if (!user) return null;

  const userName =
    user.full_name ||
    user.name ||
    `${user.first_name} ${user.last_name}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="md"
      classNames={{
        base: "bg-white rounded-[20px]",
        backdrop: "bg-black/50"
      }}
    >
      <ModalContent>
        <div className="p-6">
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <Icon size={28} className=" text-red-500" name="TriangleAlert" />
            </div>
            <h2 className="text-center">
              <Text isAdmin={true} variant="title" color="#F04242" weight="bold">¿Quieres eliminar este elemento?</Text>
            </h2>
          </div>

          <div className="mb-6 text-center">
            <Text variant="body" color="#16305A">
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <span className="font-semibold">{userName}</span>?
            </Text>
            <p className="pt-2">
              <Text isAdmin={true} variant="label" color="#16305A">
                El usuario no podrá acceder al sistema.
              </Text>
            </p>
          </div>

          <Divider className="bg-[#A7BDE2] mb-4" />

          <div className="flex gap-3 justify-end">
            <Button
              isAdmin={true}
              variant="secondary"
              className="w-[162px]"
              onPress={onCancel}
            >
              Cancelar
            </Button>
            <Button
              isAdmin={true}
              variant="primary"
              className="bg-[#F04242] w-[162px] !border-0"
              onPress={onConfirm}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ModalDeleteUser;
