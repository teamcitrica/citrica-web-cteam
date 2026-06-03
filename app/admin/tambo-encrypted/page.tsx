"use client";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { useState, useCallback } from "react";
import { Text, Col, Container, Select, Input, Button, Icon } from "citrica-ui-toolkit";
import { UserAuth } from "@/shared/context/auth-context";
import { useExcelExport } from "@/hooks/use-excel-export";

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
  { name: "FECHA CREACIÓN", uid: "created_at", sortable: true },
  { name: "CAMPAÑA", uid: "campaign", sortable: false },
  { name: "🔐 APELLIDO", uid: "last_name", sortable: false },
  { name: "🔐 CUMPLEAÑOS", uid: "bday", sortable: false },
  { name: "🔐 DIRECCIÓN", uid: "address", sortable: false },
  { name: "🔐 TELÉFONO", uid: "phone", sortable: false },
  { name: "🔐 EMAIL", uid: "email", sortable: false },
  { name: "TIPO DOC", uid: "doc_type", sortable: false },
  { name: "🔐 NRO DOC", uid: "doc_number", sortable: false },
  { name: "TIPO INV", uid: "inv_type", sortable: false },
  { name: "SERIE INV", uid: "inv_serie", sortable: false },
  { name: "NRO INV", uid: "inv_number", sortable: false },
  { name: "CÓDIGO INV", uid: "inv_code", sortable: false },
  { name: "TÉRMINOS", uid: "terms_accept", sortable: false },
  { name: "ADS", uid: "ads_accept", sortable: false },
  { name: "ENCUESTA", uid: "survey_accept", sortable: false },
  { name: "🔐 NOMBRE", uid: "first_name", sortable: false },
  { name: "PACK", uid: "pack_option", sortable: true },
  { name: "PUBLICIDAD", uid: "publicity_accept", sortable: false },
  { name: "TRANSFER DIAGEO", uid: "transfer_diageo", sortable: true },
];

const ITEMS_PER_PAGE = 15;

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
    // Para columnas de texto (como campaign), solo operadores de texto
    return ALL_OPERATORS.filter((op) => op.text);
  }
};

