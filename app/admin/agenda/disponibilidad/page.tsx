"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Text, Container, Col, Icon } from "citrica-ui-toolkit";
import WeeklyScheduleManager from "./components/weekly-schedule-manager";
import UnifiedAvailabilityManager from "./components/unified-availability-manager";

const DisponibilidadAdminPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams?.get("page") || "disponibilidad";

  const renderContent = () => {
    switch (activeTab) {
      case "semanal":
        return <WeeklyScheduleManager />;
      case "disponibilidad":
      default:
        return <UnifiedAvailabilityManager />;
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "semanal":
        return "Configura los horarios base de toda la semana";
      case "disponibilidad":
      default:
        return "Gestiona bloqueos específicos por fecha y visualiza disponibilidad en tiempo real";
    }
  };

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }} className="space-y-6">
        <h1 className="text-2xl font-bold text-[#265197] mb-5">
          <Text isAdmin={true} variant="title" weight="bold" color="#678CC5">AGENDA</Text> {'>'}  <Text isAdmin={true} variant="title" weight="bold" color="#265197">Disponibilidad</Text>
        </h1>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="flex items-center gap-3">
            <Icon name="Clock" size={24} className="text-[#ff5b00]" />
            <div>
              <p>
              <Text variant="headline" color="#ff5b00">
                Horarios
              </Text>
              </p>
              <Text variant="body" color="black">
                {getTabDescription()}
              </Text>
            </div>
          </Col>

          {/* Navegación de pestañas */}
          <Col cols={{ lg: 12, md: 6, sm: 4 }}  className="flex justify-end gap-4">
            <Button
              size="sm"
              variant={activeTab === "disponibilidad" ? "primary" : "secondary"}
              onPress={() => router.push("/admin/reservas/disponibilidad?page=disponibilidad")}
              startContent={<Icon name="Calendar" size={16} />}
            >
              Gestión de Disponibilidad
            </Button>
            <Button
              size="sm"
              variant={activeTab === "semanal" ? "primary" : "secondary"}
              onPress={() => router.push("/admin/reservas/disponibilidad?page=semanal")}
              startContent={<Icon name="Clock" size={16} />}
            >
              Configuración Semanal
            </Button>
          </Col>
        </div>

        {/* Contenido de la pestaña activa */}
        {renderContent()}
      </Col>
    </Container>
  );
};

export default DisponibilidadAdminPage;