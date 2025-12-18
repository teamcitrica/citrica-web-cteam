"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { useSupabase } from "@/shared/context/supabase-context";
import { useUserAssets } from "@/hooks/user-assets/use-user-assets";
import { Spinner, DateRangePicker, Chip, Input } from "@heroui/react";
import { Col, Container } from "@/styles/07-objects/objects";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { parseDate } from "@internationalized/date";

interface ExternalTableData {
  [key: string]: any;
}

interface ColumnWithAlias {
  field: string;
  alias: string;
  visible: boolean;
}

export default function AssetDataPage() {
  const params = useParams();
  const assetId = params.assetId as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tableData, setTableData] = useState<ExternalTableData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
  const [isExporting, setIsExporting] = useState(false);
  const { supabase } = useSupabase();

  // Estados para buscadores personalizados
  const [textSearchValue, setTextSearchValue] = useState("");
  const [textSearchInput, setTextSearchInput] = useState(""); // Para el input sin debounce
  const [dateRange, setDateRange] = useState<{start: any, end: any} | null>(null);

  // Debounce para el buscador de texto
  useEffect(() => {
    const timer = setTimeout(() => {
      setTextSearchValue(textSearchInput);
      if (textSearchInput !== textSearchValue) {
        setCurrentPage(1);
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [textSearchInput]);

  // Obtener el usuario actual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    getCurrentUser();
  }, [supabase]);

  // Obtener los assets del usuario
  const { assets, isLoading: isLoadingAssets } = useUserAssets(currentUser?.id);

  // Cargar datos de la tabla externa cuando se tiene el assetId
  useEffect(() => {
    const fetchExternalData = async () => {
      if (!assetId || !assets.length) {
        setTableData([]);
        setColumns([]);
        return;
      }

      const selectedAsset = assets.find((a) => a.id === assetId);
      if (!selectedAsset) {
        console.error("Asset no encontrado");
        return;
      }

      if (
        !selectedAsset.supabase_url ||
        !selectedAsset.supabase_anon_key ||
        !selectedAsset.tabla
      ) {
        console.error("Asset incompleto:", selectedAsset);
        return;
      }

      try {
        setIsLoadingData(true);

        const cleanUrl = selectedAsset.supabase_url.replace(/\/$/, "");

        // Detectar formato de columnas (nuevo con alias o antiguo)
        const columnsConfig: (ColumnWithAlias | string)[] = selectedAsset.assets_options?.columns || ["*"];
        let columnsToSelect: string[];

        if (columnsConfig.length > 0 && typeof columnsConfig[0] === 'object') {
          // Formato nuevo: array de objetos con alias
          columnsToSelect = (columnsConfig as ColumnWithAlias[]).map((col) => col.field);
        } else {
          // Formato antiguo: array de strings
          columnsToSelect = columnsConfig as string[];
        }

        const selectQuery = columnsToSelect.join(",");

        // Construir filtros desde assets_options (soportar formato antiguo y nuevo)
        const filter = selectedAsset.assets_options?.filter || null;
        const filters = selectedAsset.assets_options?.filters || [];
        let filterQuery = "";

        // Priorizar formato nuevo (filter único)
        if (filter) {
          filterQuery = `&${filter.column}=eq.${filter.value}`;
        } else if (filters.length > 0) {
          // Formato antiguo (array de filtros)
          const filterParams = filters.map((f: any) =>
            `${f.column}=eq.${f.value}`
          ).join("&");
          filterQuery = `&${filterParams}`;
        }

        // Calcular offset para la paginación
        const offset = (currentPage - 1) * pageSize;
        const paginationQuery = `&limit=${pageSize}&offset=${offset}`;

        // Obtener configuración de búsqueda
        const searchConfig = selectedAsset.assets_options?.searchConfig;
        const textColumns = searchConfig?.textColumns || [];
        const dateColumn = searchConfig?.dateColumn || null;

        // Búsqueda por texto en backend usando operador 'or' de PostgREST
        let textSearchQuery = "";
        if (textSearchValue && textSearchValue.trim() && textColumns.length > 0) {
          const searchTerm = textSearchValue.trim();

          // Separar columnas de texto y numéricas
          // Las columnas que terminan con _id, id, o contienen números son consideradas numéricas
          const numericColumns = textColumns.filter((col: string) =>
            col === 'id' || col.endsWith('_id') || col.match(/^(number|count|total|amount)/i)
          );
          const textOnlyColumns = textColumns.filter((col: string) =>
            !numericColumns.includes(col)
          );

          const orConditions: string[] = [];

          // Agregar búsqueda ilike solo para columnas de texto
          if (textOnlyColumns.length > 0) {
            textOnlyColumns.forEach((col: string) => {
              orConditions.push(`${col}.ilike.*${searchTerm}*`);
            });
          }

          // Si el término de búsqueda es numérico, agregar búsqueda exacta en columnas numéricas
          if (!isNaN(Number(searchTerm)) && numericColumns.length > 0) {
            numericColumns.forEach((col: string) => {
              orConditions.push(`${col}.eq.${searchTerm}`);
            });
          }

          if (orConditions.length > 0) {
            textSearchQuery = `&or=(${orConditions.join(',')})`;
          }
        }

        // Búsqueda por rango de fechas
        let dateSearchQuery = "";
        if (dateRange && dateColumn) {
          const startDate = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day).toISOString();
          const endDate = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day, 23, 59, 59).toISOString();
          dateSearchQuery = `&${dateColumn}=gte.${startDate}&${dateColumn}=lte.${endDate}`;
        }

        // Ordenamiento
        let orderQuery = "";
        if (sortColumn) {
          const direction = sortDirection === "ascending" ? "asc" : "desc";
          orderQuery = `&order=${sortColumn}.${direction}`;
        }

        // Fetch de la tabla externa con filtros, búsqueda, ordenamiento y paginación
        const fetchUrl = `${cleanUrl}/rest/v1/${selectedAsset.tabla}?select=${selectQuery}${filterQuery}${textSearchQuery}${dateSearchQuery}${orderQuery}${paginationQuery}`;

        const response = await fetch(
          fetchUrl,
          {
            method: "GET",
            headers: {
              apikey: selectedAsset.supabase_anon_key,
              Authorization: `Bearer ${selectedAsset.supabase_anon_key}`,
              "Content-Type": "application/json",
              "Prefer": "count=exact"
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        // Obtener el total de registros del header Content-Range
        const contentRange = response.headers.get("content-range");
        if (contentRange) {
          const total = parseInt(contentRange.split("/")[1], 10);
          setTotalRecords(total);
        }

        const data = await response.json();
        setTableData(data || []);

        // Generar columnas dinámicamente
        if (data && data.length > 0) {
          const dynamicColumns = columnsToSelect.map((col) => {
            // Obtener el alias si existe
            let columnName = col.toUpperCase().replace(/_/g, " ");

            if (columnsConfig.length > 0 && typeof columnsConfig[0] === 'object') {
              // Buscar el alias en la configuración
              const columnConfig = (columnsConfig as ColumnWithAlias[]).find((c) => c.field === col);
              if (columnConfig && columnConfig.alias) {
                columnName = columnConfig.alias;
              }
            }

            return {
              name: columnName,
              uid: col,
              sortable: true,
              render: (row: ExternalTableData) => {
                const value = row[col];

              // Formatear fechas
              if (col.includes("_at") || col.includes("date")) {
                if (value) {
                  return (
                    <div className="text-black font-medium">
                      {new Date(value).toLocaleString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  );
                }
                return <div className="text-black font-medium">-</div>;
              }

              // Formatear valores nulos
              if (value === null || value === undefined) {
                return <div className="text-black font-medium">-</div>;
              }

              // Formatear booleanos
              if (typeof value === "boolean") {
                return (
                  <div className="text-black font-medium">
                    {value ? "Sí" : "No"}
                  </div>
                );
              }

              // Formatear objetos/arrays como JSON
              if (typeof value === "object") {
                return (
                  <div className="text-black font-medium">
                    {JSON.stringify(value)}
                  </div>
                );
              }

              // Formatear URLs con truncado
              if (col.toLowerCase().includes("url") || col.toLowerCase().includes("image")) {
                return (
                  <div className="text-black font-medium max-w-[200px] truncate cursor-pointer select-text" title={String(value)}>
                    {String(value)}
                  </div>
                );
              }

              return (
                <div className="text-black font-medium">{String(value)}</div>
              );
            },
          };
        });

          setColumns(dynamicColumns);
        }
      } catch (err: any) {
        console.error("Error al obtener datos de la tabla externa:", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExternalData();
  }, [assetId, assets, supabase, currentPage, pageSize, searchValue, sortColumn, sortDirection, textSearchValue, dateRange]);

  const selectedAsset = assets.find((a) => a.id === assetId);
  const isLoading = isLoadingAssets || !currentUser || isLoadingData;

  // Función para obtener TODOS los datos del backend para exportar
  const fetchAllDataForExport = async () => {
    if (!selectedAsset || !selectedAsset.supabase_url || !selectedAsset.supabase_anon_key || !selectedAsset.tabla) {
      return [];
    }

    try {
      const cleanUrl = selectedAsset.supabase_url.replace(/\/$/, "");

      // Detectar formato de columnas (nuevo con alias o antiguo)
      const columnsConfig: (ColumnWithAlias | string)[] = selectedAsset.assets_options?.columns || ["*"];
      let columnsToSelect: string[];

      if (columnsConfig.length > 0 && typeof columnsConfig[0] === 'object') {
        // Formato nuevo: array de objetos con alias
        columnsToSelect = (columnsConfig as ColumnWithAlias[]).map((col) => col.field);
      } else {
        // Formato antiguo: array de strings
        columnsToSelect = columnsConfig as string[];
      }

      const selectQuery = columnsToSelect.join(",");

      // Construir filtros desde assets_options (soportar formato antiguo y nuevo)
      const filter = selectedAsset.assets_options?.filter || null;
      const filters = selectedAsset.assets_options?.filters || [];
      let filterQuery = "";

      // Priorizar formato nuevo (filter único)
      if (filter) {
        filterQuery = `&${filter.column}=eq.${filter.value}`;
      } else if (filters.length > 0) {
        // Formato antiguo (array de filtros)
        const filterParams = filters.map((f: any) =>
          `${f.column}=eq.${f.value}`
        ).join("&");
        filterQuery = `&${filterParams}`;
      }

      // Obtener configuración de búsqueda
      const searchConfig = selectedAsset.assets_options?.searchConfig;
      const textColumns = searchConfig?.textColumns || [];
      const dateColumn = searchConfig?.dateColumn || null;

      // Búsqueda por texto en backend usando operador 'or' de PostgREST
      let textSearchQuery = "";
      if (textSearchValue && textSearchValue.trim() && textColumns.length > 0) {
        const searchTerm = textSearchValue.trim();

        // Separar columnas de texto y numéricas
        const numericColumns = textColumns.filter((col: string) =>
          col === 'id' || col.endsWith('_id') || col.match(/^(number|count|total|amount)/i)
        );
        const textOnlyColumns = textColumns.filter((col: string) =>
          !numericColumns.includes(col)
        );

        const orConditions: string[] = [];

        // Agregar búsqueda ilike solo para columnas de texto
        if (textOnlyColumns.length > 0) {
          textOnlyColumns.forEach((col: string) => {
            orConditions.push(`${col}.ilike.*${searchTerm}*`);
          });
        }

        // Si el término de búsqueda es numérico, agregar búsqueda exacta en columnas numéricas
        if (!isNaN(Number(searchTerm)) && numericColumns.length > 0) {
          numericColumns.forEach((col: string) => {
            orConditions.push(`${col}.eq.${searchTerm}`);
          });
        }

        if (orConditions.length > 0) {
          textSearchQuery = `&or=(${orConditions.join(',')})`;
        }
      }

      // Búsqueda por rango de fechas
      let dateSearchQuery = "";
      if (dateRange && dateColumn) {
        const startDate = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day).toISOString();
        const endDate = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day, 23, 59, 59).toISOString();
        dateSearchQuery = `&${dateColumn}=gte.${startDate}&${dateColumn}=lte.${endDate}`;
      }

      // Ordenamiento
      let orderQuery = "";
      if (sortColumn) {
        const direction = sortDirection === "ascending" ? "asc" : "desc";
        orderQuery = `&order=${sortColumn}.${direction}`;
      }

      // Obtener todos los datos en múltiples peticiones (límite de Supabase: 1000 por petición)
      const allData: any[] = [];
      const pageSize = 1000;
      let offset = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        const paginationQuery = `&limit=${pageSize}&offset=${offset}`;

        const response = await fetch(
          `${cleanUrl}/rest/v1/${selectedAsset.tabla}?select=${selectQuery}${filterQuery}${textSearchQuery}${dateSearchQuery}${orderQuery}${paginationQuery}`,
          {
            method: "GET",
            headers: {
              apikey: selectedAsset.supabase_anon_key,
              Authorization: `Bearer ${selectedAsset.supabase_anon_key}`,
              "Content-Type": "application/json",
              "Prefer": "count=exact"
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error en la respuesta:", response.status, errorText);
          throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          allData.push(...data);
          offset += pageSize;

          // Si recibimos menos datos que el pageSize, ya no hay más datos
          if (data.length < pageSize) {
            hasMoreData = false;
          }
        } else {
          hasMoreData = false;
        }
      }

      return allData;
    } catch (err: any) {
      console.error("Error al obtener todos los datos para exportar:", err);
      return [];
    }
  };

  // Función para formatear valores según el tipo de columna
  const formatCellValue = (value: any, columnUid: string): string => {
    // Formatear fechas
    if (columnUid.includes("_at") || columnUid.includes("date")) {
      if (value) {
        return new Date(value).toLocaleString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return "-";
    }

    // Formatear valores nulos
    if (value === null || value === undefined) {
      return "-";
    }

    // Formatear booleanos
    if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    }

    // Formatear objetos/arrays como JSON
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // Función para exportar datos
  const handleExport = async (exportFormat: string, fileName: string) => {
    try {
      setIsExporting(true);
      const allData = await fetchAllDataForExport();

      if (allData.length === 0) {
        alert("No hay datos para exportar");
        return;
      }

      console.log(`Exportando ${allData.length} registros...`);

    // Preparar datos para exportar
    const dataToExport = allData.map((item: ExternalTableData) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        row[col.name] = formatCellValue(item[col.uid], col.uid);
      });
      return row;
    });

    // Función auxiliar para descargar archivos
    const downloadFile = (data: Blob, filename: string) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    };

    switch (exportFormat) {
      case "excel":
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Datos");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const excelData = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadFile(excelData, `${fileName}.xlsx`);
        break;

      case "csv":
        const csvWs = XLSX.utils.json_to_sheet(dataToExport);
        const csv = XLSX.utils.sheet_to_csv(csvWs);
        const csvData = new Blob([csv], { type: "text/csv" });
        downloadFile(csvData, `${fileName}.csv`);
        break;

      case "pdf":
        const doc = new jsPDF();

        // Título
        doc.setFontSize(16);
        doc.text(selectedAsset?.name || "Mis Datos", 14, 20);

        // Fecha
        doc.setFontSize(10);
        doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy")}`, 14, 30);

        // Datos de la tabla
        const tableData = allData.map((item: ExternalTableData) =>
          columns.map((col) => formatCellValue(item[col.uid], col.uid))
        );

        autoTable(doc, {
          head: [columns.map((col) => col.name)],
          body: tableData,
          startY: 40,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [94, 166, 103],
            textColor: 255,
          },
        });

        doc.save(`${fileName}.pdf`);
        break;
    }
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar los datos. Por favor intenta de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          {/* Breadcrumb similar a contactos */}
          {selectedAsset && (
            <h1 className="text-2xl font-bold text-[#265197] mb-6">
              <span className="text-[#678CC5]">Proyectos</span> {'>'} {selectedAsset.name || "Sin nombre"}
            </h1>
          )}

          {/* Mostrar mensaje de error si no existe el asset */}
          {!isLoading && !selectedAsset ? (
            <p className="text-gray-600">
              El asset seleccionado no existe o no tienes acceso a él.
            </p>
          ) : (
            <>
              {isExporting && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700 font-medium">
                    Exportando {totalRecords} registros... Por favor espera.
                  </p>
                </div>
              )}

              {/* Buscadores personalizados */}
              {selectedAsset && selectedAsset.assets_options?.searchConfig && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Buscador por texto/número */}
                    {selectedAsset.assets_options.searchConfig.textColumns &&
                     selectedAsset.assets_options.searchConfig.textColumns.length > 0 && (
                      <div>
                        <Input
                          type="text"
                          label="Buscar por texto/número"
                          labelPlacement="inside"
                          placeholder={`Buscar en: ${selectedAsset.assets_options.searchConfig.textColumns.join(", ")}`}
                          value={textSearchInput}
                          onValueChange={setTextSearchInput}
                          isClearable
                          startContent={
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          }
                          classNames={{
                            base: "w-full",
                            label: "!text-[#265197] font-medium",
                            inputWrapper: "bg-white border-[#D4DEED]",
                            input: "!text-[#265197]",
                          }}
                          description="Escribe para buscar (búsqueda automática después de 0.5s)"
                        />
                      </div>
                    )}

                    {/* Buscador por fecha */}
                    {selectedAsset.assets_options.searchConfig.dateColumn && (
                      <div>
                        <DateRangePicker
                          label="Buscar por rango de fechas"
                          labelPlacement="inside"
                          aria-label="Buscar por rango de fechas"
                          value={dateRange}
                          onChange={(value) => {
                            setDateRange(value);
                            setCurrentPage(1);
                          }}
                          classNames={{
                            base: "w-full",
                            label: "!text-[#265197] font-medium mb-1",
                            inputWrapper: "bg-white !border-[#D4DEED]",
                            input: "!text-[#265197]",
                          }}
                          description={`Columna: ${selectedAsset.assets_options.searchConfig.dateColumn}`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Indicadores de filtros activos */}
                  <div className="space-y-2">
                    {/* Filtro permanente del asset */}
                    {(selectedAsset.assets_options?.filter ||
                      (selectedAsset.assets_options?.filters && selectedAsset.assets_options.filters.length > 0)) && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Filtro activo:</span>
                        {selectedAsset.assets_options?.filter ? (
                          <Chip color="default"  variant="flat" size="sm">
                            {selectedAsset.assets_options.filter.column} = {selectedAsset.assets_options.filter.value}
                          </Chip>
                        ) : (
                          selectedAsset.assets_options?.filters?.map((filter: any, index: number) => (
                            <Chip key={index} color="default" variant="flat" size="sm">
                              {filter.column} = {filter.value}
                            </Chip>
                          ))
                        )}
                      </div>
                    )}

                    {/* Buscadores activos */}
                    {(textSearchValue || dateRange) && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600 font-medium">Búsqueda activa:</span>
                        {textSearchValue && (
                          <Chip
                           color="default" 
                            variant="flat"
                            size="sm"
                            onClose={() => {
                              setTextSearchInput("");
                              setTextSearchValue("");
                              setCurrentPage(1);
                            }}
                          >
                            Texto: "{textSearchValue}"
                          </Chip>
                        )}
                        {dateRange && (
                          <Chip
                            color="default" 
                            variant="flat"
                            size="sm"
                            onClose={() => {
                              setDateRange(null);
                              setCurrentPage(1);
                            }}
                          >
                            Fecha: {dateRange.start.day}/{dateRange.start.month}/{dateRange.start.year} - {dateRange.end.day}/{dateRange.end.month}/{dateRange.end.year}
                          </Chip>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DataTable
                data={tableData}
                columns={columns.length > 0 ? columns : [{ name: "CARGANDO", uid: "loading", sortable: false }]}
                isLoading={isLoading}
                paginationColor="#42668A"
                headerColor="#42668A"
                headerTextColor="#ffffff"
                searchPlaceholder="Buscar..."
                getRowKey={(item) => item.id || JSON.stringify(item)}
                searchFields={columns.map(col => col.uid as any)}
                emptyContent="No hay datos disponibles en esta tabla."
                serverSidePagination={true}
                totalRecords={totalRecords}
                currentPage={currentPage}
                itemsPerPage={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1); // Resetear a la primera página cuando cambia el tamaño
                }}
                // Exportación
                enableExport={true}
                exportColumns={[]} // No necesario, usamos onExport custom
                tableName={selectedAsset?.name || "mis-datos"}
                onExport={handleExport}
                // Búsqueda del servidor
                onSearchChange={(value) => {
                  setSearchValue(value);
                  setCurrentPage(1); // Resetear a la primera página cuando se busca
                }}
                searchValue={searchValue}
                // Ordenamiento del servidor
                onSortChange={(column, direction) => {
                  setSortColumn(column);
                  setSortDirection(direction);
                  setCurrentPage(1); // Resetear a la primera página cuando se ordena
                }}
              />
            </>
          )}
        </div>
      </Col>
    </Container>
  );
}
