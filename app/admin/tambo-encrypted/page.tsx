"use client";
import { useState, useCallback, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { addToast } from "@heroui/toast";
import {
  Text,
  Col,
  Container,
  Select,
  Input,
  Button,
  Icon,
} from "citrica-ui-toolkit";

import { UserAuth } from "@/shared/context/auth-context";
import { useExcelExport } from "@/hooks/use-excel-export";
import {
  DataTable,
  Column,
} from "@/shared/components/citrica-ui/organism/data-table";

interface Sorteo {
  id: number;
  created_at: string | null;
  pack_option: number | null;
  transfer_diageo: boolean | null;
  bday: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  doc_type: string | null;
  doc_number: string | null;
  inv_type: string | null;
  inv_serie: string | null;
  inv_number: string | null;
  inv_code: string | null;
  terms_accept: string | null;
  ads_accept: string | null;
  survey_accept: string | null;
  first_name: string | null;
  publicity_accept: string | null;
  campaign: string | null;
  last_name: string | null;
}

const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "FECHA CREACIÓN", uid: "created_at", sortable: false },
  { name: "CAMPAÑA", uid: "campaign", sortable: false },
  { name: "NOMBRE", uid: "first_name", sortable: false },
  { name: "APELLIDO", uid: "last_name", sortable: false },
  { name: "CUMPLEAÑOS", uid: "bday", sortable: false },
  { name: "DIRECCIÓN", uid: "address", sortable: false },
  { name: "TELÉFONO", uid: "phone", sortable: false },
  { name: "EMAIL", uid: "email", sortable: false },
  { name: "TIPO DOC", uid: "doc_type", sortable: false },
  { name: "NRO DOC", uid: "doc_number", sortable: false },
  { name: "TIPO INV", uid: "inv_type", sortable: false },
  { name: "SERIE INV", uid: "inv_serie", sortable: false },
  { name: "NRO INV", uid: "inv_number", sortable: false },
  { name: "CÓDIGO INV", uid: "inv_code", sortable: false },
  { name: "TÉRMINOS", uid: "terms_accept", sortable: false },
  { name: "ADS", uid: "ads_accept", sortable: false },
  { name: "ENCUESTA", uid: "survey_accept", sortable: false },
];

const PAGE_SIZE = 15; // registros visibles por página
const PAGES_PER_BATCH = 10; // páginas que trae cada lote
const BATCH_SIZE = PAGE_SIZE * PAGES_PER_BATCH; // 150 registros por lote

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

// Función para obtener operadores disponibles según el tipo de columna
const getOperatorsForColumn = (columnName: string) => {
  const isNumeric = NUMERIC_COLUMNS.includes(columnName);

  if (isNumeric) {
    // Para columnas numéricas, mostrar todos los operadores numéricos
    return ALL_OPERATORS.filter((op) => op.numeric);
  } else {
    // Para columnas de texto (como campaign), solo operadores de texto,
    // SIN "Es nulo" / "No es nulo".
    return ALL_OPERATORS.filter(
      (op) => op.text && op.key !== "is_null" && op.key !== "is_not_null",
    );
  }
};

