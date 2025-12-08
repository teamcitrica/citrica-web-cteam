"use client";

import { CredentialType } from "@/hooks/use-credentials";
import { useState } from "react";
import { Eye, EyeOff, Copy } from "lucide-react";
import { addToast } from "@heroui/toast";

type ViewCredentialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  credential: CredentialType;
};

const ViewCredentialModal = ({
  isOpen,
  onClose,
  credential,
}: ViewCredentialModalProps) => {
  const [showKey, setShowKey] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(credential.supabase_url);
    addToast({
      title: "Copiado",
      description: "URL copiada al portapapeles",
      color: "success",
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(credential.supabase_anon_key);
    addToast({
      title: "Copiado",
      description: "Clave copiada al portapapeles",
      color: "success",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-md p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Botón para cerrar el modal */}
        <button
          className="absolute top-2 right-2 text-black text-xl"
          onClick={onClose}
        >
          X
        </button>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-black">Detalles de Credencial</h2>

          {/* ID */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">ID</label>
            <div className="p-3 bg-gray-100 rounded-md text-black">
              {credential.id}
            </div>
          </div>

          {/* Rol */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Rol</label>
            <div className="p-3 bg-gray-100 rounded-md text-black">
              {credential.role?.name || "N/A"} (ID: {credential.role_id})
            </div>
          </div>

          {/* Descripción del rol */}
          {credential.role?.description && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Descripción del Rol
              </label>
              <div className="p-3 bg-gray-100 rounded-md text-black">
                {credential.role.description}
              </div>
            </div>
          )}

          {/* Supabase URL */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Supabase URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-gray-100 rounded-md text-black break-all">
                {credential.supabase_url}
              </div>
              <button
                onClick={handleCopyUrl}
                className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                title="Copiar URL"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          {/* Supabase Anon Key */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Supabase Anon Key
            </label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-gray-100 rounded-md text-black break-all font-mono text-sm">
                {showKey
                  ? credential.supabase_anon_key
                  : "•".repeat(credential.supabase_anon_key.length)}
              </div>
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                title={showKey ? "Ocultar clave" : "Mostrar clave"}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button
                onClick={handleCopyKey}
                className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                title="Copiar clave"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          {/* Nombre de la tabla */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Nombre de la Tabla
            </label>
            <div className="p-3 bg-gray-100 rounded-md text-black font-mono">
              {credential.table_name}
            </div>
          </div>

          {/* Fecha de creación */}
          {credential.created_at && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Fecha de Creación
              </label>
              <div className="p-3 bg-gray-100 rounded-md text-black">
                {new Date(credential.created_at).toLocaleString()}
              </div>
            </div>
          )}

          {/* Botón de cerrar */}
          <button
            className="mt-4 bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCredentialModal;
