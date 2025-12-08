"use client";

import { useUserRole, RoleType } from "@/hooks/role/use-role";

type DeleteRoleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  role: RoleType;
};

const DeleteRoleModal = ({ isOpen, onClose, role }: DeleteRoleModalProps) => {
  const { deleteRole } = useUserRole();

  const handleDelete = async () => {
    try {
      const result = await deleteRole(role.id);

      if (result?.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error inesperado al eliminar el rol:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-md p-6 w-full max-w-md relative">
        {/* Botón para cerrar el modal */}
        <button
          className="absolute top-2 right-2 text-black text-xl font-bold hover:text-gray-600"
          onClick={onClose}
        >
          X
        </button>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-red-600">Eliminar Rol</h2>

          <p className="text-black">
            ¿Estás seguro que deseas eliminar el rol{" "}
            <strong>{role.name}</strong>?
          </p>

          <p className="text-gray-600 text-sm">
            Esta acción no se puede deshacer. Todos los usuarios con este rol
            podrían verse afectados.
          </p>

          <div className="flex gap-3 mt-4">
            <button
              className="flex-1 bg-gray-300 text-black p-2 rounded-md hover:bg-gray-400"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="flex-1 bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
              onClick={handleDelete}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoleModal;