export default function TamboEncryptedPage() {
  const { userSession } = UserAuth();
  const { exportToExcel } = useExcelExport();
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [exporting, setExporting] = useState(false); // descarga de Excel en curso

  // Sistema de filtros dinámicos estilo Supabase
  type Filter = {
    id: string;
    column: string;
    operator: string;
    value: string;
  };

  const [filters, setFilters] = useState<Filter[]>([]);
  // Filtros actualmente aplicados en el servidor (van en el queryKey de React Query)
  const [appliedFilters, setAppliedFilters] = useState<Filter[]>([]);

  // Un filtro "cuenta" si tiene valor, o si su operador no necesita valor (is_null / is_not_null)
  const isFilterActive = (f: Filter) =>
    f.value.trim() !== "" ||
    f.operator === "is_null" ||
    f.operator === "is_not_null";

  type LocalSortDescriptor = {
    column: string;
    direction: "ascending" | "descending";
  };

  const [sortDescriptor, setSortDescriptor] = useState<LocalSortDescriptor>({
    column: "id",
    direction: "ascending",
  });

  // Trae un LOTE del servidor (función pura que usa React Query como queryFn).
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

    const res = await fetch(
      `https://axndntqikmbldyodiwal.supabase.co/functions/v1/get-tambo-encrypted-data`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TAMBO_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body,
      },
    );

    if (res.status === 403) throw new Error("FORBIDDEN");

    const json = await res.json();

    if (!res.ok) throw new Error(json.error || "Error al obtener datos");

    return { data: json.data || [], count: json.count || 0 };
  };

  // Lote (0-based) que contiene la página actual
  const batchIndex = Math.floor((page - 1) / PAGES_PER_BATCH);

  // React Query: cachea cada combinación (filtros + orden + lote).
  // - Volver a un lote ya visto = instantáneo (desde caché).
  // - Cambiar filtro/orden = otra queryKey → consulta nueva (sin invalidar a mano).
  // - keepPreviousData = mantiene la tabla anterior mientras llega el nuevo lote.
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error: queryError,
  } = useQuery<{
    data: Sorteo[];
    count: number;
  }>({
    queryKey: ["tambo-encrypted", appliedFilters, sortDescriptor, batchIndex],
    queryFn: () =>
      fetchEncryptedBatch(appliedFilters, sortDescriptor, batchIndex),
    enabled: hasSearched && !!userSession,
    placeholderData: keepPreviousData,
  });

  // Derivados (reemplazan a los estados manuales)
  const totalRecords = data?.count ?? 0;
  const offsetInBatch = ((page - 1) % PAGES_PER_BATCH) * PAGE_SIZE;
  const paginatedItems: Sorteo[] = (data?.data ?? []).slice(
    offsetInBatch,
    offsetInBatch + PAGE_SIZE,
  );
  const loading = isLoading;
  // Cargando un lote NUEVO (no cacheado) mientras keepPreviousData mantiene
  // visible la tabla anterior.
  const isFetchingBatch = isFetching && !isLoading;
  const forbidden = isError && (queryError as Error)?.message === "FORBIDDEN";
  const displayError =
    isError && !forbidden ? (queryError as Error)?.message : null;

  // Cambiar de página: solo cambia `page`. React Query trae el lote (o usa
  // caché) automáticamente cuando cambia `batchIndex` dentro del queryKey.
  const goToPage = (p: number) => {
    setPage(p);
  };

  // Hay al menos un filtro válido (con valor, o un operador que no necesita valor).
  const hasValidFilter = filters.some(isFilterActive);

  // El valor debe ser coherente con el tipo de columna:
  // las columnas numéricas (ej. id) solo aceptan números.
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
    columns.find((c) => c.uid === uid)?.name || uid;
  const getOperatorLabel = (key: string) =>
    ALL_OPERATORS.find((o) => o.key === key)?.label || key;

  // Filtros aplicados que realmente tienen efecto (con valor o sin necesidad de valor)
  const activeAppliedFilters = appliedFilters.filter(isFilterActive);

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

    // Si todavía no se ha buscado, no hay nada aplicado que sincronizar
    if (!hasSearched) return;

    // Sincronizar con la tabla: re-aplicar los filtros que quedan
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
        // Al cambiar de columna, reiniciar el valor y poner un operador válido
        // por defecto (evita arrastrar texto a una columna numérica como id).
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

  // Aplicar filtros: setea los filtros aplicados → React Query consulta solo
  const applyFiltersToServer = () => {
    // Guarda de seguridad: no aplicar si no hay filtro válido o si alguno es inválido
    // (ej. texto en la columna ID). El botón ya se muestra deshabilitado en ese caso.
    if (!canApply) return;

    setAppliedFilters(filters);
    setPage(1);
    setHasSearched(true);
  };

  // Normaliza una fecha a DD/MM/YYYY parseando los formatos que llegan
  // (DD/MM/YYYY o ISO YYYY-MM-DD, con o sin hora), SIN usar new Date()
  // para no mal-interpretar (ej. 12/02 como mes/día). Sirve para bday y created_at.
  const formatFecha = (value: string | null) => {
    if (!value) return "-";
    const v = String(value).trim();
    // DD/MM/YYYY o D/M/YYYY
    const dmy = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (dmy) {
      const [, d, m, y] = dmy;

      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }
    // ISO YYYY-MM-DD (con o sin hora, ej. timestamp de created_at)
    const ymd = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

    if (ymd) {
      const [, y, m, d] = ymd;
      const fecha = `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
      // Si trae hora (HH:MM:SS), la agregamos tal cual viene guardada
      const hora = v.match(/[ T](\d{2}):(\d{2}):(\d{2})/);

      if (hora) {
        const [, hh, mm, ss] = hora;

        return `${fecha} ${hh}:${mm}:${ss}`;
      }

      return fecha;
    }

    return v; // formato desconocido → tal cual
  };

  // Trae TODOS los registros filtrados en bloques (paginados). Pide el bloque 1
  // para obtener el total (count) y luego itera los bloques restantes acumulando.
  // IMPORTANTE: este tamaño NUNCA debe superar el `max-rows` de Supabase (default
  // 1000). Si lo supera, la paginación por offset saltaría filas en silencio.
  const EXPORT_BLOCK_SIZE = 500;

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
      const res = await fetch(
        `https://axndntqikmbldyodiwal.supabase.co/functions/v1/get-tambo-encrypted-data`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TAMBO_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body,
        },
      );
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
        fileName: "registros_tambo_encriptados",
        sheetName: "Registros Tambo Encriptados",
        // Columnas que NO se exportan (no están en la tabla)
        excludeColumns: ["pack_option", "publicity_accept", "transfer_diageo"],
        columnMapping: {
          id: "ID",
          created_at: "FECHA CREACIÓN",
          campaign: "CAMPAÑA",
          first_name: "NOMBRE",
          last_name: "APELLIDO",
          bday: "CUMPLEAÑOS",
          address: "DIRECCIÓN",
          phone: "TELÉFONO",
          email: "EMAIL",
          doc_type: "TIPO DOC",
          doc_number: "NRO DOC",
          inv_type: "TIPO INV",
          inv_serie: "SERIE INV",
          inv_number: "NRO INV",
          inv_code: "CÓDIGO INV",
          terms_accept: "TÉRMINOS",
          ads_accept: "ADS",
          survey_accept: "ENCUESTA",
        },
        customFormatter: (key, value) => {
          // Formatear booleano de transfer_diageo
          if (key === "transfer_diageo") {
            return value === true ? "Sí" : value === false ? "No" : "-";
          }
          // Normalizar fechas (cumpleaños y fecha de creación) a DD/MM/YYYY
          if (key === "bday" || key === "created_at") {
            return formatFecha(value);
          }

          return value;
        },
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

  const renderCell = useCallback((sorteo: Sorteo, columnKey: string) => {
    const cellValue = sorteo[columnKey as keyof Sorteo];

    switch (columnKey) {
      case "id":
        return <p className="text-sm text-black">{sorteo.id}</p>;

      case "created_at":
        return (
          <span className="text-sm text-black">
            {formatFecha(sorteo.created_at)}
          </span>
        );

      case "first_name":
        return <p className="text-sm text-black">{sorteo.first_name || "-"}</p>;

      case "last_name":
        return <p className="text-sm text-black">{sorteo.last_name || "-"}</p>;

      case "email":
        return <p className="text-sm text-black">{sorteo.email || "-"}</p>;

      case "phone":
        return <p className="text-sm text-black">{sorteo.phone || "-"}</p>;

      case "doc_type":
        return <p className="text-sm text-black">{sorteo.doc_type || "-"}</p>;

      case "doc_number":
        return <p className="text-sm text-black">{sorteo.doc_number || "-"}</p>;

      case "bday":
        return <p className="text-sm text-black">{formatFecha(sorteo.bday)}</p>;

      case "address":
        return (
          <p
            className="text-sm text-black truncate max-w-xs"
            title={sorteo.address || "-"}
          >
            {sorteo.address || "-"}
          </p>
        );

      case "campaign":
        return <p className="text-sm text-black">{sorteo.campaign || "-"}</p>;

      case "inv_type":
        return <p className="text-sm text-black">{sorteo.inv_type || "-"}</p>;

      case "inv_serie":
        return <p className="text-sm text-black">{sorteo.inv_serie || "-"}</p>;

      case "inv_number":
        return <p className="text-sm text-black">{sorteo.inv_number || "-"}</p>;

      case "inv_code":
        return <p className="text-sm text-black">{sorteo.inv_code || "-"}</p>;

      case "terms_accept":
        return (
          <p className="text-sm text-black">{sorteo.terms_accept || "-"}</p>
        );

      case "ads_accept":
        return <p className="text-sm text-black">{sorteo.ads_accept || "-"}</p>;

      case "survey_accept":
        return (
          <p className="text-sm text-black">{sorteo.survey_accept || "-"}</p>
        );

      default:
        return <p className="text-sm text-black">{String(cellValue || "-")}</p>;
    }
  }, []);

  // Columnas para el DataTable: mismas columnas, cada una con su render propio.
  const dataTableColumns: Column<Sorteo>[] = useMemo(
    () =>
      columns.map((c) => ({
        ...c,
        render: (item: Sorteo) => renderCell(item, c.uid),
      })),
    [renderCell],
  );

  // Barra de filtros (slot customFilters del DataTable). Mantiene la lógica de
  // filtros estilo Supabase, con componentes del toolkit (sin emojis).
  const filterBar = (
    <div className="flex flex-col gap-3 pb-2">
      {/* Botones de filtros (siempre visibles al entrar a la página) */}
      <div className="flex items-center justify-end gap-3 flex-wrap">
        <Button
          isAdmin
          isDisabled={filters.length === 0 && !hasSearched}
          startContent={<Icon name="Trash2" size={16} />}
          variant="secondary"
          onPress={clearAllFilters}
        >
          Limpiar todo
        </Button>
        <Button
          isAdmin
          isDisabled={!hasSearched || totalRecords === 0 || exporting}
          startContent={<Icon name="Download" size={16} />}
          variant="primary"
          onPress={handleDownloadExcel}
        >
          {exporting ? "Descargando..." : "Descargar"}
        </Button>
        <Button
          isAdmin
          isDisabled={!canApply || loading}
          startContent={<Icon name="Search" size={16} />}
          title={
            hasInvalidFilter
              ? "El valor de la columna ID debe ser numérico"
              : !hasValidFilter
                ? "Ingresa un valor en al menos un filtro"
                : undefined
          }
          variant="primary"
          onPress={applyFiltersToServer}
        >
          {loading ? "Aplicando..." : "Aplicar Filtros"}
        </Button>
        <Button
          isAdmin
          startContent={<Icon name="Plus" size={16} />}
          variant="primary"
          onPress={addFilter}
        >
          Agregar Filtro
        </Button>
      </div>

      {/* Total de registros + filtros dinámicos */}
      {(filters.length > 0 || hasSearched) && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {hasSearched && (
              <Text isAdmin color="#265197" variant="body" weight="bold">
                Total de registros filtrados: {totalRecords}
              </Text>
            )}
            {activeAppliedFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Text isAdmin color="#5A6B85" variant="label">
                  Filtros aplicados:
                </Text>
                {activeAppliedFilters.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center bg-[#EEF1F7] border border-[#D4DEED] rounded-full px-3 py-1"
                  >
                    <Text isAdmin color="#265197" variant="label">
                      {getColumnName(f.column)} · {getOperatorLabel(f.operator)}
                      {f.operator !== "is_null" && f.operator !== "is_not_null"
                        ? ` "${f.value}"`
                        : ""}
                    </Text>
                  </span>
                ))}
              </div>
            )}
          </div>
          {filters.length > 0 && (
            <div className="flex flex-col gap-1">
              {filters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-end gap-2 p-2 rounded-lg"
                >
                  {/* Selector de columna */}
                  <Select
                    className="text-[#3E688E] w-[140px]"
                    classNames={{
                      trigger: "!bg-[#F4F4F5] !text-[#3E688E]",
                      value: "!text-[#3E688E]",
                    }}
                    options={columns
                      .filter((col) => FILTERABLE_COLUMNS.includes(col.uid))
                      .map((col) => ({ value: col.uid, label: col.name }))}
                    selectedKeys={filter.column ? [filter.column] : []}
                    variant="faded"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      updateFilter(filter.id, "column", selected);
                    }}
                  />

                  {/* Selector de operador */}
                  <Select
                    className="text-[#3E688E] w-[140px]"
                    classNames={{
                      trigger: "!bg-[#F4F4F5] !text-[#3E688E]",
                      value: "!text-[#3E688E]",
                    }}
                    options={getOperatorsForColumn(filter.column).map((op) => ({
                      value: op.key,
                      label: op.label,
                    }))}
                    selectedKeys={filter.operator ? [filter.operator] : []}
                    variant="faded"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      updateFilter(filter.id, "operator", selected);
                    }}
                  />

                  {/* Input de valor (solo si no es is_null o is_not_null) */}
                  {filter.operator !== "is_null" &&
                    filter.operator !== "is_not_null" && (
                      <Input
                        className="text-[#3E688E] w-[180px]"
                        classNames={{
                          inputWrapper:
                            "!bg-[#F4F4F5] !border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                          input: "!text-[#3E688E] placeholder:!text-[#719BC1]",
                        }}
                        placeholder="Valor..."
                        value={filter.value}
                        variant="faded"
                        onChange={(e) =>
                          updateFilter(filter.id, "value", e.target.value)
                        }
                      />
                    )}

                  {/* Botón para eliminar filtro */}
                  <Button
                    isAdmin
                    isIconOnly
                    className="!min-w-6 !w-6 !h-7 !px-0"
                    size="sm"
                    title="Eliminar filtro"
                    variant="secondary"
                    onPress={() => removeFilter(filter.id)}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              ))}
              {hasInvalidFilter && (
                <div className="flex justify-end">
                  <Text isAdmin color="#dc3545" variant="label">
                    El valor de la columna ID debe ser numérico
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (forbidden) {
    return (
      <p className="text-yellow-600 text-center mt-10">
        No tienes permiso para ver esta información.
      </p>
    );
  }

  if (displayError) {
    return <p className="text-red-500 text-center mt-10">{displayError}</p>;
  }

  return (
    <div className="pb-[100px]">
      <Container>
        <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
          <div className="">
            <h1 className="text-2xl font-bold text-[#265197] mb-5">
              <Text isAdmin color="#678CC5" variant="title" weight="bold">
                CRM
              </Text>
              {" > "}
              <Text isAdmin color="#265197" variant="title" weight="bold">
                Tambo Encriptado
              </Text>
            </h1>

            <DataTable<Sorteo>
              key={`${sortDescriptor.column}-${sortDescriptor.direction}`}
              serverSidePagination
              columns={dataTableColumns}
              currentPage={page}
              customFilters={filterBar}
              data={paginatedItems}
              defaultSortDirection={sortDescriptor.direction}
              emptyContent={
                hasSearched
                  ? "No se encontraron registros"
                  : "Aplica un filtro para ver registros"
              }
              getRowKey={(s) => s.id}
              headerColor="#265197"
              headerTextColor="#ffffff"
              isLoading={loading || isFetchingBatch}
              itemsPerPage={PAGE_SIZE}
              paginationColor="#265197"
              searchFields={[]}
              totalRecords={totalRecords}
              onPageChange={goToPage}
              onSortChange={(col, dir) => {
                setSortDescriptor({ column: col, direction: dir });
                setPage(1);
              }}
            />
          </div>
        </Col>
      </Container>
    </div>
  );
}
