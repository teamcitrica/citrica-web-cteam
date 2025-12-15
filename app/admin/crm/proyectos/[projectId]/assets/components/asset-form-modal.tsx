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
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
  Chip,
  Tooltip,
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

  const [tables, setTables] = useState<string[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);

  // Estados para acordeones y filtros
  const [columnsConfirmed, setColumnsConfirmed] = useState(false);
  const [showColumnSelection, setShowColumnSelection] = useState(true);
  const [showFilterSelection, setShowFilterSelection] = useState(false);
  const [filters, setFilters] = useState<Array<{ column: string; value: string }>>([]);
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("");
  const [filterColumnValues, setFilterColumnValues] = useState<string[]>([]);
  const [selectedFilterValue, setSelectedFilterValue] = useState<string>("");
  const [isLoadingFilterValues, setIsLoadingFilterValues] = useState(false);

  // Cache de valores de columnas
  const [columnValuesCache, setColumnValuesCache] = useState<Record<string, string[]>>({});

  const handleInputChange = (field: keyof AssetInput, value: string | number | Record<string, any> | null) => {
    // Para strings vacíos, mantener el string vacío en lugar de null para permitir escritura
    const finalValue = typeof value === "string" && value === "" ? "" : (value || null);

    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
  };


  // Función para obtener columnas de una tabla específica
  const fetchTableColumns = useCallback(async (tableName: string, preservedColumns?: string[], showToast = true) => {
    if (!formData.supabase_url || !formData.supabase_anon_key || !tableName) {
      return;
    }

    try {
      setIsLoadingColumns(true);
      setTableColumns([]);
      if (!preservedColumns) {
        setSelectedColumns([]);
      }

      const cleanUrl = formData.supabase_url.replace(/\/$/, "");

      // Obtener el schema OpenAPI para ver las propiedades de la tabla
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

      // Buscar las columnas de la tabla en definitions
      const tableDefinition = data.definitions?.[tableName];

      if (tableDefinition && tableDefinition.properties) {
        const columns = Object.keys(tableDefinition.properties);
        setTableColumns(columns);

        // Si hay columnas preservadas (modo edit), usar esas
        if (preservedColumns && preservedColumns.length > 0) {
          setSelectedColumns(preservedColumns);
        }

        if (showToast) {
          addToast({
            title: "Columnas cargadas",
            description: `Se encontraron ${columns.length} columnas en la tabla ${tableName}`,
            color: "success",
          });
        }
      } else {
        if (showToast) {
          addToast({
            title: "Sin columnas",
            description: "No se pudo obtener el schema de la tabla",
            color: "warning",
          });
        }
      }
    } catch (err: any) {
      console.error("Error al obtener columnas:", err);
      if (showToast) {
        addToast({
          title: "Error",
          description: "No se pudieron obtener las columnas de la tabla",
          color: "danger",
        });
      }
    } finally {
      setIsLoadingColumns(false);
    }
  }, [formData.supabase_url, formData.supabase_anon_key]);

  const handleConsultTables = useCallback(async (url?: string, key?: string, showToast = true) => {
    const supabaseUrl = url || formData.supabase_url;
    const supabaseKey = key || formData.supabase_anon_key;

    if (!supabaseUrl || !supabaseKey) {
      if (showToast) {
        addToast({
          title: "Campos requeridos",
          description: "Por favor ingresa la URL y la clave anon de Supabase",
          color: "warning",
        });
      }
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
        if (showToast) {
          addToast({
            title: "Sin tablas",
            description: "No se encontraron tablas en este Supabase.",
            color: "warning",
          });
        }
      } else {
        setTables(tableNames);
        if (showToast) {
          addToast({
            title: "Éxito",
            description: `Se encontraron ${tableNames.length} tablas`,
            color: "success",
          });
        }
      }
    } catch (err: any) {
      console.error("Error al consultar tablas:", err);
      if (showToast) {
        addToast({
          title: "Error",
          description:
            err.message ||
            "No se pudieron consultar las tablas. Verifica las credenciales.",
          color: "danger",
        });
      }
    } finally {
      setIsLoadingTables(false);
    }
  }, [formData.supabase_url, formData.supabase_anon_key]);

  // Función para confirmar columnas seleccionadas
  const handleConfirmColumns = () => {
    if (selectedColumns.length === 0) {
      addToast({
        title: "Selecciona columnas",
        description: "Debes seleccionar al menos una columna",
        color: "warning",
      });
      return;
    }

    setColumnsConfirmed(true);
    setShowColumnSelection(false);
    setShowFilterSelection(true);

    // Actualizar assets_options con las columnas y el cache de valores
    const options = {
      columns: selectedColumns,
      filters: filters,
      columnValues: columnValuesCache
    };
    handleInputChange("assets_options", options);

    addToast({
      title: "Columnas confirmadas",
      description: `Se confirmaron ${selectedColumns.length} columnas`,
      color: "success",
    });
  };

  // Función para obtener valores únicos de una columna
  const fetchColumnValues = useCallback(async (columnName: string, showToast = true, forceRefresh = false) => {
    if (!formData.supabase_url || !formData.supabase_anon_key || !formData.tabla || !columnName) {
      return;
    }

    // Si ya tenemos valores en cache y no es un refresh forzado, usar el cache
    if (!forceRefresh && columnValuesCache[columnName]) {
      setFilterColumnValues(columnValuesCache[columnName]);
      if (showToast) {
        addToast({
          title: "Valores cargados desde caché",
          description: `${columnValuesCache[columnName].length} valores únicos`,
          color: "success",
        });
      }
      return;
    }

    try {
      setIsLoadingFilterValues(true);
      setFilterColumnValues([]);

      const cleanUrl = formData.supabase_url.replace(/\/$/, "");
      const uniqueValuesSet = new Set<string>();

      // Parámetros de paginación
      const pageSize = 1000; // Número de registros por página
      const maxPages = 100; // Máximo 100 páginas (100,000 registros)
      let currentPage = 0;
      let hasMoreData = true;

      // Hacer múltiples peticiones paginadas para obtener valores únicos
      while (hasMoreData && currentPage < maxPages) {
        const offset = currentPage * pageSize;

        const response = await fetch(
          `${cleanUrl}/rest/v1/${formData.tabla}?select=${columnName}&limit=${pageSize}&offset=${offset}`,
          {
            method: "GET",
            headers: {
              apikey: formData.supabase_anon_key,
              "Content-Type": "application/json",
              "Prefer": "count=exact"
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Si no hay más datos, terminar el loop
        if (data.length === 0) {
          hasMoreData = false;
          break;
        }

        // Agregar valores únicos al Set
        data.forEach((item: any) => {
          const value = item[columnName];
          if (value !== null && value !== undefined) {
            uniqueValuesSet.add(String(value));
          }
        });

        // Si recibimos menos registros que el pageSize, ya no hay más datos
        if (data.length < pageSize) {
          hasMoreData = false;
        }

        currentPage++;

        // Actualizar la UI mientras se cargan más valores
        if (showToast && currentPage % 10 === 0) {
          setFilterColumnValues(Array.from(uniqueValuesSet).sort());
        }
      }

      // Convertir el Set a Array, ordenar y actualizar
      const uniqueValues = Array.from(uniqueValuesSet).sort();
      setFilterColumnValues(uniqueValues);

      // Guardar en cache
      setColumnValuesCache(prev => ({
        ...prev,
        [columnName]: uniqueValues
      }));

      // También actualizar assets_options inmediatamente con el nuevo cache
      const updatedCache = { ...columnValuesCache, [columnName]: uniqueValues };
      const options = {
        columns: selectedColumns,
        filters: filters,
        columnValues: updatedCache
      };
      handleInputChange("assets_options", options);

      if (showToast) {
        const totalScanned = currentPage * pageSize;
        addToast({
          title: "Valores cargados",
          description: `Se encontraron ${uniqueValues.length} valores únicos (escaneados ${Math.min(totalScanned, uniqueValues.length * pageSize)} registros)`,
          color: "success",
        });
      }
    } catch (err: any) {
      console.error("Error al obtener valores de columna:", err);
      if (showToast) {
        addToast({
          title: "Error",
          description: "No se pudieron obtener los valores de la columna",
          color: "danger",
        });
      }
    } finally {
      setIsLoadingFilterValues(false);
    }
  }, [formData.supabase_url, formData.supabase_anon_key, formData.tabla, columnValuesCache, selectedColumns, filters]);

  // Función para agregar filtro
  const handleAddFilter = () => {
    if (!selectedFilterColumn || !selectedFilterValue) {
      addToast({
        title: "Campos requeridos",
        description: "Selecciona una columna y un valor para el filtro",
        color: "warning",
      });
      return;
    }

    const newFilter = { column: selectedFilterColumn, value: selectedFilterValue };
    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);

    // Actualizar assets_options con cache incluido
    const options = {
      columns: selectedColumns,
      filters: updatedFilters,
      columnValues: columnValuesCache
    };
    handleInputChange("assets_options", options);

    // Limpiar selección
    setSelectedFilterColumn("");
    setSelectedFilterValue("");
    setFilterColumnValues([]);

    addToast({
      title: "Filtro agregado",
      description: `Filtro: ${selectedFilterColumn} = ${selectedFilterValue}`,
      color: "success",
    });
  };

  // Función para eliminar filtro
  const handleRemoveFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);

    // Actualizar assets_options con cache incluido
    const options = {
      columns: selectedColumns,
      filters: updatedFilters,
      columnValues: columnValuesCache
    };
    handleInputChange("assets_options", options);

    addToast({
      title: "Filtro eliminado",
      color: "success",
    });
  };

  useEffect(() => {
    // Resetear todo cuando el modal se abre
    if (!isOpen) {
      return;
    }

    if (mode === "edit" && asset) {
      setFormData({
        name: asset.name,
        supabase_url: asset.supabase_url,
        supabase_anon_key: asset.supabase_anon_key,
        tabla: asset.tabla,
        assets_options: asset.assets_options,
        project_id: asset.project_id,
      });

      // Extraer las columnas guardadas
      const savedColumns = asset.assets_options?.columns && Array.isArray(asset.assets_options.columns)
        ? asset.assets_options.columns
        : [];

      // Extraer los filtros guardados
      const savedFilters = asset.assets_options?.filters && Array.isArray(asset.assets_options.filters)
        ? asset.assets_options.filters
        : [];

      // Extraer el cache de valores de columnas guardado
      const savedColumnValues = asset.assets_options?.columnValues && typeof asset.assets_options.columnValues === 'object'
        ? asset.assets_options.columnValues
        : {};

      // Si tiene columnas en assets_options, cargarlas
      if (savedColumns.length > 0) {
        setSelectedColumns(savedColumns);
        setColumnsConfirmed(true);
        setShowColumnSelection(false);
        setShowFilterSelection(true);
      }

      // Si tiene filtros, cargarlos
      if (savedFilters.length > 0) {
        setFilters(savedFilters);
      }

      // Si tiene cache de valores, cargarlo
      if (Object.keys(savedColumnValues).length > 0) {
        setColumnValuesCache(savedColumnValues);
      }

      // Si tiene URL y key, cargar las tablas automáticamente sin mostrar toasts
      if (asset.supabase_url && asset.supabase_anon_key) {
        handleConsultTables(asset.supabase_url, asset.supabase_anon_key, false);

        // Si también tiene una tabla seleccionada, cargar sus columnas preservando las selecciones sin mostrar toasts
        if (asset.tabla) {
          fetchTableColumns(asset.tabla, savedColumns, false);
        }
      }
    } else if (mode === "create") {
      // Limpiar el formulario cuando se abre en modo "create"
      setFormData({
        name: "",
        supabase_url: "",
        supabase_anon_key: "",
        tabla: null,
        assets_options: null,
        project_id: projectId,
      });
      setSelectedColumns([]);
      setTables([]);
      setTableColumns([]);
      setColumnsConfirmed(false);
      setShowColumnSelection(true);
      setShowFilterSelection(false);
      setFilters([]);
      setColumnValuesCache({});
      setFilterColumnValues([]);
      setSelectedFilterColumn("");
      setSelectedFilterValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, mode, projectId, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name) {
      addToast({
        title: "Error",
        description: "El nombre del asset es requerido",
        color: "danger",
      });
      return;
    }

    // Las opciones ya están en formData.assets_options gracias a los checkboxes

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
          // Limpiar completamente el formulario después de crear
          setFormData({
            name: "",
            supabase_url: "",
            supabase_anon_key: "",
            tabla: null,
            assets_options: null,
            project_id: projectId,
          });
          setSelectedColumns([]);
          setTables([]);
          setTableColumns([]);
          setColumnsConfirmed(false);
          setShowColumnSelection(true);
          setShowFilterSelection(false);
          setFilters([]);
          setColumnValuesCache({});
          setFilterColumnValues([]);
          setSelectedFilterColumn("");
          setSelectedFilterValue("");
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
                isDisabled={mode === "edit"}
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
                isDisabled={mode === "edit"}
                classNames={{
                  label: "text-gray-700",
                  input: "text-gray-800",
                }}
              />
            </div>

            {mode === "create" && (
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
            )}

            {tables.length > 0 && (
              <div className="col-span-2">
                <Select
                  label="Tabla"
                  placeholder="Selecciona una tabla"
                  selectedKeys={formData.tabla ? [formData.tabla] : []}
                  onChange={(e) => {
                    const tableName = e.target.value;
                    handleInputChange("tabla", tableName);
                    if (tableName) {
                      fetchTableColumns(tableName);
                    }
                  }}
                  classNames={{
                    label: "text-gray-700",
                    value: "text-gray-800 truncate",
                  }}
                >
                  {tables.map((table) => (
                    <SelectItem
                      key={table}
                      classNames={{
                        base: "max-w-full",
                        title: "truncate",
                      }}
                      title={table}
                    >
                      <span className="truncate block" title={table}>
                        {table}
                      </span>
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}

            {/* Acordeón: Selección de columnas */}
            {tableColumns.length > 0 && (
              <div className="col-span-2">
                <div className="border rounded-lg bg-white">
                  {/* Header del acordeón de columnas */}
                  <button
                    type="button"
                    onClick={() => setShowColumnSelection(!showColumnSelection)}
                    className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      {columnsConfirmed && "✓"} 1. Selecciona las columnas visibles
                    </h4>
                    <span className="text-gray-500">
                      {showColumnSelection ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Contenido del acordeón de columnas */}
                  {showColumnSelection && (
                    <div className="p-4 border-t bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-xs text-gray-600">
                          Selecciona las columnas que serán visibles para el usuario
                        </p>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => {
                            const allSelected = selectedColumns.length === tableColumns.length;
                            const newSelection = allSelected ? [] : tableColumns;
                            setSelectedColumns(newSelection);
                          }}
                        >
                          {selectedColumns.length === tableColumns.length ? "Deseleccionar todos" : "Seleccionar todos"}
                        </Button>
                      </div>

                      {isLoadingColumns ? (
                        <p className="text-sm text-gray-500">Cargando columnas...</p>
                      ) : (
                        <>
                          <CheckboxGroup
                            value={selectedColumns}
                            onValueChange={(values) => {
                              setSelectedColumns(values);
                            }}
                            classNames={{
                              base: "w-full",
                            }}
                          >
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                              {tableColumns.map((column) => (
                                <Checkbox
                                  key={column}
                                  value={column}
                                  classNames={{
                                    label: "text-sm text-gray-700 truncate",
                                  }}
                                >
                                  <span className="truncate max-w-[150px] block" title={column}>
                                    {column}
                                  </span>
                                </Checkbox>
                              ))}
                            </div>
                          </CheckboxGroup>

                          {/* Chips de columnas seleccionadas */}
                          {selectedColumns.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2 font-medium">
                                Columnas seleccionadas ({selectedColumns.length}):
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {selectedColumns.map((column) => (
                                  <Chip
                                    key={column}
                                    onClose={() => {
                                      const newSelection = selectedColumns.filter(c => c !== column);
                                      setSelectedColumns(newSelection);
                                    }}
                                    variant="flat"
                                    color="primary"
                                    size="sm"
                                  >
                                    {column}
                                  </Chip>
                                ))}
                              </div>

                              {/* Botón de confirmar columnas */}
                              <Button
                                className="bg-green-600 text-white w-full"
                                onPress={handleConfirmColumns}
                                isDisabled={columnsConfirmed}
                              >
                                {columnsConfirmed ? "Columnas Confirmadas ✓" : "Confirmar Columnas"}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acordeón: Filtros de datos */}
            {columnsConfirmed && (
              <div className="col-span-2">
                <div className="border rounded-lg bg-white">
                  {/* Header del acordeón de filtros */}
                  <button
                    type="button"
                    onClick={() => setShowFilterSelection(!showFilterSelection)}
                    className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="text-sm font-semibold text-gray-700">
                      2. Configura filtros (opcional)
                    </h4>
                    <span className="text-gray-500">
                      {showFilterSelection ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Contenido del acordeón de filtros */}
                  {showFilterSelection && (
                    <div className="p-4 border-t bg-gray-50">
                      <p className="text-xs text-gray-600 mb-4">
                        Selecciona una columna y su valor para filtrar los datos
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Select de columnas */}
                        <Select
                          label="Columna"
                          placeholder="Selecciona una columna"
                          selectedKeys={selectedFilterColumn ? [selectedFilterColumn] : []}
                          onChange={(e) => {
                            const column = e.target.value;
                            setSelectedFilterColumn(column);
                            setSelectedFilterValue("");
                            if (column) {
                              fetchColumnValues(column);
                            }
                          }}
                          classNames={{
                            label: "text-gray-700",
                            value: "text-gray-800",
                          }}
                        >
                          {selectedColumns.map((column) => (
                            <SelectItem key={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </Select>

                        {/* Select de valores con botón de refresh */}
                        <div className="flex gap-2">
                          <Select
                            label="Valor"
                            placeholder="Selecciona un valor"
                            selectedKeys={selectedFilterValue ? [selectedFilterValue] : []}
                            onChange={(e) => setSelectedFilterValue(e.target.value)}
                            isDisabled={!selectedFilterColumn || isLoadingFilterValues}
                            isLoading={isLoadingFilterValues}
                            classNames={{
                              label: "text-gray-700",
                              value: "text-gray-800",
                              base: "flex-1",
                            }}
                          >
                            {filterColumnValues.map((value) => (
                              <SelectItem key={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </Select>

                          {selectedFilterColumn && columnValuesCache[selectedFilterColumn] && (
                            <div className="flex items-end">
                              <Tooltip content="Refrescar valores desde Supabase" placement="top">
                                <Button
                                  size="md"
                                  color="primary"
                                  variant="flat"
                                  onPress={() => fetchColumnValues(selectedFilterColumn, true, true)}
                                  isDisabled={isLoadingFilterValues}
                                  className="h-14"
                                >
                                  🔄
                                </Button>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botón para agregar filtro */}
                      <Button
                        className="bg-blue-600 text-white w-full mb-4"
                        onPress={handleAddFilter}
                        isDisabled={!selectedFilterColumn || !selectedFilterValue}
                      >
                        Agregar Filtro
                      </Button>

                      {/* Lista de filtros agregados */}
                      {filters.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-600 mb-2 font-medium">
                            Filtros aplicados ({filters.length}):
                          </p>
                          <div className="space-y-2">
                            {filters.map((filter, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-white p-3 rounded-lg border"
                              >
                                <span className="text-sm text-gray-700">
                                  <strong>{filter.column}</strong> = {filter.value}
                                </span>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="light"
                                  onPress={() => handleRemoveFilter(index)}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

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
