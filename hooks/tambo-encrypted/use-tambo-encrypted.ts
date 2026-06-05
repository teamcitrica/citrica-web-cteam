"use client";
import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { addToast } from "@heroui/toast";

import { UserAuth } from "@/shared/context/auth-context";
import { useExcelExport } from "@/hooks/use-excel-export";
import {
  Sorteo,
  tamboColumns,
  tamboExportConfig,
} from "@/app/admin/tambo-encrypted/columns/tambo-columns";

export type Filter = {
  id: string;
  column: string;
  operator: string;
  value: string;
};

type LocalSortDescriptor = {
  column: string;
  direction: "ascending" | "descending";
};

export const TAMBO_PAGE_SIZE = 10; // registros visibles por página
const PAGES_PER_BATCH = 10; // páginas que trae cada lote
const BATCH_SIZE = TAMBO_PAGE_SIZE * PAGES_PER_BATCH; // 150 registros por lote
// IMPORTANTE: NUNCA debe superar el `max-rows` de Supabase (default 1000). Si lo
// supera, la paginación por offset saltaría filas en silencio.
const EXPORT_BLOCK_SIZE = 500;

const FUNCTION_URL =
  "https://axndntqikmbldyodiwal.supabase.co/functions/v1/get-tambo-encrypted-data";

// Definición de operadores con símbolos
const ALL_OPERATORS = [
  { key: "eq", label: "=", numeric: true, text: true },
  { key: "neq", label: "≠", numeric: true, text: true },
  { key: "gt", label: ">", numeric: true, text: false },
  { key: "gte", label: "≥", numeric: true, text: false },
  { key: "lt", label: "<", numeric: true, text: false },
  { key: "lte", label: "≤", numeric: true, text: false },
  { key: "contains", label: "Contiene", numeric: false, text: true },
  { key: "not_contains", label: "No contiene", numeric: false, text: true },
  { key: "starts_with", label: "Empieza con", numeric: false, text: true },
  { key: "ends_with", label: "Termina con", numeric: false, text: true },
  { key: "is_null", label: "Es nulo", numeric: true, text: true },
  { key: "is_not_null", label: "No es nulo", numeric: true, text: true },
];

// Columnas numéricas que permiten operadores de comparación
const NUMERIC_COLUMNS = ["id", "pack_option"];

// Columnas por las que SÍ se puede filtrar en el servidor (deben ser columnas
// planas, no encriptadas, porque el filtro se aplica en la consulta SQL).
const FILTERABLE_COLUMNS = ["id", "campaign"];

// Operadores disponibles según el tipo de columna
const getOperatorsForColumn = (columnName: string) => {
  const isNumeric = NUMERIC_COLUMNS.includes(columnName);

  if (isNumeric) {
    return ALL_OPERATORS.filter((op) => op.numeric);
  } else {
    // Columnas de texto (como campaign): solo operadores de texto, sin null/not-null
    return ALL_OPERATORS.filter(
      (op) => op.text && op.key !== "is_null" && op.key !== "is_not_null",
    );
  }
};

