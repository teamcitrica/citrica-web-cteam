"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

import { Divider } from "@heroui/divider";
import { Container, Col, Text, Icon } from "citrica-ui-toolkit";

import { useContractedServices } from "@/hooks/contracted-services/use-contracted-services";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useContactCRUD } from "@/hooks/contact/use-contact";
import { useServices } from "@/hooks/services/use-services";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";

import { getContractedServiceColumns } from "./columns/contracted-service-columns";
import ContractedServiceDrawer from "./components/contracted-service-drawer";
import DeleteContractedServiceModal from "./components/delete-contracted-service-modal";

import type { ContractedService, ContractedServiceInput } from "@/hooks/contracted-services/use-contracted-services";

type StatusFilter = "todos" | "al_dia" | "pendiente_pago";

export default function ServiciosContratadosPage() {
  // Hooks
  const {
    contractedServices,
    isLoading,
    fetchContractedServices,
    createContractedService,
    updateContractedService,
    deleteContractedService,
  } = useContractedServices();

  const { companies, fetchCompanies } = useCompanyCRUD();
  const { contacts, fetchContacts } = useContactCRUD();
  const { services, fetchServices } = useServices();

  // Filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContractedService | null>(null);

  // Delete modal
  const [itemToDelete, setItemToDelete] = useState<ContractedService | null>(null);

  // Fetch inicial
  useEffect(() => {
    fetchContractedServices();
    fetchCompanies();
    fetchContacts();
    fetchServices();
  }, [fetchContractedServices, fetchCompanies, fetchContacts, fetchServices]);

  // Handlers
  const handleCreate = () => {
    setSelectedItem(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = useCallback((item: ContractedService) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  }, []);

  const handleDelete = useCallback((item: ContractedService) => {
    setItemToDelete(item);
  }, []);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteContractedService(itemToDelete.id);
    setItemToDelete(null);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async (data: ContractedServiceInput) => {
    let success = false;

    if (selectedItem) {
      success = await updateContractedService(selectedItem.id, data);
    } else {
      success = await createContractedService(data);
    }
    if (success) handleCloseDrawer();
  };

  // Datos filtrados
  const filteredData = useMemo(() => {
    let data = contractedServices;

    if (statusFilter !== "todos") {
      data = data.filter((d) => d.status === statusFilter);
    }
    if (companyFilter !== "all") {
      data = data.filter((d) => d.company_id.toString() === companyFilter);
    }

    return data;
  }, [contractedServices, statusFilter, companyFilter]);

  // Columnas
  const columns = useMemo(
    () =>
      getContractedServiceColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  );

  // Opciones de filtro empresa
  const companyOptions = useMemo(() => {
    const uniqueIds = [...new Set(contractedServices.map((d) => d.company_id))];

    return [
      { id: "all", name: "Todas las empresas" },
      ...uniqueIds.map((id) => {
        const company = companies.find((c) => c.id === id);

        return { id: id.toString(), name: company?.name || "Sin empresa" };
      }),
    ];
  }, [contractedServices, companies]);

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <Text as="h1" className="mb-4" isAdmin={true} color="#16305A" variant="title" weight="bold">
          SERVICIOS CONTRATADOS
        </Text>

        <DataTable<ContractedService>
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          searchFields={[]}
          showCustomAutocomplete={true}
          customAutocompleteItems={companyOptions}
          customAutocompletePlaceholder="Filtrar por empresa..."
          customAutocompleteSelectedKey={companyFilter}
          onCustomAutocompleteChange={(key) => setCompanyFilter(key || "all")}
          onAdd={handleCreate}
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
          contractedService={selectedItem}
          contacts={contacts}
          companies={companies}
          services={services}
          onClose={handleCloseDrawer}
          onSave={handleSave}
        />

        {/* Delete modal */}
        {itemToDelete && (
          <DeleteContractedServiceModal
            contractedService={itemToDelete}
            onConfirm={handleConfirmDelete}
            onCancel={() => setItemToDelete(null)}
          />
        )}
      </Col>
    </Container>
  );
}
