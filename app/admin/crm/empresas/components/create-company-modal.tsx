"use client";
import { Select } from "citrica-ui-toolkit";
import { Textarea } from "@heroui/input";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { Button } from "citrica-ui-toolkit";
import { useSupabase } from "@/shared/context/supabase-context";

import { useCompanyCRUD, CompanyInput } from "@/hooks/companies/use-companies";
import { COUNTRIES } from "@/shared/data/countries";
import { PHONE_CODES } from "@/shared/archivos js/phone-codes";
import { COMPANY_SECTORS } from "@/shared/archivos js/sectores";

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
  const { supabase } = useSupabase();
  const [contactTypes, setContactTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [phoneCode, setPhoneCode] = useState<string>("+51");
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
    type_id: null,
    zip_code: null,
    website: null,
    sector: null,
  });

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
          type_id: null,
          zip_code: null,
          website: null,
          sector: null,
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
          <Button
            isAdmin
            variant="secondary"
            onPress={onClose}
            className="w-[162px]"
          >
            Cerrar
          </Button>
          <Button
            isAdmin
            variant="primary"
            className="bg-[#42668A] w-[162px]"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Agregar
          </Button>
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
        <Select
          label="Sector"
          placeholder="Seleccione un sector"
          value={formData.sector || ""}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              sector: e.target.value || null,
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
          value={formData.type_id ? String(formData.type_id) : ""}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              type_id: e.target.value ? Number(e.target.value) : null,
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
        <InputCitricaAdmin
          label="Website"
          placeholder="https://ejemplo.com"
          value={formData.website || ""}
          onChange={(e) => handleInputChange("website", e.target.value)}
        />
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <Select
            label="Código"
            placeholder="+51"
            value={phoneCode}
            onChange={(e) => {
              setPhoneCode(e.target.value);
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
          <InputCitricaAdmin
            label="Teléfono"
            placeholder="Número de teléfono"
            value={formData.contact_phone?.replace(phoneCode, "").trim() || ""}
            onChange={(e) => {
              const phone = e.target.value ? `${phoneCode} ${e.target.value}` : "";
              handleInputChange("contact_phone", phone);
            }}
          />
        </div>
        <InputCitricaAdmin
          label="Email"
          placeholder="correo@ejemplo.com"
          type="email"
          value={formData.contact_email || ""}
          onChange={(e) => handleInputChange("contact_email", e.target.value)}
        />
        <Select
          label="País"
          placeholder="Seleccione un país"
          value={formData.country || ""}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              country: e.target.value || null,
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
          value={formData.zip_code || ""}
          onChange={(e) => handleInputChange("zip_code", e.target.value)}
        />
      </div>
      <Textarea
        label="Descripción"
        placeholder="Agrega una descripción"
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
