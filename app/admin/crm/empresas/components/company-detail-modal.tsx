"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Company } from "@/hooks/companies/use-companies";

interface CompanyDetailModalProps {
  company: Company;
  onClose: () => void;
}

export default function CompanyDetailModal({
  company,
  onClose,
}: CompanyDetailModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Detalles de la Empresa
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Nombre</p>
              <p className="text-gray-800">{company.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">RUC</p>
              <p className="text-gray-800">{company.ruc || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Contacto</p>
              <p className="text-gray-800">{company.contact_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Cargo</p>
              <p className="text-gray-800">{company.contact_position || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Teléfono</p>
              <p className="text-gray-800">{company.contact_phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Email</p>
              <p className="text-gray-800">{company.contact_email || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">País</p>
              <p className="text-gray-800">{company.country || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Departamento</p>
              <p className="text-gray-800">{company.departament || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Distrito</p>
              <p className="text-gray-800">{company.district || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Dirección</p>
              <p className="text-gray-800">
                {company.street_or_avenue
                  ? `${company.street_or_avenue} ${company.address_number || ""}`
                  : "-"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-600">Descripción</p>
              <p className="text-gray-800">{company.description || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Fecha de Creación</p>
              <p className="text-gray-800">
                {new Date(company.created_at).toLocaleDateString("es-PE")}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
