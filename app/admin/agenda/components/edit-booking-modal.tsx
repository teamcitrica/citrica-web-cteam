"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Select, Text, Icon } from "citrica-ui-toolkit";
import { Textarea } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { Reserva, ReservaEstado } from "@/hooks/reservas/use-reservas";
import { useLeadNotes } from "@/hooks/leads/use-lead-notes";
import { useSupabase } from "@/shared/context/supabase-context";
import { STATUS_CONFIG } from "../booking-calendar-view";

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Reserva | null;
  onSubmit: (
    id: string,
    data: Partial<Pick<Reserva, "name" | "email" | "message" | "description" | "booking_date" | "time_slots" | "status" | "recurring">>
  ) => Promise<{ error: unknown }>;
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
  { value: "expired", label: "Expirada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "reminder", label: "Recordatorio" },
];

/**
 * Extrae hora inicio y fin de los time_slots.
 * Formatos soportados:
 * - ["08:00-09:00"] → { start: "08:00", end: "09:00" }
 * - ["09:00","09:30","10:00"] → { start: "09:00", end: "10:30" }
 */
const parseTimeSlots = (timeSlots: string[]): { start: string; end: string } => {
  if (!timeSlots || timeSlots.length === 0) return { start: "08:00", end: "09:00" };

  if (timeSlots.length === 1 && timeSlots[0].includes("-")) {
    const [start, end] = timeSlots[0].split("-");
    return { start, end };
  }

  const sorted = [...timeSlots].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const [h, m] = last.split(":").map(Number);
  const endMinutes = h * 60 + m + 30;
  const endH = String(Math.floor(endMinutes / 60)).padStart(2, "0");
  const endM = String(endMinutes % 60).padStart(2, "0");

  return { start: first, end: `${endH}:${endM}` };
};

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("08:00");
  const [timeEnd, setTimeEnd] = useState("09:00");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<ReservaEstado>("pending");
  const [recurringValue, setRecurringValue] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const { supabase } = useSupabase();
  const { notes, fetchNotes, addNote, deleteNote, isLoading: isLoadingNotes } = useLeadNotes();

  // Si la recurrencia no es "none" ni "yearly", es una recurrencia avanzada que solo se muestra como texto
  const isAdvancedRecurrence = recurringValue !== "none" && recurringValue !== "yearly";

  useEffect(() => {
    if (booking) {
      setName(booking.name || "");
      setDescription(booking.description || "");
      setDate(booking.booking_date || "");
      setEmail(booking.email || "");
      setMessage(booking.message || "");
      setStatus(booking.status);
      setRecurringValue(booking.recurring || "none");
      const { start, end } = parseTimeSlots(booking.time_slots);
      setTimeStart(start);
      setTimeEnd(end);

      // Buscar lead asociado por email y cargar notas
      if (booking.email) {
        supabase
          .from("leads")
          .select("id")
          .eq("email", booking.email)
          .eq("type_id", 2)
          .limit(1)
          .then(({ data }) => {
            if (data && data.length > 0) {
              const id = String(data[0].id);
              setLeadId(id);
              fetchNotes(id);
            } else {
              setLeadId(null);
            }
          });
      }
    }
  }, [booking, supabase, fetchNotes]);

  const handleSubmit = async () => {
    if (!booking || !name || !date) return;

    setIsLoading(true);
    try {
      const { error } = await onSubmit(booking.id, {
        name,
        description,
        booking_date: date,
        time_slots: [`${timeStart}-${timeEnd}`],
        email,
        message,
        status,
        recurring: recurringValue,
      });

      if (!error) {
        onClose();
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColor = STATUS_CONFIG[status]?.color || "#94A3B8";

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title={booking?.status === "reminder" ? "EDITAR RECORDATORIO" : "EDITAR RESERVA"}
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
            isDisabled={!name || !date}
          >
            Guardar
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1">
        <Input
          label="Título"
          placeholder="Nombre de la reserva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          variant="faded"
          classNames={INPUT_CLASSNAMES}
        />
        <Input
          label="Descripción"
          placeholder="Descripción o comentario"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="faded"
          classNames={INPUT_CLASSNAMES}
        />
        <Select
          label="Estado"
          placeholder="Seleccione un estado"
          selectedKeys={[status]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as ReservaEstado;
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
          startContent={
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: statusColor }}
            />
          }
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
        placeholder="Detalles..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        classNames={TEXTAREA_CLASSNAMES}
        className="mt-4"
      />
      {/* Notas del lead */}
      {leadId && (
        <>
          <Divider className="my-4 bg-[#D4DEED]" />
          <div className="flex flex-col gap-3">
            <Text isAdmin variant="subtitle" weight="bold" color="#265197">
              Notas del Lead
            </Text>

            {/* Agregar nota */}
            <div className="flex gap-2">
              <Input
                placeholder="Escribir nota..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                variant="faded"
                classNames={INPUT_CLASSNAMES}
                className="flex-1"
              />
              <Button
                isAdmin
                variant="primary"
                className="bg-[#265197] shrink-0"
                isDisabled={!newNote.trim() || isLoadingNotes}
                onPress={async () => {
                  if (leadId && newNote.trim()) {
                    await addNote(leadId, newNote.trim());
                    setNewNote("");
                  }
                }}
              >
                <Icon name="Plus" size={16} />
              </Button>
            </div>

            {/* Lista de notas */}
            {isLoadingNotes ? (
              <Text isAdmin variant="label" color="#678CC5">Cargando notas...</Text>
            ) : notes.length === 0 ? (
              <Text isAdmin variant="label" color="#A7BDE2">Sin notas aún</Text>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="bg-[#EEF1F7] rounded-lg p-3 flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <Text isAdmin variant="body" color="#16305A">{note.note}</Text>
                      <div className="flex gap-2 mt-1">
                        <Text isAdmin variant="label" color="#A7BDE2">
                          {note.user_email} · {new Date(note.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </Text>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (leadId) await deleteNote(note.id, leadId);
                      }}
                      className="p-1 hover:bg-[#D4DEED] rounded-md transition-colors shrink-0"
                    >
                      <Icon name="Trash2" size={14} color="#F04242" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {status === "reminder" && (
        <div className="flex items-center mt-4">
          {isAdvancedRecurrence ? (
            <Text isAdmin variant="label" color="#265197" className="opacity-60">
              Recurrencia: {recurringValue === "daily" ? "Todos los días" : recurringValue === "weekly" ? "Semanal" : recurringValue === "monthly" ? "Mensual" : recurringValue === "weekdays" ? "Días hábiles" : "Personalizada"}
            </Text>
          ) : (
            <>
              <Checkbox
                isSelected={recurringValue === "yearly"}
                onValueChange={(checked) => setRecurringValue(checked ? "yearly" : "none")}
                classNames={{
                  wrapper: "border border-gray-300 before:border-0 after:bg-[#00226c]",
                  icon: "text-white"
                }}
              />
              <Text variant="label" textColor="color-black" className="opacity-60">
                Repetir cada año
              </Text>
            </>
          )}
        </div>
      )}
    </DrawerCitricaAdmin>
  );
};

export default EditBookingModal;
