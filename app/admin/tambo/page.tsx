"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Pagination,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import Icon from "@/shared/components/citrica-ui/atoms/icon";
import Text from "@/shared/components/citrica-ui/atoms/text";
import { Col, Container } from "@/styles/07-objects/objects";
import { UserAuth } from "@/shared/context/auth-context";

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
  { name: "NOMBRE", uid: "first_name", sortable: true },
  { name: "APELLIDO", uid: "last_name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "TELÉFONO", uid: "phone", sortable: false },
  { name: "TIPO DOC", uid: "doc_type", sortable: false },
  { name: "NRO DOC", uid: "doc_number", sortable: false },
  { name: "CUMPLEAÑOS", uid: "bday", sortable: true },
  { name: "DIRECCIÓN", uid: "address", sortable: false },
  { name: "PACK", uid: "pack_option", sortable: true },
  { name: "TRANSFER DIAGEO", uid: "transfer_diageo", sortable: true },
  { name: "CAMPAÑA", uid: "campaign", sortable: false },
  { name: "TIPO INV", uid: "inv_type", sortable: false },
  { name: "SERIE INV", uid: "inv_serie", sortable: false },
  { name: "NRO INV", uid: "inv_number", sortable: false },
  { name: "CÓDIGO INV", uid: "inv_code", sortable: false },
  { name: "TÉRMINOS", uid: "terms_accept", sortable: false },
  { name: "ADS", uid: "ads_accept", sortable: false },
  { name: "ENCUESTA", uid: "survey_accept", sortable: false },
  { name: "PUBLICIDAD", uid: "publicity_accept", sortable: false },
];

const ITEMS_PER_PAGE = 15;

