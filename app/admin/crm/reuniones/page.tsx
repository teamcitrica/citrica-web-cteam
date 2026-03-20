"use client";
import { useState, useMemo, useCallback } from "react";
import { Divider } from "@heroui/divider";
import { useReservas, Reserva } from "@/hooks/reservas/use-reservas";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Col, Container } from "citrica-ui-toolkit";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";
import { getReunionColumns, getReunionExportColumns } from "./columns/reunion-columns";
import EditBookingModal from "@/app/admin/agenda/components/edit-booking-modal";
import CreateReunionDrawer from "./components/create-reunion-drawer";

export default function ReunionesPage() {
  const { reservas, isLoading, refreshReservas, updateReserva } = useReservas();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("upcoming");
  const [selectedReunion, setSelectedReunion] = useState<Reserva | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const handleViewReunion = useCallback((reunion: Reserva) => {
    setSelectedReunion(reunion);
    setIsEditModalOpen(true);
  }, []);

  const handleEditReunion = useCallback((reunion: Reserva) => {
    setSelectedReunion(reunion);
    setIsEditModalOpen(true);
  }, []);

  const columns = useMemo(
    () => getReunionColumns({ onView: handleViewReunion, onEdit: handleEditReunion }),
    [handleViewReunion, handleEditReunion]
  );

  const exportColumns = useMemo(() => getReunionExportColumns(), []);

  // Filtrar solo reuniones (no recordatorios ni bloqueos)
  const reuniones = useMemo(() => {
    return reservas.filter((r) => r.status !== "reminder");
  }, [reservas]);

  const filteredReuniones = useMemo(() => {
    let filtered = reuniones;

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Filtro por tiempo (próximas / pasadas)
    if (timeFilter !== "all") {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (timeFilter === "upcoming") {
        filtered = filtered.filter((r) => r.booking_date && r.booking_date >= todayStr);
      } else if (timeFilter === "past") {
        filtered = filtered.filter((r) => r.booking_date && r.booking_date < todayStr);
      }
    }

    return filtered;
  }, [reuniones, statusFilter, timeFilter]);

  return (
    <div className="pb-[100px]">
      <Container>
        <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
          <div>
            <h1 className="text-2xl font-bold text-[#265197] mb-5">
              <Text isAdmin={true} variant="title" weight="bold" color="#678CC5">CRM</Text>
              {" > "}
              <Text isAdmin={true} variant="title" weight="bold" color="#265197">Reuniones</Text>
            </h1>

            <DataTable<Reserva>
              data={filteredReuniones}
              defaultSortDirection="descending"
              customFilters={
                <>
                  <div className="flex flex-col gap-3 pb-4 w-full">
                    <div className="w-fit">
                      <FilterButtonGroup
                        buttons={[
                          { value: "upcoming", label: "Próximas" },
                          { value: "past", label: "Pasadas" },
                          { value: "all", label: "Todas" },
                        ]}
                        selectedValue={timeFilter}
                        onValueChange={setTimeFilter}
                      />
                    </div>
                  </div>
                  <Divider className="bg-[#D4DEED]" />
                </>
              }
              showCustomAutocomplete={true}
              customAutocompleteItems={[
                { id: "all", name: "Todos los estados" },
                { id: "confirmed", name: "Confirmadas" },
                { id: "pending", name: "Sin confirmar" },
                { id: "completed", name: "Completadas" },
                { id: "expired", name: "Expiradas" },
                { id: "cancelled", name: "Canceladas" },
              ]}
              customAutocompletePlaceholder="Filtrar por estado..."
              customAutocompleteSelectedKey={statusFilter}
              onCustomAutocompleteChange={(key) => setStatusFilter(key)}
              onAdd={() => setIsCreateDrawerOpen(true)}
              addButtonText="Nueva reunión"
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Buscar reuniones..."
              searchFields={["name", "email"]}
              emptyContent="No se encontraron reuniones"
              headerColor="#265197"
              headerTextColor="#ffffff"
              paginationColor="#265197"
              getRowKey={(reunion) => reunion.id}
              enableExport={true}
              exportColumns={exportColumns}
              exportTitle="Reuniones"
              tableName="reuniones"
              showRowsPerPageSelector={true}
            />

            <CreateReunionDrawer
              isOpen={isCreateDrawerOpen}
              onClose={() => setIsCreateDrawerOpen(false)}
              onSuccess={refreshReservas}
            />

            <EditBookingModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedReunion(null);
              }}
              booking={selectedReunion}
              onSubmit={updateReserva}
            />
          </div>
        </Col>
      </Container>
    </div>
  );
}
