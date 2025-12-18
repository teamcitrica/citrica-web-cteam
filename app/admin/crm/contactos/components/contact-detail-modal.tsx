"use client";
import React from "react";

import { Contact } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { DetailModal } from "@/shared/components/citrica-ui";

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
        <div className="flex flex-col">
          <div className="flex">
            <p className="text-sm text-[#265197]">Nombre: {contact.name || "-"}</p>
          </div>
          <div className="flex">
            <p className="text-sm text-[#265197]">Apellido: {contact.last_name || "-"}</p>
          </div>
          <div className="flex">

          </div>
          <div className="flex">
            <p className="text-sm text-[#265197]">Teléfono: {contact.phone || "-"}</p>
          </div>
          <div className="flex">
            <p className="text-sm text-[#265197]">Email: {contact.email || "-"}</p>
          </div>
          <div className="flex">
            <p className="text-sm text-[#265197]">Dirección: {contact.address || "-"}</p>
          </div>
          <div className="flex">
            <p className="text-sm text-[#265197]">Empresa: {getCompanyName(contact.company_id)}</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DetailModal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center overflow-hidden" style={{ width: '32px', height: '32px' }}>
            <img src="/avatar-logueo-citrica.png" alt="Avatar" width="32" height="32" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-[#265197]">{contact.name || "Sin nombre"}</span>
            <span className="text-sm text-[#678CC5]">{contact.cargo || "-"}</span>
          </div>
        </div>
      }
      sections={sections}
    />
  );
}
