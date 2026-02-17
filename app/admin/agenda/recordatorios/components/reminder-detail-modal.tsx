"use client";
import { Reserva } from "@/hooks/reservas/use-reservas";
import { DetailModal } from "@/shared/components/citrica-ui";
import { Text, Button } from "citrica-ui-toolkit";

interface ReminderDetailModalProps {
  reminder: Reserva;
  onClose: () => void;
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "Sin fecha";
  const date = new Date(dateStr + "T00:00:00");
  return `${DAYS[date.getDay()]} ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
};

const formatTime = (timeSlots: string[]): string => {
  if (!timeSlots || timeSlots.length === 0) return "Todo el día";
  if (timeSlots.length === 1 && timeSlots[0].includes("-")) {
    const [start, end] = timeSlots[0].split("-");
    if (start === "00:00" && end === "23:59") return "Todo el día";
    return `${start} - ${end}`;
  }
  return "Todo el día";
};

const KNOWN_FREQUENCIES: Record<string, string> = {
  none: "No se repite",
  daily: "Todos los días",
  weekly: "Cada semana",
  monthly: "Todos los meses",
  yearly: "Anualmente",
  weekdays: "Todos los días hábiles",
};

const getRecurrenceLabel = (recurring?: string, bookingDate?: string | null): string => {
  if (!recurring || recurring === "none") return "No se repite";
  if (KNOWN_FREQUENCIES[recurring]) {
    if (recurring === "yearly" && bookingDate) {
      const date = new Date(bookingDate + "T00:00:00");
      return `Anualmente el ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
    }
    if (recurring === "weekly" && bookingDate) {
      const date = new Date(bookingDate + "T00:00:00");
      return `Cada semana el ${DAYS[date.getDay()].toLowerCase()}`;
    }
    return KNOWN_FREQUENCIES[recurring];
  }
  try {
    const config = JSON.parse(recurring);
    const unitLabels: Record<string, string> = { day: "día(s)", week: "semana(s)", month: "mes(es)", year: "año(s)" };
    return `Cada ${config.interval} ${unitLabels[config.unit] || config.unit}`;
  } catch {
    return "Personalizado";
  }
};

export default function ReminderDetailModal({ reminder, onClose }: ReminderDetailModalProps) {
  const sections = [
    {
      title: "",
      content: (
        <div className="flex flex-col gap-2">
          <p className="flex flex-col">
            <Text isAdmin variant="label" color="#678CC5">Asunto:</Text>
            <Text isAdmin variant="body" color="#265197" weight="bold">{reminder.name || "-"}</Text>
          </p>
          <p className="flex flex-col">
            <Text isAdmin variant="label" color="#678CC5">Fecha:</Text>
            <Text isAdmin variant="body" color="#265197" weight="bold">{formatDate(reminder.booking_date)}</Text>
          </p>
          <p className="flex flex-col">
            <Text isAdmin variant="label" color="#678CC5">Horario:</Text>
            <Text isAdmin variant="body" color="#265197" weight="bold">{formatTime(reminder.time_slots)}</Text>
          </p>
          <p className="flex flex-col">
            <Text isAdmin variant="label" color="#678CC5">Frecuencia:</Text>
            <Text isAdmin variant="body" color="#265197" weight="bold">{getRecurrenceLabel(reminder.recurring, reminder.booking_date)}</Text>
          </p>
        </div>
      ),
    },
    {
      title: "Mensaje",
      content: (
        <div className="py-1">
          <Text isAdmin variant="body" color="#265197">
            {reminder.message || "Sin mensaje"}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <DetailModal
      isOpen={true}
      onClose={onClose}
      title="DETALLES DEL RECORDATORIO"
      sections={sections}
      footer={
        <Button isAdmin variant="secondary" onPress={onClose}>
          Cerrar
        </Button>
      }
    />
  );
}
