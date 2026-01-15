"use client";
import { Skeleton } from "@heroui/skeleton";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Icon from "@ui/atoms/icon";
import { Text, Button, Input, Autocomplete } from "citrica-ui-toolkit";
import ExportModal from "./export-modal";
import { useTableFeatures, ExportColumn } from "@/shared/hooks/useTableFeatures";
// import "./data-table.css";

export interface Column<T extends Record<string, any>> {
  name: string;
  uid: string;
  sortable?: boolean;
  align?: "start" | "center" | "end";
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
  addButtonIcon?: React.ReactNode;
  exportButtonIcon?: React.ReactNode;
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
  showCompanyFilter?: boolean;
  companies?: Array<{ id: number; name: string | null }>;
  companyFilterField?: keyof T;
  companyFilterPlaceholder?: string;
  showCustomAutocomplete?: boolean;
  customAutocompleteItems?: Array<{ id: string; name: string }>;
  customAutocompletePlaceholder?: string;
  customAutocompleteSelectedKey?: string;
  onCustomAutocompleteChange?: (key: string) => void;
  serverSidePagination?: boolean;
  totalRecords?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onExport?: (format: string, fileName: string) => Promise<void>;
  onSearchChange?: (searchValue: string) => void;
  searchValue?: string;
  onSortChange?: (column: string, direction: "ascending" | "descending") => void;
  removeWrapper?: boolean;
  customContainerClass?: string;
  customFilters?: React.ReactNode;
  showFilterIndicators?: boolean;
  totalRecordsLabel?: string;
  activeFilters?: Array<{
    label: string;
    value: string;
    onClear: () => void;
  }>;
  permanentFilters?: Array<{
    column: string;
    value: string;
  }>;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  itemsPerPage = 50,
  searchFields = [],
  searchPlaceholder = "Buscar...",
  onAdd,
  addButtonText = "Agregar",
  addButtonIcon,
  exportButtonIcon,
  emptyContent = "No se encontraron registros",
  headerColor = "#265197",
  headerTextColor = "#ffffff",
  paginationColor = "#265197",
  getRowKey,
  renderActions,
  enableExport = false,
  exportColumns = [],
  exportTitle = "Tabla de datos",
  tableName = "tabla",
  showCompanyFilter = false,
  companies = [],
  companyFilterField,
  companyFilterPlaceholder = "Filtrar por empresa...",
  showCustomAutocomplete = false,
  customAutocompleteItems = [],
  customAutocompletePlaceholder = "Buscar...",
  customAutocompleteSelectedKey = "",
  onCustomAutocompleteChange,
  serverSidePagination = false,
  totalRecords = 0,
  currentPage = 1,
  onPageChange,
  onExport,
  onSearchChange: onSearchChangeServer,
  searchValue: searchValueServer,
  onSortChange: onSortChangeServer,
  removeWrapper = false,
  customContainerClass = "container-blue-principal",
  customFilters,
  showFilterIndicators = false,
  totalRecordsLabel,
  activeFilters = [],
  permanentFilters = [],
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
    <div className={`${customContainerClass} container-blue-principal2 h-full flex flex-col`}>
      {/* Custom Filters en su propia fila */}
      {customFilters && (
        <div className="w-full flex-shrink-0">
          {customFilters}
        </div>
      )}

