// ModalDeleteUser.tsx
import React from "react";

import { UserType } from "@/shared/types/types";
import Text from "@/shared/components/citrica-ui/atoms/text";
import Icon from "@ui/atoms/icon";

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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-red-500" name="Trash2" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 text-center">
            Confirmar eliminación
          </h2>
        </div>

        <div className="mb-6">
          <Text color="black" variant="body">
            ¿Estás seguro de que deseas eliminar al usuario{" "}
            <span className="font-semibold">{userName}</span>?
          </Text>
          <Text color="black" variant="body">
            El usuario no podrá acceder al sistema.
          </Text>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-[10px] hover:bg-gray-300 transition-colors"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-[10px] hover:bg-red-600 transition-colors"
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteUser;
