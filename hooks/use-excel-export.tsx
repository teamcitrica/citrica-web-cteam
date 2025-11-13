"use client";
import * as XLSX from "xlsx";

/**
 * Opciones de configuración para la exportación a Excel
 */
export interface ExcelExportOptions {
  /** Datos a exportar (array de objetos) */
  data: any[];
  /** Nombre del archivo (sin extensión) - Por defecto: "export" */
  fileName?: string;
  /** Nombre de la hoja del Excel - Por defecto: "Datos" */
  sheetName?: string;
  /** Incluir fecha en el nombre del archivo - Por defecto: true */
  includeDateInFileName?: boolean;
  /** Formato de fecha para las columnas de fecha - Por defecto: "es-ES" */
  dateLocale?: string;
  /**
   * Mapeo personalizado de columnas (opcional)
   * Permite renombrar columnas y formatear valores
   * Ejemplo: { id: "ID", first_name: "NOMBRE" }
   */
  columnMapping?: Record<string, string>;
  /**
   * Función personalizada para formatear valores
   * Se ejecuta antes del formateo automático
   */
  customFormatter?: (key: string, value: any, row: any) => any;
  /**
   * Columnas a excluir de la exportación
   * Ejemplo: ["password", "token"]
   */
  excludeColumns?: string[];
}

/**
 * Hook reutilizable para exportar datos a Excel
 *
 * @example
 * // Uso básico
 * const { exportToExcel } = useExcelExport();
 *
 * const handleExport = () => {
 *   exportToExcel({
 *     data: users,
 *     fileName: "usuarios",
 *     sheetName: "Lista de Usuarios"
 *   });
 * };
 *
 * @example
 * // Con mapeo personalizado de columnas
 * const handleExport = () => {
 *   exportToExcel({
 *     data: products,
 *     fileName: "productos",
 *     columnMapping: {
 *       id: "ID",
 *       name: "NOMBRE",
 *       price: "PRECIO",
 *       created_at: "FECHA CREACIÓN"
 *     },
 *     excludeColumns: ["internal_code", "deleted_at"]
 *   });
 * };
 *
 * @example
 * // Con formateador personalizado
 * const handleExport = () => {
 *   exportToExcel({
 *     data: sales,
 *     fileName: "ventas",
 *     customFormatter: (key, value, row) => {
 *       // Formatear precios con símbolo de moneda
 *       if (key === "price" || key === "total") {
 *         return `$${value.toFixed(2)}`;
 *       }
 *       // Formatear booleanos
 *       if (typeof value === "boolean") {
 *         return value ? "Sí" : "No";
 *       }
 *       return value;
 *     }
 *   });
 * };
 */
