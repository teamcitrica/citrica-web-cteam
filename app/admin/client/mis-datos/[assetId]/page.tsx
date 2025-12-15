"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { useSupabase } from "@/shared/context/supabase-context";
import { useUserAssets } from "@/hooks/user-assets/use-user-assets";
import { Spinner } from "@heroui/react";
import { Col, Container } from "@/styles/07-objects/objects";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ExternalTableData {
  [key: string]: any;
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
        const columnsToSelect = selectedAsset.assets_options?.columns || ["*"];
        const selectQuery = columnsToSelect.join(",");

        // Construir filtros desde assets_options
        const filters = selectedAsset.assets_options?.filters || [];
        let filterQuery = "";
        if (filters.length > 0) {
          const filterParams = filters.map((filter: any) =>
            `${filter.column}=eq.${filter.value}`
          ).join("&");
          filterQuery = `&${filterParams}`;
        }

        // Calcular offset para la paginación
        const offset = (currentPage - 1) * pageSize;
        const paginationQuery = `&limit=${pageSize}&offset=${offset}`;

        // Búsqueda en el backend (ilike para búsqueda insensible a mayúsculas)
        let searchQuery = "";
        if (searchValue && columnsToSelect.length > 0) {
          const searchConditions = columnsToSelect
            .map((col) => `${col}.ilike.*${searchValue}*`)
            .join(",");
          searchQuery = `&or=(${searchConditions})`;
        }

        // Ordenamiento
        let orderQuery = "";
        if (sortColumn) {
          const direction = sortDirection === "ascending" ? "asc" : "desc";
          orderQuery = `&order=${sortColumn}.${direction}`;
        }

        // Fetch de la tabla externa con filtros, búsqueda, ordenamiento y paginación
        const response = await fetch(
          `${cleanUrl}/rest/v1/${selectedAsset.tabla}?select=${selectQuery}${filterQuery}${searchQuery}${orderQuery}${paginationQuery}`,
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
          const dynamicColumns = columnsToSelect.map((col) => ({
            name: col.toUpperCase().replace(/_/g, " "),
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

              return (
                <div className="text-black font-medium">{String(value)}</div>
              );
            },
          }));

          setColumns(dynamicColumns);
        }
      } catch (err: any) {
        console.error("Error al obtener datos de la tabla externa:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExternalData();
  }, [assetId, assets, supabase, currentPage, pageSize, searchValue, sortColumn, sortDirection]);

  const selectedAsset = assets.find((a) => a.id === assetId);
  const isLoading = isLoadingAssets || !currentUser || isLoadingData;

  // Función para obtener TODOS los datos del backend para exportar
  const fetchAllDataForExport = async () => {
    if (!selectedAsset || !selectedAsset.supabase_url || !selectedAsset.supabase_anon_key || !selectedAsset.tabla) {
      return [];
    }

    try {
      const cleanUrl = selectedAsset.supabase_url.replace(/\/$/, "");
      const columnsToSelect = selectedAsset.assets_options?.columns || ["*"];
      const selectQuery = columnsToSelect.join(",");

      // Construir filtros desde assets_options
      const filters = selectedAsset.assets_options?.filters || [];
      let filterQuery = "";
      if (filters.length > 0) {
        const filterParams = filters.map((filter: any) =>
          `${filter.column}=eq.${filter.value}`
        ).join("&");
        filterQuery = `&${filterParams}`;
      }

      // Búsqueda en el backend
      let searchQuery = "";
      if (searchValue && columnsToSelect.length > 0) {
        const searchConditions = columnsToSelect
          .map((col) => `${col}.ilike.*${searchValue}*`)
          .join(",");
        searchQuery = `&or=(${searchConditions})`;
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
          `${cleanUrl}/rest/v1/${selectedAsset.tabla}?select=${selectQuery}${filterQuery}${searchQuery}${orderQuery}${paginationQuery}`,
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
        doc.setFontSize(16);
        doc.text(selectedAsset?.name || "Mis Datos", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy")}`, 14, 30);

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
            fillColor: [66, 102, 138],
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
          <h1 className="text-2xl font-bold text-[#265197] mb-6">
            Mis Datos
          </h1>

          {/* Título del asset seleccionado */}
          {selectedAsset && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#265197]">
                {selectedAsset.name || "Sin nombre"}
              </h2>
              <p className="text-sm text-[#678CC5]">
                Proyecto: {selectedAsset.project_name || "Sin proyecto"}
              </p>
              <p className="text-sm font-medium text-[#265197] mt-2">
                Total de registros: {totalRecords}
              </p>
            </div>
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

              {/* Tabla de datos */}
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
