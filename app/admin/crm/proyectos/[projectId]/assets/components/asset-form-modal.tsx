"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
  Chip,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { Button } from "citrica-ui-toolkit";

import { useAssetCRUD, AssetInput, Asset } from "@/hooks/assets/use-assets";

// Tipo para columnas con alias
interface ColumnWithAlias {
  field: string;
  alias: string;
  visible: boolean;
}

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
  const [showColumnSelection, setShowColumnSelection] = useState(true);
  const [showAliasManagement, setShowAliasManagement] = useState(false);
  const [showSearchConfiguration, setShowSearchConfiguration] = useState(false);
  const [showFilterSelection, setShowFilterSelection] = useState(false);
  const [filter, setFilter] = useState<{ column: string; value: string } | null>(null);
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");

  // Estados para buscadores
  const [dateSearchColumn, setDateSearchColumn] = useState<string | null>(null);
  const [textSearchColumns, setTextSearchColumns] = useState<string[]>([]);

  // Estados para gestión de alias
  const [columnsWithAlias, setColumnsWithAlias] = useState<ColumnWithAlias[]>([]);

  const handleInputChange = (field: keyof AssetInput, value: string | number | Record<string, any> | null) => {
    // Para strings vacíos, mantener el string vacío en lugar de null para permitir escritura
    const finalValue = typeof value === "string" && value === "" ? "" : (value || null);

    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
  };


  // Función para obtener columnas de una tabla específica
  const fetchTableColumns = useCallback(async (tableName: string, preservedColumns?: string[], showToast = true, supabaseUrl?: string, supabaseKey?: string) => {
    const url = supabaseUrl || formData.supabase_url;
    const key = supabaseKey || formData.supabase_anon_key;

    if (!url || !key || !tableName) {
      return;
    }

    try {
      setIsLoadingColumns(true);
      setTableColumns([]);
      if (!preservedColumns) {
        setSelectedColumns([]);
      }

      const cleanUrl = url.replace(/\/$/, "");

      // Obtener el schema OpenAPI para ver las propiedades de la tabla
      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: key,
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

      // Obtener el schema OpenAPI de Supabase
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

      const allTableNames: string[] = [];

      if (data.definitions) {
        Object.keys(data.definitions).forEach((key) => {
          // Filtrar solo las vistas que empiezan con "view_"
          if (key.startsWith("view_")) {
            allTableNames.push(key);
          }
        });
      }

      // También revisar en "paths" por si las tablas están ahí
      if (data.paths && allTableNames.length === 0) {
        Object.keys(data.paths).forEach((path) => {
          const tableName = path.replace("/", "");
          if (
            tableName &&
            tableName.startsWith("view_") &&
            !allTableNames.includes(tableName)
          ) {
            allTableNames.push(tableName);
          }
        });
      }

      if (allTableNames.length === 0) {
        if (showToast) {
          addToast({
            title: "Sin vistas",
            description: "No se encontraron vistas que empiecen con 'view_' en este Supabase.",
            color: "warning",
          });
        }
        return;
      }

      // Validar permisos de cada vista
      const tableNames: string[] = [];
      const tablesWithoutPermissions: string[] = [];

      for (const tableName of allTableNames) {
        try {
          const testResponse = await fetch(`${cleanUrl}/rest/v1/${tableName}?limit=1`, {
            method: "GET",
            headers: {
              apikey: supabaseKey,
              "Content-Type": "application/json",
            },
          });

          if (testResponse.ok) {
            // La vista tiene permisos configurados
            tableNames.push(tableName);
          } else {
            // La vista no tiene permisos
            tablesWithoutPermissions.push(tableName);
          }
        } catch (error) {
          // Error al validar, asumir que no tiene permisos
          tablesWithoutPermissions.push(tableName);
        }
      }

      if (tableNames.length === 0) {
        if (showToast) {
          addToast({
            title: "Sin vistas con permisos",
            description: `Se encontraron ${allTableNames.length} vistas pero ninguna tiene permisos configurados para el rol 'anon'.`,
            color: "warning",
          });
        }
      } else {
        setTables(tableNames);
        if (showToast) {
          let description = `Se encontraron ${tableNames.length} vistas con permisos configurados`;
          if (tablesWithoutPermissions.length > 0) {
            description += `. ${tablesWithoutPermissions.length} vistas sin permisos fueron omitidas: ${tablesWithoutPermissions.join(", ")}`;
          }
          addToast({
            title: "Éxito",
            description,
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

  // Función para manejar cambio de columnas seleccionadas
  const handleColumnsChange = (newColumns: string[]) => {
    setSelectedColumns(newColumns);

    // Si hay columnas seleccionadas, abrir acordeón de alias y crear/actualizar array de columnas con alias
    if (newColumns.length > 0) {
      setShowAliasManagement(true);
      setShowSearchConfiguration(true);
      setShowFilterSelection(true);

      // Crear array de columnas con alias (usar alias existente o campo como default)
      const newColumnsWithAlias: ColumnWithAlias[] = newColumns.map(col => {
        const existing = columnsWithAlias.find(c => c.field === col);
        return existing || { field: col, alias: col, visible: true };
      });
      setColumnsWithAlias(newColumnsWithAlias);

      // Limpiar columnas de búsqueda si ya no están en las columnas seleccionadas
      if (dateSearchColumn && !newColumns.includes(dateSearchColumn)) {
        setDateSearchColumn(null);
      }
      setTextSearchColumns(prev => prev.filter(col => newColumns.includes(col)));
    } else {
      setShowAliasManagement(false);
      setShowSearchConfiguration(false);
      setShowFilterSelection(false);
      setColumnsWithAlias([]);
      setDateSearchColumn(null);
      setTextSearchColumns([]);
    }
  };

  // Función para actualizar alias de una columna
  const handleAliasChange = (field: string, newAlias: string) => {
    const updatedColumns = columnsWithAlias.map(col =>
      col.field === field ? { ...col, alias: newAlias } : col
    );
    setColumnsWithAlias(updatedColumns);

    // Actualizar assets_options en tiempo real para no perder cambios
    const options = {
      columns: updatedColumns,
      searchConfig: {
        dateColumn: dateSearchColumn,
        textColumns: textSearchColumns
      },
      filter: filter
    };
    handleInputChange("assets_options", options);
  };


  // Función para manejar la columna de búsqueda por fecha
  const handleDateSearchColumnChange = (column: string) => {
    setDateSearchColumn(column || null);

    // Actualizar assets_options
    const options = {
      columns: columnsWithAlias,
      searchConfig: {
        dateColumn: column || null,
        textColumns: textSearchColumns
      },
      filter: filter
    };
    handleInputChange("assets_options", options);
  };

  // Función para manejar las columnas de búsqueda por texto/número
  const handleTextSearchColumnsChange = (columns: string[]) => {
    setTextSearchColumns(columns);

    // Actualizar assets_options
    const options = {
      columns: columnsWithAlias,
      searchConfig: {
        dateColumn: dateSearchColumn,
        textColumns: columns
      },
      filter: filter
    };
    handleInputChange("assets_options", options);
  };

  // Función para agregar/actualizar filtro
  const handleSetFilter = () => {
    if (!selectedFilterColumn || !filterValue.trim()) {
      addToast({
        title: "Campos requeridos",
        description: "Selecciona una columna e ingresa un valor para el filtro",
        color: "warning",
      });
      return;
    }

    const newFilter = { column: selectedFilterColumn, value: filterValue };
    setFilter(newFilter);

    // Actualizar assets_options con columnas con alias
    const options = {
      columns: columnsWithAlias,
      searchConfig: {
        dateColumn: dateSearchColumn,
        textColumns: textSearchColumns
      },
      filter: newFilter
    };
    handleInputChange("assets_options", options);

    addToast({
      title: "Filtro configurado",
      description: `Filtro: ${selectedFilterColumn} = ${filterValue}`,
      color: "success",
    });
  };

  // Función para eliminar filtro
  const handleRemoveFilter = () => {
    setFilter(null);
    setSelectedFilterColumn("");
    setFilterValue("");

    // Actualizar assets_options con columnas con alias
    const options = {
      columns: columnsWithAlias,
      searchConfig: {
        dateColumn: dateSearchColumn,
        textColumns: textSearchColumns
      },
      filter: null
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
      // Extraer las columnas guardadas (soportar formato nuevo y antiguo)
      let savedColumns: string[] = [];
      let savedColumnsWithAlias: ColumnWithAlias[] = [];

      if (asset.assets_options?.columns && Array.isArray(asset.assets_options.columns)) {
        // Verificar si es el formato nuevo (con alias) o antiguo (solo strings)
        if (asset.assets_options.columns.length > 0 && typeof asset.assets_options.columns[0] === 'object') {
          // Formato nuevo con alias
          savedColumnsWithAlias = asset.assets_options.columns as ColumnWithAlias[];
          savedColumns = savedColumnsWithAlias.map(c => c.field);
        } else {
          // Formato antiguo (array de strings)
          savedColumns = asset.assets_options.columns as string[];
          savedColumnsWithAlias = savedColumns.map(col => ({ field: col, alias: col, visible: true }));
        }
      }

      // Extraer el filtro guardado (soportar formato antiguo con filtros array y nuevo con filter)
      let savedFilter: { column: string; value: string } | null = null;
      if (asset.assets_options?.filter && typeof asset.assets_options.filter === 'object') {
        // Formato nuevo (filter único)
        savedFilter = asset.assets_options.filter;
      } else if (asset.assets_options?.filters && Array.isArray(asset.assets_options.filters) && asset.assets_options.filters.length > 0) {
        // Formato antiguo (array de filtros, tomar el primero)
        savedFilter = asset.assets_options.filters[0];
      }

      // Extraer la configuración de búsqueda guardada
      const savedSearchConfig = asset.assets_options?.searchConfig;
      const savedDateColumn = savedSearchConfig?.dateColumn || null;
      const savedTextColumns = savedSearchConfig?.textColumns && Array.isArray(savedSearchConfig.textColumns)
        ? savedSearchConfig.textColumns
        : [];

      // Configurar estados primero
      if (savedColumns.length > 0) {
        setSelectedColumns(savedColumns);
        setColumnsWithAlias(savedColumnsWithAlias);
        setShowColumnSelection(true); // Mantener abierto para que se vea en edición
        setShowAliasManagement(savedColumnsWithAlias.length > 0);
        setShowSearchConfiguration(true);
        setShowFilterSelection(true);
      } else {
        setSelectedColumns([]);
        setColumnsWithAlias([]);
        setShowColumnSelection(true);
        setShowAliasManagement(false);
        setShowSearchConfiguration(false);
        setShowFilterSelection(false);
      }

      // Si tiene configuración de búsqueda, cargarla
      setDateSearchColumn(savedDateColumn);
      setTextSearchColumns(savedTextColumns);

      // Si tiene filtro, cargarlo
      if (savedFilter) {
        setFilter(savedFilter);
        setSelectedFilterColumn(savedFilter.column);
        setFilterValue(savedFilter.value);
      } else {
        setFilter(null);
        setSelectedFilterColumn("");
        setFilterValue("");
      }

      // Establecer formData después de configurar los estados
      setFormData({
        name: asset.name,
        supabase_url: asset.supabase_url,
        supabase_anon_key: asset.supabase_anon_key,
        tabla: asset.tabla,
        assets_options: asset.assets_options,
        project_id: asset.project_id,
      });

      // Si tiene URL y key, cargar las tablas automáticamente sin mostrar toasts
      if (asset.supabase_url && asset.supabase_anon_key) {
        const url = asset.supabase_url;
        const key = asset.supabase_anon_key;
        const tabla = asset.tabla;

        // Cargar tablas inmediatamente
        handleConsultTables(url, key, false);

        // Si también tiene una tabla seleccionada, cargar sus columnas preservando las selecciones sin mostrar toasts
        if (tabla) {
          fetchTableColumns(tabla, savedColumns, false, url, key);
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
      setColumnsWithAlias([]);
      setTables([]);
      setTableColumns([]);
      setShowColumnSelection(true);
      setShowAliasManagement(false);
      setShowSearchConfiguration(false);
      setShowFilterSelection(false);
      setDateSearchColumn(null);
      setTextSearchColumns([]);
      setFilter(null);
      setSelectedFilterColumn("");
      setFilterValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, mode, projectId, isOpen]);

  // Validar si el formulario está completo
  const isFormValid = () => {
    if (mode === "create") {
      return !!(
        formData.name &&
        formData.supabase_url &&
        formData.supabase_anon_key &&
        formData.tabla
      );
    }
    // En modo edit, solo requerir el nombre
    return !!formData.name;
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      addToast({
        title: "Error",
        description: "El nombre del asset es requerido",
        color: "danger",
      });
      return;
    }

    // Actualizar assets_options con las columnas con alias, configuración de búsqueda y filtro actual antes de guardar
    const updatedOptions = {
      columns: columnsWithAlias.length > 0 ? columnsWithAlias : selectedColumns.map(col => ({ field: col, alias: col, visible: true })),
      searchConfig: {
        dateColumn: dateSearchColumn,
        textColumns: textSearchColumns
      },
      filter: filter
    };

    try {
      // Limpiar campos vacíos antes de enviar
      const cleanedData: any = {};

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "" && value !== undefined) {
          cleanedData[key] = value;
        }
      });

      // Actualizar assets_options con los valores actuales
      if (selectedColumns.length > 0 || dateSearchColumn || textSearchColumns.length > 0 || filter) {
        cleanedData.assets_options = updatedOptions;
      }

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
          setColumnsWithAlias([]);
          setTables([]);
          setTableColumns([]);
          setShowColumnSelection(true);
          setShowAliasManagement(false);
          setShowSearchConfiguration(false);
          setShowFilterSelection(false);
          setDateSearchColumn(null);
          setTextSearchColumns([]);
          setFilter(null);
          setSelectedFilterColumn("");
          setFilterValue("");
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
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "AGREGAR ASSET" : "EDITAR ASSET"}
      customWidth="700px"
      footer={
        <>
          <Button
            isAdmin
            variant="secondary"
            onPress={onClose}
            className="w-[162px]"
          >
            Cerrar
          </Button>
          <Button
            isAdmin
            variant="primary"
            className="bg-[#42668A] w-[162px]"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!isFormValid() || isLoading}
          >
            {mode === "create" ? "Agregar" : "Guardar"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <InputCitricaAdmin
          label="Nombre del Asset"
          placeholder="Ingrese el nombre"
          value={formData.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          isRequired
        />

            <InputCitricaAdmin
              label="Supabase URL"
              placeholder="https://xxx.supabase.co"
              value={formData.supabase_url || ""}
              onChange={(e) => handleInputChange("supabase_url", e.target.value)}
              isDisabled={mode === "edit"}
              isRequired={mode === "create"}
            />

            <InputCitricaAdmin
              label="Supabase Anon Key"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={formData.supabase_anon_key || ""}
              onChange={(e) => handleInputChange("supabase_anon_key", e.target.value)}
              isDisabled={mode === "edit"}
              isRequired={mode === "create"}
            />

            {mode === "create" && (
              <div>
                <Button
                  isAdmin
                  className="bg-[#42668A] text-white w-full"
                  onPress={() => handleConsultTables()}
                  isLoading={isLoadingTables}
                  isDisabled={!formData.supabase_url || !formData.supabase_anon_key}
                >
                  {isLoadingTables ? "Consultando..." : "Consultar Tablas"}
                </Button>
              </div>
            )}

            {tables.length > 0 && (
              <div>
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
                  isRequired={mode === "create"}
                  classNames={{
                    label: "!text-[#265197]",
                    value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2] truncate",
                    trigger: "bg-white !border-[#D4DEED]",
                    selectorIcon: "text-[#678CC5]",
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
            {(tableColumns.length > 0 || selectedColumns.length > 0) && (
              <div>
                <div className="border rounded-lg bg-white">
                  {/* Header del acordeón de columnas */}
                  <button
                    type="button"
                    onClick={() => setShowColumnSelection(!showColumnSelection)}
                    className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="text-sm font-semibold text-gray-700">
                      1. Selecciona las columnas visibles
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
                          isAdmin
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => {
                            const allSelected = selectedColumns.length === tableColumns.length;
                            const newSelection = allSelected ? [] : tableColumns;
                            handleColumnsChange(newSelection);
                          }}
                        >
                          {selectedColumns.length === tableColumns.length ? "Ninguno" : "Todos"}
                        </Button>
                      </div>

                      {isLoadingColumns ? (
                        <p className="text-sm text-gray-500">Cargando columnas...</p>
                      ) : (
                        <>
                          <CheckboxGroup
                            value={selectedColumns}
                            onValueChange={(values) => {
                              handleColumnsChange(values);
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
                                      handleColumnsChange(newSelection);
                                    }}
                                    variant="flat"
                                    color="primary"
                                    size="sm"
                                  >
                                    {column}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acordeón: Gestión de Alias */}
            {selectedColumns.length > 0 && (
              <div>
                <div className="border rounded-lg bg-white">
                  {/* Header del acordeón de alias */}
                  <button
                    type="button"
                    onClick={() => setShowAliasManagement(!showAliasManagement)}
                    className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="text-sm font-semibold text-gray-700">
                      2. Gestiona alias de columnas
                    </h4>
                    <span className="text-gray-500">
                      {showAliasManagement ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Contenido del acordeón de alias */}
                  {showAliasManagement && (
                    <div className="p-4 border-t bg-gray-50">
                      <p className="text-xs text-gray-600 mb-4">
                        Asigna alias amigables para cada columna. Estos nombres se mostrarán al cliente en lugar de los nombres técnicos.
                      </p>

                      {/* Información de ayuda */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-800">
                          <strong>💡 Tip:</strong> Los alias son opcionales. Si dejas un campo vacío o igual al nombre original, se mostrará el nombre de la columna original.
                        </p>
                      </div>

                      {/* Tabla editable de alias */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                        <Table
                          aria-label="Tabla de alias de columnas"
                          removeWrapper
                          classNames={{
                            th: "bg-gray-100 text-gray-700 font-semibold text-xs",
                            td: "text-sm",
                          }}
                        >
                          <TableHeader>
                            <TableColumn>COLUMNA ORIGINAL</TableColumn>
                            <TableColumn>ALIAS PERSONALIZADO</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {columnsWithAlias.map((col) => (
                              <TableRow key={col.field}>
                                <TableCell>
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {col.field}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={col.alias}
                                    onChange={(e) => handleAliasChange(col.field, e.target.value)}
                                    placeholder="Ingresa un alias"
                                    size="sm"
                                    variant="bordered"
                                    classNames={{
                                      input: "text-sm",
                                      inputWrapper: "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acordeón: Configuración de buscadores */}
            {selectedColumns.length > 0 && (
              <div>
                <div className="border rounded-lg bg-white">
                  {/* Header del acordeón de buscadores */}
                  <button
                    type="button"
                    onClick={() => setShowSearchConfiguration(!showSearchConfiguration)}
                    className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="text-sm font-semibold text-gray-700">
                      3. Configura buscadores (opcional)
                    </h4>
                    <span className="text-gray-500">
                      {showSearchConfiguration ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Contenido del acordeón de buscadores */}
                  {showSearchConfiguration && (
                    <div className="p-4 border-t bg-gray-50">
                      <p className="text-xs text-gray-600 mb-4">
                        Configura los buscadores que estarán disponibles para el usuario en la vista de datos
                      </p>

                      {/* Información de ayuda */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-800">
                          <strong>💡 Tip:</strong> Los buscadores permiten al usuario filtrar los datos dinámicamente.
                        </p>
                      </div>

                      {/* Buscador por fecha */}
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">
                          📅 Buscador por fecha
                        </h5>
                        <p className="text-xs text-gray-600 mb-3">
                          Selecciona una columna de tipo fecha para activar el filtro de fechas (solo una columna permitida)
                        </p>
                        <Select
                          label="Columna de fecha"
                          placeholder="Selecciona una columna"
                          selectedKeys={dateSearchColumn ? [dateSearchColumn] : []}
                          onChange={(e) => handleDateSearchColumnChange(e.target.value)}
                          classNames={{
                            label: "!text-[#265197]",
                            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
                            trigger: "bg-white !border-[#D4DEED]",
                            selectorIcon: "text-[#678CC5]",
                          }}
                        >
                          {["", ...selectedColumns].map((column) => (
                            <SelectItem key={column}>
                              {column === "" ? "Ninguna" : column}
                            </SelectItem>
                          ))}
                        </Select>
                        {dateSearchColumn && (
                          <div className="mt-2">
                            <Chip color="primary" variant="flat" size="sm">
                              Buscador de fecha activo: {dateSearchColumn}
                            </Chip>
                          </div>
                        )}
                      </div>

                      {/* Buscador por texto/número */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">
                          🔍 Buscador por texto/número
                        </h5>
                        <p className="text-xs text-gray-600 mb-3">
                          Selecciona las columnas donde se podrá buscar texto o números
                        </p>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-xs text-gray-600">
                            Selecciona las columnas para búsqueda
                          </p>
                          <Button
                            isAdmin
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => {
                              const allSelected = textSearchColumns.length === selectedColumns.length;
                              handleTextSearchColumnsChange(allSelected ? [] : selectedColumns);
                            }}
                          >
                            {textSearchColumns.length === selectedColumns.length ? "Ninguna" : "Todas"}
                          </Button>
                        </div>
                        <CheckboxGroup
                          value={textSearchColumns}
                          onValueChange={handleTextSearchColumnsChange}
                          classNames={{
                            base: "w-full",
                          }}
                        >
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {selectedColumns.map((column) => (
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
                        {textSearchColumns.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">
                              Columnas seleccionadas ({textSearchColumns.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {textSearchColumns.map((column) => (
                                <Chip
                                  key={column}
                                  onClose={() => {
                                    handleTextSearchColumnsChange(
                                      textSearchColumns.filter(c => c !== column)
                                    );
                                  }}
                                  variant="flat"
                                  color="primary"
                                  size="sm"
                                >
                                  {column}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acordeón: Filtros de datos */}
            {selectedColumns.length > 0 && (
              <div>
                <div className="border rounded-lg bg-white">
                  {/* Header del acordeón de filtros */}
                  <button
                    type="button"
                    onClick={() => setShowFilterSelection(!showFilterSelection)}
                    className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="text-sm font-semibold text-gray-700">
                      4. Configura filtros (opcional)
                    </h4>
                    <span className="text-gray-500">
                      {showFilterSelection ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Contenido del acordeón de filtros */}
                  {showFilterSelection && (
                    <div className="p-4 border-t bg-gray-50">
                      <p className="text-xs text-gray-600 mb-4">
                        Selecciona una columna e ingresa el valor para filtrar los datos
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
                          }}
                          classNames={{
                            label: "!text-[#265197]",
                            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
                            trigger: "bg-white !border-[#D4DEED]",
                            selectorIcon: "text-[#678CC5]",
                          }}
                        >
                          {selectedColumns.map((column) => (
                            <SelectItem key={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </Select>

                        {/* Input de valor */}
                        <InputCitricaAdmin
                          label="Valor"
                          placeholder="Ingresa el valor del filtro"
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          isDisabled={!selectedFilterColumn}
                        />
                      </div>

                      {/* Botón para configurar filtro */}
                      <Button
                        isAdmin
                        className="bg-[#42668A] text-white w-full mb-4"
                        onClick={handleSetFilter}
                        isDisabled={!selectedFilterColumn || !filterValue.trim()}
                      >
                        {filter ? "Actualizar Filtro" : "Configurar Filtro"}
                      </Button>

                      {/* Filtro configurado */}
                      {filter && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-600 mb-2 font-medium">
                            Filtro configurado:
                          </p>
                          <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                            <span className="text-sm text-gray-700">
                              <strong>{filter.column}</strong> = {filter.value}
                            </span>
                            <Button
                              isAdmin
                              size="sm"
                              color="danger"
                              onPress={() => handleRemoveFilter()}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
    </DrawerCitricaAdmin>
  );
}
