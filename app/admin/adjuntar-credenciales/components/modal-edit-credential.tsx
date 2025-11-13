"use client";

import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";
import { Input } from "@/shared/components/citrica-ui";
import { useUserRole } from "@/hooks/role/use-role";
import { useCredentials, CredentialType } from "@/hooks/use-credentials";

type EditCredentialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  credential: CredentialType;
};

const EditCredentialModal = ({
  isOpen,
  onClose,
  credential,
}: EditCredentialModalProps) => {
  const { roles, fetchRoles } = useUserRole();
  const { updateCredential } = useCredentials();

  const [formData, setFormData] = useState({
    supabase_url: credential.supabase_url,
    supabase_anon_key: credential.supabase_anon_key,
    table_name: credential.table_name,
    role_id: credential.role_id.toString(),
  });

  const [tables, setTables] = useState<string[]>([credential.table_name]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      // Resetear el formulario con los datos de la credencial
      setFormData({
        supabase_url: credential.supabase_url,
        supabase_anon_key: credential.supabase_anon_key,
        table_name: credential.table_name,
        role_id: credential.role_id.toString(),
      });
      setTables([credential.table_name]);
    }
  }, [isOpen, credential, fetchRoles]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConsultTables = async () => {
    if (!formData.supabase_url || !formData.supabase_anon_key) {
      addToast({
        title: "Campos requeridos",
        description: "Por favor ingresa la URL y la clave anon de Supabase",
        color: "warning",
      });
      return;
    }

    try {
      setIsLoadingTables(true);
      setTables([]);

      const cleanUrl = formData.supabase_url.replace(/\/$/, "");

      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: formData.supabase_anon_key,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      const tableNames: string[] = [];

      if (data.definitions) {
        Object.keys(data.definitions).forEach((key) => {
          if (!key.startsWith("_") && !key.includes("pg_")) {
            tableNames.push(key);
          }
        });
      }

      if (data.paths && tableNames.length === 0) {
        Object.keys(data.paths).forEach((path) => {
          const tableName = path.replace("/", "");
          if (
            tableName &&
            !tableName.includes("{") &&
            !tableName.includes("rpc") &&
            !tableName.startsWith("_") &&
            !tableNames.includes(tableName)
          ) {
            tableNames.push(tableName);
          }
        });
      }

      if (tableNames.length === 0) {
        addToast({
          title: "Sin tablas",
          description: "No se encontraron tablas en este Supabase.",
          color: "warning",
        });
      } else {
        setTables(tableNames);
        addToast({
          title: "Éxito",
          description: `Se encontraron ${tableNames.length} tablas`,
          color: "success",
        });
      }
    } catch (err: any) {
      console.error("Error al consultar tablas:", err);
      addToast({
        title: "Error",
        description:
          err.message ||
          "No se pudieron consultar las tablas. Verifica las credenciales.",
        color: "danger",
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.supabase_url ||
      !formData.supabase_anon_key ||
      !formData.table_name ||
      !formData.role_id
    ) {
      addToast({
        title: "Campos requeridos",
        description: "Todos los campos son obligatorios",
        color: "warning",
      });
      return;
    }

    try {
      setIsSaving(true);

      const cleanUrl = formData.supabase_url.replace(/\/$/, "");

      const result = await updateCredential(credential.id, {
        supabase_url: cleanUrl,
        supabase_anon_key: formData.supabase_anon_key,
        table_name: formData.table_name,
        role_id: parseInt(formData.role_id),
      });

      if (result?.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error inesperado al actualizar credencial:", error);
      addToast({
        title: "Error inesperado",
        description: "Por favor, intente nuevamente.",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Filtrar roles a partir del ID 5
  const availableRoles = roles.filter((role) => role.id >= 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-md p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {/* Botón para cerrar el modal */}
        <button
          className="absolute top-2 right-2 text-black text-xl"
          onClick={onClose}
        >
          X
        </button>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-black">Editar Credencial</h2>

          <Input
            name="supabase_url"
            placeholder="Supabase URL (ej: https://xxx.supabase.co)"
            type="url"
            value={formData.supabase_url}
            onChange={handleChange}
          />

          <Input
            name="supabase_anon_key"
            placeholder="Supabase Anon Key"
            type="text"
            value={formData.supabase_anon_key}
            onChange={handleChange}
          />

          <button
            className="mt-2 bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            onClick={handleConsultTables}
            disabled={isLoadingTables}
          >
            {isLoadingTables ? "Consultando..." : "Consultar Tablas"}
          </button>

          {tables.length > 0 && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">
                  Seleccionar Tabla
                </label>
                <select
                  name="table_name"
                  value={formData.table_name}
                  onChange={handleChange}
                  className="border rounded-md p-2 text-black"
                >
                  <option value="">Selecciona una tabla</option>
                  {tables.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">
                  Seleccionar Rol
                </label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="border rounded-md p-2 text-black"
                >
                  <option value="">Selecciona un rol</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} (ID: {role.id})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex gap-2 mt-4">
            <button
              className="flex-1 bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              onClick={handleSubmit}
              disabled={isSaving || tables.length === 0}
            >
              {isSaving ? "Guardando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCredentialModal;
