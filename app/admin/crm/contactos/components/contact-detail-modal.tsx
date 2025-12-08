"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Contact } from "@/hooks/contacts-clients/use-contacts-clients";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";

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

  return (
    <Modal isOpen={true} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Detalles del Contacto
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="text-base font-medium text-gray-800">
                  {contact.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cargo</p>
                <p className="text-base font-medium text-gray-800">
                  {contact.cargo || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-800">
                  {contact.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-base font-medium text-gray-800">
                  {contact.phone || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="text-base font-medium text-gray-800">
                  {contact.address || "-"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="text-base font-medium text-gray-800">
                  {getCompanyName(contact.company_id)}
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
