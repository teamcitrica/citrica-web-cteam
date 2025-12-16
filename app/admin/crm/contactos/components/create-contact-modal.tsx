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
      title="AGREGAR CONTACTO"
      customWidth="max-w-[400px]"
      footer={
        <>
          <Button
            variant="bordered"
            onPress={onClose}
            className="border-[#42668A] text-[#42668A] rounded-[8px] w-[162px]"
          >
           Cerrar
          </Button>
          <Button
            className="bg-[#42668A] text-white w-[162px] rounded-[8px]"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Agregar
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ">
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
            label: "!text-[#265197]",
            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
        >
          {companies.map((company) => (
            <SelectItem key={String(company.id)} className="text-[#265197]">
              {company.name || `Empresa ${company.id}`}
            </SelectItem>
          ))}
        </Select>

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

      </div>
    </DrawerCitricaAdmin>
  );
}
