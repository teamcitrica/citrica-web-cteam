// UserDetailModal.tsx
import React from "react";

import { UserType } from "@/shared/types/types";
import Text from "@/shared/components/citrica-ui/atoms/text";

interface UserDetailModalProps {
  user: UserType | null;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-[20px] shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-stone-800">
          Detalle del Usuario
        </h2>
        <p>
          <Text color="black" variant="body">
            Primer Nombre:{" "}
          </Text>
          <Text color="blue" variant="label">
            {user.first_name}
          </Text>
        </p>
        <p>
          <Text color="black" variant="body">
            Apellido:{" "}
          </Text>
          <Text color="blue" variant="label">
            {user.last_name}
          </Text>
        </p>
        <p>
          <Text color="black" variant="body">
            Email:{" "}
          </Text>
          <Text color="blue" variant="label">
            {user.email}
          </Text>
        </p>
        <p>
          <Text color="black" variant="body">
            Rol:{" "}
          </Text>
          <Text color="blue" variant="label">
            {user.role?.name}
          </Text>
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-[20px] hover:bg-blue-600"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default UserDetailModal;
