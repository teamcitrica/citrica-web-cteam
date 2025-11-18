"use client";
import React, { useState, useCallback, useMemo } from "react";
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
} from "@heroui/react";
import { Button } from "@heroui/react";
import Icon from "@ui/atoms/icon";
import Text from "@/shared/components/citrica-ui/atoms/text";

export interface Column<T> {
  name: string;
  uid: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  itemsPerPage?: number;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  onAdd?: () => void;
  addButtonText?: string;
  emptyContent?: string;
  headerColor?: string;
  headerTextColor?: string;
  paginationColor?: string;
  getRowKey: (item: T) => string | number;
  renderActions?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  itemsPerPage = 15,
  searchPlaceholder = "Buscar...",
  searchKey,
  onAdd,
  addButtonText = "Agregar",
  emptyContent = "No se encontraron registros",
  headerColor = "#42668A",
  headerTextColor = "#ffffff",
  paginationColor = "#42668A",
  getRowKey,
  renderActions,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  type LocalSortDescriptor = {
    column: string;
    direction: "ascending" | "descending";
  };

  const [sortDescriptor, setSortDescriptor] = useState<LocalSortDescriptor>({
    column: columns[0]?.uid || "",
    direction: "ascending",
  });

  // Agregar columna de acciones si hay renderActions
  const tableColumns = useMemo(() => {
    if (renderActions) {
      return [...columns, { name: "ACCIONES", uid: "actions" }];
    }
    return columns;
  }, [columns, renderActions]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || !searchKey) {
      return data;
    }

    return data.filter((item) => {
      const value = item[searchKey];
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [data, searchTerm, searchKey]);

  // Ordenar datos
  const sortedItems = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof T];
      const second = b[sortDescriptor.column as keyof T];

      let cmp = 0;
      if (typeof first === "string" && typeof second === "string") {
        cmp = first.toLowerCase() < second.toLowerCase() ? -1 : first.toLowerCase() > second.toLowerCase() ? 1 : 0;
      } else if (typeof first === "number" && typeof second === "number") {
        cmp = first < second ? -1 : first > second ? 1 : 0;
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredData, sortDescriptor]);

  // Calcular páginas
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  // Obtener items para la página actual
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, page, itemsPerPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const renderCell = useCallback(
    (item: T, columnKey: React.Key) => {
      if (columnKey === "actions" && renderActions) {
        return renderActions(item);
      }

      const column = columns.find((col) => col.uid === columnKey);
      if (column?.render) {
        return column.render(item);
      }

      const value = item[columnKey as keyof T];
      if (value === null || value === undefined) {
        return "-";
      }
      return String(value);
    },
    [columns, renderActions]
  );

  if (isLoading) {
    return (
      <div className="w-full h-40 flex justify-center items-center">
        <Spinner color="primary" size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="container-blue-principal">
        <div className="flex items-center gap-6">
          {searchKey && (
            <Input
              className="text-[#3E688E] min-w-[268px]"
              classNames={{
                inputWrapper:
                  "!bg-[#F4F4F5] !text-[#3E688E] !placeholder-[#719BC1] input-ui-pro input-ui-pro",
                mainWrapper: "",
              }}
              placeholder={searchPlaceholder}
              startContent={
                <Icon className="mr-2" color="#719BC1" name="Search" />
              }
              value={searchTerm}
              variant="faded"
              onChange={handleSearchChange}
            />
          )}
        </div>

        {onAdd && (
          <Button
            className={`bg-[${headerColor}] mt-[10px] text-white py-[6px] px-[6px] rounded-lg border-2 border-white`}
            startContent={<Icon className="w-4 h-4" name="Plus" />}
            onClick={onAdd}
          >
            <Text color="white" variant="label">
              {addButtonText}
            </Text>
          </Button>
        )}
      </div>

      <Table
        aria-label="Tabla de datos"
        selectionMode="none"
        sortDescriptor={sortDescriptor}
        onSortChange={(descriptor) =>
          setSortDescriptor(descriptor as LocalSortDescriptor)
        }
        classNames={{
          wrapper: "bg-transparent",
          th: `bg-[${headerColor}] text-[${headerTextColor}] font-semibold text-center`,
          td: "text-gray-700 text-center",
        }}
      >
        <TableHeader columns={tableColumns}>
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
        <TableBody emptyContent={emptyContent} items={paginatedItems}>
          {(item) => (
            <TableRow key={getRowKey(item)} className="items-center">
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            isCompact
            showControls
            showShadow
            classNames={{
              cursor: `!bg-[${paginationColor}] text-white`,
            }}
            page={page}
            total={totalPages}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
