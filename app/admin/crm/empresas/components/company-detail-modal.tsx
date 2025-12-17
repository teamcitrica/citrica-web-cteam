"use client";
import { useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
} from "@heroui/react";

import { Company } from "@/hooks/companies/use-companies";
import { useUserCRUD } from "@/hooks/users/use-users";
import { Text } from "@/shared/components/citrica-ui";

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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
       className="w-[360px]"
      scrollBehavior="inside"
      
      
    >
      <ModalContent className="!">
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-[#265197]">
            {company.name}
          </h3>
        </ModalHeader>
        <ModalBody className="bg-[#EEF1F7] rounded-xl">
          <h3>
            <Text variant="subtitle" color="#265197" weight="bold" >Datos de la empresa</Text>
          </h3>
          <div className="flex flex-col">
            <div className="flex">
              <p className="text-sm text-[#265197]">Nombre: {company.name || "-"}</p>
            </div>
            <div className="flex ">

              <p className="text-sm text-[#265197]">RUC: {company.ruc || "-"}</p>
            </div>
            <div className="flex">
              <p className="text-sm text-[#265197]">Contacto: {company.contact_name || "-"}</p>
            </div>
            <div className="flex">
              <p className="text-sm text-[#265197]">Cargo: {company.contact_position || "-"}</p>
            </div>
            <div className="flex ">
              <p className="text-sm text-[#265197]">Teléfono: {company.contact_phone || "-"}</p>
            </div>
            <div className="flex">
              <p className="text-sm text-[#265197]">Email: {company.contact_email || "-"}</p>
            </div>
            <div className="flex">
              <p className="text-sm text-[#265197]">Ubicación: {company.country || "-"}</p>
            </div>
            {/* <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Departamento:</p>
              <p className="text-sm text-[#265197]">{company.departament || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Distrito:</p>
              <p className="text-sm text-[#265197]">{company.district || "-"}</p>
            </div> */}
            <div className="flex">
              <p className="text-sm text-[#265197]">Dirección:
                {company.street_or_avenue
                  ? `${company.street_or_avenue} ${company.address_number || ""}`
                  : "-"}
              </p>
            </div>
            <div className="flex ">
              <p className="text-sm text-[#265197]">Sector: {company.description || "-"}</p>
            </div>
            {/* <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Fecha de Creación:</p>
              <p className="text-sm text-[#265197]">
                {new Date(company.created_at).toLocaleDateString("es-PE")}
              </p>
            </div> */}
          </div>
          <Divider className="" />
          <h3 className="mb-[-5px]">
            <Text variant="subtitle" color="#265197" weight="bold" >Contactos</Text>
          </h3>
          <div className="flex gap-4 mb-[24px]">
            <div className="flex items-center gap-2">
              <p className="text-sm text-[#265197]">Usuarios:</p>
              <p className="text-lg font-bold text-[#265197]">{userStats.withAccess}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-[#265197]">Sin Acceso:</p>
              <p className="text-lg font-bold text-[#265197]">{userStats.withoutAccess}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-[#265197]">Total:</p>
              <p className="text-lg font-bold text-[#265197]">{userStats.total}</p>
            </div>
          </div>
        </ModalBody>
        
      </ModalContent>
    </Modal>
  );
}
