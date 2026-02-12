"use client";

import React, { useState, useEffect } from "react";
import { Button, Input } from "citrica-ui-toolkit";
import { Textarea } from "@heroui/input";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    booking_date: string;
    time_slots: string[];
    message?: string;
    description?: string;
    recurring?: string;
  }) => Promise<{ error: unknown }>;
  defaultDate?: string;
}

/** Estilos reutilizables para los inputs del admin */
const INPUT_CLASSNAMES = {
  inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
  label: "!text-[#265197]",
  input: "placeholder:text-[#A7BDE2] !text-[#265197]",
};

const TEXTAREA_CLASSNAMES = {
  label: "!text-[#265197]",
  input: "!text-[#265197]",
  inputWrapper: "bg-white !border-[#D4DEED]",
};

const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
}) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(defaultDate || "");
  const [timeStart, setTimeStart] = useState("08:00");
  const [timeEnd, setTimeEnd] = useState("09:00");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar fecha cuando cambia defaultDate
  useEffect(() => {
    if (defaultDate) setDate(defaultDate);
  }, [defaultDate]);

  const resetForm = () => {
    setName("");
    setDate(defaultDate || "");
    setTimeStart("08:00");
    setTimeEnd("09:00");
    setDescription("");
    setMessage("");
    setRecurring(false);
  };

  const handleSubmit = async () => {
    if (!name || !date || !timeStart || !timeEnd) return;

    setIsLoading(true);
    const { error } = await onSubmit({
      name,
      booking_date: date,
      time_slots: [`${timeStart}-${timeEnd}`],
      description,
      message,
      recurring: recurring ? 'yearly' : 'none',
    });

    setIsLoading(false);

    if (!error) {
      resetForm();
      onClose();
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="NUEVO RECORDATORIO"
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
            isDisabled={!name || !date || !timeStart || !timeEnd}
          >
            Agregar
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-1">
        <Input
          label="Título"
          placeholder="Ej: Vencimiento hosting Akita"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          variant="faded"
          classNames={INPUT_CLASSNAMES}
        />
        <Input
          label="Descripción"
          placeholder="Ej: Se repite anualmente el 14 de Noviembre"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="faded"
          classNames={INPUT_CLASSNAMES}
        />
        <Input
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          variant="faded"
          classNames={INPUT_CLASSNAMES}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Hora inicio"
            type="time"
            value={timeStart}
            onChange={(e) => setTimeStart(e.target.value)}
            required
            variant="faded"
            classNames={INPUT_CLASSNAMES}
          />
          <Input
            label="Hora fin"
            type="time"
            value={timeEnd}
            onChange={(e) => setTimeEnd(e.target.value)}
            required
            variant="faded"
            classNames={INPUT_CLASSNAMES}
          />
        </div>
      </div>
      <Textarea
        label="Mensaje"
        placeholder="Detalles del recordatorio..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        classNames={TEXTAREA_CLASSNAMES}
        className="mt-4"
      />
      <label className="flex items-center gap-2 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="w-4 h-4 rounded border-[#D4DEED] accent-[#265197]"
        />
        <span className="text-sm text-[#265197]">Repetir cada año</span>
      </label>
    </DrawerCitricaAdmin>
  );
};

export default CreateReminderModal;
