"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Divider,
} from "@heroui/react";

import { Company } from "@/hooks/companies/use-companies";
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
  const customStyle: React.CSSProperties = {};
  if (width) customStyle.width = width;
  if (height) customStyle.height = height;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size={width || height ? undefined : "md"}
      scrollBehavior="inside"
      style={width || height ? customStyle : undefined}
      classNames={{
        closeButton: "w-5 h-5 min-w-5 !text-base text-[#265197] border border-[#265197] rounded-full hover:bg-[#265197] hover:text-white transition-colors flex items-center justify-center",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-[#265197]">
            {company.name}
          </h3>
        </ModalHeader>
        <ModalBody className="bg-[#EEF1F7]">
          <h3>
            <Text variant="subtitle" color="#265197" weight="bold" >Datos de la empresa</Text>
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Nombre:</p>
              <p className="text-sm text-[#265197]">{company.name || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">RUC:</p>
              <p className="text-sm text-[#265197]">{company.ruc || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Contacto:</p>
              <p className="text-sm text-[#265197]">{company.contact_name || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Cargo:</p>
              <p className="text-sm text-[#265197]">{company.contact_position || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Teléfono:</p>
              <p className="text-sm text-[#265197]">{company.contact_phone || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Email:</p>
              <p className="text-sm text-[#265197]">{company.contact_email || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">País:</p>
              <p className="text-sm text-[#265197]">{company.country || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Departamento:</p>
              <p className="text-sm text-[#265197]">{company.departament || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Distrito:</p>
              <p className="text-sm text-[#265197]">{company.district || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Dirección:</p>
              <p className="text-sm text-[#265197]">
                {company.street_or_avenue
                  ? `${company.street_or_avenue} ${company.address_number || ""}`
                  : "-"}
              </p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Descripción:</p>
              <p className="text-sm text-[#265197]">{company.description || "-"}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-semibold text-gray-600 min-w-[120px]">Fecha de Creación:</p>
              <p className="text-sm text-[#265197]">
                {new Date(company.created_at).toLocaleDateString("es-PE")}
              </p>
            </div>
          </div>
          <Divider className="my-4" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
