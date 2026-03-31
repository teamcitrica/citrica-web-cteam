"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

import { Divider } from "@heroui/divider";
import { Container, Col, Text, Icon } from "citrica-ui-toolkit";

import { useServiceTypes } from "@/hooks/services/use-service-types";
import { useServices } from "@/hooks/services/use-services";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";

import { getServiceColumns } from "./columns/service-columns";
import { getServiceTypeColumns } from "./columns/service-type-columns";
import DeleteServiceModal from "./components/delete-service-modal";
import DeleteServiceTypeModal from "./components/delete-service-type-modal";
import ServiceDrawer from "./components/service-drawer";
import ServiceTypeDrawer from "./components/service-type-drawer";

import type { ServiceType, ServiceTypeInput } from "@/hooks/services/use-service-types";
import type { Service, ServiceInput } from "@/hooks/services/use-services";

export type { ServiceType, Service };

type TabKey = "servicios" | "tipos";

export default function ServiciosPage() {
  const [selectedTab, setSelectedTab] = useState<TabKey>("servicios");

  // Hooks
  const {
    serviceTypes,
    isLoading: isLoadingTypes,
    fetchServiceTypes,
    createServiceType,
    updateServiceType,
    deleteServiceType,
    toggleActive: toggleTypeActive,
  } = useServiceTypes();

  const {
    services,
    isLoading: isLoadingServices,
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleActive: toggleServiceActive,
  } = useServices();

  // Drawers
  const [isServiceDrawerOpen, setIsServiceDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isTypeDrawerOpen, setIsTypeDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);

  // Delete modals
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<ServiceType | null>(null);

  // Fetch inicial
  useEffect(() => {
    fetchServiceTypes();
    fetchServices();
  }, [fetchServiceTypes, fetchServices]);

  // Handlers servicios
  const handleCreateService = () => {
    setSelectedService(null);
    setIsServiceDrawerOpen(true);
  };

  const handleEditService = useCallback((service: Service) => {
    setSelectedService(service);
    setIsServiceDrawerOpen(true);
  }, []);

  const handleDeleteService = useCallback((service: Service) => {
    setServiceToDelete(service);
  }, []);

  const handleConfirmDeleteService = async () => {
    if (!serviceToDelete) return;
    await deleteService(serviceToDelete.id);
    setServiceToDelete(null);
  };

  const handleCloseServiceDrawer = () => {
    setIsServiceDrawerOpen(false);
    setSelectedService(null);
  };

  const handleSaveService = async (data: ServiceInput) => {
    let success = false;

    if (selectedService) {
      success = await updateService(selectedService.id, data);
    } else {
      success = await createService(data);
    }
    if (success) handleCloseServiceDrawer();
  };

  const handleToggleServiceActive = useCallback(async (id: number, isActive: boolean) => {
    await toggleServiceActive(id, isActive);
  }, [toggleServiceActive]);

  // Handlers tipos
  const handleCreateType = () => {
    setSelectedType(null);
    setIsTypeDrawerOpen(true);
  };

  const handleEditType = useCallback((type: ServiceType) => {
    setSelectedType(type);
    setIsTypeDrawerOpen(true);
  }, []);

  const handleDeleteType = useCallback((type: ServiceType) => {
    setTypeToDelete(type);
  }, []);

  const handleConfirmDeleteType = async () => {
    if (!typeToDelete) return;
    await deleteServiceType(typeToDelete.id);
    setTypeToDelete(null);
  };

  const handleCloseTypeDrawer = () => {
    setIsTypeDrawerOpen(false);
    setSelectedType(null);
  };

  const handleSaveType = async (data: ServiceTypeInput) => {
    let success = false;

    if (selectedType) {
      success = await updateServiceType(selectedType.id, data);
    } else {
      success = await createServiceType(data);
    }
    if (success) handleCloseTypeDrawer();
  };

  const handleToggleTypeActive = useCallback(async (id: number, isActive: boolean) => {
    await toggleTypeActive(id, isActive);
  }, [toggleTypeActive]);

  // Columnas
  const serviceColumns = useMemo(
    () =>
      getServiceColumns({
        onEdit: handleEditService,
        onDelete: handleDeleteService,
        onToggleActive: handleToggleServiceActive,
      }),
    [handleEditService, handleDeleteService, handleToggleServiceActive],
  );

  const serviceTypeColumns = useMemo(
    () =>
      getServiceTypeColumns({
        onEdit: handleEditType,
        onDelete: handleDeleteType,
        onToggleActive: handleToggleTypeActive,
      }),
    [handleEditType, handleDeleteType, handleToggleTypeActive],
  );

  const handleCreate = () => {
    if (selectedTab === "servicios") {
      handleCreateService();
    } else {
      handleCreateType();
    }
  };

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        {/* Título */}
        <Text as="h1" className="mb-4" isAdmin={true} color="#16305A" variant="title" weight="bold">
          GESTIÓN DE SERVICIOS
        </Text>

        {/* Tabla según tab */}
        {selectedTab === "servicios" ? (
          <DataTable<Service>
            data={services}
            columns={serviceColumns}
            isLoading={isLoadingServices}
            searchFields={[]}
            onAdd={handleCreate}
            addButtonText="Nuevo servicio"
            addButtonIcon={<Icon name="Plus" size={16} />}
            emptyContent="No hay servicios creados"
            headerColor="#265197"
            headerTextColor="#ffffff"
            paginationColor="#265197"
            getRowKey={(service) => service.id}
            customFilters={
              <>
                <div className="flex gap-3 pb-4">
                  <FilterButtonGroup
                    buttons={[
                      { value: "tipos", label: "Tipos de Servicio" },
                      { value: "servicios", label: "Servicios" },
                    ]}
                    selectedValue={selectedTab}
                    onValueChange={(value) => setSelectedTab(value as TabKey)}
                  />
                </div>
                <Divider className="bg-[#D4DEED]" />
              </>
            }
          />
        ) : (
          <DataTable<ServiceType>
            data={serviceTypes}
            columns={serviceTypeColumns}
            isLoading={isLoadingTypes}
            searchFields={[]}
            onAdd={handleCreate}
            addButtonText="Nuevo tipo"
            addButtonIcon={<Icon name="Plus" size={16} />}
            emptyContent="No hay tipos de servicio creados"
            headerColor="#265197"
            headerTextColor="#ffffff"
            paginationColor="#265197"
            getRowKey={(type) => type.id}
            customFilters={
              <>
                <div className="flex gap-3 pb-4">
                  <FilterButtonGroup
                    buttons={[
                      { value: "tipos", label: "Tipos de Servicio" },
                      { value: "servicios", label: "Servicios" },
                    ]}
                    selectedValue={selectedTab}
                    onValueChange={(value) => setSelectedTab(value as TabKey)}
                  />
                </div>
                <Divider className="bg-[#D4DEED]" />
              </>
            }
          />
        )}

        {/* Drawers */}
        <ServiceDrawer
          isOpen={isServiceDrawerOpen}
          service={selectedService}
          serviceTypes={serviceTypes}
          onClose={handleCloseServiceDrawer}
          onSave={handleSaveService}
        />
        <ServiceTypeDrawer
          isOpen={isTypeDrawerOpen}
          serviceType={selectedType}
          onClose={handleCloseTypeDrawer}
          onSave={handleSaveType}
        />

        {/* Delete modals */}
        {serviceToDelete && (
          <DeleteServiceModal
            service={serviceToDelete}
            onConfirm={handleConfirmDeleteService}
            onCancel={() => setServiceToDelete(null)}
          />
        )}
        {typeToDelete && (
          <DeleteServiceTypeModal
            serviceType={typeToDelete}
            onConfirm={handleConfirmDeleteType}
            onCancel={() => setTypeToDelete(null)}
          />
        )}
      </Col>
    </Container>
  );
}
