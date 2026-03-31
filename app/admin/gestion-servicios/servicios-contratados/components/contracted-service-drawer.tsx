"use client";

import { useState } from "react";
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

const MOCK_CONTACTS = [
  { value: "c1", label: "Carlos Ramírez", company: "Tech Solutions SAC" },
  { value: "c2", label: "María López", company: "Innovatech EIRL" },
  { value: "c3", label: "Jorge Mendoza", company: "Digital Corp SA" },
  { value: "c4", label: "Ana Torres", company: "Tech Solutions SAC" },
  { value: "c5", label: "Pedro García", company: "StartUp Labs SAC" },
  { value: "c6", label: "Lucía Fernández", company: "Innovatech EIRL" },
];

const MOCK_SERVICES = [
  { value: "1", label: "Hosting Premium", amount: 1500 },
  { value: "2", label: "Mantenimiento Web", amount: 800 },
  { value: "3", label: "Diseño UX/UI", amount: 3500 },
  { value: "4", label: "SEO Avanzado", amount: 1200 },
  { value: "5", label: "Soporte Técnico", amount: 600 },
  { value: "6", label: "Community Manager", amount: 950 },
];

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

interface ContractedServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContractedServiceDrawer({
  isOpen,
  onClose,
}: ContractedServiceDrawerProps) {
  const [contactId, setContactId] = useState<string>("");
  const [contactInput, setContactInput] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [serviceId, setServiceId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("mensual");
  const [periods, setPeriods] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("al_dia");

  const handleContactChange = (key: string | number | null) => {
    const id = key?.toString() || "";

    setContactId(id);
    const contact = MOCK_CONTACTS.find((c) => c.value === id);

    setContactInput(contact?.label || "");
    setCompanyName(contact?.company || "");
  };

  const handleServiceChange = (keys: Set<string> | Set<number>) => {
    const selected = Array.from(keys)[0] as string;

    setServiceId(selected || "");
    const service = MOCK_SERVICES.find((s) => s.value === selected);

    if (service) setAmount(service.amount.toString());
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
              Nuevo servicio contratado
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
              options={MOCK_CONTACTS.map((c) => ({ value: c.value, label: c.label }))}
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
              options={MOCK_SERVICES.map((s) => ({ value: s.value, label: s.label }))}
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
            isDisabled={!contactId || !serviceId || !amount || !startDate || !periods}
            variant="primary"
          >
            Crear servicio contratado
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
