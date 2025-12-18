"use client";
import { useState } from "react";
import { Textarea } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin/button-citrica-admin";

import { useCompanyCRUD, CompanyInput } from "@/hooks/companies/use-companies";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateCompanyModal({
  isOpen,
  onClose,
  onSuccess,
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
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Error al crear empresa:", error);
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="AGREGAR EMPRESA"
      footer={
        <>
          <ButtonCitricaAdmin
            variant="secondary"
            onPress={onClose}
            className="w-[162px]"
          >
            Cerrar
          </ButtonCitricaAdmin>
          <ButtonCitricaAdmin
            variant="primary"
            className="bg-[#42668A] w-[162px]"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Agregar
          </ButtonCitricaAdmin>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <InputCitricaAdmin
          label="Nombre de la Empresa"
          placeholder="Ingrese el nombre"
          value={formData.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          isRequired
        />
        {/* <InputCitricaAdmin
          label="RUC"
          placeholder="Ingrese el RUC"
          value={formData.ruc || ""}
          onChange={(e) => handleInputChange("ruc", e.target.value)}
        /> */}
        {/* <InputCitricaAdmin
          label="Nombre del Contacto"
          placeholder="Nombre completo"
          value={formData.contact_name || ""}
          onChange={(e) => handleInputChange("contact_name", e.target.value)}
        /> */}
        {/* <InputCitricaAdmin
          label="Cargo del Contacto"
          placeholder="Cargo o posición"
          value={formData.contact_position || ""}
          onChange={(e) => handleInputChange("contact_position", e.target.value)}
        /> */}

        <InputCitricaAdmin
          label="Teléfono"
          placeholder="Número de teléfono"
          value={formData.contact_phone || ""}
          onChange={(e) => handleInputChange("contact_phone", e.target.value)}
        />
        <InputCitricaAdmin
          label="Email"
          placeholder="correo@ejemplo.com"
          type="email"
          value={formData.contact_email || ""}
          onChange={(e) => handleInputChange("contact_email", e.target.value)}
        />
        <InputCitricaAdmin
          label="País"
          placeholder="País"
          value={formData.country || ""}
          onChange={(e) => handleInputChange("country", e.target.value)}
        />
        <InputCitricaAdmin
          label="Departamento"
          placeholder="Departamento o Región"
          value={formData.departament || ""}
          onChange={(e) => handleInputChange("departament", e.target.value)}
        />
        <InputCitricaAdmin
          label="Distrito"
          placeholder="Distrito"
          value={formData.district || ""}
          onChange={(e) => handleInputChange("district", e.target.value)}
        />
        <InputCitricaAdmin
          label="Calle o Avenida"
          placeholder="Nombre de la calle"
          value={formData.street_or_avenue || ""}
          onChange={(e) => handleInputChange("street_or_avenue", e.target.value)}
        />
        <InputCitricaAdmin
          label="Número de Dirección"
          placeholder="Número"
          value={formData.address_number || ""}
          onChange={(e) => handleInputChange("address_number", e.target.value)}
        />
      </div>
      <Textarea
        label="Descripción"
        placeholder="Descripción de la empresa"
        value={formData.description || ""}
        onChange={(e) => handleInputChange("description", e.target.value)}
        classNames={{
          label: "!text-[#265197]",
          input: "!text-[#265197]",
          inputWrapper: "bg-white !border-[#D4DEED]",
        }}
        className="mt-4"
      />
    </DrawerCitricaAdmin>
  );
}
