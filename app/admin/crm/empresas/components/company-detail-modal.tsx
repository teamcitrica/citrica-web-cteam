"use client";
import { useMemo } from "react";

import { Company } from "@/hooks/companies/use-companies";
import { useUserCRUD } from "@/hooks/users/use-users";
import { DetailModal } from "@/shared/components/citrica-ui";

interface CompanyDetailModalProps {
  company: Company;
  onClose: () => void;
  width?: string;
  height?: string;
}

export default function CompanyDetailModal({
  company,
  onClose,
  width,
  height,
}: CompanyDetailModalProps) {
  const { users } = useUserCRUD();

  const customStyle: React.CSSProperties = {};
  if (width) customStyle.width = width;
  if (height) customStyle.height = height;

  // Calcular estadísticas de usuarios de esta empresa
  const userStats = useMemo(() => {
    const companyUsers = users.filter(user => user.company_id === company.id);
    const withAccess = companyUsers.filter(user => user.active_users === true).length;
    const withoutAccess = companyUsers.filter(user => user.active_users === false).length;

    return {
      total: companyUsers.length,
      withAccess,
      withoutAccess,
    };
  }, [users, company.id]);

  const sections = [
    {
      title: "Datos de la empresa",
      content: (
        <div className="flex flex-col">
          {/* <div className="flex">
            <p className="text-sm text-[#265197]">Nombre: {company.name || "-"}</p>
          </div> */}
          {/* <div className="flex">
            <p className="text-sm text-[#265197]">RUC: {company.ruc || "-"}</p>
          </div> */}
          {/* <div className="flex">
            <p className="text-sm text-[#265197]">Contacto: {company.contact_name || "-"}</p>
          </div> */}
          {/* <div className="flex">
            <p className="text-sm text-[#265197]">Cargo: {company.contact_position || "-"}</p>
          </div> */}
          <div className="flex flex-col pt-[12px]">
            <p className="text-sm text-[#678CC5]">Sector:</p>
            <p className="text-sm text-[#000000]">{company.description || "-"}</p>

          </div>
          <div className="flex flex-col pt-[8px]">
            <p className="text-sm text-[#678CC5]">Teléfono:</p>
            <p className="text-sm text-[#000000]">{company.contact_phone || "-"}</p>
          </div>
          <div className="flex flex-col pt-[8px]">
            <p className="text-sm text-[rgb(103,140,197)]">Email:</p>
            <p className="text-sm text-[#000000]"> {company.contact_email || "-"}</p>
          </div>
          <div className="flex flex-col pt-[8px]">
            <p className="text-sm text-[#678CC5]">Ubicación:</p>
            <p className="text-sm text-[#000000]">{company.country || "-"}</p>
          </div>
          <div className="flex flex-col pt-[8px] pb-[16px]">
            <p className="text-sm text-[#678CC5]">Dirección:</p>
            <p className="text-sm text-[#000000]">
              {company.street_or_avenue
                ? ` ${company.street_or_avenue} ${company.address_number || ""}`
                : " -"}
            </p>
          </div>

        </div>
      ),
    },
    {
      title: "Contactos",
      content: (
        <div className="flex gap-4 mb-[24px] mt-[12px]">
          <div className="flex items-center gap-2">
            <p className="text-sm text-[#265197]">Usuarios:</p>
            <p className="text-lg text-[#265197]">{userStats.withAccess}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-[#265197]">Sin Acceso:</p>
            <p className="text-lg  text-[#265197]">{userStats.withoutAccess}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-[#265197]">Total:</p>
            <p className="text-lg font-bold text-[#265197]">{userStats.total}</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DetailModal
      isOpen={true}
      onClose={onClose}
      title={company.name || "Sin nombre"}
      sections={sections}
      width={width}
      height={height}
    />
  );
}