export function useTamboEncrypted() {
  const { userSession } = UserAuth();
  const { exportToExcel } = useExcelExport();
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [exporting, setExporting] = useState(false); // descarga de Excel en curso

  const [filters, setFilters] = useState<Filter[]>([]);
  // Filtros aplicados en el servidor (van en el queryKey de React Query)
  const [appliedFilters, setAppliedFilters] = useState<Filter[]>([]);

  // Un filtro "cuenta" si tiene valor, o si su operador no necesita valor
  const isFilterActive = (f: Filter) =>
    f.value.trim() !== "" ||
    f.operator === "is_null" ||
    f.operator === "is_not_null";

  const [sortDescriptor, setSortDescriptor] = useState<LocalSortDescriptor>({
    column: "id",
    direction: "ascending",
  });

  // Trae un LOTE del servidor (queryFn de React Query)
  const fetchEncryptedBatch = async (
    filtersToApply: Filter[],
    sort: LocalSortDescriptor,
    targetBatch: number,
  ): Promise<{ data: Sorteo[]; count: number }> => {
    const filtersToSend = filtersToApply.filter(isFilterActive);
    const orderBy = {
      column: sort.column,
      ascending: sort.direction === "ascending",
    };

    const body = JSON.stringify({
      filters: filtersToSend,
      orderBy,
      page: targetBatch + 1, // nº de lote
      pageSize: BATCH_SIZE, // 150 → la edge function hace .range()
    });

    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TAMBO_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (res.status === 403) throw new Error("FORBIDDEN");

    const json = await res.json();

    if (!res.ok) throw new Error(json.error || "Error al obtener datos");

    return { data: json.data || [], count: json.count || 0 };
  };

  // Lote (0-based) que contiene la página actual
  const batchIndex = Math.floor((page - 1) / PAGES_PER_BATCH);

  // React Query: cachea cada combinación (filtros + orden + lote).
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error: queryError,
  } = useQuery<{ data: Sorteo[]; count: number }>({
    queryKey: ["tambo-encrypted", appliedFilters, sortDescriptor, batchIndex],
    queryFn: () =>
      fetchEncryptedBatch(appliedFilters, sortDescriptor, batchIndex),
    enabled: hasSearched && !!userSession,
    placeholderData: keepPreviousData,
  });

  // Derivados atados a `hasSearched` para que al Limpiar todo (o quitar el último
  // filtro) la tabla quede vacía aunque React Query conserve el último resultado.
  const totalRecords = hasSearched ? (data?.count ?? 0) : 0;
  const offsetInBatch = ((page - 1) % PAGES_PER_BATCH) * TAMBO_PAGE_SIZE;
  const paginatedItems: Sorteo[] = hasSearched
    ? (data?.data ?? []).slice(offsetInBatch, offsetInBatch + TAMBO_PAGE_SIZE)
    : [];
  const loading = isLoading;
  // Cargando un lote NUEVO (no cacheado) mientras keepPreviousData mantiene
  // visible la tabla anterior.
  const isFetchingBatch = isFetching && !isLoading;
  const forbidden = isError && (queryError as Error)?.message === "FORBIDDEN";
  const displayError =
    isError && !forbidden ? (queryError as Error)?.message : null;

  const goToPage = (p: number) => {
    setPage(p);
  };

  // Hay al menos un filtro válido (con valor, o un operador que no necesita valor)
  const hasValidFilter = filters.some(isFilterActive);

  // El valor debe ser coherente con el tipo de columna (numéricas solo números)
  const filterHasValidValue = (f: Filter) => {
    if (f.operator === "is_null" || f.operator === "is_not_null") return true;
    if (NUMERIC_COLUMNS.includes(f.column) && f.value.trim() !== "") {
      return !isNaN(Number(f.value));
    }

    return true;
  };

  // ¿Hay algún filtro activo con valor inválido? (ej. texto en la columna ID)
  const hasInvalidFilter = filters
    .filter(isFilterActive)
    .some((f) => !filterHasValidValue(f));

  // Se puede aplicar solo si hay al menos un filtro válido y ninguno inválido
  const canApply = hasValidFilter && !hasInvalidFilter;

  // Helpers para mostrar los filtros aplicados de forma legible
  const getColumnName = (uid: string) =>
    tamboColumns.find((c) => c.uid === uid)?.name || uid;
  const getOperatorLabel = (key: string) =>
    ALL_OPERATORS.find((o) => o.key === key)?.label || key;

  const activeAppliedFilters = appliedFilters.filter(isFilterActive);

  // Opciones del Select de columna (solo columnas filtrables)
  const filterableColumnOptions = useMemo(
    () =>
      tamboColumns
        .filter((c) => FILTERABLE_COLUMNS.includes(c.uid))
        .map((c) => ({ value: c.uid, label: c.name })),
    [],
  );

  const addFilter = () => {
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      column: "campaign",
      operator: "contains",
      value: "",
    };

    setFilters([...filters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    const remaining = filters.filter((f) => f.id !== filterId);

    setFilters(remaining);
    setPage(1);

    if (!hasSearched) return;

    const validRemaining = remaining.filter(isFilterActive);

    if (validRemaining.length > 0) {
      // Quedan filtros válidos → React Query re-consulta solo (cambia el queryKey)
      setAppliedFilters(remaining);
      setPage(1);
    } else {
      // No queda ningún filtro → volver al estado inicial (sin tabla)
      setAppliedFilters([]);
      setPage(1);
      setHasSearched(false);
    }
  };

  const updateFilter = (
    filterId: string,
    field: keyof Filter,
    value: string,
  ) => {
    setFilters(
      filters.map((f) => {
        if (f.id !== filterId) return f;
        // Al cambiar de columna, reiniciar valor y poner operador válido por defecto
        if (field === "column") {
          return { ...f, column: value, operator: "eq", value: "" };
        }

        return { ...f, [field]: value };
      }),
    );
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters([]);
    setAppliedFilters([]);
    setPage(1);
    setHasSearched(false);
  };

  // Aplicar filtros: setea los aplicados → React Query consulta solo
  const applyFiltersToServer = () => {
    if (!canApply) return;

    setAppliedFilters(filters);
    setPage(1);
    setHasSearched(true);
  };

  // Trae TODOS los registros filtrados en bloques (paginados) para exportar.
  const fetchAllFilteredForExport = async (): Promise<Sorteo[]> => {
    const filtersToSend = appliedFilters.filter(isFilterActive);
    const orderBy = {
      column: sortDescriptor.column,
      ascending: sortDescriptor.direction === "ascending",
    };

    const fetchBlock = async (pageNum: number) => {
      const body = JSON.stringify({
        filters: filtersToSend,
        orderBy,
        page: pageNum,
        pageSize: EXPORT_BLOCK_SIZE,
      });
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TAMBO_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body,
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Error al exportar");

      return json as { data: Sorteo[]; count: number };
    };

    // Bloque 1 → datos + total real (count exact)
    const first = await fetchBlock(1);
    const total = first.count || first.data.length;
    const all: Sorteo[] = [...(first.data || [])];

    // Bloques restantes (orden por id asc → offsets estables aunque entre data nueva)
    const totalBlocks = Math.ceil(total / EXPORT_BLOCK_SIZE);

    for (let p = 2; p <= totalBlocks; p++) {
      const block = await fetchBlock(p);

      all.push(...(block.data || []));
    }

    return all;
  };

  // Descarga directa a Excel de TODOS los registros filtrados (en bloques).
  const handleDownloadExcel = async () => {
    if (exporting) return; // evita doble clic durante la descarga

    if (!userSession) {
      addToast({
        title: "Sesión requerida",
        description: "Debes iniciar sesión para exportar.",
        color: "danger",
      });

      return;
    }

    if (!hasSearched || totalRecords === 0) {
      addToast({
        title: "Aplica un filtro",
        description: "Filtra los registros antes de exportar.",
        color: "warning",
      });

      return;
    }

    try {
      setExporting(true);

      const allRecords = await fetchAllFilteredForExport();

      exportToExcel({
        data: allRecords,
        fileName: tamboExportConfig.fileName,
        sheetName: tamboExportConfig.sheetName,
        excludeColumns: tamboExportConfig.excludeColumns,
        columnMapping: tamboExportConfig.columnMapping,
        customFormatter: tamboExportConfig.customFormatter,
      });
    } catch (err: any) {
      addToast({
        title: "Error al exportar",
        description: err.message || "Ocurrió un error al exportar",
        color: "danger",
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    // paginación / orden
    page,
    goToPage,
    sortDescriptor,
    setSortDescriptor,
    // datos
    totalRecords,
    paginatedItems,
    loading,
    isFetchingBatch,
    forbidden,
    displayError,
    // filtros
    filters,
    activeAppliedFilters,
    hasSearched,
    canApply,
    hasValidFilter,
    hasInvalidFilter,
    addFilter,
    removeFilter,
    updateFilter,
    clearAllFilters,
    applyFiltersToServer,
    // helpers UI
    filterableColumnOptions,
    getOperatorsForColumn,
    getColumnName,
    getOperatorLabel,
    // export
    exporting,
    handleDownloadExcel,
  };
}
