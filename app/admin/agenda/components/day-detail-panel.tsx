"use client";

import React from "react";
import { Text } from "citrica-ui-toolkit";
import { Reserva, ReservaEstado } from "@/hooks/reservas/use-reservas";
import EventCard from "./event-card";

interface DayDetailPanelProps {
  dateLabel: string;
  bookings: Reserva[];
  onStatusChange?: (id: string, status: ReservaEstado) => void;
  onDelete?: (booking: Reserva) => void;
  onEdit?: (booking: Reserva) => void;
}

/**
 * DayDetailPanel - Panel lateral que muestra los eventos del día seleccionado
 * Incluye el título con la fecha formateada y una lista scrollable de EventCards.
 */
const DayDetailPanel: React.FC<DayDetailPanelProps> = ({ dateLabel, bookings, onStatusChange, onDelete, onEdit }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header con la fecha seleccionada */}
      <div className="p-3 xl:p-4 border-b border-[#D4DEED]">
        <Text isAdmin={true} variant="body" weight="bold" color="#16305A">
          {dateLabel || "Selecciona un día"}
        </Text>
      </div>

      {/* Lista de eventos con scroll */}
      <div className="flex-1 overflow-y-auto p-3 xl:p-4">
        {bookings.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[60px]">
            <Text isAdmin={true} variant="label" color="#678CC5">
              No hay eventos para este día
            </Text>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => (
              <EventCard
                key={booking.id}
                booking={booking}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayDetailPanel;
