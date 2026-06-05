"use client";
import { Text, Select, Input, Button, Icon } from "citrica-ui-toolkit";

import { usePollaEncrypted } from "@/hooks/polla-encrypted/use-polla-encrypted";

type Props = {
  table: ReturnType<typeof usePollaEncrypted>;
};

export default function PollaFilterBar({ table }: Props) {
  const {
    filters,
    hasSearched,
    totalRecords,
    activeAppliedFilters,
    exporting,
    canApply,
    loading,
    hasInvalidFilter,
    hasValidFilter,
    filterableColumnOptions,
    getOperatorsForColumn,
    getColumnName,
    getOperatorLabel,
    addFilter,
    removeFilter,
    updateFilter,
    clearAllFilters,
    applyFiltersToServer,
    handleDownloadExcel,
  } = table;

  return (
    <div
      className={`flex flex-col gap-3 ${
        filters.length > 0 || hasSearched ? "pb-4" : "pb-8"
      }`}
    >
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
                  className="flex items-center justify-end gap-2 px-2 py-0.5 rounded-lg"
                >
                  {/* Selector de columna */}
                  <Select
                    className="text-[#3E688E] w-[140px]"
                    classNames={{
                      trigger: "!bg-[#F4F4F5] !text-[#3E688E]",
                      value: "!text-[#3E688E]",
                    }}
                    options={filterableColumnOptions}
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
}
