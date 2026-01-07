"use client";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { useState, useEffect } from "react";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { Button } from "citrica-ui-toolkit";
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
          placeholder="Seleccione un sector"
          selectedKeys={formData.sector ? [formData.sector] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            setFormData((prev) => ({
              ...prev,
              sector: selected ? String(selected) : null,
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
          {COMPANY_SECTORS.map((sector) => (
            <SelectItem key={sector} className="text-[#265197]">
              {sector}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="Relación"
          placeholder="Seleccione una relación"
          selectedKeys={formData.type_id ? [String(formData.type_id)] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            setFormData((prev) => ({
              ...prev,
              type_id: selected ? Number(selected) : null,
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
          {contactTypes.map((type) => (
            <SelectItem key={type.id} className="text-[#265197]">
              {type.name}
            </SelectItem>
          ))}
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
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <Select
            label="Código"
            placeholder="+51"
            selectedKeys={[phoneCode]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setPhoneCode(selected);
            }}
            classNames={{
              label: "!text-[#265197]",
              value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
              trigger: "bg-white !border-[#D4DEED]",
              selectorIcon: "text-[#678CC5]",
            }}
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center gap-1">
                  <span className="text-sm">{item.key}</span>
                </div>
              ));
            }}
          >
            {PHONE_CODES.map((code) => (
              <SelectItem
                key={code.value}
                className="text-[#265197]"
                textValue={code.value}
              >
                {code.label}
              </SelectItem>
            ))}
          </Select>
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
          selectedKeys={formData.country ? [formData.country] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            setFormData((prev) => ({
              ...prev,
              country: selected ? String(selected) : null,
            }));
          }}
          classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
          renderValue={(items) => {
            return items.map((item) => {
              const country = COUNTRIES.find(c => c.name === item.key);
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <span>{country?.flag}</span>
                  <span>{country?.name}</span>
                </div>
              );
            });
          }}
        >
          {COUNTRIES.map((country) => (
            <SelectItem
              key={country.name}
              className="text-[#265197]"
              startContent={<span className="text-lg">{country.flag}</span>}
            >
              {country.name}
            </SelectItem>
          ))}
        </Select>
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
