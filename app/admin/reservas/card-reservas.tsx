"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
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
import Icon from "@ui/atoms/icon";
import Text from "@/shared/components/citrica-ui/atoms/text";
import { useReservas, Reserva, ReservaEstado } from "@/hooks/reservas/use-reservas";
import ReservaDetailModal from "./components/modal-details-reserva";

const columns = [
  { name: "NOMBRE", uid: "nombre", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "FECHA", uid: "fecha", sortable: true },
  { name: "HORARIO", uid: "horario" },
  { name: "ESTADO", uid: "estado", sortable: true },
  { name: "CAMBIAR ESTADO", uid: "cambiar_estado" },
  { name: "ACCIONES", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["nombre", "email", "fecha", "horario", "estado", "cambiar_estado", "actions"];
const ITEMS_PER_PAGE = 15;

interface CardReservasProps {
  reservas: Reserva[];
  refresh: () => void;
}

export default function CardReservas({
  reservas,
  refresh,
}: CardReservasProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<Set<React.Key>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para manejar los modales
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { refreshReservas, deleteReserva, updateReservaStatus } = useReservas();

  type LocalSortDescriptor = {
    column: string;
    direction: "ascending" | "descending";
  };

  useEffect(() => {
    if (reservas.length >= 0) {
      setIsLoading(false);
    }
  }, [reservas, refresh]);

  useEffect(() => {
    refreshReservas();
  }, [refreshReservas]);

  const [sortDescriptor, setSortDescriptor] = useState<LocalSortDescriptor>({
    column: "fecha",
    direction: "descending",
  });

  const headerColumns = useMemo(() => {
    if (visibleColumns.has("all")) return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredReservas = useMemo(() => {
    let filtered = reservas;

    // Filtro por búsqueda en el input
    if (searchTerm.trim()) {
      filtered = filtered.filter((reserva) => {
        const nombre = reserva.name || "";
        const email = reserva.email || "";
        return (
          nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  }, [reservas, searchTerm, refresh]);

  // Ordenar reservas
  const sortedItems = useMemo(() => {
    return [...filteredReservas].sort((a, b) => {
      let first: any;
      let second: any;

      if (sortDescriptor.column === "nombre") {
        first = (a.name || "").toLowerCase();
        second = (b.name || "").toLowerCase();
      } else if (sortDescriptor.column === "email") {
        first = (a.email || "").toLowerCase();
        second = (b.email || "").toLowerCase();
      } else if (sortDescriptor.column === "fecha") {
        first = new Date(a.created_at).getTime();
        second = new Date(b.created_at).getTime();
      } else {
        return 0;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredReservas, sortDescriptor]);

  // Calcular cantidad de páginas
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);

  // Obtener reservas para la página actual
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;

    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedItems, page]);

  const handleViewReserva = useCallback((reserva: Reserva) => {
    setSelectedReserva(reserva);
    setIsDetailModalOpen(true);
  }, []);

  const handleDeleteReserva = useCallback(
    async (reserva: Reserva) => {
      if (window.confirm(`¿Estás seguro de eliminar la reserva de ${reserva.name}?`)) {
        await deleteReserva(reserva.id);
        refresh();
      }
    },
    [deleteReserva, refresh]
  );

  const handleStatusChange = useCallback(
    async (reservaId: string, newStatus: ReservaEstado) => {
      await updateReservaStatus(reservaId, newStatus);
      refresh();
    },
    [updateReservaStatus, refresh]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getStatusColor = (status: ReservaEstado) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-[#fff] bg-[#FFA05A]';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: ReservaEstado) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
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

  const renderCell = useCallback(
    (reserva: Reserva, columnKey: React.Key) => {
      switch (columnKey) {
        case "nombre":
          return (
            <div className="flex items-center gap-2 text-black">
              {reserva.name}
            </div>
          );
        case "email":
          return (
            <p className="text-sm text-black">{reserva.email}</p>
          );
        case "fecha":
          return (
            <p className="text-sm text-black">{formatDate(reserva.booking_date)}</p>
          );
        case "horario":
          return (
            <p className="text-sm text-black">
              {reserva.time_slots && reserva.time_slots.length > 0
                ? reserva.time_slots.join(', ')
                : "Sin horario"}
            </p>
          );
        case "estado":
          return (
            <div className="flex justify-center">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(reserva.status || 'pending')}`}>
                {getStatusLabel(reserva.status || 'pending')}
              </span>
            </div>
          );
        case "cambiar_estado":
          return (
            <div className="flex justify-center">
              <Select
                aria-label="Cambiar estado"
                className="max-w-[180px]"
                classNames={{
                  trigger: "!h-9 min-h-9",
                  value: "text-sm",
                }}
                selectedKeys={reserva.status ? [reserva.status] : ['pending']}
                size="sm"
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as ReservaEstado;
                  if (selectedKey) {
                    handleStatusChange(reserva.id, selectedKey);
                  }
                }}
              >
                <SelectItem key="pending" textValue="Pendiente">
                  Pendiente
                </SelectItem>
                <SelectItem key="confirmed" textValue="Confirmada">
                  Confirmada
                </SelectItem>
                <SelectItem key="cancelled" textValue="Cancelada">
                  Cancelada
                </SelectItem>
              </Select>
            </div>
          );
        case "actions":
          return (
            <div className="flex items-end justify-center w-full gap-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleViewReserva(reserva)}
              >
                <Icon className="w-5 h-5" name="Eye" />
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteReserva(reserva)}
              >
                <Icon className="w-5 h-5" name="Trash2" />
              </button>
            </div>
          );
        default:
          return null;
      }
    },
    [handleViewReserva, handleDeleteReserva, handleStatusChange],
  );

  return isLoading ? (
    <div className="w-full h-40 flex justify-center items-center">
      <Spinner color="secondary" size="md" />
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      <div className="container-blue-principal">
        <div className="flex items-center gap-6">
          <Input
            className="text-[#3E688E] min-w-[268px]"
            classNames={{
              inputWrapper:
                "!bg-[#F4F4F5] !text-[#3E688E] !placeholder-[#719BC1] input-ui-pro input-ui-pro",
              mainWrapper: "",
            }}
            placeholder="Buscar por nombre o email"
            startContent={
              <Icon className="mr-2" color="#719BC1" name="Search" />
            }
            value={searchTerm}
            variant="faded"
            onChange={handleSearchChange}
          />
        </div>

        <div className="mt-4">
          <Text color="white" variant="body">
            Total de reservas: {sortedItems.length}
          </Text>
        </div>
      </div>
      <Table
        aria-label="Tabla de Reservas"
        selectedKeys={
          Array.from(selectedKeys) as Iterable<
            import("@react-types/shared").Key
          >
        }
        selectionMode="none"
        sortDescriptor={sortDescriptor}
        onSelectionChange={(keys) => setSelectedKeys(new Set(keys))}
        onSortChange={(descriptor) =>
          setSortDescriptor(descriptor as LocalSortDescriptor)
        }
        classNames={{
          wrapper: "bg-transparent",
          th: "bg-[#ff5b00] text-[#fff] font-semibold text-center",
          td: "text-gray-700 text-center",
        }}
      >
        <TableHeader columns={headerColumns}>
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
          emptyContent={"No se encontraron reservas"}
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

      {/* Modal de detalles */}
      {isDetailModalOpen && selectedReserva && (
        <ReservaDetailModal
          reserva={selectedReserva}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedReserva(null);
          }}
        />
      )}
    </div>
  );
}
