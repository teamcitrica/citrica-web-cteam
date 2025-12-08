"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@heroui/react";

import { Company, CompanyInput, useCompanyCRUD } from "@/hooks/companies/use-companies";

interface EditCompanyModalProps {
  isOpen: boolean;
  company: Company;
  onClose: () => void;
}

export default function EditCompanyModal({
  isOpen,
  company,
  onClose,
}: EditCompanyModalProps) {
  const { updateCompany, isLoading } = useCompanyCRUD();
  const [formData, setFormData] = useState<CompanyInput>({
    name: company.name,
    description: company.description,
    contact_name: company.contact_name,
    contact_phone: company.contact_phone,
    contact_email: company.contact_email,
    ruc: company.ruc,
    country: company.country,
    departament: company.departament,
    district: company.district,
    street_or_avenue: company.street_or_avenue,
    address_number: company.address_number,
    contact_position: company.contact_position,
  });

  useEffect(() => {
    setFormData({
      name: company.name,
      description: company.description,
      contact_name: company.contact_name,
      contact_phone: company.contact_phone,
      contact_email: company.contact_email,
      ruc: company.ruc,
      country: company.country,
      departament: company.departament,
      district: company.district,
      street_or_avenue: company.street_or_avenue,
      address_number: company.address_number,
      contact_position: company.contact_position,
    });
  }, [company]);

  const handleInputChange = (field: keyof CompanyInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateCompany(company.id, formData);
      onClose();
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Editar Empresa
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre de la Empresa"
              placeholder="Ingrese el nombre"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              isRequired
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="RUC"
              placeholder="Ingrese el RUC"
              value={formData.ruc || ""}
              onChange={(e) => handleInputChange("ruc", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Nombre del Contacto"
              placeholder="Nombre completo"
              value={formData.contact_name || ""}
              onChange={(e) => handleInputChange("contact_name", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Cargo del Contacto"
              placeholder="Cargo o posición"
              value={formData.contact_position || ""}
              onChange={(e) => handleInputChange("contact_position", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Teléfono del Contacto"
              placeholder="Número de teléfono"
              value={formData.contact_phone || ""}
              onChange={(e) => handleInputChange("contact_phone", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Email del Contacto"
              placeholder="correo@ejemplo.com"
              type="email"
              value={formData.contact_email || ""}
              onChange={(e) => handleInputChange("contact_email", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="País"
              placeholder="País"
              value={formData.country || ""}
              onChange={(e) => handleInputChange("country", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Departamento"
              placeholder="Departamento o Región"
              value={formData.departament || ""}
              onChange={(e) => handleInputChange("departament", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Distrito"
              placeholder="Distrito"
              value={formData.district || ""}
              onChange={(e) => handleInputChange("district", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Calle o Avenida"
              placeholder="Nombre de la calle"
              value={formData.street_or_avenue || ""}
              onChange={(e) => handleInputChange("street_or_avenue", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Número de Dirección"
              placeholder="Número"
              value={formData.address_number || ""}
              onChange={(e) => handleInputChange("address_number", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
          </div>
          <Textarea
            label="Descripción"
            placeholder="Descripción de la empresa"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            classNames={{
              label: "text-gray-700",
              input: "text-gray-800",
            }}
            className="mt-4"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[#42668A] text-white"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Guardar Cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
