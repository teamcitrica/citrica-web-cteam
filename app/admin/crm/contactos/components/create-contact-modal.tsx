"use client";
import { useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";

import { useContactCRUD, ContactInput } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateContactModal({
  isOpen,
  onClose,
  onSuccess,
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
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Error al crear contacto:", error);
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Nuevo Contacto"
      size="2xl"
      footer={
        <>
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
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputCitricaAdmin
          label="Nombre del Contacto"
          placeholder="Ingrese el nombre completo"
          value={formData.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          isRequired
        />
        <InputCitricaAdmin
          label="Cargo"
          placeholder="Cargo o posición"
          value={formData.cargo || ""}
          onChange={(e) => handleInputChange("cargo", e.target.value)}
        />
        <InputCitricaAdmin
          label="Email"
          placeholder="correo@ejemplo.com"
          type="email"
          value={formData.email || ""}
          onChange={(e) => handleInputChange("email", e.target.value)}
        />
        <InputCitricaAdmin
          label="Teléfono"
          placeholder="Número de teléfono"
          value={formData.phone || ""}
          onChange={(e) => handleInputChange("phone", e.target.value)}
        />
        <InputCitricaAdmin
          label="Dirección"
          placeholder="Dirección completa"
          value={formData.address || ""}
          onChange={(e) => handleInputChange("address", e.target.value)}
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
    </DrawerCitricaAdmin>
  );
}
