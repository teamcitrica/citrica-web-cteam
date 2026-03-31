"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/drawer";

import { Text, Button, Input, Select, Autocomplete } from "citrica-ui-toolkit";

import { RECURRENCE_LABELS } from "../types";

import type { Recurrence, PaymentStatus } from "../types";
import type { ContractedService, ContractedServiceInput } from "@/hooks/contracted-services/use-contracted-services";
import type { Contact } from "@/hooks/contact/use-contact";
import type { Company } from "@/hooks/companies/use-companies";
import type { Service } from "@/hooks/services/use-services";

const RECURRENCE_MONTHS: Record<Recurrence, number> = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

const recurrenceOptions = Object.entries(RECURRENCE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const statusOptions = [
  { value: "al_dia", label: "Al día" },
  { value: "pendiente_pago", label: "Pendiente de pago" },
];

const autocompleteClassNames = {
  base: "w-full [&_label]:!text-[#265197] [&_input]:!text-[#265197] [&_input::placeholder]:!text-[#A7BDE2]",
  selectorButton: "!text-[#678CC5]",
  listboxWrapper: "!text-[#265197]",
  popoverContent: "[&_li]:!text-[#265197]",
};

function calculateEndDate(startDate: string, recurrence: Recurrence, periods: number): string {
  if (!startDate || !periods) return "";
  const date = new Date(startDate + "T00:00:00");
  const months = RECURRENCE_MONTHS[recurrence] * periods;

  date.setMonth(date.getMonth() + months);

  return date.toISOString().split("T")[0];
}

interface ContractedServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContractedServiceInput) => void;
  contractedService: ContractedService | null;
  contacts: Contact[];
  companies: Company[];
  services: Service[];
}

