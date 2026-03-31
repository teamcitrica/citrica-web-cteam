"use client";

import { useState } from "react";

import { Container, Col, Text, Button, Icon } from "citrica-ui-toolkit";

import ServicesTable from "./components/services-table";
import ServiceDrawer from "./components/service-drawer";
import ServiceTypesTable from "./components/service-types-table";
import ServiceTypeDrawer from "./components/service-type-drawer";

export interface ServiceType {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Service {
  id: number;
  name: string;
  typeId: number;
  referenceAmount: number;
  description: string;
  is_active: boolean;
}

type TabKey = "servicios" | "tipos";

const MOCK_TYPES: ServiceType[] = [
  { id: 1, name: "Hosting", description: "Servicios de alojamiento web", is_active: true },
  { id: 2, name: "Mantenimiento", description: "Soporte y actualización", is_active: true },
  { id: 3, name: "Diseño Web", description: "Diseño y maquetación", is_active: true },
  { id: 4, name: "Marketing", description: "Marketing digital y SEO", is_active: true },
];

const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    name: "Hosting básico",
    typeId: 1,
    referenceAmount: 50,
    description: "Servicio de hosting compartido mensual",
    is_active: true,
  },
  {
    id: 2,
    name: "Mantenimiento web mensual",
    typeId: 2,
    referenceAmount: 120,
    description: "Actualización y soporte técnico mensual",
    is_active: true,
  },
  {
    id: 3,
    name: "Diseño de landing page",
    typeId: 3,
    referenceAmount: 800,
    description: "Diseño y maquetación de landing page",
    is_active: true,
  },
  {
    id: 4,
    name: "SEO mensual",
    typeId: 4,
    referenceAmount: 300,
    description: "Optimización SEO y reporte mensual",
    is_active: false,
  },
];

export default function ServiciosPage() {
  const [selectedTab, setSelectedTab] = useState<TabKey>("servicios");

  // Estado servicios
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [isServiceDrawerOpen, setIsServiceDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Estado tipos
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(MOCK_TYPES);
  const [isTypeDrawerOpen, setIsTypeDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);

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

  const handleSaveService = (data: Omit<Service, "id">) => {
    if (selectedService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === selectedService.id ? { ...s, ...data } : s,
        ),
      );
    } else {
      setServices((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    handleCloseServiceDrawer();
  };

  const handleDeleteService = (id: number) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleServiceActive = (id: number) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, is_active: !s.is_active } : s,
      ),
    );
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

  const handleSaveType = (data: Omit<ServiceType, "id">) => {
    if (selectedType) {
      setServiceTypes((prev) =>
        prev.map((t) =>
          t.id === selectedType.id ? { ...t, ...data } : t,
        ),
      );
    } else {
      setServiceTypes((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    handleCloseTypeDrawer();
  };

  const handleDeleteType = (id: number) => {
    setServiceTypes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTypeActive = (id: number) => {
    setServiceTypes((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_active: !t.is_active } : t,
      ),
    );
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