export default function TamboPage() {
  const { userSession } = UserAuth();
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Sistema de filtros dinámicos estilo Supabase
  type Filter = {
    id: string;
    column: string;
    operator: string;
    value: string;
  };

  const [filters, setFilters] = useState<Filter[]>([]);

  type LocalSortDescriptor = {
    column: string;
    direction: "ascending" | "descending";
  };

  const [sortDescriptor, setSortDescriptor] = useState<LocalSortDescriptor>({
    column: "created_at",
    direction: "descending",
  });

  useEffect(() => {
    const fetchSorteos = async () => {
      try {
        // 1️⃣ Verificar que haya sesión activa
        if (!userSession) {
          setError("Debes iniciar sesión para ver esta información");
          setLoading(false);
          return;
        }

        // 2️⃣ Hacer la petición a la Edge Function
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-tambo-data`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userSession.access_token}`,
            },
          }
        );

        if (res.status === 403) {
          setForbidden(true);
          setLoading(false);
          return;
        }

        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Error al obtener datos");

        console.log("Respuesta de la API:", json);
        console.log("Datos de sorteos:", json.data);

        setSorteos(json.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSorteos();
  }, [userSession]);

  // Función para aplicar un filtro individual
  const applyFilter = (sorteo: Sorteo, filter: Filter): boolean => {
    const columnValue = sorteo[filter.column as keyof Sorteo];
    const filterValue = filter.value;

    // Si no hay valor en el filtro, no filtrar
    if (!filterValue || filterValue.trim() === "") return true;

    switch (filter.operator) {
      case "eq": // Igual
        if (typeof columnValue === "number") {
          return columnValue === parseFloat(filterValue);
        }
        return String(columnValue || "").toLowerCase() === filterValue.toLowerCase();

      case "neq": // No igual
        if (typeof columnValue === "number") {
          return columnValue !== parseFloat(filterValue);
        }
        return String(columnValue || "").toLowerCase() !== filterValue.toLowerCase();

      case "gt": // Mayor que
        if (typeof columnValue === "number") {
          return columnValue > parseFloat(filterValue);
        }
        return false;

      case "gte": // Mayor o igual que
        if (typeof columnValue === "number") {
          return columnValue >= parseFloat(filterValue);
        }
        return false;

      case "lt": // Menor que
        if (typeof columnValue === "number") {
          return columnValue < parseFloat(filterValue);
        }
        return false;

      case "lte": // Menor o igual que
        if (typeof columnValue === "number") {
          return columnValue <= parseFloat(filterValue);
        }
        return false;

      case "contains": // Contiene (like)
        return String(columnValue || "").toLowerCase().includes(filterValue.toLowerCase());

      case "not_contains": // No contiene
        return !String(columnValue || "").toLowerCase().includes(filterValue.toLowerCase());

      case "starts_with": // Empieza con
        return String(columnValue || "").toLowerCase().startsWith(filterValue.toLowerCase());

      case "ends_with": // Termina con
        return String(columnValue || "").toLowerCase().endsWith(filterValue.toLowerCase());

      case "is_null": // Es nulo
        return columnValue === null || columnValue === undefined || columnValue === "";

      case "is_not_null": // No es nulo
        return columnValue !== null && columnValue !== undefined && columnValue !== "";

      default:
        return true;
    }
  };

  const filteredSorteos = useMemo(() => {
    let filtered = sorteos;

    // Filtro por búsqueda general en el input
    if (searchTerm.trim()) {
      filtered = filtered.filter((sorteo) => {
        const firstName = sorteo.first_name || "";
        const lastName = sorteo.last_name || "";
        const email = sorteo.email || "";
        const phone = sorteo.phone || "";
        const docNumber = sorteo.doc_number || "";
        const campaign = sorteo.campaign || "";
        const id = String(sorteo.id || "");
        const searchLower = searchTerm.toLowerCase();

        return (
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower) ||
          phone.toLowerCase().includes(searchLower) ||
          docNumber.toLowerCase().includes(searchLower) ||
          campaign.toLowerCase().includes(searchLower) ||
          id.toLowerCase().includes(searchLower)
        );
      });
    }

    // Aplicar todos los filtros dinámicos (AND)
    filters.forEach((filter) => {
      filtered = filtered.filter((sorteo) => applyFilter(sorteo, filter));
    });

    return filtered;
  }, [sorteos, searchTerm, filters]);

  // Ordenar sorteos
  const sortedItems = useMemo(() => {
    return [...filteredSorteos].sort((a, b) => {
      let first: any;
      let second: any;

      switch (sortDescriptor.column) {
        case "id":
          first = a.id || 0;
          second = b.id || 0;
          break;
        case "created_at":
          first = a.created_at ? new Date(a.created_at).getTime() : 0;
          second = b.created_at ? new Date(b.created_at).getTime() : 0;
          break;
        case "first_name":
          first = (a.first_name || "").toLowerCase();
          second = (b.first_name || "").toLowerCase();
          break;
        case "last_name":
          first = (a.last_name || "").toLowerCase();
          second = (b.last_name || "").toLowerCase();
          break;
        case "email":
          first = (a.email || "").toLowerCase();
          second = (b.email || "").toLowerCase();
          break;
        case "bday":
          first = a.bday ? new Date(a.bday).getTime() : 0;
          second = b.bday ? new Date(b.bday).getTime() : 0;
          break;
        case "pack_option":
          first = a.pack_option || 0;
          second = b.pack_option || 0;
          break;
        case "transfer_diageo":
          first = a.transfer_diageo ? 1 : 0;
          second = b.transfer_diageo ? 1 : 0;
          break;
        default:
          return 0;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredSorteos, sortDescriptor]);

  // Calcular cantidad de páginas
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);

  // Obtener sorteos para la página actual
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedItems, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

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
    setFilters(filters.filter((f) => f.id !== filterId));
    setPage(1);
  };

  const updateFilter = (filterId: string, field: keyof Filter, value: string) => {
    setFilters(
      filters.map((f) => (f.id === filterId ? { ...f, [field]: value } : f))
    );
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters([]);
    setPage(1);
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

  if (loading) {
    return (
      <div className="w-full h-40 flex justify-center items-center">
        <Spinner color="secondary" size="md" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }

  if (forbidden) {
    return <p className="text-yellow-600 text-center mt-10">No tienes permiso para ver esta información.</p>;
  }

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="flex flex-col gap-4">
          <div className="container-blue-principal">
            {/* Búsqueda general */}
            <div className="flex items-center gap-4 mb-4">
              <Input
                className="text-[#3E688E] flex-1"
                classNames={{
                  inputWrapper:
                    "!bg-[#F4F4F5] !text-[#3E688E] !placeholder-[#719BC1] input-ui-pro",
                  mainWrapper: "",
                }}
                placeholder="Buscar por nombre, email, teléfono o documento"
                startContent={
                  <Icon className="mr-2" color="#719BC1" name="Search" />
                }
                value={searchTerm}
                variant="faded"
                onChange={handleSearchChange}
              />
            </div>

            {/* Botones de filtros */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={addFilter}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <span>+</span>
                <span>Agregar Filtro</span>
              </button>
              {(filters.length > 0 || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Filtros dinámicos */}
            {filters.length > 0 && (
              <div className="flex flex-col gap-3 mb-4">
                {filters.map((filter) => (
                  <div key={filter.id} className="flex items-center gap-2 bg-white/10 p-3 rounded-lg">
                    {/* Selector de columna */}
                    <Select
                      className="text-[#3E688E] w-[160px]"
                      classNames={{
                        trigger: "!bg-[#F4F4F5] !text-[#3E688E]",
                        value: "!text-[#3E688E]",
                      }}
                      selectedKeys={[filter.column]}
                      variant="faded"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFilter(filter.id, "column", value);
                      }}
                    >
                      {columns.map((col) => (
                        <SelectItem key={col.uid} value={col.uid}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </Select>

                    {/* Selector de operador */}
                    <Select
                      className="text-[#3E688E] w-[160px]"
                      classNames={{
                        trigger: "!bg-[#F4F4F5] !text-[#3E688E]",
                        value: "!text-[#3E688E]",
                      }}
                      selectedKeys={[filter.operator]}
                      variant="faded"
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        updateFilter(filter.id, "operator", value);
                      }}
                    >
                      <SelectItem key="eq" value="eq">
                        Igual a
                      </SelectItem>
                      <SelectItem key="neq" value="neq">
                        No igual a
                      </SelectItem>
                      <SelectItem key="gt" value="gt">
                        Mayor que
                      </SelectItem>
                      <SelectItem key="gte" value="gte">
                        Mayor o igual
                      </SelectItem>
                      <SelectItem key="lt" value="lt">
                        Menor que
                      </SelectItem>
                      <SelectItem key="lte" value="lte">
                        Menor o igual
                      </SelectItem>
                      <SelectItem key="contains" value="contains">
                        Contiene
                      </SelectItem>
                      <SelectItem key="not_contains" value="not_contains">
                        No contiene
                      </SelectItem>
                      <SelectItem key="starts_with" value="starts_with">
                        Empieza con
                      </SelectItem>
                      <SelectItem key="ends_with" value="ends_with">
                        Termina con
                      </SelectItem>
                      <SelectItem key="is_null" value="is_null">
                        Es nulo
                      </SelectItem>
                      <SelectItem key="is_not_null" value="is_not_null">
                        No es nulo
                      </SelectItem>
                    </Select>

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
                ))}
              </div>
            )}

            <div className="mt-4">
              <Text color="white" variant="body">
                Total de registros: {sortedItems.length}
              </Text>
            </div>
          </div>

          <Table
            aria-label="Tabla de Registros de Tambo"
            selectionMode="none"
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor) =>
              setSortDescriptor(descriptor as LocalSortDescriptor)
            }
            classNames={{
              wrapper: "bg-transparent overflow-x-auto",
              th: "bg-[#ff5b00] text-[#fff] font-semibold text-center whitespace-nowrap",
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
              items={paginatedItems}
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

          {/* Paginación */}
          {totalPages > 0 && (
            <div className="flex justify-center mt-4">
              <Pagination
                isCompact
                showControls
                showShadow
                className="pagination-reservas"
                classNames={{
                  wrapper: "gap-2",
                  cursor: "bg-[#ff5b00] text-white shadow-md",
                  item: "bg-transparent",
                  prev: "bg-white",
                  next: "bg-white"
                }}
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </div>
      </Col>
    </Container>
  );
}