      {/* Barra de búsqueda y acciones */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full py-3 flex-shrink-0 gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-0">
          {/* Autocomplete personalizado O Filtro de empresa */}
          {showCustomAutocomplete && customAutocompleteItems.length > 0 ? (
            <Autocomplete
              placeholder={customAutocompletePlaceholder}
              selectedKey={customAutocompleteSelectedKey || "all"}
              onSelectionChange={(key) => {
                onCustomAutocompleteChange?.(key || "all");
              }}
              options={customAutocompleteItems.map(item => ({
                value: item.id,
                label: item.name,
              }))}
              variant="bordered"
              fullWidth={false}
              className="w-full sm:w-56"
              classNames={{
                base: "!border-none",
                listboxWrapper: "!border-none",
                popoverContent: "!border-none",
              }}
            />
          ) : showCompanyFilter && companies.length > 0 ? (
            <Autocomplete
              variant="bordered"
              placeholder={companyFilterPlaceholder}
              options={[
                { value: 'all', label: 'Todas las empresas' },
                ...companies.map(c => ({ value: String(c.id), label: c.name || 'Sin nombre' }))
              ]}
              selectedKey={tableFeatures.companyFilter && tableFeatures.companyFilter !== "" && tableFeatures.companyFilter !== "all" ? tableFeatures.companyFilter : null}
              onSelectionChange={(key) => {
                tableFeatures.onCompanyFilterChange(key ? new Set([String(key)]) : new Set(["all"]));
              }}
              isClearable={false}
              fullWidth={false}
              className="w-full sm:w-56 [&_[data-slot='input-wrapper']]:bg-transparent [&_[data-slot='input-wrapper']]:!border-[#D4DEED] [&_[data-slot='input-wrapper']:hover]:!border-[#265197] [&_[data-slot='input-wrapper'][data-hover=true]]:!border-[#265197] [&_[data-slot='input-wrapper'][data-focus=true]]:!border-[#265197] [&_[data-slot='input-wrapper'][data-focus-visible=true]]:!border-[#265197] [&_[data-slot='input-wrapper']:focus-within]:!border-[#265197] [&_input]:text-[#265197]"
              classNames={{
                base: "bg-transparent",
                listboxWrapper: "!border-none",
                popoverContent: "!border-none",
              }}
            />
          ) : null}

          {/* Input de búsqueda */}
          {searchFields.length > 0 && (
            <Input
              type="text"
              placeholder={searchPlaceholder || "Buscar..."}
              value={serverSidePagination ? (searchValueServer || "") : tableFeatures.filterValue}
              onChange={(e) => {
                if (serverSidePagination && onSearchChangeServer) {
                  onSearchChangeServer(e.target.value);
                } else {
                  tableFeatures.setFilterValue(e.target.value);
                }
              }}
              startContent={<Icon size={16} color="#265197" name="Search" />}
              className="w-full sm:w-56"
              variant="faded"
              classNames={{
                inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                label: "!text-[#265197]",
                input: "placeholder:text-[#A7BDE2] !text-[#265197]",
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {enableExport && (
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isAdmin
                  variant="primary"
                  startContent={exportButtonIcon || <Icon size={16} name="Download" />}
                  label="Descargar"
                  className="w-full sm:w-auto"
                />
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
                  startContent={<Icon size={16} name="FileSpreadsheet" />}
                >
                  Excel (.xlsx)
                </DropdownItem>
                <DropdownItem
                  key="csv"
                  startContent={<Icon size={16} name="FileText" />}
                >
                  CSV (.csv)
                </DropdownItem>
                <DropdownItem
                  key="pdf"
                  startContent={<Icon size={16} name="FileDown" />}
                >
                  PDF (.pdf)
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}

          {onAdd && (
            <Button
              isAdmin
              variant="primary"
              startContent={addButtonIcon || <Icon size={16} name="UserPlus" />}
              onClick={onAdd}
              label={addButtonText}
              className="w-full sm:w-auto"
            />
          )}
        </div>
      </div>

      {/* Indicadores de filtros activos - solo para client table */}
      {showFilterIndicators && (
        <>
          <Divider className="mb-4" />
          <div className="flex gap-2 items-center pb-4">

            {totalRecordsLabel && (
              <p>
                <Text variant="label" color="#265197">{totalRecordsLabel}</Text>
              </p>
            )}
            {totalRecordsLabel && (permanentFilters.length > 0 || activeFilters.length > 0) && (
              <Divider className="h-[20px] bg-[#A7BDE2]" orientation="vertical" />
            )}

            {/* Filtros permanentes del asset */}
            {permanentFilters.length > 0 && (
              <div className="flex items-center gap-2">
                <span>
                  <Text variant="label" color="#265197">Filtro activo:</Text>
                </span>
                {permanentFilters.map((filter, index) => (
                  <span key={index}>
                    <Text variant="label" color="#265197">{filter.column} = {filter.value}</Text>
                  </span>
                ))}
              </div>
            )}
            {permanentFilters.length > 0 && activeFilters.length > 0 && (
              <Divider className="h-[20px] bg-[#A7BDE2]" orientation="vertical" />
            )}

            {/* Indicadores de filtros activos */}
            <div className="space-y-2">
              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {activeFilters.map((filter, index) => (
                    <Chip
                      key={index}
                      color="default"
                      variant="bordered"
                      size="sm"
                      classNames={{
                        base: "!border-[#A7BDE2]",
                      }}
                      onClose={filter.onClear}
                      endContent={
                        <Image src="/img/x.svg" alt="Cerrar" width={16} height={16} className="cursor-pointer" />
                      }
                    >
                      {filter.value}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </div>

        </>
      )}

      {/* Contenedor de tabla con scroll horizontal y vertical */}
      <div className="table-scroll-container flex-1">
        {/* Tabla */}
        <Table
          isStriped
          removeWrapper={removeWrapper}
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
            wrapper: "!p-0 rounded-none",
            tr: "data-[odd=true]:bg-[#EEF1F7]",
          }}
        >
          <TableHeader columns={tableColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.align || "start"}
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
          <div className="flex justify-center mt-4 flex-shrink-0">
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
          <div className="flex justify-center mt-4 flex-shrink-0">
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
