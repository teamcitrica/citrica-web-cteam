"use client";
import React, { useMemo } from "react";
import { Text } from "citrica-ui-toolkit";
import { Reserva } from "@/hooks/reservas/use-reservas";
import { STATUS_CONFIG } from "../booking-calendar-view";

/** Abreviaciones de los días de la semana (Domingo a Sábado) */
const WEEK_DAYS = ["D", "L", "M", "M", "J", "V", "S"];

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  bookings: Reserva[];
}

/** Genera un string de fecha en formato YYYY-MM-DD */
const toDateStr = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/**
 * CalendarGrid - Grilla mensual del calendario
 * Muestra los días del mes con badges de colores indicando
 * la cantidad de reservas por estado en cada día.
 */
const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  bookings,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calcular estructura del calendario
  const calendarDays = useMemo(() => {
    const firstDayWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [year, month]);

  // Pre-calcular reservas agrupadas por día y estado
  const bookingsByDay = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};

    bookings.forEach((booking) => {
      if (!booking.booking_date) return;
      if (!map[booking.booking_date]) {
        map[booking.booking_date] = {};
      }
      const status = booking.status;
      map[booking.booking_date][status] = (map[booking.booking_date][status] || 0) + 1;
    });

    return map;
  }, [bookings]);

  // Verificar si un día es hoy
  const todayStr = useMemo(() => {
    const now = new Date();
    return toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  return (
    <div className="p-2 md:p-4">
      {/* Header: Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map((day, i) => (
          <div key={`header-${i}`} className="text-center">
            <Text isAdmin={true} variant="label" weight="bold" color="#265197">
              {day}
            </Text>
          </div>
        ))}
      </div>

      {/* Grilla de días con gap de 4px */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-[72px] md:h-[90px] xl:h-[112px]" />;
          }

          const dateStr = toDateStr(year, month, day);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          const dayStatuses = bookingsByDay[dateStr] || {};
          const statusEntries = Object.entries(dayStatuses);

          return (
            <div
              key={dateStr}
              className={`
                h-[72px] md:h-[90px] xl:h-[112px] border border-[#D4DEED] rounded-lg p-1 md:p-2 cursor-pointer transition-colors relative
                ${isSelected ? "!border-[#265197] !border-2 bg-[#F0F4FA]" : "hover:bg-[#F8FAFC]"}
              `}
              onClick={() => onSelectDate(dateStr)}
            >
              {/* Número del día */}
              <div className="flex justify-start mb-0.5 md:mb-1">
                {isToday || isSelected ? (
                  <Text isAdmin={true} variant="label" color="#ffffff" className="w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 flex items-center justify-center rounded-full bg-[#265197] !text-white text-[9px] md:text-[10px] xl:text-[11px] font-bold">
                    {day}
                  </Text>
                ) : (
                  <Text isAdmin={true} variant="label" color="#16305A" weight="bold" className="w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 flex items-center justify-center text-[9px] md:text-[10px] xl:text-[11px] ">
                    {day}
                  </Text>
                )}
              </div>

              {/* Badges de estado (círculos de colores con número) - esquina superior derecha */}
              <div className="absolute top-1 md:top-2 right-1 md:right-2 flex flex-col items-end gap-0.5 md:gap-1">
                {statusEntries.map(([status, count]) => {
                  const config = STATUS_CONFIG[status];
                  if (!config) return null;

                  const darkTextStatuses = ["pending", "confirmed"];
                  const textColor = darkTextStatuses.includes(status) ? "text-black" : "text-white";

                  return (
                    <span
                      key={status}
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 xl:w-[18px] xl:h-[18px] rounded-full flex items-center justify-center ${textColor} text-[8px] md:text-[9px] xl:text-[10px] font-bold`}
                      style={{ backgroundColor: config.color }}
                    >
                      {count}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
