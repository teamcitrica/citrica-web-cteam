// ModalDeleteUser.tsx
import React from "react";
import { UserType } from "@/shared/types/types";
import Text from "@/shared/components/citrica-ui/atoms/text";
import Icon from "@ui/atoms/icon";
import { Button, Divider } from "@heroui/react";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";

interface ModalDeleteUserProps {
  user: UserType | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ModalDeleteUser: React.FC<ModalDeleteUserProps> = ({
  user,
  onConfirm,
  onCancel,
}) => {
  if (!user) return null;

  const userName =
    user.full_name ||
    user.name ||
    `${user.first_name} ${user.last_name}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-[20px] shadow-md w-96">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <Icon size={28} className=" text-red-500" name="TriangleAlert" />
          </div>
          <h2 className="text-center">
            <Text variant="title" color="#F04242" weight="bold">¿Quieres eliminar este elemento?</Text>
          </h2>
        </div>

        <div className="mb-6 text-center">
          <Text variant="body" color="#16305A">
            ¿Estás seguro de que deseas eliminar al usuario{" "}
            <span className="font-semibold">{userName}</span>?
          </Text>
          <p className="pt-2">
            <Text variant="label" color="#16305A">
              El usuario no podrá acceder al sistema.
            </Text>
          </p>
        </div>

        <Divider className="bg-[#A7BDE2] mb-4" />

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
            onPress={onCancel}
          >
            Eliminar
          </ButtonCitricaAdmin>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteUser;
