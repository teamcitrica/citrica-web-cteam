"use client";
import React from "react";
import { Contact } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { DetailModal } from "@/shared/components/citrica-ui";
import { Text } from "citrica-ui-toolkit";
import { COUNTRIES } from "@/shared/data/countries";

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

  const getCountryWithFlag = (countryName: string | null) => {
    if (!countryName) return "-";
    const country = COUNTRIES.find(c => c.name === countryName);
    return country ? `${country.flag} ${country.name}` : countryName;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const sections = [
    {
      title: "Datos del contacto",
      content: (
        <div className="grid grid-cols-2 gap-x-6 pt-[12px] pb-[16px]">
          {/* Columna Izquierda */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col">
              <p>
                <Text variant="label" color="#678CC5">Tipo de Contacto</Text>
              </p>
              <p>
                <Text variant="body" color="#16305A">{contact.types_contact?.name || "-"}</Text>
              </p>
            </div>
            <div className="flex flex-col">
              <p>
                <Text variant="label" color="#678CC5">Empresa</Text>
              </p>
              <p>
                <Text variant="body" color="#16305A">{getCompanyName(contact.company_id)}</Text>
              </p>
            </div>
            <div className="flex flex-col">
              <p>
                <Text variant="label" color="#678CC5">Email</Text>
              </p>
              <p>
                <Text variant="body" color="#16305A">{contact.email || "-"}</Text>
              </p>
            </div>
            <div className="flex flex-col">
              <p>
                <Text variant="label" color="#678CC5">WhatsApp</Text>
              </p>
              <p>
                <Text variant="body" color="#16305A">{contact.phone || "-"}</Text>
              </p>
            </div>
            <div className="flex flex-col">
              <p>
                <Text variant="label" color="#678CC5">Fecha de Cumpleaños</Text>
              </p>
              <p>
                <Text variant="body" color="#16305A">{formatDate(contact.birth_date)}</Text>
              </p>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col">
              <p>
                <Text variant="label" color="#678CC5">País</Text>
              </p>
              <p>
                <Text variant="body" color="#16305A">{getCountryWithFlag(contact.country)}</Text>
              </p>
            </div>
            <div className="flex flex-col">
              <p>
                <Text variant="label" color="#678CC5">Ciudad</Text>
              </p>
              <p>
                <Text variant="body" color="#16305A">{contact.city || "-"}</Text>
              </p>
            </div>
            <div className="flex flex-col">
              <p>
                <Text variant="label" color="#678CC5">Dirección</Text>
              </p>
              <p>
                <Text variant="body" color="#16305A">{contact.address || "-"}</Text>
              </p>
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
      width="512px"
      title={
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center overflow-hidden" style={{ width: '46px', height: '46px' }}>
            <img src="/avatar-login.png" alt="Avatar" width="46" height="46" />
          </div>
          <div className="flex flex-col">
            <Text variant="body" weight="bold" color="#265197">{`${contact.name || "Sin nombre"} ${contact.last_name || ""}`}</Text>
            <Text variant="label" weight="bold" color="#678CC5">{contact.cargo || "-"}</Text>
          </div>
        </div>
      }
      sections={sections}
      footer={
        <></>
        // <Button
        //   onClick={onClose}
        //   style={{ width: '140px', backgroundColor: '#265197' }}
        //   className="text-white"
        // >
        //   Cerrar
        // </Button>
      }
    />
  );
}
