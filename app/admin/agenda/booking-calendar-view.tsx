"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button, Text } from "citrica-ui-toolkit";
import Icon from "@ui/atoms/icon";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";
import { useReservas, Reserva } from "@/hooks/reservas/use-reservas";
import CalendarGrid from "./components/calendar-grid";
import DayDetailPanel from "./components/day-detail-panel";
import CreateReminderModal from "./components/create-reminder-modal";
import EditBookingModal from "./components/edit-booking-modal";

/** Tipos de estado para los filtros del calendario */
export type BookingStatusFilter = "all" | "confirmed" | "pending" | "cancelled" | "reminder";

/** Configuración de colores y etiquetas por estado */
export const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  confirmed: { color: "#10E5A4", label: "Confirmada" },
  pending: { color: "#F9E124", label: "Sin confirmar" },
  cancelled: { color: "#F04242", label: "Cancelada" },
  reminder: { color: "#8D0AF5", label: "Recordatorio" },
};

/** Botones de filtro para el grupo de filtros */
const FILTER_BUTTONS = [
  { value: "all", label: "Todas" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "pending", label: "Sin confirmar" },
  { value: "cancelled", label: "Canceladas" },
  { value: "reminder", label: "Recordatorios" },
];

/** Capitaliza la primera letra de un string */
const capitalize = (str: string) => str.replace(/^\w/, (c) => c.toUpperCase());

const BookingCalendarView = () => {
  const { reservas: bookings, refreshReservas, createReminder, updateReservaStatus, deleteReserva, updateReserva } = useReservas();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("all");
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Reserva | null>(null);

  useEffect(() => {
    refreshReservas();
  }, [refreshReservas]);

  // Seleccionar hoy por defecto al cargar
  useEffect(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDate(todayStr);
  }, []);

  // Filtrar reservas según el estado seleccionado
  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  // Formatear mes y año para el selector: "Noviembre 2025"
  const monthYearLabel = capitalize(
    currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  );

  // Navegación entre meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Reservas del día seleccionado
  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [];
    return filteredBookings.filter((b) => b.booking_date === selectedDate);
  }, [filteredBookings, selectedDate]);

  // Formatear la fecha seleccionada: "Viernes 14 Noviembre de 2025"
  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return "";
    const date = new Date(selectedDate + "T00:00:00");
    const weekday = capitalize(date.toLocaleDateString("es-ES", { weekday: "long" }));
    const day = date.getDate();
    const month = capitalize(date.toLocaleDateString("es-ES", { month: "long" }));
    const year = date.getFullYear();
    return `${weekday} ${day} ${month} de ${year}`;
  }, [selectedDate]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Barra superior: navegación de mes + filtros, envuelta en contenedor blanco */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white border border-[#D4DEED] rounded-xl px-4 py-2 overflow-hidden shadow-md">
        {/* Navegación de mes: < Noviembre 2025 > */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={goToPreviousMonth}
            className="!min-w-8 !w-8 !h-[34px] !p-0 !border-solid !border !border-[#16305A] !rounded-md !bg-transparent"
          >
            <Icon name="ChevronLeft" size={16} className="text-[#16305A]" />
          </Button>

          <div className="px-4 h-[34px] border border-[#16305A] rounded-md flex items-center">
            <Text variant="body" weight="bold" color="#16305A">
              {monthYearLabel}
            </Text>
          </div>

          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={goToNextMonth}
            className="!min-w-8 !w-8 !h-[34px] !p-0 !border-solid !border !border-[#16305A] !rounded-md !bg-transparent"
          >
            <Icon name="ChevronRight" size={16} className="text-[#16305A]" />
          </Button>
        </div>

        {/* Filtros de estado */}
        <div className="w-full md:w-auto overflow-x-auto">
          <FilterButtonGroup
            buttons={FILTER_BUTTONS}
            selectedValue={statusFilter}
            onValueChange={(val) => setStatusFilter(val as BookingStatusFilter)}
            size="sm"
          />
        </div>

        {/* Botón crear recordatorio */}
        <Button
          isAdmin
          size="sm"
          variant="primary"
          onPress={() => setIsReminderModalOpen(true)}
          startContent={<Icon name="Plus" size={16} />}
          className="!ml-auto shrink-0"
        >
          Recordatorio
        </Button>
      </div>

      {/* Contenido principal: calendario + panel lateral, separados 12px */}
      <div className="flex flex-col xl:flex-row gap-3 flex-1">
        {/* Grilla del calendario */}
        <div className="flex-1 min-w-0 border border-[#D4DEED] rounded-xl overflow-hidden bg-white shadow-md">
          <CalendarGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            bookings={filteredBookings}
          />
        </div>

        {/* Panel lateral de detalles del día */}
        <div className="xl:w-[320px] xl:min-w-[320px] border border-[#D4DEED] rounded-xl overflow-hidden bg-white shadow-md max-h-[400px] xl:max-h-none">
          <DayDetailPanel
            dateLabel={selectedDateLabel}
            bookings={selectedDayBookings}
            onStatusChange={async (id, status) => {
              await updateReservaStatus(id, status);
              refreshReservas();
            }}
            onDelete={async (booking) => {
              if (window.confirm(`¿Estás seguro de eliminar la reserva de ${booking.name}?`)) {
                await deleteReserva(booking.id);
                refreshReservas();
              }
            }}
            onEdit={(booking) => {
              setEditingBooking(booking);
              setIsEditModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Modal para crear recordatorio */}
      <CreateReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSubmit={createReminder}
        defaultDate={selectedDate || undefined}
      />

      {/* Drawer para editar reserva/recordatorio */}
      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBooking(null);
        }}
        booking={editingBooking}
        onSubmit={updateReserva}
      />
    </div>
  );
};

export default BookingCalendarView;
