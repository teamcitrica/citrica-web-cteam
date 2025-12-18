"use client";
import React from "react";

import { Contact } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { DetailModal } from "@/shared/components/citrica-ui";
import { Button } from "@heroui/react";

interface ContactDetailModalProps {
  contact: Contact;
  onClose: () => void;
}

export default function ContactDetailModal({
  contact,
  onClose,
}: ContactDetailModalProps) {
  const { companies } = useCompanyCRUD();

  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "Sin empresa asignada";
    const company = companies.find(c => c.id === companyId);
    return company?.name || "Empresa no encontrada";
  };

  const sections = [
    {
      title: "Datos del contacto",
      content: (
        <div className="grid grid-cols-2 gap-x-6 pt-[12px] pb-[16px]">
          {/* Columna Izquierda */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col">
              <p className="text-sm text-[#678CC5]">Nombre:</p>
              <p className="text-sm text-[#000000]">{contact.name || "-"}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-[#678CC5]">Apellido:</p>
              <p className="text-sm text-[#000000]">{contact.last_name || "-"}</p>
                          <div className="flex flex-col">
              <p className="text-sm text-[#678CC5]">Empresa:</p>
              <p className="text-sm text-[#000000]">{getCompanyName(contact.company_id)}</p>
            </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col">
              <p className="text-sm text-[#678CC5]">Teléfono:</p>
              <p className="text-sm text-[#000000]">{contact.phone || "-"}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-[#678CC5]">Email:</p>
              <p className="text-sm text-[#000000]">{contact.email || "-"}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-[#678CC5]">Dirección:</p>
              <p className="text-sm text-[#000000]">{contact.address || "-"}</p>
            </div>

          </div>
        </div>
      ),
    },
  ];

  return (
    <DetailModal
      isOpen={true}
      onClose={onClose}
      width="560px"
      title={
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center overflow-hidden" style={{ width: '46px', height: '46px' }}>
            <img src="/avatar-logueo-citrica.png" alt="Avatar" width="46" height="46" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-[#265197]">
              {`${contact.name || "Sin nombre"} ${contact.last_name || ""}`}
            </span>
            <span className="text-sm text-[#678CC5]">{contact.cargo || "-"}</span>
          </div>
        </div>
      }
      sections={sections}
      footer={
        <Button
          onClick={onClose}
          style={{ width: '140px', backgroundColor: '#265197' }}
          className="text-white"
        >
          Cerrar
        </Button>
      }
    />
  );
}
