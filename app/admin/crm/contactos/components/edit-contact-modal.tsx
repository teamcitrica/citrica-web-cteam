"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";

import { useContactCRUD, Contact, ContactInput } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";

interface EditContactModalProps {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditContactModal({
  isOpen,
  contact,
  onClose,
  onSuccess,
}: EditContactModalProps) {
  const { updateContact, isLoading } = useContactCRUD();
  const { companies } = useCompanyCRUD();
  const [formData, setFormData] = useState<Partial<ContactInput>>({
    name: contact.name,
    cargo: contact.cargo,
    email: contact.email,
    address: contact.address,
    phone: contact.phone,
    company_id: contact.company_id,
    user_id: contact.user_id,
    type_id: contact.type_id,
    code: contact.code,
    email_access: contact.email_access,
    last_name: contact.last_name,
  });
  const [originalData, setOriginalData] = useState<Partial<ContactInput>>({
    name: contact.name,
    cargo: contact.cargo,
    email: contact.email,
    address: contact.address,
    phone: contact.phone,
    company_id: contact.company_id,
  });

  useEffect(() => {
    const contactData = {
      name: contact.name,
      cargo: contact.cargo,
      email: contact.email,
      address: contact.address,
      phone: contact.phone,
      company_id: contact.company_id,
      user_id: contact.user_id,
      type_id: contact.type_id,
      code: contact.code,
      email_access: contact.email_access,
      last_name: contact.last_name,
    };
    setFormData(contactData);
    setOriginalData({
      name: contact.name,
      cargo: contact.cargo,
      email: contact.email,
      address: contact.address,
      phone: contact.phone,
      company_id: contact.company_id,
    });
  }, [contact]);

  // Verificar si hay cambios en el formulario
  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.cargo !== originalData.cargo ||
      formData.email !== originalData.email ||
      formData.address !== originalData.address ||
      formData.phone !== originalData.phone ||
      formData.company_id !== originalData.company_id
    );
  };

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
      // No incluir user_id en la actualización normal
      const { user_id, ...updateData } = formData;
      await updateContact(contact.id, updateData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error al actualizar contacto:", error);
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Contacto"
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
            isDisabled={!hasChanges()}
          >
            Actualizar Contacto
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
            const newCompanyId = selected ? Number(selected) : null;

            setFormData((prev) => ({
              ...prev,
              company_id: newCompanyId,
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
    </DrawerCitricaAdmin>
  );
}
