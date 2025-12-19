"use client";
import { useMemo } from "react";
import { Company } from "@/hooks/companies/use-companies";
import { useUserCRUD } from "@/hooks/users/use-users";
import { DetailModal, Text } from "@/shared/components/citrica-ui";

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
            <p>
              <Text variant="label" color="#678CC5">Sector:</Text>
            </p>
            <p>
              <Text variant="body" color="#16305A">{company.description || "-"}</Text>
            </p>
          </div>
          <div className="flex flex-col pt-[8px]">
            <p>
              <Text variant="label" color="#678CC5">Teléfono:</Text>
            </p>
            <p>
              <Text variant="body" color="#16305A">{company.contact_phone || "-"}</Text>
            </p>
          </div>
          <div className="flex flex-col pt-[8px]">
            <p>
              <Text variant="label" color="#678CC5">Email:</Text>
            </p>
            <p>
              <Text variant="body" color="#16305A">{company.contact_email || "-"}</Text>
            </p>
          </div>
          <div className="flex flex-col pt-[8px]">
            <p>
              <Text variant="label" color="#678CC5">Ubicación:</Text>
            </p>
            <p>
              <Text variant="body" color="#16305A">{company.country || "-"}</Text>
            </p>
          </div>
          <div className="flex flex-col pt-[8px] pb-[16px]">
            <p>
              <Text variant="label" color="#678CC5">Dirección:</Text>
            </p>
            <p>
              <Text variant="body" color="#16305A">
                {company.street_or_avenue
                  ? ` ${company.street_or_avenue} ${company.address_number || ""}`
                  : " -"}
              </Text>
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
            <p>
              <Text variant="label" color="#265197">Usuarios:</Text>
            </p>
            <p>
              <Text variant="body" color="#265197" weight="bold">{userStats.withAccess}</Text>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p>
              <Text variant="label" color="#265197">Sin Acceso:</Text>
            </p>
            <p>
              <Text variant="body" color="#265197" weight="bold">{userStats.withoutAccess}</Text>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p>
              <Text variant="label" color="#265197">Total:</Text>
            </p>
            <p>
              <Text variant="body" color="#265197" weight="bold">{userStats.total}</Text>
            </p>
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
