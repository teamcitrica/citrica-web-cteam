import React from "react";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { ExportColumn } from "@/shared/hooks/useTableFeatures";
import { Reserva } from "@/hooks/reservas/use-reservas";
import { Text, Icon } from "citrica-ui-toolkit";
import { Tooltip } from "@heroui/tooltip";

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  confirmed: { color: "#10E5A4", label: "Confirmada" },
  pending: { color: "#F9E124", label: "Sin confirmar" },
  cancelled: { color: "#F04242", label: "Cancelada" },
  completed: { color: "#265197", label: "Completada" },
  expired: { color: "#A7BDE2", label: "Expirada" },
};

const formatRelativeDate = (dateStr: string | null): { date: string; isRelative: boolean } => {
  if (!dateStr) return { date: "-", isRelative: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { date: "Hoy", isRelative: true };
  if (diffDays === 1) return { date: "Mañana", isRelative: true };
  if (diffDays === -1) return { date: "Ayer", isRelative: true };

  const formatted = target.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return { date: formatted.charAt(0).toUpperCase() + formatted.slice(1), isRelative: false };
};

type ReunionColumnsConfig = {
  onView: (reunion: Reserva) => void;
  onEdit: (reunion: Reserva) => void;
};

export const getReunionColumns = ({
  onView,
  onEdit,
}: ReunionColumnsConfig): Column<Reserva>[] => [
  {
    name: "FECHA Y HORA",
    uid: "booking_date",
    sortable: true,
    render: (reunion) => {
      const { date } = formatRelativeDate(reunion.booking_date);
      const firstSlot = reunion.time_slots?.[0] || "-";
      return (
        <div className="flex flex-col whitespace-nowrap">
          <Text isAdmin variant="body" color="#16305A">{date}</Text>
          <Text isAdmin variant="label" weight="bold" color="#265197">{firstSlot}</Text>
        </div>
      );
    },
  },
  {
    name: "LEAD",
    uid: "name",
    sortable: true,
    render: (reunion) => (
      <div className="flex flex-col whitespace-nowrap">
        <Text isAdmin variant="body" weight="bold" color="#16305A">
          {reunion.name || "-"}
        </Text>
        <Text isAdmin variant="label" color="#678CC5">
          {reunion.email || "-"}
        </Text>
      </div>
    ),
  },
  {
    name: "STATUS",
    uid: "status",
    sortable: true,
    render: (reunion) => {
      const config = STATUS_CONFIG[reunion.status] || { color: "#D4DEED", label: reunion.status };
      return (
        <div className="flex items-center gap-2 border-2 border-[#A7BDE2] rounded-full px-3 py-1 w-fit">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
          <Text isAdmin variant="body" color="#16305A">{config.label}</Text>
        </div>
      );
    },
  },
  {
    name: "ACCIONES",
    uid: "actions",
    render: (reunion) => (
      <div className="flex items-center gap-4">
        <Tooltip content="Ver detalle" delay={200} closeDelay={0}>
          <button onClick={() => onView(reunion)} className="p-1 hover:bg-[#EEF1F7] rounded-md transition-colors">
            <Icon name="Eye" size={20} color="#265197" />
          </button>
        </Tooltip>
        <Tooltip content="Editar" delay={200} closeDelay={0}>
          <button onClick={() => onEdit(reunion)} className="p-1 hover:bg-[#EEF1F7] rounded-md transition-colors">
            <Icon name="Pencil" size={20} color="#265197" />
          </button>
        </Tooltip>
      </div>
    ),
  },
];

export const getReunionExportColumns = (): ExportColumn[] => [
  { header: "Nombre", key: "name" },
  { header: "Email", key: "email" },
  { header: "Fecha Reserva", key: "booking_date" },
  {
    header: "Horarios",
    key: "time_slots",
    format: (value) => value?.join(", ") || "-",
  },
  { header: "Estado", key: "status" },
  { header: "Mensaje", key: "message" },
];
