"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

import { Divider } from "@heroui/divider";
import { Container, Col, Text, Icon } from "citrica-ui-toolkit";

import { useContractedServices } from "@/hooks/contracted-services/use-contracted-services";
import { useServicePayments } from "@/hooks/contracted-services/use-service-payments";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useContactCRUD } from "@/hooks/contact/use-contact";
import { useServices } from "@/hooks/services/use-services";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";

import { getContractedServiceColumns } from "./columns/contracted-service-columns";
import ContractedServiceDrawer from "./components/contracted-service-drawer";
import DeleteContractedServiceModal from "./components/delete-contracted-service-modal";
import PaymentHistoryDrawer from "./components/payment-history-drawer";

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

  const { generatePayments, regeneratePayments } = useServicePayments();
  const { companies, fetchCompanies } = useCompanyCRUD();
  const { contacts, fetchContacts } = useContactCRUD();
  const { services, fetchServices } = useServices();

  // Filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // Drawer crear/editar
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContractedService | null>(null);

  // Drawer historial de pagos
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<ContractedService | null>(null);

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

  const handleViewDetail = useCallback((item: ContractedService) => {
    setHistoryItem(item);
    setIsHistoryOpen(true);
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
    if (selectedItem) {
      const dateChanged =
        data.start_date !== selectedItem.start_date ||
        data.recurrence !== selectedItem.recurrence ||
        data.periods !== selectedItem.periods;

      if (dateChanged) {
        const canRegenerate = await regeneratePayments(
          selectedItem.id,
          data.start_date,
          data.recurrence,
          data.periods,
          data.amount,
        );

        if (!canRegenerate) return;
      }

      const success = await updateContractedService(selectedItem.id, data);

      if (success) handleCloseDrawer();
    } else {
      const newId = await createContractedService(data);

      if (newId) {
        await generatePayments(
          newId,
          data.start_date,
          data.recurrence,
          data.periods,
          data.amount,
        );
        handleCloseDrawer();
      }
    }
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
        onViewDetail: handleViewDetail,
      }),
    [handleEdit, handleDelete, handleViewDetail],
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

        {/* Drawer crear/editar */}
        <ContractedServiceDrawer
          isOpen={isDrawerOpen}
          contractedService={selectedItem}
          contacts={contacts}
          companies={companies}
          services={services}
          onClose={handleCloseDrawer}
          onSave={handleSave}
        />

        {/* Drawer historial de pagos */}
        <PaymentHistoryDrawer
          isOpen={isHistoryOpen}
          contractedService={historyItem}
          onClose={() => {
            setIsHistoryOpen(false);
            setHistoryItem(null);
          }}
          onStatusUpdated={fetchContractedServices}
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
