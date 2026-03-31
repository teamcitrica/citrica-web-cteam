"use client";

import { useState, useMemo, useCallback } from "react";

import { Divider } from "@heroui/divider";
import { Container, Col, Text, Icon } from "citrica-ui-toolkit";

import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";

import { getContractedServiceColumns } from "./columns/contracted-service-columns";
import ContractedServiceDrawer from "./components/contracted-service-drawer";
import DeleteContractedServiceModal from "./components/delete-contracted-service-modal";
import { MOCK_DATA } from "./types";

import type { ContractedService } from "./types";

type StatusFilter = "todos" | "al_dia" | "pendiente_pago";

export default function ServiciosContratadosPage() {
  // Filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Delete modal
  const [itemToDelete, setItemToDelete] = useState<ContractedService | null>(null);

  // Handlers
  const handleEdit = useCallback((_item: ContractedService) => {
    setIsDrawerOpen(true);
  }, []);

  const handleDelete = useCallback((item: ContractedService) => {
    setItemToDelete(item);
  }, []);

  // Datos filtrados
  const filteredData = useMemo(() => {
    let data = MOCK_DATA;

    if (statusFilter !== "todos") {
      data = data.filter((d) => d.status === statusFilter);
    }
    if (companyFilter !== "all") {
      data = data.filter((d) => d.company_name === companyFilter);
    }

    return data;
  }, [statusFilter, companyFilter]);

  // Columnas
  const columns = useMemo(
    () =>
      getContractedServiceColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  );

  // Opciones de filtro empresa (extraidas del mock)
  const companyOptions = useMemo(() => {
    const unique = [...new Set(MOCK_DATA.map((d) => d.company_name))];

    return [
      { id: "all", name: "Todas las empresas" },
      ...unique.map((name) => ({ id: name, name })),
    ];
  }, []);

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <Text as="h1" className="mb-4" isAdmin={true} color="#16305A" variant="title" weight="bold">
          SERVICIOS CONTRATADOS
        </Text>

        <DataTable<ContractedService>
          columns={columns}
          data={filteredData}
          isLoading={false}
          searchFields={[]}
          showCustomAutocomplete={true}
          customAutocompleteItems={companyOptions}
          customAutocompletePlaceholder="Filtrar por empresa..."
          customAutocompleteSelectedKey={companyFilter}
          onCustomAutocompleteChange={(key) => setCompanyFilter(key || "all")}
          onAdd={() => setIsDrawerOpen(true)}
          addButtonText="Nuevo registro"
          addButtonIcon={<Icon name="Plus" size={16} />}
          emptyContent="No hay servicios contratados"
          headerColor="#265197"
          headerTextColor="#ffffff"
          paginationColor="#265197"
          getRowKey={(item) => item.id}
          customFilters={
            <>
              <div className="flex flex-wrap gap-3 pb-4 items-center">
                <FilterButtonGroup
                  buttons={[
                    { value: "todos", label: "Todos" },
                    { value: "al_dia", label: "Al día" },
                    { value: "pendiente_pago", label: "Pendiente" },
                  ]}
                  selectedValue={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                />
              </div>
              <Divider className="bg-[#D4DEED]" />
            </>
          }
        />

        {/* Drawer */}
        <ContractedServiceDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        {/* Delete modal */}
        {itemToDelete && (
          <DeleteContractedServiceModal
            contractedService={itemToDelete}
            onConfirm={() => setItemToDelete(null)}
            onCancel={() => setItemToDelete(null)}
          />
        )}
      </Col>
    </Container>
  );
}
