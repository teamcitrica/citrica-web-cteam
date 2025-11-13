"use client";

import { useCredentials, CredentialType } from "@/hooks/use-credentials";

type DeleteCredentialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  credential: CredentialType;
};

const DeleteCredentialModal = ({
  isOpen,
  onClose,
  credential,
}: DeleteCredentialModalProps) => {
  const { deleteCredential } = useCredentials();

  const handleDelete = async () => {
    try {
      const result = await deleteCredential(credential.id);

      if (result?.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error inesperado al eliminar la credencial:", error);
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
          <h2 className="text-xl font-bold text-red-600">
            Eliminar Credencial
          </h2>

          <p className="text-black">
            ¿Estás seguro que deseas eliminar las credenciales del rol{" "}
            <strong>{credential.role?.name || "N/A"}</strong>?
          </p>

          <div className="bg-gray-100 p-3 rounded-md text-sm text-black">
            <p>
              <strong>URL:</strong> {credential.supabase_url}
            </p>
            <p className="mt-1">
              <strong>Tabla:</strong> {credential.table_name}
            </p>
          </div>

          <p className="text-gray-600 text-sm">
            Esta acción no se puede deshacer. Las credenciales se eliminarán
            permanentemente.
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

export default DeleteCredentialModal;
