"use client";

import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";
import { Input } from "@/shared/components/citrica-ui";
import { useUserRole } from "@/hooks/role/use-role";
import { useSupabase } from "@/shared/context/supabase-context";

type AttachCredentialsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AttachCredentialsModal = ({ isOpen, onClose }: AttachCredentialsModalProps) => {
  const { supabase } = useSupabase();
  const { roles, fetchRoles } = useUserRole();

  const [formData, setFormData] = useState({
    supabase_url: "",
    supabase_anon_key: "",
    table_name: "",
    role_id: "",
  });

  const [tables, setTables] = useState<string[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen, fetchRoles]);

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

      // Limpiar la URL si tiene barra al final
      const cleanUrl = formData.supabase_url.replace(/\/$/, "");

      // Intentar obtener el schema OpenAPI de Supabase
      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': formData.supabase_anon_key,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta de Supabase:", data);

      const tableNames: string[] = [];

      // El schema OpenAPI tiene las tablas en la propiedad "definitions"
      if (data.definitions) {
        Object.keys(data.definitions).forEach((key) => {
          // Filtrar tablas internas que empiezan con "_"
          if (!key.startsWith("_") && !key.includes("pg_")) {
            tableNames.push(key);
          }
        });
      }

      // También revisar en "paths" por si las tablas están ahí
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
        description: err.message || "No se pudieron consultar las tablas. Verifica las credenciales.",
        color: "danger",
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.supabase_url || !formData.supabase_anon_key || !formData.table_name || !formData.role_id) {
      addToast({
        title: "Campos requeridos",
        description: "Todos los campos son obligatorios",
        color: "warning",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Limpiar la URL
      const cleanUrl = formData.supabase_url.replace(/\/$/, "");

      // Verificar si ya existe una credencial para este rol
      const { data: existingCredential } = await supabase
        .from("credentials")
        .select("id")
        .eq("role_id", formData.role_id)
        .single();

      if (existingCredential) {
        // Actualizar credencial existente
        const { error } = await supabase
          .from("credentials")
          .update({
            supabase_url: cleanUrl,
            supabase_anon_key: formData.supabase_anon_key,
            table_name: formData.table_name,
          })
          .eq("role_id", formData.role_id);

        if (error) {
          console.error("Error al actualizar credenciales:", error);
          addToast({
            title: "Error",
            description: "No se pudieron actualizar las credenciales",
            color: "danger",
          });
          return;
        }

        addToast({
          title: "Éxito",
          description: "Credenciales actualizadas correctamente",
          color: "success",
        });
      } else {
        // Insertar nueva credencial
        const { error } = await supabase
          .from("credentials")
          .insert([{
            supabase_url: cleanUrl,
            supabase_anon_key: formData.supabase_anon_key,
            table_name: formData.table_name,
            role_id: parseInt(formData.role_id),
            name: `Credenciales para rol ${formData.role_id}`,
          }]);

        if (error) {
          console.error("Error al crear credenciales:", error);
          addToast({
            title: "Error",
            description: "No se pudieron crear las credenciales",
            color: "danger",
          });
          return;
        }

        addToast({
          title: "Éxito",
          description: "Credenciales creadas correctamente",
          color: "success",
        });
      }

      // Limpiar formulario
      setFormData({
        supabase_url: "",
        supabase_anon_key: "",
        table_name: "",
        role_id: "",
      });
      setTables([]);
      onClose();
    } catch (error) {
      console.error("Error inesperado al guardar credenciales:", error);
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
        <button className="absolute top-2 right-2 text-black text-xl" onClick={onClose}>
          X
        </button>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-black">Adjuntar Credenciales</h2>

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

          <button
            className="mt-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            onClick={handleSubmit}
            disabled={isSaving || tables.length === 0}
          >
            {isSaving ? "Guardando..." : "Guardar Credenciales"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachCredentialsModal;