export default function TamboEncryptedPage() {
  const { userSession } = UserAuth();
  const { exportToExcel } = useExcelExport();
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sistema de filtros dinámicos estilo Supabase
  type Filter = {
    id: string;
    column: string;
    operator: string;
    value: string;
  };

  const [filters, setFilters] = useState<Filter[]>([]);
  // Filtros actualmente aplicados en el servidor (para re-usar al cambiar de página/orden)
  const [appliedFilters, setAppliedFilters] = useState<Filter[]>([]);

  // Un filtro "cuenta" si tiene valor, o si su operador no necesita valor (is_null / is_not_null)
  const isFilterActive = (f: Filter) =>
    f.value.trim() !== "" || f.operator === "is_null" || f.operator === "is_not_null";

  type LocalSortDescriptor = {
    column: string;
    direction: "ascending" | "descending";
  };

  const [sortDescriptor, setSortDescriptor] = useState<LocalSortDescriptor>({
    column: "id",
    direction: "ascending",
  });

  // Función para traer datos del servidor con filtros
  const fetchSorteos = async (
    filtersToApply: Filter[] = [],
    targetPage = 1,
    sort: LocalSortDescriptor = sortDescriptor
  ) => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      // 1️⃣ Verificar que haya sesión activa
      if (!userSession) {
        setError("Debes iniciar sesión para ver esta información");
        setLoading(false);
        return;
      }

      // 2️⃣ Limpiar filtros vacíos antes de enviar
      const filtersToSend = filtersToApply.filter(isFilterActive);

      // 3️⃣ Preparar el orden
      const orderBy = {
        column: sort.column,
        ascending: sort.direction === "ascending",
      };

      // 4️⃣ Pedir SOLO la página actual (paginación del servidor)
      const body = JSON.stringify({
        filters: filtersToSend,
        orderBy,
        page: targetPage,
        pageSize: ITEMS_PER_PAGE,
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
        }
      );

      if (res.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Error al obtener datos");

      setSorteos(json.data || []);
      setTotalRecords(json.count || 0);
      setPage(targetPage);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Paginación del servidor: el filtrado, orden y corte por página los hace la edge function.
  // El total de páginas se calcula con el conteo total que devuelve la API.
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

  // Hay al menos un filtro válido (con valor, o un operador que no necesita valor).
  // Se exige para poder aplicar filtros (no se permite traer todo sin filtrar).
  const hasValidFilter = filters.some(isFilterActive);

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
      column: "id",
      operator: "eq",
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
      // Quedan filtros válidos → re-consultar con ellos
      setAppliedFilters(remaining);
      fetchSorteos(remaining, 1);
    } else {
      // No queda ningún filtro → limpiar la tabla (volver al estado inicial)
      setAppliedFilters([]);
      setSorteos([]);
      setTotalRecords(0);
      setHasSearched(false);
    }
  };

  const updateFilter = (filterId: string, field: keyof Filter, value: string) => {
    setFilters(
      filters.map((f) => (f.id === filterId ? { ...f, [field]: value } : f))
    );
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters([]);
    setAppliedFilters([]);
    setPage(1);
    setSorteos([]);
    setTotalRecords(0);
    setHasSearched(false);
  };

  // Función para aplicar filtros (consulta al servidor, desde la página 1)
  const applyFiltersToServer = () => {
    // Guarda de seguridad: no aplicar sin al menos un filtro con valor.
    // (El botón ya está deshabilitado en ese caso; esto es por si acaso.)
    if (!filters.some(isFilterActive)) return;

    setAppliedFilters(filters);
    fetchSorteos(filters, 1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  // Exportar a Excel: hace su PROPIA consulta SIN paginación (page/pageSize)
  // para que la edge function devuelva TODOS los registros filtrados, no solo la página visible.
  const handleExportToExcel = async () => {
    try {
      if (!userSession) {
        setError("Debes iniciar sesión para exportar");
        return;
      }

      const filtersToSend = appliedFilters.filter(isFilterActive);

      const orderBy = {
        column: sortDescriptor.column,
        ascending: sortDescriptor.direction === "ascending",
      };

      // Sin page/pageSize → trae todo lo filtrado
      const body = JSON.stringify({ filters: filtersToSend, orderBy });

      const res = await fetch(
        `https://axndntqikmbldyodiwal.supabase.co/functions/v1/get-tambo-encrypted-data`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TAMBO_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body,
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al exportar");

      exportToExcel({
        data: json.data || [],
        fileName: "registros_tambo_encriptados",
        sheetName: "Registros Tambo Encriptados",
        columnMapping: {
        id: "ID",
        created_at: "FECHA CREACIÓN",
        campaign: "CAMPAÑA",
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
        first_name: "NOMBRE",
        pack_option: "PACK",
        publicity_accept: "PUBLICIDAD",
        transfer_diageo: "TRANSFER DIAGEO",
      },
      customFormatter: (key, value) => {
        // Formatear booleano de transfer_diageo
        if (key === "transfer_diageo") {
          return value === true ? "Sí" : value === false ? "No" : "-";
        }
        return value;
      },
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renderCell = useCallback((sorteo: Sorteo, columnKey: React.Key) => {
    const cellValue = sorteo[columnKey as keyof Sorteo];

    switch (columnKey) {
      case "id":
        return <p className="text-sm text-black">{sorteo.id}</p>;

      case "created_at":
        return <span className="text-sm text-black">{formatDate(sorteo.created_at)}</span>;

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
        return <p className="text-sm text-black">{sorteo.bday || "-"}</p>;

      case "address":
        return <p className="text-sm text-black truncate max-w-xs" title={sorteo.address || "-"}>{sorteo.address || "-"}</p>;

      case "pack_option":
        return <p className="text-sm text-black">{sorteo.pack_option ?? "-"}</p>;

      case "transfer_diageo":
        return (
          <p className="text-sm text-black">
            {sorteo.transfer_diageo === true ? "Sí" : sorteo.transfer_diageo === false ? "No" : "-"}
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
        return <p className="text-sm text-black">{sorteo.terms_accept || "-"}</p>;

      case "ads_accept":
        return <p className="text-sm text-black">{sorteo.ads_accept || "-"}</p>;

      case "survey_accept":
        return <p className="text-sm text-black">{sorteo.survey_accept || "-"}</p>;

      case "publicity_accept":
        return <p className="text-sm text-black">{sorteo.publicity_accept || "-"}</p>;

      default:
        return <p className="text-sm text-black">{String(cellValue || "-")}</p>;
    }
  }, []);

  if (forbidden) {
    return <p className="text-yellow-600 text-center mt-10">No tienes permiso para ver esta información.</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="flex flex-col gap-2">
          <div className="container-blue-principal">

            {/* Botones de filtros */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Button
                isAdmin
                onPress={addFilter}
                className="!bg-[#28a745] hover:!bg-[#218838] !text-white"
              >
                <span className="flex items-center gap-2">
                  <span>+</span>
                  <span>Agregar Filtro</span>
                </span>
              </Button>
              {filters.length > 0 && (
                <Button
                  isAdmin
                  title={!hasValidFilter ? "Ingresa un valor en al menos un filtro" : undefined}
                  onPress={applyFiltersToServer}
                  className={
                    hasValidFilter && !loading
                      ? "!bg-[#265197] hover:!bg-[#16305A] !text-white"
                      : "!bg-[#A7BDE2] !text-white !cursor-not-allowed"
                  }
                >
                  <span className="flex items-center gap-2">
                    <span>🔍</span>
                    <span>{loading ? "Aplicando..." : "Aplicar Filtros"}</span>
                  </span>
                </Button>
              )}
              {(filters.length > 0 || hasSearched) && (
                <Button
                  isAdmin
                  onPress={clearAllFilters}
                  className="!bg-[#dc3545] hover:!bg-[#c82333] !text-white"
                >
                  Limpiar todo
                </Button>
              )}
              {totalRecords > 0 && (
                <Button
                  isAdmin
                  onPress={handleExportToExcel}
                  className="!bg-[#3E688E] hover:!bg-[#2d4f6b] !text-white"
                >
                  <span className="flex items-center gap-2">
                    <span>📥</span>
                    <span>Exportar a Excel</span>
                  </span>
                </Button>
              )}
            </div>

            {/* Total de registros + Filtros dinámicos en la misma línea */}
            {(filters.length > 0 || hasSearched) && (
              <div className="flex items-start justify-between gap-4 my-0">
                <div className="flex flex-col gap-2">
                  {hasSearched ? (
                    <Text isAdmin color="#265197" variant="body" weight="bold">
                      Total de registros: {totalRecords}
                    </Text>
                  ) : (
                    <span />
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
                  <div key={filter.id} className="flex items-center justify-end gap-2 bg-white/10 p-2 rounded-lg">
                    {/* Selector de columna */}
                    <Select
                      className="text-[#3E688E] w-[140px]"
                      classNames={{
                        trigger: "!bg-[#F4F4F5] !text-[#3E688E]",
                        value: "!text-[#3E688E]",
                      }}
                      selectedKeys={filter.column ? [filter.column] : []}
                      variant="faded"
                      options={columns.filter((col) => FILTERABLE_COLUMNS.includes(col.uid)).map((col) => ({ value: col.uid, label: col.name }))}
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
                      selectedKeys={filter.operator ? [filter.operator] : []}
                      variant="faded"
                      options={getOperatorsForColumn(filter.column).map((op) => ({ value: op.key, label: op.label }))}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        updateFilter(filter.id, "operator", selected);
                      }}
                    />

                    {/* Input de valor (solo si no es is_null o is_not_null) */}
                    {filter.operator !== "is_null" && filter.operator !== "is_not_null" && (
                      <Input
                        className="text-[#3E688E] w-[180px]"
                        classNames={{
                          inputWrapper: "!bg-[#F4F4F5] !border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                          input: "!text-[#3E688E] placeholder:!text-[#719BC1]",
                        }}
                        placeholder="Valor..."
                        value={filter.value}
                        variant="faded"
                        onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                      />
                    )}

                    {/* Botón para eliminar filtro */}
                    <Button
                      isAdmin
                      onPress={() => removeFilter(filter.id)}
                      className="!bg-[#dc3545] hover:!bg-[#c82333] !text-white !min-w-[40px]"
                      title="Eliminar filtro"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                  </div>
                )}
              </div>
            )}

            {!hasSearched && !loading && (
              <div className="mt-4 flex flex-col items-center justify-center text-center bg-[#EEF1F7] border border-[#D4DEED] rounded-2xl py-12 px-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white mb-5">
                  <Icon name="Search" size={32} color="#265197" />
                </div>
                <Text isAdmin variant="title" weight="bold" color="#16305A">
                  Comienza tu búsqueda
                </Text>
                <div className="mt-2 mb-7">
                  <Text isAdmin variant="body" color="#5A6B85">
                    Para visualizar los registros encriptados de Tambo, sigue estos pasos:
                  </Text>
                </div>
                <div className="flex flex-col gap-4 text-left w-full max-w-md">
                  {[
                    "Haz clic en “+ Agregar Filtro”",
                    "Selecciona tus criterios de búsqueda",
                    "Presiona el botón “Aplicar Filtros”",
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#265197] flex-shrink-0">
                        <Text isAdmin variant="label" weight="bold" color="#ffffff">
                          {index + 1}
                        </Text>
                      </div>
                      <Text isAdmin variant="body" color="#16305A">
                        {step}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-4 flex flex-col items-center justify-center text-center bg-[#EEF1F7] border border-[#D4DEED] rounded-2xl py-12 px-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white mb-5">
                  <Icon className="animate-spin" name="LoaderCircle" size={32} color="#265197" />
                </div>
                <Text isAdmin variant="title" weight="bold" color="#16305A">
                  Buscando registros...
                </Text>
                <div className="mt-2">
                  <Text isAdmin variant="body" color="#5A6B85">
                    Por favor espera mientras procesamos tu consulta
                  </Text>
                </div>
              </div>
            )}
          </div>

          {hasSearched && !loading && (
            <Table
            isStriped
            aria-label="Tabla de Registros Encriptados de Tambo"
            selectionMode="none"
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor) => {
              const newSort = descriptor as LocalSortDescriptor;
              setSortDescriptor(newSort);
              // Re-consultar al servidor con el nuevo orden, desde la página 1
              fetchSorteos(appliedFilters, 1, newSort);
            }}
            classNames={{
              wrapper: "bg-transparent overflow-x-auto !p-0",
              tr: "data-[odd=true]:bg-[#EEF1F7]",
              th: "bg-[#265197] text-[#fff] font-semibold text-center whitespace-nowrap",
              td: "text-gray-700 text-center whitespace-nowrap",
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align="center"
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent={"No se encontraron registros"}
              items={sorteos}
            >
              {(item) => (
                <TableRow key={item.id} className="items-center">
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}

          {/* Paginación */}
          {hasSearched && !loading && totalPages > 0 && (
            <div className="flex justify-center mt-4">
              <Pagination
                isCompact
                showControls
                showShadow
                classNames={{
                  cursor: "bg-[#265197] text-white shadow-none",
                  item: "border-none shadow-none outline-none ring-0",
                  prev: "border-none shadow-none outline-none ring-0",
                  next: "border-none shadow-none outline-none ring-0",
                }}
                page={page}
                total={totalPages}
                onChange={(p) => fetchSorteos(appliedFilters, p)}
              />
            </div>
          )}
        </div>
      </Col>
    </Container>
  );
}