export const useExcelExport = () => {
  /**
   * Detecta si una columna contiene fechas basándose en su nombre
   */
  const isDateColumn = (columnName: string): boolean => {
    const dateKeywords = [
      "date",
      "fecha",
      "created_at",
      "updated_at",
      "deleted_at",
      "birthdate",
      "bday",
      "birthday",
      "timestamp",
    ];
    const lowerColumnName = columnName.toLowerCase();
    return dateKeywords.some((keyword) => lowerColumnName.includes(keyword));
  };

  /**
   * Formatea una fecha a formato legible
   */
  const formatDateValue = (value: any, locale: string = "es-ES"): string => {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return value ?? "-";
    } catch {
      return value ?? "-";
    }
  };

  /**
   * Formatea un valor según su tipo
   */
  const formatValue = (
    key: string,
    value: any,
    dateLocale: string,
    customFormatter?: (key: string, value: any, row: any) => any,
    row?: any
  ): any => {
    // Si hay un formateador personalizado, usarlo primero
    if (customFormatter && row) {
      const customValue = customFormatter(key, value, row);
      if (customValue !== undefined && customValue !== value) {
        return customValue;
      }
    }

    // Si es una fecha, formatearla
    if (isDateColumn(key)) {
      return formatDateValue(value, dateLocale);
    }

    // Si es un objeto, convertir a JSON
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    // Si es un booleano, convertir a texto
    if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    }

    // Si es null o undefined, retornar "-"
    if (value === null || value === undefined) {
      return "-";
    }

    // Retornar el valor tal cual
    return value;
  };

  /**
   * Exporta datos a un archivo Excel
   */
  const exportToExcel = (options: ExcelExportOptions): void => {
    const {
      data,
      fileName = "export",
      sheetName = "Datos",
      includeDateInFileName = true,
      dateLocale = "es-ES",
      columnMapping,
      customFormatter,
      excludeColumns = [],
    } = options;

    // Validar que haya datos
    if (!data || data.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }

    // Preparar datos para exportación
    const dataToExport = data.map((row) => {
      const exportRow: any = {};

      // Procesar cada columna
      Object.keys(row).forEach((key) => {
        // Saltar columnas excluidas
        if (excludeColumns.includes(key)) {
          return;
        }

        const value = row[key];

        // Determinar el nombre de la columna (usar mapping o convertir a mayúsculas)
        const columnName = columnMapping?.[key] || key.toUpperCase();

        // Formatear el valor
        exportRow[columnName] = formatValue(
          key,
          value,
          dateLocale,
          customFormatter,
          row
        );
      });

      return exportRow;
    });

    // Crear worksheet (hoja de cálculo)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Ajustar ancho de columnas automáticamente
    const columnWidths = Object.keys(dataToExport[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...dataToExport.map((row) => String(row[key] || "").length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Máximo 50 caracteres de ancho
    });
    worksheet["!cols"] = columnWidths;

    // Crear workbook (libro de trabajo)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generar nombre del archivo
    const dateString = includeDateInFileName
      ? `_${new Date().toISOString().split("T")[0]}`
      : "";
    const fullFileName = `${fileName}${dateString}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(workbook, fullFileName);

    console.log(`✅ Archivo Excel generado: ${fullFileName}`);
  };

  /**
   * Exporta múltiples conjuntos de datos a un mismo archivo Excel
   * Cada conjunto de datos se exporta en una hoja diferente
   *
   * @example
   * exportMultipleSheets({
   *   fileName: "reporte_completo",
   *   sheets: [
   *     { data: users, sheetName: "Usuarios" },
   *     { data: products, sheetName: "Productos" },
   *     { data: sales, sheetName: "Ventas" }
   *   ]
   * });
   */
  const exportMultipleSheets = (config: {
    fileName: string;
    sheets: Array<{
      data: any[];
      sheetName: string;
      columnMapping?: Record<string, string>;
      excludeColumns?: string[];
    }>;
    includeDateInFileName?: boolean;
  }): void => {
    const { fileName, sheets, includeDateInFileName = true } = config;

    if (!sheets || sheets.length === 0) {
      console.warn("No hay hojas para exportar");
      return;
    }

    // Crear workbook
    const workbook = XLSX.utils.book_new();

    // Agregar cada hoja
    sheets.forEach((sheet) => {
      const { data, sheetName, columnMapping, excludeColumns = [] } = sheet;

      if (!data || data.length === 0) {
        console.warn(`No hay datos para la hoja: ${sheetName}`);
        return;
      }

      // Preparar datos
      const dataToExport = data.map((row) => {
        const exportRow: any = {};

        Object.keys(row).forEach((key) => {
          if (excludeColumns.includes(key)) return;

          const value = row[key];
          const columnName = columnMapping?.[key] || key.toUpperCase();
          exportRow[columnName] = formatValue(key, value, "es-ES");
        });

        return exportRow;
      });

      // Crear worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Ajustar ancho de columnas
      const columnWidths = Object.keys(dataToExport[0] || {}).map((key) => {
        const maxLength = Math.max(
          key.length,
          ...dataToExport.map((row) => String(row[key] || "").length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      worksheet["!cols"] = columnWidths;

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Generar nombre del archivo
    const dateString = includeDateInFileName
      ? `_${new Date().toISOString().split("T")[0]}`
      : "";
    const fullFileName = `${fileName}${dateString}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(workbook, fullFileName);

    console.log(`✅ Archivo Excel con múltiples hojas generado: ${fullFileName}`);
  };

  return {
    exportToExcel,
    exportMultipleSheets,
  };
};
