"use client";
import { Select } from "citrica-ui-toolkit";
import { Textarea } from "@heroui/input";
import { useState, useEffect } from "react";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { Button, Input } from "citrica-ui-toolkit";
import { useSupabase } from "@/shared/context/supabase-context";

import { Company, CompanyInput, useCompanyCRUD } from "@/hooks/companies/use-companies";
import { COUNTRIES } from "@/shared/data/countries";
import { PHONE_CODES } from "@/shared/archivos js/phone-codes";
import { COMPANY_SECTORS } from "@/shared/archivos js/sectores";

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
  const { supabase } = useSupabase();
  const [contactTypes, setContactTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [phoneCode, setPhoneCode] = useState<string>("+51");
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
    type_id: company.type_id,
    zip_code: company.zip_code,
    website: company.website,
    sector: company.sector,
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
      type_id: company.type_id,
      zip_code: company.zip_code,
      website: company.website,
      sector: company.sector,
    });

    // Extraer código de teléfono si existe
    if (company.contact_phone) {
      const matchedCode = PHONE_CODES.find(code =>
        company.contact_phone?.startsWith(code.value)
      );
      if (matchedCode) {
        setPhoneCode(matchedCode.value);
      }
    }
  }, [company]);

  // Cargar tipos de contacto (Cliente y Proveedor)
  useEffect(() => {
    const fetchContactTypes = async () => {
      const { data, error } = await supabase
        .from("types_contact")
        .select("id, name")
        .in("id", [1, 5])
        .order("id", { ascending: true });

      if (error) {
        console.error("Error al cargar tipos de contacto:", error);
        return;
      }

      setContactTypes(data || []);
    };

    if (isOpen) {
      fetchContactTypes();
    }
  }, [isOpen, supabase]);

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
          <Button isAdmin variant="secondary" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            isAdmin
            variant="primary"
            className="bg-[#42668A]"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Guardar Cambios
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1">
        <Input
          label="Nombre de la Empresa"
          placeholder="Ingrese el nombre"
          value={formData.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />
        <Select
          label="Sector"
          placeholder="Seleccione un sector"
          selectedKeys={formData.sector ? [formData.sector] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData((prev) => ({
              ...prev,
              sector: selected || null,
            }));
          }}
          options={COMPANY_SECTORS.map((sector) => ({ value: sector, label: sector }))}
          variant="faded"
          classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
          required
        />
        <Select
          label="Relación"
          placeholder="Seleccione una relación"
          selectedKeys={formData.type_id ? [String(formData.type_id)] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData((prev) => ({
              ...prev,
              type_id: selected ? Number(selected) : null,
            }));
          }}
          options={contactTypes.map((type) => ({ value: String(type.id), label: type.name }))}
          variant="faded"
          classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
          required
        />
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
        <Input
          label="Website"
          placeholder="Website"
          value="."
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
          //onChange={(e) => handleInputChange("contact_phone", e.target.value)}
        />
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <Select
            label="Código"
            placeholder="+51"
            selectedKeys={phoneCode ? [phoneCode] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setPhoneCode(selected);
            }}
            options={PHONE_CODES.map((code) => ({ value: code.value, label: code.label }))}
            variant="faded"
            classNames={{
              label: "!text-[#265197]",
              value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
              trigger: "bg-white !border-[#D4DEED]",
              selectorIcon: "text-[#678CC5]",
            }}
          />
          <Input
            label="Teléfono"
            placeholder="Número de teléfono"
            value={formData.contact_phone?.replace(phoneCode, "").trim() || ""}
            onChange={(e) => {
              const phone = e.target.value ? `${phoneCode} ${e.target.value}` : "";
              handleInputChange("contact_phone", phone);
            }}
            variant="faded"
            classNames={{
              inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
              label: "!text-[#265197]",
              input: "placeholder:text-[#A7BDE2] !text-[#265197]",
            }}
          />
        </div>
        <Input
          label="Email"
          placeholder="correo@ejemplo.com"
          type="email"
          value={formData.contact_email || ""}
          onChange={(e) => handleInputChange("contact_email", e.target.value)}
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />
        <Select
          label="País"
          placeholder="Seleccione un país"
          selectedKeys={formData.country ? [formData.country] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData((prev) => ({
              ...prev,
              country: selected || null,
            }));
          }}
          options={COUNTRIES.map((country) => ({ value: country.name, label: `${country.flag} ${country.name}` }))}
          variant="faded"
          classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
        />
        <Input
          label="Ciudad o localidad"
          placeholder="Lima"
          value={formData.departament || ""}
          onChange={(e) => handleInputChange("departament", e.target.value)}
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />
        <Input
          label="Calle y Número"
          placeholder="Nombre de la calle"
          value={formData.street_or_avenue || ""}
          onChange={(e) => handleInputChange("street_or_avenue", e.target.value)}
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />
        <Input
          label="Distrito o Barrio"
          placeholder="Distrito"
          value={formData.district || ""}
          onChange={(e) => handleInputChange("district", e.target.value)}
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />
        <Input
          label="Código Postal"
          placeholder="123456"
          value={formData.address_number || ""}
          onChange={(e) => handleInputChange("address_number", e.target.value)}
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
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
