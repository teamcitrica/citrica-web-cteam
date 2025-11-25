"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { useAssetCRUD, AssetInput, Asset } from "@/hooks/assets/use-assets";

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  asset?: Asset;
  projectId: string;
}

export default function AssetFormModal({
  isOpen,
  onClose,
  mode,
  asset,
  projectId,
}: AssetFormModalProps) {
  const { createAsset, updateAsset, isLoading } = useAssetCRUD();

  const [formData, setFormData] = useState<AssetInput>({
    name: asset?.name || null,
    supabase_url: asset?.supabase_url || null,
    supabase_anon_key: asset?.supabase_anon_key || null,
    tabla: asset?.tabla || null,
    assets_options: asset?.assets_options || null,
    project_id: projectId,
  });

  const [assetsOptionsText, setAssetsOptionsText] = useState<string>("");
  const [tables, setTables] = useState<string[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  const handleInputChange = (field: keyof AssetInput, value: string | number | Record<string, any> | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleAssetsOptionsChange = (text: string) => {
    setAssetsOptionsText(text);

    // Intentar parsear el JSON
    if (text.trim() === "") {
      handleInputChange("assets_options", null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      handleInputChange("assets_options", parsed);
    } catch (e) {
      // Si no es JSON válido, no actualizar formData todavía
    }
  };

  const handleConsultTables = useCallback(async (url?: string, key?: string) => {
    const supabaseUrl = url || formData.supabase_url;
    const supabaseKey = key || formData.supabase_anon_key;

    if (!supabaseUrl || !supabaseKey) {
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
      const cleanUrl = supabaseUrl.replace(/\/$/, "");

      // Intentar obtener el schema OpenAPI de Supabase
      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          "Content-Type": "application/json",
        },
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
        description:
          err.message ||
          "No se pudieron consultar las tablas. Verifica las credenciales.",
        color: "danger",
      });
    } finally {
      setIsLoadingTables(false);
    }
  }, [formData.supabase_url, formData.supabase_anon_key]);

  useEffect(() => {
    if (mode === "edit" && asset) {
      setFormData({
        name: asset.name,
        supabase_url: asset.supabase_url,
        supabase_anon_key: asset.supabase_anon_key,
        tabla: asset.tabla,
        assets_options: asset.assets_options,
        project_id: asset.project_id,
      });

      // Convertir assets_options a texto JSON formateado
      if (asset.assets_options) {
        try {
          setAssetsOptionsText(JSON.stringify(asset.assets_options, null, 2));
        } catch (e) {
          setAssetsOptionsText("");
        }
      }

      // Si tiene URL y key, cargar las tablas automáticamente
      if (asset.supabase_url && asset.supabase_anon_key) {
        handleConsultTables(asset.supabase_url, asset.supabase_anon_key);
      }
    }
  }, [asset, mode, handleConsultTables]);

  const handleSubmit = async () => {
    if (!formData.name) {
      addToast({
        title: "Error",
        description: "El nombre del asset es requerido",
        color: "danger",
      });
      return;
    }

    // Validar JSON de assets_options si hay texto
    if (assetsOptionsText.trim() !== "") {
      try {
        const parsed = JSON.parse(assetsOptionsText);
        formData.assets_options = parsed;
      } catch (e) {
        addToast({
          title: "Error",
          description: "El formato de Assets Options debe ser un JSON válido",
          color: "danger",
        });
        return;
      }
    }

    try {
      // Limpiar campos vacíos antes de enviar
      const cleanedData: any = {};

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "" && value !== undefined) {
          cleanedData[key] = value;
        }
      });

      // Asegurar que project_id siempre esté presente
      cleanedData.project_id = projectId;

      if (mode === "create") {
        const result = await createAsset(cleanedData as AssetInput);
        if (result) {
          setFormData({
            name: null,
            supabase_url: null,
            supabase_anon_key: null,
            tabla: null,
            assets_options: null,
            project_id: projectId,
          });
          setAssetsOptionsText("");
          onClose();
        }
      } else {
        await updateAsset(asset!.id, cleanedData);
        onClose();
      }
    } catch (error) {
      console.error(`Error al ${mode === "create" ? "crear" : "actualizar"} asset:`, error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {mode === "create" ? "Agregar Nuevo Asset" : "Editar Asset"}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Asset"
              placeholder="Ingrese el nombre"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              isRequired
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />

            <div className="col-span-2">
              <Input
                label="Supabase URL"
                placeholder="https://xxx.supabase.co"
                value={formData.supabase_url || ""}
                onChange={(e) => handleInputChange("supabase_url", e.target.value)}
                classNames={{
                  label: "text-gray-700",
                  input: "text-gray-800",
                }}
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Supabase Anon Key"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={formData.supabase_anon_key || ""}
                onChange={(e) => handleInputChange("supabase_anon_key", e.target.value)}
                classNames={{
                  label: "text-gray-700",
                  input: "text-gray-800",
                }}
              />
            </div>

            <div className="col-span-2">
              <Button
                className="bg-green-600 text-white w-full"
                onPress={() => handleConsultTables()}
                isLoading={isLoadingTables}
                isDisabled={!formData.supabase_url || !formData.supabase_anon_key}
              >
                {isLoadingTables ? "Consultando..." : "Consultar Tablas"}
              </Button>
            </div>

            {tables.length > 0 && (
              <div className="col-span-2">
                <Select
                  label="Tabla"
                  placeholder="Selecciona una tabla"
                  selectedKeys={formData.tabla ? [formData.tabla] : []}
                  onChange={(e) => handleInputChange("tabla", e.target.value)}
                  classNames={{
                    label: "text-gray-700",
                    value: "text-gray-800",
                  }}
                >
                  {tables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}

            <div className="col-span-2">
              <Textarea
                label="Assets Options (JSON)"
                placeholder='{"filtro1": "valor1", "filtro2": "valor2"}'
                description="Filtros que se usarán para mostrar la tabla. Debe ser un JSON válido."
                value={assetsOptionsText}
                onChange={(e) => handleAssetsOptionsChange(e.target.value)}
                minRows={5}
                classNames={{
                  label: "text-gray-700",
                  input: "text-gray-800 font-mono text-sm",
                }}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[#42668A] text-white"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            {mode === "create" ? "Crear Asset" : "Guardar Cambios"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
