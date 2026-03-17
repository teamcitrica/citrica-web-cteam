import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { ExportColumn } from "@/shared/hooks/useTableFeatures";
import { Lead } from "@/hooks/leads/use-leads-crud";
import { Text, Icon } from "citrica-ui-toolkit";
import { AvatarTables } from "@/public/icon-svg/avatar-tables";
import { getAvatarColor } from "@/shared/utils/avatar-colors";
import { Tooltip } from "@heroui/tooltip";

const ORIGIN_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  "landing_home": { color: "#16305A", bgColor: "#D4DEED", label: "Landing Home" },
};

type LeadColumnsConfig = {
  onView: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
};

export const getLeadColumns = ({
  onView,
  onDelete,
  onConvert,
}: LeadColumnsConfig): Column<Lead>[] => [
  {
    name: "NOMBRE",
    uid: "name",
    sortable: true,
    render: (lead) => (
      <div className="flex items-center gap-3 min-w-[180px]">
        <AvatarTables color={getAvatarColor(lead.name || "User")} size={32} />
        <div className="flex flex-col items-start">
          <Text isAdmin={true} variant="body" weight="bold" color="#16305A">
            {lead.name || "-"}
          </Text>
          <Text variant="label" color="#678CC5">{lead.email || "-"}</Text>
        </div>
      </div>
    ),
  },
  {
    name: "FECHA RESERVA",
    uid: "date",
    sortable: true,
    render: (lead) => {
      if (!lead.date) return <Text isAdmin variant="body" color="#678CC5">-</Text>;
      const date = new Date(lead.date + "T00:00:00");
      const formatted = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return (
        <div className="whitespace-nowrap">
          <Text isAdmin variant="body" color="#16305A">{formatted}</Text>
        </div>
      );
    },
  },
  {
    name: "HORARIO",
    uid: "time_slot",
    render: (lead) => {
      if (!lead.time_slot) return <Text isAdmin variant="body" color="#678CC5">-</Text>;
      return (
        <div className="whitespace-nowrap">
          <Text isAdmin variant="body" color="#16305A">{lead.time_slot}</Text>
        </div>
      );
    },
  },
  {
    name: "ORIGEN",
    uid: "origin",
    sortable: true,
    render: (lead) => {
      const origin = lead.origin || "landing_home";
      const config = ORIGIN_CONFIG[origin] || { color: "#16305A", bgColor: "#D4DEED", label: origin };
      return (
        <span
          className="px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap"
          style={{ backgroundColor: config.bgColor, color: config.color }}
        >
          {config.label}
        </span>
      );
    },
  },
  {
    name: "MENSAJE",
    uid: "message",
    render: (lead) => {
      if (!lead.message) return <Text isAdmin variant="body" color="#678CC5">-</Text>;
      return (
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <button className="flex items-center gap-1.5 text-left hover:bg-[#EEF1F7] rounded-md px-2 py-1 transition-colors max-w-[150px]">
              <span className="text-[13px] text-[#678CC5] truncate">{lead.message}</span>
              <Icon name="ChevronDown" size={14} color="#678CC5" className="shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-w-[300px] p-3">
            <Text isAdmin variant="body" color="#16305A">{lead.message}</Text>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    name: "REGISTRO",
    uid: "created_at",
    sortable: true,
    render: (lead) => {
      const date = new Date(lead.created_at);
      const formatted = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return (
        <div className="whitespace-nowrap">
          <Text isAdmin variant="body" color="#16305A">{formatted}</Text>
        </div>
      );
    },
  },
  {
    name: "",
    uid: "actions",
    render: (lead) => (
      <div className="flex items-center gap-1">
        <Tooltip content="Ver detalle" delay={200} closeDelay={0}>
          <button onClick={() => onView(lead)} className="p-1.5 hover:bg-[#EEF1F7] rounded-md transition-colors">
            <Icon name="Eye" size={16} color="#265197" />
          </button>
        </Tooltip>
        <Tooltip content="Convertir a contacto" delay={200} closeDelay={0}>
          <button onClick={() => onConvert(lead)} className="p-1.5 hover:bg-green-50 rounded-md transition-colors">
            <Icon name="UserPlus" size={16} color="#22C55E" />
          </button>
        </Tooltip>
        <Tooltip content="Eliminar" delay={200} closeDelay={0}>
          <button onClick={() => onDelete(lead)} className="p-1.5 hover:bg-red-50 rounded-md transition-colors">
            <Icon name="Trash2" size={16} color="#F04242" />
          </button>
        </Tooltip>
      </div>
    ),
  },
];

export const getLeadExportColumns = (): ExportColumn[] => [
  { header: "Nombre", key: "name" },
  { header: "Email", key: "email" },
  { header: "Fecha Reserva", key: "date" },
  { header: "Horario", key: "time_slot" },
  { header: "Origen", key: "origin", format: (value) => value || "Landing Home" },
  { header: "Mensaje", key: "message" },
  {
    header: "Fecha Registro",
    key: "created_at",
    format: (value) => new Date(value).toLocaleDateString("es-ES"),
  },
];
