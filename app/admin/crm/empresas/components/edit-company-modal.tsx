"use client";
import { useState, useEffect } from "react";
import { Select, SelectItem, Textarea } from "@heroui/react";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin/button-citrica-admin";

import { Company, CompanyInput, useCompanyCRUD } from "@/hooks/companies/use-companies";

interface EditCompanyModalProps {
  isOpen: boolean;
  company: Company;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditCompanyModal({
  isOpen,
  company,
  onClose,
  onSuccess,
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
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Empresa"
      size="2xl"
      footer={
        <>
          <ButtonCitricaAdmin variant="secondary" onPress={onClose}>
            Cancelar
          </ButtonCitricaAdmin>
          <ButtonCitricaAdmin
            variant="primary"
            className="bg-[#42668A]"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Guardar Cambios
          </ButtonCitricaAdmin>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        <InputCitricaAdmin
          label="Nombre de la Empresa"
          placeholder="Ingrese el nombre"
          value={formData.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          isRequired
        />
        <Select
          label="Sector"
          placeholder="Tecnología y Software"
          selectedKeys=""
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
          isRequired
        >
            <SelectItem className="text-[#265197]">
              Sector de la economía...
            </SelectItem>
        </Select>
        <Select
          label="Relación"
          placeholder="Seleccione una empresa"
          selectedKeys=""
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
          isRequired
        >
            <SelectItem className="text-[#265197]">
              Relación: Cliente, Proveedor
            </SelectItem>
        </Select>
        {/* <InputCitricaAdmin
          label="RUC"
          placeholder="Ingrese el RUC"
          value={formData.ruc || ""}
          onChange={(e) => handleInputChange("ruc", e.target.value)}
        /> 
        <InputCitricaAdmin
          label="Nombre del Contacto"
          placeholder="Nombre completo"
          value={formData.contact_name || ""}
          onChange={(e) => handleInputChange("contact_name", e.target.value)}
        />
        <InputCitricaAdmin
          label="Cargo del Contacto"
          placeholder="Cargo o posición"
          value={formData.contact_position || ""}
          onChange={(e) => handleInputChange("contact_position", e.target.value)}
        /> */}
        <InputCitricaAdmin
          label="Website"
          placeholder="Website"
          value="."
          //onChange={(e) => handleInputChange("contact_phone", e.target.value)}
        />
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
          label="Ciudad o localidad"
          placeholder="Lima"
          value={formData.departament || ""}
          onChange={(e) => handleInputChange("departament", e.target.value)}
        />
        <InputCitricaAdmin
          label="Calle y Número"
          placeholder="Nombre de la calle"
          value={formData.street_or_avenue || ""}
          onChange={(e) => handleInputChange("street_or_avenue", e.target.value)}
        />
        <InputCitricaAdmin
          label="Distrito o Barrio"
          placeholder="Distrito"
          value={formData.district || ""}
          onChange={(e) => handleInputChange("district", e.target.value)}
        />
        <InputCitricaAdmin
          label="Código Postal"
          placeholder="123456"
          value={formData.address_number || ""}
          onChange={(e) => handleInputChange("address_number", e.target.value)}
        />
      </div>
      <Textarea
        label="Descripción"
        placeholder="Agrega una descripción"
        value={formData.description || ""}
        onChange={(e) => handleInputChange("description", e.target.value)}
        classNames={{
          label: "text-gray-700",
          input: "text-gray-800",
        }}
        className="mt-4"
      />
    </DrawerCitricaAdmin>
  );
}
