"use client";

import { Input } from "@heroui/input";
import { Select } from "citrica-ui-toolkit";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Icon from "@ui/atoms/icon";
import { UserAuth } from "@/shared/context/auth-context";
import { useRoleData } from "@/hooks/role/use-role-data";
import { Text, Button } from "citrica-ui-toolkit";
import { useExcelExport } from "@/hooks/use-excel-export";
import { Col,Container } from "@/styles/07-objects/objects";

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

// Función para obtener operadores disponibles según el tipo de columna
const getOperatorsForColumn = (isNumeric: boolean) => {
  if (isNumeric) {
    // Para columnas numéricas, mostrar todos los operadores numéricos
    return ALL_OPERATORS.filter((op) => op.numeric);
  } else {
    // Para columnas de texto, solo operadores de texto
    return ALL_OPERATORS.filter((op) => op.text);
  }
};

type Filter = {
  id: string;
  column: string;
  operator: string;
  value: string;
};

export default function RoleDataPage() {
  const params = useParams();
  const { userInfo } = UserAuth();
  const roleId = Number(params.roleId);

  const { exportToExcel } = useExcelExport();
  const { credentials, tableData, isLoading, error, applyFilters } = useRoleData(roleId);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  useEffect(() => {
    // Verificar que el usuario solo pueda ver sus propios datos
    if (userInfo && userInfo.role_id !== roleId) {
      console.warn("Usuario intentando acceder a datos de otro rol");
    }
  }, [userInfo, roleId]);

  // Configurar columnas disponibles según el rol
  useEffect(() => {
    if (roleId === 11) {
      // Rol 11: campaña, id, fecha
      setAvailableColumns(["campaign", "id", "created_at"]);
    } else {
      // Otros roles: solo id y fecha
      setAvailableColumns(["id", "created_at"]);
    }
  }, [roleId]);

  // Extraer las columnas de la tabla (usar el primer registro)
  const columns = useMemo(() => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]).map((key) => ({
      name: key.toUpperCase(),
      uid: key,
    }));
  }, [tableData]);

  // Filtrar datos según búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;

    return tableData.filter((row) => {
      return Object.values(row).some((value) => {
        const strValue = String(value ?? '').toLowerCase();
        return strValue.includes(searchTerm.toLowerCase());
      });
    });
  }, [tableData, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Resetear a la primera página al buscar
  };

  const addFilter = () => {
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      column: availableColumns[0] || "id",
      operator: "eq",
      value: "",
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter((f) => f.id !== filterId));
  };

  const updateFilter = (filterId: string, field: keyof Filter, value: string) => {
    setFilters(
      filters.map((f) => (f.id === filterId ? { ...f, [field]: value } : f))
    );
  };

  const handleLoadData = async () => {
    setHasSearched(true);

    // Preparar filtros para enviar (solo los que tienen valor o son operadores nulos)
    const filtersToSend = filters.filter(
      (f) => f.value.trim() !== "" || f.operator === "is_null" || f.operator === "is_not_null"
    );

    await applyFilters(filtersToSend);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setPage(1);
    setFilters([]);
    setHasSearched(false);
  };

  // Función para exportar a Excel usando el hook reutilizable
  const handleExportToExcel = () => {
    exportToExcel({
      data: filteredData,
      fileName: credentials?.table_name || 'datos',
      sheetName: credentials?.table_name || 'Datos',
    });
  };

  const renderCell = (row: any, columnKey: string) => {
    const value = row[columnKey];

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return String(value ?? 'N/A');
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!credentials) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold">Sin configuración</h3>
          <p className="text-yellow-600">
            No hay credenciales configuradas para este rol. Contacte al administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <Col cols={{lg:12,md:6,sm:4}}>
          <div className="flex flex-col gap-4 p-6">
      <div className="container-blue-principal">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-black">
              {credentials.table_name}
            </h1>
            {hasSearched && (
              <p className="text-gray-600 mt-1">
                Total: {filteredData.length} registros
              </p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={addFilter}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <span>+</span>
            <span>Agregar Filtro</span>
          </button>

          {filters.length > 0 && (
            <Button
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
              startContent={<Icon className="w-4 h-4" name="Search" />}
              onPress={handleLoadData}
              isLoading={isLoading}
            >
              <Text color="white" variant="label">
                {isLoading ? "Aplicando..." : "Aplicar Filtros"}
              </Text>
            </Button>
          )}

          {(filters.length > 0 || hasSearched) && (
            <Button
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              onPress={clearAllFilters}
            >
              <Text color="white" variant="label">
                Limpiar todo
              </Text>
            </Button>
          )}

          {hasSearched && (
            <>
              <Button
                className="bg-[#ff5b00] text-white py-2 px-4 rounded-lg border-2 border-white"
                startContent={<Icon className="w-4 h-4" name="RefreshCw" />}
                onPress={handleLoadData}
                isLoading={isLoading}
              >
                <Text color="white" variant="label">
                  Actualizar
                </Text>
              </Button>

              {filteredData.length > 0 && (
                <button
                  onClick={handleExportToExcel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <span>📥</span>
                  <span>Exportar a Excel</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Filtros dinámicos */}
        {filters.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            {filters.map((filter) => {
              const isNumericColumn = filter.column === "id";
              return (
                <div key={filter.id} className="flex items-center gap-2 bg-white/10 p-3 rounded-lg">
                  {/* Selector de columna */}
                  <Select
                    aria-label="Seleccionar columna"
                    className="text-[#3E688E] w-[160px]"
                    classNames={{
                      trigger: "!bg-[#F4F4F5] !text-[#3E688E]",
                      value: "!text-[#3E688E]",
                    }}
                    value={filter.column}
                    variant="faded"
                    options={availableColumns.map((col) => ({
                      value: col,
                      label: col === "campaign" ? "CAMPAÑA" : col === "id" ? "ID" : "FECHA"
                    }))}
                    onChange={(value) => {
                      updateFilter(filter.id, "column", value);
                    }}
                  />

                  {/* Selector de operador */}
                  <Select
                    aria-label="Seleccionar operador"
                    className="text-[#3E688E] w-[160px]"
                    classNames={{
                      trigger: "!bg-[#F4F4F5] !text-[#3E688E]",
                      value: "!text-[#3E688E]",
                    }}
                    value={filter.operator}
                    variant="faded"
                    options={getOperatorsForColumn(isNumericColumn).map((op) => ({
                      value: op.key,
                      label: op.label
                    }))}
                    onChange={(value) => {
                      updateFilter(filter.id, "operator", value);
                    }}
                  />

                  {/* Input de valor (solo si no es is_null o is_not_null) */}
                  {filter.operator !== "is_null" && filter.operator !== "is_not_null" && (
                    <Input
                      className="text-[#3E688E] flex-1"
                      classNames={{
                        inputWrapper:
                          "!bg-[#F4F4F5] !text-[#3E688E] !placeholder-[#719BC1]",
                        input: "!text-[#3E688E]",
                      }}
                      placeholder="Valor..."
                      value={filter.value}
                      variant="faded"
                      onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                    />
                  )}

                  {/* Botón para eliminar filtro */}
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Eliminar filtro"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Mensaje inicial antes de buscar */}
        {!hasSearched && !isLoading && (
          <div className="mt-4 p-8 bg-gradient-to-br from-[#3E688E] via-[#5080a8] to-[#719BC1] rounded-xl shadow-2xl text-center">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              ¡Comienza tu búsqueda!
            </h3>
            <p className="text-white/90 text-lg mb-5 font-medium">
              Para visualizar los datos de {credentials.table_name}:
            </p>
            <div className="bg-[#ff5b00] rounded-lg p-5 inline-block shadow-xl transform hover:scale-105 transition-transform">
              <p className="text-white font-bold text-lg leading-relaxed">
                1️⃣ Haz clic en <span className="bg-white/20 px-2 py-1 rounded">+ Agregar Filtro</span><br/>
                2️⃣ Selecciona tus criterios de búsqueda<br/>
                3️⃣ Presiona el botón <span className="bg-white/20 px-2 py-1 rounded">🔍 Aplicar Filtros</span>
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de carga */}
        {isLoading && (
          <div className="mt-4 p-8 bg-gradient-to-br from-[#3E688E] via-[#5080a8] to-[#719BC1] rounded-xl shadow-2xl text-center">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              Buscando registros...
            </h3>
            <div className="bg-[#ff5b00]/90 rounded-lg p-4 inline-block shadow-lg">
              <p className="text-white font-semibold text-lg">
                Por favor espera mientras procesamos tu consulta
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabla - solo se muestra después de buscar */}
      {hasSearched && !isLoading && (
        <>
          <Table
            aria-label={`Tabla de ${credentials.table_name}`}
            classNames={{
              wrapper: "bg-transparent",
              th: "bg-[#ff5b00] text-[#fff] font-semibold text-center",
              td: "text-gray-700 text-center",
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.uid} align="center">
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent={"No se encontraron registros"}
              items={paginatedData}
            >
              {(item) => (
                <TableRow key={JSON.stringify(item)}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, String(columnKey))}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                isCompact
                showControls
                showShadow
                classNames={{
                  cursor: "!bg-[#ff5b00] text-white",
                }}
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
      </Col>

    </Container>

  );
}
