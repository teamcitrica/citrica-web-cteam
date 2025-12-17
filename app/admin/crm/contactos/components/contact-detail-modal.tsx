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
            <p className="text-sm text-[#265197]">Cargo: {contact.cargo || "-"}</p>
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
      title={contact.name || "Sin nombre"}
      sections={sections}
    />
  );
}
