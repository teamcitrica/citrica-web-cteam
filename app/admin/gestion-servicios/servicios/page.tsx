"use client";

import { useState, useEffect } from "react";

import { Container, Col, Text, Button, Icon } from "citrica-ui-toolkit";

import { useServiceTypes } from "@/hooks/services/use-service-types";
import { useServices } from "@/hooks/services/use-services";

import ServicesTable from "./components/services-table";
import ServiceDrawer from "./components/service-drawer";
import ServiceTypesTable from "./components/service-types-table";
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

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsServiceDrawerOpen(true);
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

  const handleDeleteService = async (id: number) => {
    await deleteService(id);
  };

  const handleToggleServiceActive = async (id: number, isActive: boolean) => {
    await toggleServiceActive(id, isActive);
  };

  // Handlers tipos
  const handleCreateType = () => {
    setSelectedType(null);
    setIsTypeDrawerOpen(true);
  };

  const handleEditType = (type: ServiceType) => {
    setSelectedType(type);
    setIsTypeDrawerOpen(true);
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

  const handleDeleteType = async (id: number) => {
    await deleteServiceType(id);
  };

  const handleToggleTypeActive = async (id: number, isActive: boolean) => {
    await toggleTypeActive(id, isActive);
  };

  const getButtonText = () => {
    return selectedTab === "servicios" ? "Nuevo servicio" : "Nuevo tipo";
  };

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
        {/* Header breadcrumb */}
        <Text as="h3" variant="title" weight="bold">
          <Text isAdmin={true} color="#678CC5" variant="title" weight="bold">
            Gestión de Servicios
          </Text>
          <Text isAdmin={true} color="#265197" variant="title" weight="bold">
            <span> {">"} </span> Servicios
          </Text>
        </Text>

        {/* Barra de acciones con tabs */}
        <div className="bg-[#265197] rounded-xl p-4 mt-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === "tipos"
                  ? "bg-white text-[#265197]"
                  : "bg-transparent text-white border border-white/30 hover:bg-white/10"
              }`}
              onClick={() => setSelectedTab("tipos")}
            >
              Tipos de Servicio
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === "servicios"
                  ? "bg-white text-[#265197]"
                  : "bg-transparent text-white border border-white/30 hover:bg-white/10"
              }`}
              onClick={() => setSelectedTab("servicios")}
            >
              Servicios
            </button>
          </div>

          <Button
            isAdmin
            startContent={<Icon name="Plus" size={16} />}
            variant="secondary"
            onPress={handleCreate}
          >
            {getButtonText()}
          </Button>
        </div>

        {/* Contenido según tab */}
        {selectedTab === "servicios" && (
          <>
            <ServicesTable
              isLoading={isLoadingServices}
              services={services}
              serviceTypes={serviceTypes}
              onDelete={handleDeleteService}
              onEdit={handleEditService}
              onToggleActive={handleToggleServiceActive}
            />
            <ServiceDrawer
              isOpen={isServiceDrawerOpen}
              service={selectedService}
              serviceTypes={serviceTypes}
              onClose={handleCloseServiceDrawer}
              onSave={handleSaveService}
            />
          </>
        )}

        {selectedTab === "tipos" && (
          <>
            <ServiceTypesTable
              isLoading={isLoadingTypes}
              types={serviceTypes}
              onDelete={handleDeleteType}
              onEdit={handleEditType}
              onToggleActive={handleToggleTypeActive}
            />
            <ServiceTypeDrawer
              isOpen={isTypeDrawerOpen}
              serviceType={selectedType}
              onClose={handleCloseTypeDrawer}
              onSave={handleSaveType}
            />
          </>
        )}
      </Col>
    </Container>
  );
}
