"use client";
import React from "react";
import { Lead } from "@/hooks/leads/use-leads-crud";
import { DetailModal } from "@/shared/components/citrica-ui";
import { Text } from "citrica-ui-toolkit";
import { AvatarTables } from "@/public/icon-svg/avatar-tables";
import { getAvatarColor } from "@/shared/utils/avatar-colors";

const ORIGIN_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  "landing_home": { color: "#16305A", bgColor: "#D4DEED", label: "Landing Home" },
};

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
}

export default function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString + "T00:00:00");
      return date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const origin = lead.origin || "landing_home";
  const originConfig = ORIGIN_CONFIG[origin] || { color: "#16305A", bgColor: "#D4DEED", label: origin };

  const sections = [
    {
      title: "Información del lead",
      content: (
        <div className="grid grid-cols-2 gap-x-6 pt-[12px] pb-[16px]">
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Email</Text></p>
              <p><Text isAdmin variant="body" color="#16305A">{lead.email || "-"}</Text></p>
            </div>
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Fecha de reserva</Text></p>
              <p><Text isAdmin variant="body" color="#16305A">{formatDate(lead.date)}</Text></p>
            </div>
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Horario seleccionado</Text></p>
              <div className="flex flex-wrap gap-1 mt-1">
                {lead.time_slot ? (
                  lead.time_slot.split(", ").map((slot) => (
                    <span
                      key={slot}
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF1F7] text-[#265197]"
                    >
                      {slot}
                    </span>
                  ))
                ) : (
                  <Text isAdmin variant="body" color="#678CC5">-</Text>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Origen</Text></p>
              <div className="mt-1">
                <span
                  className="px-3 py-1 rounded-full text-[12px] font-semibold"
                  style={{ backgroundColor: originConfig.bgColor, color: originConfig.color }}
                >
                  {originConfig.label}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Fecha de registro</Text></p>
              <p><Text isAdmin variant="body" color="#16305A">{formatDateTime(lead.created_at)}</Text></p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Mensaje",
      content: (
        <div className="pt-[8px] pb-[16px]">
          <Text isAdmin variant="body" color="#16305A">
            {lead.message || "Sin mensaje"}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <DetailModal
      isOpen={true}
      onClose={onClose}
      width="512px"
      title={
        <div className="flex items-center gap-3">
          <AvatarTables color={getAvatarColor(lead.name || "User")} size={46} />
          <div className="flex flex-col">
            <Text isAdmin variant="body" weight="bold" color="#265197">
              {lead.name || "Sin nombre"}
            </Text>
            <Text isAdmin variant="label" weight="bold" color="#678CC5">
              {lead.email || "-"}
            </Text>
          </div>
        </div>
      }
      sections={sections}
      footer={<></>}
    />
  );
}
