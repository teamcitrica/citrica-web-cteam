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
  Switch,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { useContactCRUD, ContactInput } from "@/hooks/contact/use-contact";
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
  const [formData, setFormData] = useState<Partial<ContactInput>>({
    name: null,
    cargo: null,
    email: null,
    address: null,
    phone: null,
    company_id: null,
    user_id: null,
    type_id: null,
    code: null,
    email_access: null,
    last_name: null,
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
      const result = await createContact(formData as ContactInput);
      if (result) {
        setFormData({
          name: null,
          cargo: null,
          email: null,
          address: null,
          phone: null,
          company_id: null,
          user_id: null,
          type_id: null,
          code: null,
          email_access: null,
          last_name: null,
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
                setFormData((prev) => ({
                  ...prev,
                  company_id: selected ? Number(selected) : null,
                }));
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

          {/* {formData.company_id && formData.company_id !== 1 && (
            <div className="mt-4">
              <Switch
                isSelected={formData.has_system_access || false}
                onValueChange={(value) => handleInputChange("has_system_access", value as any)}
                classNames={{
                  label: "text-gray-700",
                }}
              >
                Dar acceso al sistema
              </Switch>
            </div>
          )} */}
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
