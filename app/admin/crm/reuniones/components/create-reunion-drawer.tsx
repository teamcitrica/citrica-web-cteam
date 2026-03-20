"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Input, Select, Text } from "citrica-ui-toolkit";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { useSupabase } from "@/shared/context/supabase-context";

interface CreateReunionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

const STATUS_OPTIONS = [
  { value: "pending", label: "Sin confirmar" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
];

export default function CreateReunionDrawer({
  isOpen,
  onClose,
  onSuccess,
}: CreateReunionDrawerProps) {
  const { supabase } = useSupabase();
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [availableLeads, setAvailableLeads] = useState<{ id: string; name: string; email: string; bookingCount: number }[]>([]);
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("10:00");
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableLeads = useCallback(async () => {
    const [leadsRes, bookingsRes] = await Promise.all([
      supabase.from("leads").select("id, name, email").eq("type_id", 2),
      supabase.from("bookings").select("email").eq("type_id", 1),
    ]);

    const leads = leadsRes.data || [];
    const bookings = bookingsRes.data || [];

    // Contar reuniones por email
    const bookingCountMap = new Map<string, number>();
    bookings.forEach((b: { email: string }) => {
      const key = b.email?.toLowerCase() || "";
      bookingCountMap.set(key, (bookingCountMap.get(key) || 0) + 1);
    });

    setAvailableLeads(leads.map((l) => ({
      ...l,
      bookingCount: bookingCountMap.get(l.email?.toLowerCase()) || 0,
    })));
  }, [supabase]);

  useEffect(() => {
    if (isOpen) fetchAvailableLeads();
  }, [isOpen, fetchAvailableLeads]);

  const resetForm = () => {
    setSelectedLeadId("");
    setName("");
    setEmail("");
    setDate("");
    setTimeStart("09:00");
    setTimeEnd("10:00");
    setStatus("pending");
    setMessage("");
  };

  const handleSubmit = async () => {
    if (!selectedLeadId || !date) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("bookings").insert([
        {
          name,
          email,
          booking_date: date,
          time_slots: [`${timeStart}-${timeEnd}`],
          status,
          message,
          type_id: 1,
        },
      ]);

      if (error) {
        console.error("Error al crear reunión:", error);
        addToast({
          title: "Error",
          description: "No se pudo crear la reunión",
          color: "danger",
        });
        return;
      }

      addToast({
        title: "Reunión creada",
        description: `Reunión con ${name} agendada para ${date}`,
        color: "success",
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={handleClose}
      title="NUEVA REUNIÓN"
      footer={
        <>
          <Button
            isAdmin
            variant="secondary"
            onPress={handleClose}
            className="w-[162px]"
          >
            Cancelar
          </Button>
          <Button
            isAdmin
            variant="primary"
            className="bg-[#265197] w-[162px]"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!selectedLeadId || !date}
          >
            Crear
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1">
        <Select
          label="Lead"
          placeholder="Seleccione un lead"
          selectedKeys={selectedLeadId ? [selectedLeadId] : []}
          onSelectionChange={(keys) => {
            const id = Array.from(keys)[0] as string;
            setSelectedLeadId(id || "");
            const lead = availableLeads.find((l) => l.id === id);
            if (lead) {
              setName(lead.name);
              setEmail(lead.email);
            } else {
              setName("");
              setEmail("");
            }
          }}
          options={availableLeads.map((l) => ({
            value: l.id,
            label: `${l.name} — ${l.email} (${l.bookingCount > 0 ? `${l.bookingCount} reunión${l.bookingCount > 1 ? 'es' : ''}` : 'sin reuniones'})`,
          }))}
          variant="faded"
          classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
        />
        <Select
          label="Estado"
          placeholder="Seleccione un estado"
          selectedKeys={[status]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            if (selected) setStatus(selected);
          }}
          options={STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          variant="faded"
          classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
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
            variant="faded"
            classNames={INPUT_CLASSNAMES}
          />
          <Input
            label="Hora fin"
            type="time"
            value={timeEnd}
            onChange={(e) => setTimeEnd(e.target.value)}
            variant="faded"
            classNames={INPUT_CLASSNAMES}
          />
        </div>
      </div>
      <Textarea
        label="Mensaje"
        placeholder="Detalles de la reunión..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        classNames={TEXTAREA_CLASSNAMES}
        className="mt-4"
      />
    </DrawerCitricaAdmin>
  );
}