export default function ContractedServiceDrawer({
  isOpen,
  onClose,
  onSave,
  contractedService,
  contacts,
  companies,
  services,
}: ContractedServiceDrawerProps) {
  const [contactId, setContactId] = useState<string>("");
  const [contactInput, setContactInput] = useState("");
  const [companyId, setCompanyId] = useState<number>(0);
  const [companyName, setCompanyName] = useState("");
  const [serviceId, setServiceId] = useState<string>("");
  const [serviceName, setServiceName] = useState("");
  const [serviceTypeName, setServiceTypeName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("mensual");
  const [periods, setPeriods] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("al_dia");

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      if (contractedService) {
        setContactId(contractedService.contact_id);
        const contact = contacts.find((c) => c.id === contractedService.contact_id);

        setContactInput(
          contact ? `${contact.name || ""} ${contact.last_name || ""}`.trim() : "",
        );
        setCompanyId(contractedService.company_id);
        const company = companies.find((c) => c.id === contractedService.company_id);

        setCompanyName(company?.name || "");
        const matchedService = services.find((s) => s.name === contractedService.service_name);

        setServiceId(matchedService ? matchedService.id.toString() : "");
        setServiceName(contractedService.service_name);
        setServiceTypeName(contractedService.service_type_name);
        setAmount(contractedService.amount.toString());
        setStartDate(contractedService.start_date);
        setRecurrence(contractedService.recurrence);
        setPeriods(contractedService.periods.toString());
        setStatus(contractedService.status);
      } else {
        setContactId("");
        setContactInput("");
        setCompanyId(0);
        setCompanyName("");
        setServiceId("");
        setServiceName("");
        setServiceTypeName("");
        setAmount("");
        setStartDate("");
        setRecurrence("mensual");
        setPeriods("");
        setStatus("al_dia");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contractedService]);

  // Contact options
  const contactOptions = useMemo(
    () =>
      contacts.map((c) => ({
        value: c.id,
        label: `${c.name || ""} ${c.last_name || ""}`.trim() || c.email || "Sin nombre",
      })),
    [contacts],
  );

  // Service options (only active)
  const serviceOptions = useMemo(
    () =>
      services
        .filter((s) => s.is_active)
        .map((s) => ({
          value: s.id.toString(),
          label: s.name,
        })),
    [services],
  );

  const handleContactChange = (key: string | number | null) => {
    const id = key?.toString() || "";

    setContactId(id);
    const contact = contacts.find((c) => c.id === id);

    setContactInput(
      contact ? `${contact.name || ""} ${contact.last_name || ""}`.trim() : "",
    );

    if (contact?.company_id) {
      setCompanyId(contact.company_id);
      const company = companies.find((c) => c.id === contact.company_id);

      setCompanyName(company?.name || "");
    } else {
      setCompanyId(0);
      setCompanyName("");
    }
  };

  const handleServiceChange = (keys: Set<string> | Set<number>) => {
    const selected = Array.from(keys)[0] as string;

    setServiceId(selected || "");
    const service = services.find((s) => s.id.toString() === selected);

    if (service) {
      setServiceName(service.name);
      setServiceTypeName(service.service_type?.name || "");
      setAmount(service.reference_amount.toString());
    }
  };

  const endDate = calculateEndDate(startDate, recurrence, parseInt(periods) || 0);

  const handleSubmit = () => {
    if (!contactId || !companyId || !serviceName || !amount || !startDate || !periods) return;

    onSave({
      contact_id: contactId,
      company_id: companyId,
      service_name: serviceName,
      service_type_name: serviceTypeName,
      amount: parseFloat(amount) || 0,
      start_date: startDate,
      end_date: endDate,
      recurrence,
      periods: parseInt(periods) || 0,
      status,
    });
  };

  return (
    <Drawer
      className="bg-[#F4F4F5] rounded-tl-[40px] rounded-bl-[40px]"
      isOpen={isOpen}
      size="lg"
      onClose={onClose}
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="bg-[#265197] p-3 flex w-full rounded-[8px]">
            <Text color="#FFFFFF" variant="label">
              {contractedService ? "Editar servicio contratado" : "Nuevo servicio contratado"}
            </Text>
          </div>
        </DrawerHeader>

        <DrawerBody>
          <div className="flex flex-col gap-4">
            <Autocomplete
              className="[&>div>div]:bg-white [&>div>div]:!border-[#D4DEED]"
              classNames={autocompleteClassNames}
              allowsCustomValue={false}
              fullWidth
              isClearable
              inputValue={contactInput}
              label="Contacto"
              required
              menuTrigger="input"
              options={contactOptions}
              placeholder="Buscar contacto..."
              selectedKey={contactId}
              variant="bordered"
              onInputChange={setContactInput}
              onSelectionChange={handleContactChange}
            />

            <Input
              isReadOnly
              label="Empresa"
              placeholder="Se completa al seleccionar contacto"
              value={companyName}
              variant="primary"
            />

            <Select
              className="[&_button]:bg-white"
              label="Servicio"
              options={serviceOptions}
              placeholder="Selecciona un servicio"
              required
              selectedKeys={serviceId ? [serviceId] : []}
              variant="bordered"
              onSelectionChange={handleServiceChange}
            />

            <Input
              label="Monto (S/.)"
              placeholder="Ej: 1500.00"
              required
              type="number"
              value={amount}
              variant="primary"
              onValueChange={setAmount}
            />

            <Input
              label="Fecha de inicio"
              placeholder="dd/mm/aaaa"
              required
              type="date"
              value={startDate}
              variant="primary"
              onValueChange={setStartDate}
            />

            <Select
              className="[&_button]:bg-white"
              label="Recurrencia"
              options={recurrenceOptions}
              placeholder="Selecciona recurrencia"
              required
              selectedKeys={[recurrence]}
              variant="bordered"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;

                if (selected) setRecurrence(selected as Recurrence);
              }}
            />

            <Input
              label="Cantidad de periodos"
              placeholder="Ej: 12"
              required
              type="number"
              value={periods}
              variant="primary"
              onValueChange={(value) => {
                const num = value.replace(/[^0-9]/g, "");

                setPeriods(num);
              }}
            />

            {endDate && (
              <Text color="#678CC5" variant="label">
                Fecha fin calculada: {new Date(endDate + "T00:00:00").toLocaleDateString("es-PE")}
              </Text>
            )}

            <Select
              className="[&_button]:bg-white"
              label="Estado"
              options={statusOptions}
              placeholder="Selecciona estado"
              selectedKeys={[status]}
              variant="bordered"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;

                if (selected) setStatus(selected as PaymentStatus);
              }}
            />
          </div>
        </DrawerBody>

        <DrawerFooter className="justify-end gap-2">
          <Button isAdmin variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            isAdmin
            isDisabled={!contactId || !serviceName || !amount || !startDate || !periods}
            variant="primary"
            onPress={handleSubmit}
          >
            {contractedService ? "Guardar cambios" : "Crear servicio contratado"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
