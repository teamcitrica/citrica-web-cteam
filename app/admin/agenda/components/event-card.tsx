"use client";

import React, { useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Text, Button } from "citrica-ui-toolkit";
import Icon from "@ui/atoms/icon";
import { Reserva, ReservaEstado } from "@/hooks/reservas/use-reservas";
import { STATUS_CONFIG } from "../booking-calendar-view";

interface EventCardProps {
  booking: Reserva;
  onStatusChange?: (id: string, status: ReservaEstado) => void;
  onDelete?: (booking: Reserva) => void;
  onEdit?: (booking: Reserva) => void;
}

/**
 * Formatea los time_slots a un rango legible.
 * Ej: ["08:00-09:00"] → "8:00 a 9:00"
 *     ["09:00","09:30","10:00"] → "9:00 a 10:30"
 *     ["00:00"] o [] → "Todo el día"
 */
const formatTimeRange = (timeSlots: string[]): string => {
  if (!timeSlots || timeSlots.length === 0) return "Todo el día";

  // Si incluye 00:00 es bloqueo de día completo
  if (timeSlots.includes("00:00")) return "Todo el día";

  // Si el formato es "HH:MM-HH:MM" (recordatorios)
  if (timeSlots.length === 1 && timeSlots[0].includes("-")) {
    const [start, end] = timeSlots[0].split("-");
    return `${removeLeadingZero(start)} a ${removeLeadingZero(end)}`;
  }

  // Si son slots individuales de 30min (reservas del landing)
  const sorted = [...timeSlots].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Calcular la hora fin sumando 30 min al último slot
  const [h, m] = last.split(":").map(Number);
  const endMinutes = h * 60 + m + 30;
  const endH = String(Math.floor(endMinutes / 60)).padStart(2, "0");
  const endM = String(endMinutes % 60).padStart(2, "0");

  return `${removeLeadingZero(first)} a ${removeLeadingZero(`${endH}:${endM}`)}`;
};

/** Quita el cero inicial de la hora: "08:00" → "8:00" */
const removeLeadingZero = (time: string): string => {
  return time.replace(/^0/, "");
};

const EventCard: React.FC<EventCardProps> = ({ booking, onStatusChange, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = STATUS_CONFIG[booking.status] || {
    color: "#94A3B8",
    label: booking.status,
  };

  const timeLabel = formatTimeRange(booking.time_slots);

  return (
    <div className="border border-[#D4DEED] rounded-lg overflow-hidden">
      {/* Header de la tarjeta (siempre visible) */}
      <div className="p-3">
        {/* Fila superior: Hora + Badge de estado + Menú */}
        <div className="flex items-center justify-between pb-2 border-b border-[#D4DEED]">
          <Text variant="body" weight="bold" color="#16305A">
            {timeLabel}
          </Text>

          <div className="flex items-center gap-0.5">
            {/* Badge de estado */}
            <span
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-[#265197] bg-white border border-[#A7BDE2]"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusConfig.color }}
              />
              {statusConfig.label}
            </span>

            {/* Divider vertical + Menú de 3 puntos */}
            <span className="w-px self-stretch bg-[#D4DEED] ml-2.5" />
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  className="!p-0 !min-w-6 !w-6 !h-6 !bg-transparent hover:!bg-gray-50"
                >
                  <Icon name="EllipsisVertical" size={16} className="text-[#265197]" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Acciones del evento"
                onAction={(key) => {
                  if (key === "editar") onEdit?.(booking);
                  if (key === "confirmar") onStatusChange?.(booking.id, "confirmed");
                  if (key === "pendiente") onStatusChange?.(booking.id, "pending");
                  if (key === "cancelar") onStatusChange?.(booking.id, "cancelled");
                  if (key === "eliminar") onDelete?.(booking);
                }}
              >
                <DropdownItem key="editar" className="text-[#16305A]">
                  Editar
                </DropdownItem>
                {booking.status !== "confirmed" ? (
                  <DropdownItem key="confirmar" className="text-green-600">
                    Confirmar
                  </DropdownItem>
                ) : null}
                {booking.status !== "pending" ? (
                  <DropdownItem key="pendiente" className="text-yellow-600">
                    Sin confirmar
                  </DropdownItem>
                ) : null}
                {booking.status !== "cancelled" ? (
                  <DropdownItem key="cancelar" className="text-orange-600">
                    Cancelar
                  </DropdownItem>
                ) : null}
                <DropdownItem key="eliminar" className="text-danger" color="danger">
                  Eliminar
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Título del evento + Chevron para expandir */}
        <div
          className="flex items-center justify-between gap-0.5 cursor-pointer pt-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span
            className={`text-sm font-semibold text-[#16305A] ${!isExpanded ? "truncate" : ""}`}
          >
            {booking.name || "Sin nombre"}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-px self-stretch bg-[#D4DEED]" />
            <Icon
              name={isExpanded ? "ChevronUp" : "ChevronDown"}
              size={18}
              className="text-[#265197]"
            />
          </div>
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="mx-3 pb-3 pt-2">
          {/* Descripción / Comentario */}
          {booking.description && (
            <p className="text-xs text-[#265197] mb-2">
              {booking.description}
            </p>
          )}

          {/* Email */}
          {booking.email && (
            <p className="text-xs text-[#265197] mb-2">
              {booking.email}
            </p>
          )}

          {/* Mensaje */}
          {booking.message && (
            <div className="mt-1 pt-2 border-t border-[#D4DEED]">
              <p className="text-xs font-bold text-[#16305A] mb-1">
                Mensaje
              </p>
              <p className="text-xs text-[#265197] leading-relaxed">
                {booking.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;
