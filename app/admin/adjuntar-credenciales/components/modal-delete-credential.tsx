"use client";

import { useCredentials, CredentialType } from "@/hooks/use-credentials";
import { Button } from "citrica-ui-toolkit";

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
        <Button
          isAdmin
          variant="flat"
          className="absolute top-2 right-2 text-black text-xl font-bold hover:text-gray-600 min-w-0 w-auto h-auto p-1"
          onPress={onClose}
        >
          X
        </Button>
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
            <Button
              isAdmin
              variant="secondary"
              className="flex-1"
              onPress={onClose}
            >
              Cancelar
            </Button>
            <Button
              isAdmin
              variant="primary"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onPress={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCredentialModal;
