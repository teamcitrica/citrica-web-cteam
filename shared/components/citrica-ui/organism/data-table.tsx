"use client";
import React, { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
  Pagination,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { ButtonCitricaAdmin, SelectCitricaAdmin, InputCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import Icon from "@ui/atoms/icon";
import Text from "@/shared/components/citrica-ui/atoms/text";
import ExportModal from "./export-modal";
import { useTableFeatures, ExportColumn } from "@/shared/hooks/useTableFeatures";
import "./data-table.css";

export interface Column<T extends Record<string, any>> {
  name: string;
  uid: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  itemsPerPage?: number;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  onAdd?: () => void;
  addButtonText?: string;
  emptyContent?: string;
  headerColor?: string;
  headerTextColor?: string;
  paginationColor?: string;
  getRowKey: (item: T) => string | number;
  renderActions?: (item: T) => React.ReactNode;
  enableExport?: boolean;
  exportColumns?: ExportColumn[];
  exportTitle?: string;
  tableName?: string;
  showRowsPerPageSelector?: boolean;
  // Filtro de empresa
  showCompanyFilter?: boolean;
  companies?: Array<{ id: number; name: string | null }>;
  companyFilterField?: keyof T;
  companyFilterPlaceholder?: string;
  // Paginación del servidor
  serverSidePagination?: boolean;
  totalRecords?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Custom export para paginación de backend
  onExport?: (format: string, fileName: string) => Promise<void>;
  // Búsqueda del servidor
  onSearchChange?: (searchValue: string) => void;
  searchValue?: string;
  // Ordenamiento del servidor
  onSortChange?: (column: string, direction: "ascending" | "descending") => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  itemsPerPage = 50,
  searchPlaceholder = "Buscar...",
  searchFields = [],
  onAdd,
  addButtonText = "Agregar",
  emptyContent = "No se encontraron registros",
  headerColor = "#42668A",
  headerTextColor = "#ffffff",
  paginationColor = "#42668A",
  getRowKey,
  renderActions,
  enableExport = false,
  exportColumns = [],
  exportTitle = "Tabla de datos",
  tableName = "tabla",
  showRowsPerPageSelector = false,
  showCompanyFilter = false,
  companies = [],
  companyFilterField,
  companyFilterPlaceholder = "Filtrar por empresa...",
  serverSidePagination = false,
  totalRecords = 0,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  onExport,
  onSearchChange: onSearchChangeServer,
  searchValue: searchValueServer,
  onSortChange: onSortChangeServer,
}: DataTableProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const tableFeatures = useTableFeatures({
    data,
    initialRowsPerPage: itemsPerPage,
    searchFields,
    defaultSortColumn: columns[0]?.uid as keyof T,
    defaultSortDirection: "ascending",
    companyFilterField,
  });

  // Agregar columna de acciones si hay renderActions
  const tableColumns = useMemo(() => {
    if (renderActions) {
      return [...columns, { name: "ACCIONES", uid: "actions" }];
    }
    return columns;
  }, [columns, renderActions]);

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

  return (
    <div className="container-blue-principal">
      {/* Barra de búsqueda y acciones */}
      <div className="flex items-center justify-between w-full pb-6 pt-3">
          <div className="flex items-center gap-4 ">
            {/* Filtro de empresa */}
            {showCompanyFilter && companies.length > 0 && (
              <SelectCitricaAdmin
                aria-label="Filtrar por empresa"
                placeholder="Filtrar por empresa"
                selectedKeys={tableFeatures.companyFilter && tableFeatures.companyFilter !== "" ? [tableFeatures.companyFilter] : ["all"]}
                onSelectionChange={tableFeatures.onCompanyFilterChange}
              >
                {[
                  <SelectItem
                    key="all"
                    classNames={{
                      base: "!border-none data-[hover=true]:bg-gray-100 data-[hover=true]:!border-none data-[selectable=true]:focus:bg-gray-200 data-[selectable=true]:focus:!border-none !outline-none",
                      wrapper: "!border-none",
                    }}
                    style={{
                      border: 'none',
                      borderColor: 'transparent',
                      borderWidth: '0',
                    } as React.CSSProperties}
                  >
                    Todas las empresas
                  </SelectItem>,
                  ...companies.map((company) => (
                    <SelectItem
                      key={String(company.id)}
                      classNames={{
                        base: "!border-none data-[hover=true]:bg-gray-100 data-[hover=true]:!border-none data-[selectable=true]:focus:bg-gray-200 data-[selectable=true]:focus:!border-none !outline-none",
                        wrapper: "!border-none",
                      }}
                      style={{
                        border: 'none',
                        borderColor: 'transparent',
                        borderWidth: '0',
                      } as React.CSSProperties}
                    >
                      {company.name || "Sin nombre"}
                    </SelectItem>
                  )),
                ]}
              </SelectCitricaAdmin>
            )}

            {searchFields.length > 0 && (
              <div className="search-input-wrapper">
                <InputCitricaAdmin
                  placeholder={searchPlaceholder}
                  endContent={<Icon className="ml-2" color="#719BC1" name="Search" />}
                  value={serverSidePagination && onSearchChangeServer ? (searchValueServer || "") : tableFeatures.filterValue}
                  onChange={(e) => {
                    if (serverSidePagination && onSearchChangeServer) {
                      onSearchChangeServer(e.target.value);
                    } else {
                      tableFeatures.onSearchChange(e.target.value);
                    }
                  }}
                />
              </div>
            )}

            {/* {showRowsPerPageSelector && (
              <Select
                label="Filas por página"
                className="min-w-[150px]"
                selectedKeys={[String(tableFeatures.rowsPerPage)]}
                onChange={tableFeatures.onRowsPerPageChange}
              >
                <SelectItem key="10">10</SelectItem>
                <SelectItem key="15">15</SelectItem>
                <SelectItem key="20">20</SelectItem>
                <SelectItem key="50">50</SelectItem>
              </Select>
            )} */}
          </div>

          <div className="flex items-center gap-2">
            {enableExport && (
              <Dropdown>
                <DropdownTrigger>
                  <ButtonCitricaAdmin
                    variant="export"
                    startContent={<Icon className="w-4 h-4" name="Download" />}
                    size="sm"
                  >
                    Exportar
                  </ButtonCitricaAdmin>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Opciones de exportación"
                  onAction={(key) => {
                    if (serverSidePagination && onExport) {
                      // Para paginación de backend, usar onExport custom
                      const fileName = tableFeatures.getDefaultFileName(tableName);
                      tableFeatures.setFileName(fileName);
                      tableFeatures.setExportFormat(key as string);
                      tableFeatures.setIsExportModalOpen(true);
                    } else {
                      tableFeatures.handleOpenExportModal(key as string, tableName);
                    }
                  }}
                >
                  <DropdownItem
                    key="excel"
                    startContent={<Icon className="w-4 h-4" name="FileSpreadsheet" />}
                  >
                    Excel (.xlsx)
                  </DropdownItem>
                  <DropdownItem
                    key="csv"
                    startContent={<Icon className="w-4 h-4" name="FileText" />}
                  >
                    CSV (.csv)
                  </DropdownItem>
                  <DropdownItem
                    key="pdf"
                    startContent={<Icon className="w-4 h-4" name="FileDown" />}
                  >
                    PDF (.pdf)
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}

            {onAdd && (
              <ButtonCitricaAdmin
                variant="primary"
                style={{ backgroundColor: headerColor }}
                startContent={<Icon className="w-4 h-4" name="Plus" />}
                onPress={onAdd}
              >
                <Text color="white" variant="label">
                  {addButtonText}
                </Text>
              </ButtonCitricaAdmin>
            )}
          </div>
        </div>

      {/* Contenedor de tabla con scroll horizontal */}
      <div className="overflow-x-auto">
        {/* Tabla */}
        <Table
        isStriped
        removeWrapper
        aria-label="Tabla de datos"
        selectionMode="none"
        sortDescriptor={tableFeatures.sortDescriptor}
        onSortChange={(descriptor) => {
          if (serverSidePagination && onSortChangeServer) {
            // Para paginación de backend, usar onSortChange custom
            if (descriptor.column) {
              onSortChangeServer(
                descriptor.column as string,
                descriptor.direction as "ascending" | "descending"
              );
            }
          } else {
            tableFeatures.setSortDescriptor(descriptor);
          }
        }}
        classNames={{
          tr: "data-[odd=true]:bg-[#EEF1F7]",
        }}
      >
        <TableHeader columns={tableColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align="center"
              allowsSorting={column.sortable}
              style={{
                backgroundColor: headerColor,
                color: headerTextColor,
              }}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={emptyContent}
          items={tableFeatures.paginatedItems}
        >
          {isLoading ? (
            // Skeleton rows durante la carga
            Array.from({ length: Math.min(itemsPerPage, 10) }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {tableColumns.map((col) => (
                  <TableCell key={col.uid}>
                    <Skeleton className="h-6 w-full rounded-lg" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            (item: any) => (
              <TableRow key={getRowKey(item)} className="items-center">
                {(columnKey: React.Key) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
      </div>

      {/* Paginación */}
      {serverSidePagination ? (
        // Paginación del servidor
        totalRecords > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              isCompact
              showControls
              showShadow
              classNames={{
                cursor: "text-white",
              }}
              style={{
                "--pagination-active-bg": paginationColor,
              } as React.CSSProperties}
              page={currentPage}
              total={Math.ceil(totalRecords / tableFeatures.rowsPerPage)}
              onChange={(page) => {
                if (onPageChange) {
                  onPageChange(page);
                }
              }}
            />
          </div>
        )
      ) : (
        // Paginación del cliente
        tableFeatures.pages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              isCompact
              showControls
              showShadow
              classNames={{
                cursor: "text-white",
              }}
              style={{
                "--pagination-active-bg": paginationColor,
              } as React.CSSProperties}
              page={tableFeatures.page}
              total={tableFeatures.pages}
              onChange={tableFeatures.setPage}
            />
          </div>
        )
      )}

      {/* Modal de exportación */}
      {enableExport && (
        <ExportModal
          isOpen={tableFeatures.isExportModalOpen}
          onClose={() => tableFeatures.setIsExportModalOpen(false)}
          exportFormat={tableFeatures.exportFormat}
          fileName={tableFeatures.fileName}
          onFileNameChange={tableFeatures.setFileName}
          isLoading={isExporting}
          onConfirm={async () => {
            try {
              setIsExporting(true);
              if (serverSidePagination && onExport) {
                // Para paginación de backend, usar onExport custom
                await onExport(tableFeatures.exportFormat, tableFeatures.fileName);
                tableFeatures.setIsExportModalOpen(false);
              } else {
                tableFeatures.handleConfirmExport(exportColumns, exportTitle);
              }
            } finally {
              setIsExporting(false);
            }
          }}
        />
      )}
    </div>
  );
}
