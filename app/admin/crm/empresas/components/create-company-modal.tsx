"use client";
import { useState } from "react";
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
import { addToast } from "@heroui/toast";

import { useCompanyCRUD, CompanyInput } from "@/hooks/companies/use-companies";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCompanyModal({
  isOpen,
  onClose,
}: CreateCompanyModalProps) {
  const { createCompany, isLoading } = useCompanyCRUD();
  const [formData, setFormData] = useState<CompanyInput>({
    name: null,
    description: null,
    contact_name: null,
    contact_phone: null,
    contact_email: null,
    ruc: null,
    country: null,
    departament: null,
    district: null,
    street_or_avenue: null,
    address_number: null,
    contact_position: null,
  });

  const handleInputChange = (field: keyof CompanyInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      addToast({
        title: "Error",
        description: "El nombre de la empresa es requerido",
        color: "danger",
      });
      return;
    }

    try {
      const result = await createCompany(formData);
      if (result) {
        setFormData({
          name: null,
          description: null,
          contact_name: null,
          contact_phone: null,
          contact_email: null,
          ruc: null,
          country: null,
          departament: null,
          district: null,
          street_or_avenue: null,
          address_number: null,
          contact_position: null,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error al crear empresa:", error);
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
            Agregar Nueva Empresa
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
            Crear Empresa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
