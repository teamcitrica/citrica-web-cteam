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
  Select,
  SelectItem,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { useContactCRUD, ContactInput } from "@/hooks/contacts/use-contacts";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateContactModal({
  isOpen,
  onClose,
}: CreateContactModalProps) {
  const { createContact, isLoading } = useContactCRUD();
  const { companies } = useCompanyCRUD();
  const [formData, setFormData] = useState<ContactInput>({
    name: null,
    cargo: null,
    tipo: null,
    email: null,
    address: null,
    phone: null,
    company_id: null,
    user_id: null,
    has_system_access: false,
  });

  const handleInputChange = (field: keyof ContactInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      addToast({
        title: "Error",
        description: "El nombre del contacto es requerido",
        color: "danger",
      });
      return;
    }

    try {
      const result = await createContact(formData);
      if (result) {
        setFormData({
          name: null,
          cargo: null,
          tipo: null,
          email: null,
          address: null,
          phone: null,
          company_id: null,
          user_id: null,
          has_system_access: false,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error al crear contacto:", error);
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
            Agregar Nuevo Contacto
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Contacto"
              placeholder="Ingrese el nombre completo"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              isRequired
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Cargo"
              placeholder="Cargo o posición"
              value={formData.cargo || ""}
              onChange={(e) => handleInputChange("cargo", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Email"
              placeholder="correo@ejemplo.com"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Teléfono"
              placeholder="Número de teléfono"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Dirección"
              placeholder="Dirección completa"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Select
              label="Empresa"
              placeholder="Seleccione una empresa"
              selectedKeys={formData.company_id ? [String(formData.company_id)] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                handleInputChange("company_id", selected ? Number(selected) : "");
              }}
              classNames={{
                label: "text-gray-700",
                value: "text-gray-800",
              }}
            >
              {companies.map((company) => (
                <SelectItem key={String(company.id)}>
                  {company.name || `Empresa ${company.id}`}
                </SelectItem>
              ))}
            </Select>
          </div>
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
            Crear Contacto
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
