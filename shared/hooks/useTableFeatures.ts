"use client";
import { useState, useCallback, useMemo } from "react";
import { SortDescriptor } from "@heroui/react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

type UseTableFeaturesOptions<T> = {
  data: T[];
  initialRowsPerPage?: number;
  searchFields?: (keyof T)[];
  defaultSortColumn?: keyof T;
  defaultSortDirection?: "ascending" | "descending";
  companyFilterField?: keyof T;
};

export type ExportColumn = {
  header: string;
  key: string;
  format?: (value: any, row?: any) => string;
};

export function useTableFeatures<T extends Record<string, any>>({
  data,
  initialRowsPerPage = 15,
  searchFields = [],
  defaultSortColumn,
  defaultSortDirection = "ascending",
  companyFilterField,
}: UseTableFeaturesOptions<T>) {
  // Estados de búsqueda y filtrado
  const [filterValue, setFilterValue] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Estados de ordenamiento
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: defaultSortColumn as string,
    direction: defaultSortDirection,
  });

  // Estados de exportación
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("");
  const [fileName, setFileName] = useState("");

  // Búsqueda global en múltiples campos y filtro de empresa
  const hasSearchFilter = Boolean(filterValue);
  const hasCompanyFilter = Boolean(companyFilter);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    let filtered = [...data];

    // Filtro por búsqueda de texto
    if (hasSearchFilter && searchFields.length > 0) {
      filtered = filtered.filter((item) => {
        const searchLower = filterValue.toLowerCase();
        return searchFields.some((field) => {
          const value = item[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Filtro por empresa
    if (hasCompanyFilter && companyFilterField && companyFilter !== "all") {
      filtered = filtered.filter((item) => {
        const companyId = item[companyFilterField];
        // Comparar como string o número
        return String(companyId) === String(companyFilter) || Number(companyId) === Number(companyFilter);
      });
    }

    return filtered;
  }, [data, filterValue, hasSearchFilter, searchFields, companyFilter, hasCompanyFilter, companyFilterField]);

  // Ordenamiento
  const sortedItems = useMemo(() => {
    if (!sortDescriptor.column) return filteredItems;

    return [...filteredItems].sort((a: T, b: T) => {
      const column = sortDescriptor.column as keyof T;
      let first = a[column];
      let second = b[column];

      // Manejar valores null/undefined
      if (first === null || first === undefined) first = "" as any;
      if (second === null || second === undefined) second = "" as any;

      // Comparación por tipo
      if (typeof first === "string" && typeof second === "string") {
        const cmp = first.localeCompare(second);
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  // Paginación
  const pages = Math.ceil(sortedItems.length / rowsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [page, sortedItems, rowsPerPage]);

  // Handlers de búsqueda
  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  // Handler de filtro de empresa
  const onCompanyFilterChange = useCallback((keys: any) => {
    const selectedKey = Array.from(keys)[0];
    const keyValue = selectedKey ? String(selectedKey) : "";
    setCompanyFilter(keyValue === "all" ? "" : keyValue);
    setPage(1);
  }, []);

  const onClearCompanyFilter = useCallback(() => {
    setCompanyFilter("");
    setPage(1);
  }, []);

  // Handlers de paginación
  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  // Función para obtener nombre por defecto
  const getDefaultFileName = (tableName: string) => {
    const today = format(new Date(), "dd-MM-yyyy");
    return `${tableName}_${today}`;
  };

  // Función para descargar archivo
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

  // Exportación a Excel
  const exportToExcel = (customFileName: string, columns: ExportColumn[]) => {
    const dataToExport = filteredItems.map((item) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        const value = item[col.key];
        row[col.header] = col.format ? col.format(value, item) : value ?? "";
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadFile(data, `${customFileName}.xlsx`);
  };

  // Exportación a CSV
  const exportToCSV = (customFileName: string, columns: ExportColumn[]) => {
    const dataToExport = filteredItems.map((item) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        const value = item[col.key];
        row[col.header] = col.format ? col.format(value, item) : value ?? "";
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const data = new Blob([csv], { type: "text/csv" });
    downloadFile(data, `${customFileName}.csv`);
  };

  // Exportación a PDF
  const exportToPDF = (
    customFileName: string,
    columns: ExportColumn[],
    title: string
  ) => {
    // Determinar orientación según número de columnas
    const orientation = columns.length > 6 ? 'landscape' : 'portrait';
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Calcular tamaño de fuente dinámico según número de columnas
    const baseFontSize = columns.length > 20 ? 4 : columns.length > 15 ? 5 : columns.length > 10 ? 6 : columns.length > 6 ? 7 : 8;

    // Si hay demasiadas columnas, dividir en múltiples tablas
    const maxColumnsPerPage = orientation === 'landscape' ? 18 : 12;

    if (columns.length > maxColumnsPerPage) {
      // Dividir columnas en grupos
      const columnGroups: ExportColumn[][] = [];
      for (let i = 0; i < columns.length; i += maxColumnsPerPage) {
        columnGroups.push(columns.slice(i, i + maxColumnsPerPage));
      }

      // Generar una página por cada grupo de columnas
      columnGroups.forEach((columnGroup, groupIndex) => {
        if (groupIndex > 0) {
          doc.addPage();
        }

        // Título
        doc.setFontSize(16);
        doc.text(title, 14, 20);

        // Subtítulo indicando la sección
        doc.setFontSize(10);
        doc.text(`Parte ${groupIndex + 1} de ${columnGroups.length}`, 14, 27);
        doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy")}`, 14, 34);

        // Datos de la tabla para este grupo de columnas
        const tableData = filteredItems.map((item) =>
          columnGroup.map((col) => {
            const value = item[col.key];
            return col.format ? col.format(value, item) : String(value ?? "");
          })
        );

        autoTable(doc, {
          head: [columnGroup.map((col) => col.header)],
          body: tableData,
          startY: 42,
          styles: {
            fontSize: baseFontSize,
            cellPadding: columnGroup.length > 15 ? 1 : 1.5,
            overflow: 'linebreak',
            cellWidth: 'auto',
            minCellHeight: columnGroup.length > 15 ? 5 : 6,
            halign: 'left',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [38, 81, 151], // Color azul #265197
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            minCellHeight: columnGroup.length > 15 ? 6 : 8,
            fontSize: baseFontSize,
          },
          tableWidth: 'auto',
          margin: { left: 5, right: 5 },
          theme: 'grid',
        });
      });
    } else {
      // Tabla normal sin división
      // Título
      doc.setFontSize(16);
      doc.text(title, 14, 20);

      // Fecha
      doc.setFontSize(10);
      doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy")}`, 14, 30);

      // Datos de la tabla
      const tableData = filteredItems.map((item) =>
        columns.map((col) => {
          const value = item[col.key];
          return col.format ? col.format(value, item) : String(value ?? "");
        })
      );

      autoTable(doc, {
        head: [columns.map((col) => col.header)],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: baseFontSize,
          cellPadding: columns.length > 15 ? 1 : 1.5,
          overflow: 'linebreak',
          cellWidth: 'auto',
          minCellHeight: columns.length > 15 ? 5 : 6,
          halign: 'left',
          valign: 'middle',
        },
        headStyles: {
          fillColor: [38, 81, 151], // Color azul #265197
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          minCellHeight: columns.length > 15 ? 6 : 8,
          fontSize: baseFontSize,
        },
        tableWidth: 'auto',
        margin: { left: 5, right: 5 },
        theme: 'grid',
      });
    }

    doc.save(`${customFileName}.pdf`);
  };

  // Abrir modal de exportación
  const handleOpenExportModal = (format: string, tableName: string) => {
    setExportFormat(format);
    setFileName(getDefaultFileName(tableName));
    setIsExportModalOpen(true);
  };

  // Confirmar exportación
  const handleConfirmExport = (columns: ExportColumn[], pdfTitle: string) => {
    if (!fileName.trim()) return;

    switch (exportFormat) {
      case "excel":
        exportToExcel(fileName, columns);
        break;
      case "csv":
        exportToCSV(fileName, columns);
        break;
      // case "pdf":
      //   exportToPDF(fileName, columns, pdfTitle);
      //   break;
    }

    setIsExportModalOpen(false);
    setExportFormat("");
    setFileName("");
  };

  return {
    // Estados
    filterValue,
    companyFilter,
    page,
    rowsPerPage,
    sortDescriptor,
    isExportModalOpen,
    exportFormat,
    fileName,

    // Datos procesados
    filteredItems,
    sortedItems,
    paginatedItems,
    pages,
    hasSearchFilter,
    hasCompanyFilter,

    // Setters
    setFilterValue,
    setCompanyFilter,
    setPage,
    setRowsPerPage,
    setSortDescriptor,
    setIsExportModalOpen,
    setFileName,
    setExportFormat,

    // Handlers
    onSearchChange,
    onClear,
    onCompanyFilterChange,
    onClearCompanyFilter,
    onRowsPerPageChange,
    handleOpenExportModal,
    handleConfirmExport,
    getDefaultFileName,
  };
}
