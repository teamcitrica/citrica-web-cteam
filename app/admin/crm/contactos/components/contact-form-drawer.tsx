"use client";
import { DatePicker } from "@heroui/date-picker";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { Button, Select, Input } from "citrica-ui-toolkit";
import { useContactCRUD, ContactInput, Contact } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useTypeContactCRUD } from "@/hooks/types-contact/use-types-contact";
import { COUNTRIES } from "@/shared/data/countries";
import { PHONE_CODES } from "@/shared/archivos js/phone-codes";
import { parseDate } from "@internationalized/date";

interface ContactFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  contact?: Contact | null;
  mode: "create" | "edit";
}

// Helper para validar y parsear fechas ISO
const safeParseDateString = (dateString: string | null | undefined) => {
  if (!dateString) return null;

  // Validar formato ISO 8601 (YYYY-MM-DD)
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateString)) {
    console.warn(`Invalid date format: ${dateString}`);
    return null;
  }

  try {
    return parseDate(dateString);
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return null;
  }
};

export default function ContactFormDrawer({
  isOpen,
  onClose,
  onSuccess,
  contact,
  mode,
}: ContactFormDrawerProps) {
  const { createContact, updateContact, isLoading } = useContactCRUD();
  const { companies } = useCompanyCRUD();
  const { typesContact } = useTypeContactCRUD();

  const [phoneCode, setPhoneCode] = useState<string>("+51");
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
    birth_date: null,
    country: null,
    city: null,
  });

  // Cargar datos del contacto cuando está en modo edición
  useEffect(() => {
    if (mode === "edit" && contact) {
      setFormData({
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
        birth_date: contact.birth_date,
        country: contact.country,
        city: contact.city,
      });

      // Extraer código de teléfono si existe
      if (contact.phone) {
        const matchedCode = PHONE_CODES.find(code =>
          contact.phone?.startsWith(code.value)
        );
        if (matchedCode) {
          setPhoneCode(matchedCode.value);
        }
      }
    } else {
      // Resetear formulario en modo crear
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
        birth_date: null,
        country: null,
        city: null,
      });
    }
  }, [mode, contact, isOpen]);

  const handleInputChange = (field: keyof ContactInput, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.company_id) {
      addToast({
        title: "Error",
        description: "La empresa es requerida",
        color: "danger",
      });
      return;
    }

    if (!formData.type_id) {
      addToast({
        title: "Error",
        description: "El tipo de contacto es requerido",
        color: "danger",
      });
      return;
    }

    if (!formData.name) {
      addToast({
        title: "Error",
        description: "El nombre del contacto es requerido",
        color: "danger",
      });
      return;
    }

    if (!formData.email) {
      addToast({
        title: "Error",
        description: "El email del contacto es requerido",
        color: "danger",
      });
      return;
    }

    try {
      if (mode === "create") {
        const result = await createContact(formData as ContactInput);
        if (result) {
          onSuccess?.();
          onClose();
        }
      } else if (mode === "edit" && contact) {
        const result = await updateContact(contact.id, formData as Partial<ContactInput>);
        if (result) {
          onSuccess?.();
          onClose();
        }
      }
    } catch (error) {
      console.error("Error al guardar contacto:", error);
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "AGREGAR CONTACTO" : "EDITAR CONTACTO"}
      footer={
        <>
          <Button
            isAdmin
            variant="secondary"
            onPress={onClose}
            className=" bg-white w-[162px]"
          >
            Cerrar
          </Button>
          <Button
            isAdmin
            variant="primary"
            className="w-[162px]"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            {mode === "create" ? "Agregar" : "Guardar"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-1">
        {/* Select Tipo de Contacto */}
        <Select
          label="Tipo de Contacto"
          placeholder="Seleccione el tipo"
          variant="faded"
          selectedKeys={formData.type_id ? [String(formData.type_id)] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            handleInputChange("type_id", selected ? Number(selected) : null);
          }}
          required
          options={typesContact.map((type) => ({
            value: String(type.id),
            label: type.name,
          }))}
           classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
        />

        {/* Select Empresa */}
        <Select
          label="Empresa"
          placeholder="Seleccione una empresa"
          variant="faded"
          selectedKeys={formData.company_id ? [String(formData.company_id)] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            handleInputChange("company_id", selected ? Number(selected) : null);
          }}
          required
          options={companies.map((company) => ({
            value: String(company.id),
            label: company.name || `Empresa ${company.id}`,
          }))}
          classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
        />

        {/* Nombre */}
        <Input
          label="Nombre del Contacto"
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

        {/* Apellido */}
        <Input
          label="Apellido"
          placeholder="Ingrese el apellido"
          value={formData.last_name || ""}
          onChange={(e) => handleInputChange("last_name", e.target.value)}
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />

        {/* Cargo */}
        <Input
          label="Cargo"
          placeholder="Cargo o posición"
          value={formData.cargo || ""}
          onChange={(e) => handleInputChange("cargo", e.target.value)}
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />

        {/* Email */}
        <Input
          label="Email"
          placeholder="correo@ejemplo.com"
          type="email"
          value={formData.email || ""}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />

        {/* WhatsApp */}
        <div className="grid grid-cols-[120px_1fr] gap-2">
          <Select
            label="Código"
            placeholder="+51"
            variant="faded"
            selectedKeys={[phoneCode]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setPhoneCode(selected);
            }}
            options={PHONE_CODES.map((code) => ({
              value: code.value,
              label: code.value,
            }))}
            classNames={{
              label: "!text-[#265197]",
              value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
              trigger: "bg-white !border-[#D4DEED]",
              selectorIcon: "text-[#678CC5]",
            }}
          />
          <Input
            label="WhatsApp"
            placeholder="Número de teléfono"
            value={formData.phone?.replace(phoneCode, "").trim() || ""}
            onChange={(e) => {
              const phone = e.target.value ? `${phoneCode} ${e.target.value}` : "";
              handleInputChange("phone", phone);
            }}
            variant="faded"
            classNames={{
              inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
              label: "!text-[#265197]",
              input: "placeholder:text-[#A7BDE2] !text-[#265197]",
            }}
          />
        </div>

        {/* Fecha de cumpleaños */}
        <DatePicker
          label="Fecha de cumpleaños"
          value={safeParseDateString(formData.birth_date) as any}
          onChange={(date) => {
            if (date) {
              const formattedDate = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
              handleInputChange("birth_date", formattedDate);
            } else {
              handleInputChange("birth_date", null);
            }
          }}
          classNames={{
            label: "!text-[#265197]",
            inputWrapper: "bg-white !border-[#D4DEED] data-[hover=true]:!border-[#265197] data-[focus=true]:!border-[#265197]",
            selectorIcon: "text-[#678CC5]",
          }}
          showMonthAndYearPickers
        />

        {/* Select País */}
        <Select
          label="País"
          placeholder="Seleccione un país"
          variant="faded"
          selectedKeys={formData.country ? [formData.country] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            handleInputChange("country", selected ? String(selected) : null);
          }}
          options={COUNTRIES.map((country) => ({
            value: country.name,
            label: `${country.flag} ${country.name}`,
          }))}
          classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
        />

        {/* Ciudad */}
        <Input
          label="Ciudad"
          placeholder="Ingrese la ciudad"
          value={formData.city || ""}
          onChange={(e) => handleInputChange("city", e.target.value)}
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />

        {/* Dirección */}
        <Input
          label="Dirección"
          placeholder="Dirección completa"
          value={formData.address || ""}
          onChange={(e) => handleInputChange("address", e.target.value)}
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />
      </div>
    </DrawerCitricaAdmin>
  );
}
