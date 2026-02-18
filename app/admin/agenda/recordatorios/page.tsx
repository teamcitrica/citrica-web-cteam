"use client";
import { Divider } from "@heroui/divider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useState, useCallback, useMemo } from "react";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Button, Icon, Input, Col, Container } from "citrica-ui-toolkit";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";
import { useReservas, Reserva } from "@/hooks/reservas/use-reservas";
import { getReminderColumns } from "./columns/reminder-columns";
import CreateReminderModal from "../components/create-reminder-modal";
import ReminderDetailModal from "./components/reminder-detail-modal";

export default function RecordatoriosPage() {
  const { reservas, isLoading, refreshReservas, createReminder, updateReserva, deleteReserva } = useReservas();
  const [timeFilter, setTimeFilter] = useState<string>("proximos");
  const [searchValue, setSearchValue] = useState("");
  const [selectedReminder, setSelectedReminder] = useState<Reserva | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reserva | null>(null);

  // Solo recordatorios
  const reminders = useMemo(() => {
    return reservas.filter((r) => r.status === "reminder");
  }, [reservas]);

  // Filtrar por tiempo y búsqueda
  const filteredReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    let filtered = reminders;

    if (timeFilter === "proximos") {
      filtered = filtered.filter((r) => (r.booking_date || "") >= todayStr);
    } else {
      filtered = filtered.filter((r) => (r.booking_date || "") < todayStr);
    }

    if (searchValue.trim()) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(search) ||
          (r.message || "").toLowerCase().includes(search) ||
          (r.description || "").toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [reminders, timeFilter, searchValue]);

  const handleViewReminder = useCallback((reminder: Reserva) => {
    setSelectedReminder(reminder);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditReminder = useCallback((reminder: Reserva) => {
    setSelectedReminder(reminder);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteReminder = useCallback((reminder: Reserva) => {
    setReminderToDelete(reminder);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!reminderToDelete) return;
    await deleteReserva(reminderToDelete.id);
    setIsDeleteModalOpen(false);
    setReminderToDelete(null);
  }, [reminderToDelete, deleteReserva]);

  const columns = useMemo(
    () =>
      getReminderColumns({
        onView: handleViewReminder,
        onEdit: handleEditReminder,
        onDelete: handleDeleteReminder,
      }),
    [handleViewReminder, handleEditReminder, handleDeleteReminder]
  );

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <div>
          <h1 className="text-2xl font-bold text-[#265197] mb-5">
            <Text isAdmin={true} variant="title" weight="bold" color="#678CC5">AGENDA</Text> {'>'}{' '}
            <Text isAdmin={true} variant="title" weight="bold" color="#265197">Recordatorios</Text>
          </h1>

          <DataTable<Reserva>
            data={filteredReminders}
            customFilters={
              <div className="flex flex-col md:flex-row md:items-center gap-3 pb-[20px] w-full">
                <div className="w-full md:w-auto">
                  <FilterButtonGroup
                    buttons={[
                      { value: "proximos", label: "Próximos" },
                      { value: "pasados", label: "Pasados" },
                    ]}
                    selectedValue={timeFilter}
                    onValueChange={setTimeFilter}
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar recordatorios..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  startContent={<Icon size={16} color="#265197" name="Search" />}
                  className="w-full md:w-56"
                  variant="faded"
                  classNames={{
                    inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                    label: "!text-[#265197]",
                    input: "placeholder:text-[#A7BDE2] !text-[#265197]",
                  }}
                />
                <div className="flex-1" />
                <Button
                  isAdmin
                  variant="primary"
                  startContent={<Icon size={16} name="Plus" />}
                  onPress={() => setIsCreateModalOpen(true)}
                  label="Nuevo recordatorio"
                  className="w-full md:w-auto"
                />
              </div>
            }
            columns={columns}
            isLoading={isLoading}
            emptyContent="No se encontraron recordatorios"
            headerColor="#265197"
            headerTextColor="#ffffff"
            paginationColor="#265197"
            getRowKey={(reminder) => reminder.id}
          />

          <CreateReminderModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={async (data) => {
              return await createReminder(data);
            }}
          />

          {isDetailModalOpen && selectedReminder && (
            <ReminderDetailModal
              reminder={selectedReminder}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedReminder(null);
              }}
            />
          )}

          {isEditModalOpen && selectedReminder && (
            <CreateReminderModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedReminder(null);
              }}
              booking={selectedReminder}
              onSubmit={async (data) => {
                const result = await updateReserva(selectedReminder.id, data);
                if (!result.error) {
                  setIsEditModalOpen(false);
                  setSelectedReminder(null);
                }
                return result;
              }}
            />
          )}

          {isDeleteModalOpen && reminderToDelete && (
            <Modal isOpen={true} onClose={() => { setIsDeleteModalOpen(false); setReminderToDelete(null); }} size="md">
              <ModalContent>
                <ModalHeader className="flex flex-col gap-1 mt-4">
                  <div className="flex items-center justify-center mb-2">
                    <Icon size={28} className="text-red-500" name="TriangleAlert" />
                  </div>
                  <h2 className="text-center">
                    <Text isAdmin={true} variant="title" color="#F04242" weight="bold">Eliminar Recordatorio</Text>
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <p>
                    <Text isAdmin={true} variant="body" color="#16305A">
                      ¿Estás seguro de que deseas eliminar el recordatorio{" "}
                      <span className="font-semibold">{reminderToDelete.name || "este recordatorio"}</span>?
                    </Text>
                  </p>
                  <p className="mb-2">
                    <Text isAdmin={true} variant="label" color="#16305A">Esta acción no se puede deshacer.</Text>
                  </p>
                  <Divider className="bg-[#A7BDE2]" />
                </ModalBody>
                <ModalFooter>
                  <div className="flex gap-3 justify-end">
                    <Button
                      isAdmin={true}
                      variant="secondary"
                      className="w-[162px]"
                      onPress={() => { setIsDeleteModalOpen(false); setReminderToDelete(null); }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      isAdmin={true}
                      variant="primary"
                      className="bg-[#F04242] w-[162px] !border-0"
                      onPress={handleConfirmDelete}
                    >
                      Eliminar
                    </Button>
                  </div>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )}
        </div>
      </Col>
    </Container>
  );
}
