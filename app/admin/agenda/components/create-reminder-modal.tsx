"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, Text, Select } from "citrica-ui-toolkit";
import { Textarea } from "@heroui/input";
import { Calendar } from "@heroui/calendar";
import { Switch } from "@heroui/switch";
import { today, getLocalTimeZone, parseDate, CalendarDate } from "@internationalized/date";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { CustomRecurrencePanel, type CustomRecurrenceData } from "@/shared/components/citrica-ui/admin/custom-recurrence-panel";
import type { Reserva } from "@/hooks/reservas/use-reservas";

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
  /** Si se pasa un booking, el modal entra en modo edición */
  booking?: Reserva | null;
}

const KNOWN_FREQUENCIES = ["none", "daily", "weekly", "monthly", "yearly", "weekdays"];

const DEFAULT_CUSTOM: CustomRecurrenceData = {
  interval: 1,
  unit: "week",
  days: [],
  endType: "never",
  endDate: "",
  endCount: 24,
};

/**
 * Parsea el valor de `recurring` almacenado para determinar
 * la frecuencia seleccionada y los datos de recurrencia personalizada.
 */
const parseRecurring = (recurring?: string): { frequency: string; customData: CustomRecurrenceData } => {
  if (!recurring || recurring === "none") {
    return { frequency: "none", customData: { ...DEFAULT_CUSTOM } };
  }
  if (KNOWN_FREQUENCIES.includes(recurring)) {
    return { frequency: recurring, customData: { ...DEFAULT_CUSTOM } };
  }
  try {
    const parsed = JSON.parse(recurring);
    return {
      frequency: "custom",
      customData: {
        interval: parsed.interval ?? 1,
        unit: parsed.unit ?? "week",
        days: parsed.days ?? [],
        endType: parsed.endType ?? "never",
        endDate: parsed.endDate ?? "",
        endCount: parsed.endCount ?? 24,
      },
    };
  } catch {
    return { frequency: "none", customData: { ...DEFAULT_CUSTOM } };
  }
};

/**
 * Parsea time_slots para determinar si tiene hora y los valores de inicio/fin.
 */
const parseTimeSlots = (timeSlots?: string[]): { withTime: boolean; start: string; end: string } => {
  if (!timeSlots || timeSlots.length === 0) {
    return { withTime: false, start: "10:00", end: "10:30" };
  }
  if (timeSlots.length === 1 && timeSlots[0].includes("-")) {
    const [start, end] = timeSlots[0].split("-");
    if (start === "00:00" && end === "23:59") {
      return { withTime: false, start: "10:00", end: "10:30" };
    }
    return { withTime: true, start, end };
  }
  return { withTime: false, start: "10:00", end: "10:30" };
};

const INPUT_CLASSNAMES = {
  inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
  label: "!text-[#265197]",
  input: "placeholder:text-[#A7BDE2] !text-[#265197]",
};

const TEXTAREA_CLASSNAMES = {
  label: "!text-[#265197]",
  input: "!text-[#265197] placeholder:!text-[#A7BDE2] !bg-white",
  inputWrapper: "!bg-white !border-[#D4DEED]",
};

const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTH_NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const ORDINALS = ["primer", "segundo", "tercer", "cuarto", "quinto"];

const getFrequencyOptions = (date: CalendarDate) => {
  const jsDate = new Date(date.year, date.month - 1, date.day);
  const dayName = DAY_NAMES[jsDate.getDay()];
  const monthName = MONTH_NAMES[date.month - 1];
  const weekIndex = Math.floor((date.day - 1) / 7);
  const ordinal = ORDINALS[weekIndex] || `${weekIndex + 1}°`;

  return [
    { value: "none", label: "No se repite" },
    { value: "daily", label: "Todos los días" },
    { value: "weekly", label: `Cada semana el ${dayName}` },
    { value: "monthly", label: `Todos los meses el ${ordinal} ${dayName}` },
    { value: "yearly", label: `Anualmente el ${date.day} de ${monthName}` },
    { value: "weekdays", label: "Todos los días hábiles" },
    { value: "custom", label: "Personalizado" },
  ];
};

const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
  booking,
}) => {
  const isEditMode = !!booking;

  const [name, setName] = useState("");
  const [calendarDate, setCalendarDate] = useState<CalendarDate>(
    defaultDate ? parseDate(defaultDate) : today(getLocalTimeZone())
  );
  const [withTime, setWithTime] = useState(true);
  const [timeStart, setTimeStart] = useState("10:00");
  const [timeEnd, setTimeEnd] = useState("10:30");
  const [frequency, setFrequency] = useState<string>("none");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Custom recurrence state
  const [customRecurrence, setCustomRecurrence] = useState<CustomRecurrenceData>({
    ...DEFAULT_CUSTOM,
  });

  const [isDirty, setIsDirty] = useState(false);

  const frequencyOptions = useMemo(() => getFrequencyOptions(calendarDate), [calendarDate]);

  // Cargar datos del booking en modo edición
  useEffect(() => {
    if (booking) {
      setName(booking.name || "");
      setMessage(booking.message || "");

      if (booking.booking_date) {
        try {
          setCalendarDate(parseDate(booking.booking_date));
        } catch {
          setCalendarDate(today(getLocalTimeZone()));
        }
      }

      const time = parseTimeSlots(booking.time_slots);
      setWithTime(time.withTime);
      setTimeStart(time.start);
      setTimeEnd(time.end);

      const { frequency: freq, customData } = parseRecurring(booking.recurring);
      setFrequency(freq);
      setCustomRecurrence(customData);
      setIsDirty(false);
    }
  }, [booking]);

  useEffect(() => {
    if (defaultDate && !booking) {
      setCalendarDate(parseDate(defaultDate));
    }
  }, [defaultDate, booking]);

  const resetForm = () => {
    setName("");
    setCalendarDate(defaultDate ? parseDate(defaultDate) : today(getLocalTimeZone()));
    setWithTime(true);
    setTimeStart("10:00");
    setTimeEnd("10:30");
    setFrequency("none");
    setMessage("");
    setCustomRecurrence({
      interval: 1,
      unit: "week",
      days: [],
      endType: "never",
      endDate: "",
      endCount: 24,
    });
  };

  const getDateString = () => {
    const year = calendarDate.year;
    const month = String(calendarDate.month).padStart(2, "0");
    const day = String(calendarDate.day).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    // Validar recurrencia personalizada
    if (frequency === "custom") {
      if (customRecurrence.unit === "week" && customRecurrence.days.length === 0) return;
      if (customRecurrence.endType === "date" && !customRecurrence.endDate) return;
    }

    setIsLoading(true);
    const dateStr = getDateString();
    const timeSlots = withTime ? [`${timeStart}-${timeEnd}`] : ["00:00-23:59"];

    let recurring = frequency;
    if (frequency === "custom") {
      recurring = JSON.stringify(customRecurrence);
    }

    const { error } = await onSubmit({
      name,
      booking_date: dateStr,
      time_slots: timeSlots,
      message,
      recurring,
    });

    setIsLoading(false);

    if (!error) {
      if (!isEditMode) resetForm();
      onClose();
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "EDITAR RECORDATORIO" : "NUEVO RECORDATORIO"}
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
            isDisabled={!name.trim() || (isEditMode && !isDirty)}
          >
            {isEditMode ? "Guardar" : "Agregar"}
          </Button>
        </>
      }
    >
      <Input
        label="Asunto"
        placeholder="Agregar asunto"
        value={name}
        onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
        required
        variant="faded"
        classNames={INPUT_CLASSNAMES}
      />

      <div>
        <Calendar
          aria-label="Seleccionar fecha"
          value={calendarDate as any}
          onChange={(val: any) => { if (val) { setCalendarDate(val); setIsDirty(true); } }}
          showMonthAndYearPickers
          classNames={{
            base: "!shadow-none !border-[#D4DEED] !border !rounded-[12px] !bg-white !w-full !max-w-full",
            content: "!w-full !bg-white",
            headerWrapper: "!bg-transparent !rounded-t-[12px] !py-2",
            header: "!gap-1 !bg-[#EEF1F7] !px-3 !py-1 !rounded-lg !border !border-[#D4DEED] !w-auto",
            title: "!text-[#265197] !font-semibold !text-sm",
            prevButton: "!text-[#265197] !min-w-6 !w-6 !h-6",
            nextButton: "!text-[#265197] !min-w-6 !w-6 !h-6",
            gridWrapper: "!w-full !px-0 !pb-3",
            grid: "!w-full",
            gridHeader: "!bg-white",
            gridHeaderRow: "!w-full",
            gridHeaderCell: "!text-[#265197] !font-medium !text-xs !flex-1 !w-auto !justify-center",
            gridBody: "!bg-transparent",
            gridBodyRow: "!w-full",
            cell: "!text-[#265197] !flex-1",
            cellButton: [
              "!w-full !text-sm",
              "data-[selected=true]:!bg-[#265197] data-[selected=true]:!text-white",
              "data-[today=true]:!bg-[#EEF1F7] data-[today=true]:!text-[#265197]",
              "hover:!bg-[#EEF1F7]",
              "data-[outside-month=true]:!text-[#A7BDE2]",
            ].join(" "),
          }}
        />
      </div>

      <div className="flex items-center gap-3">
          <div className="flex flex-col w-fit">
            <Text variant="label" color="#265197" className="font-medium">Con hora</Text>
            <Switch
              isSelected={withTime}
              onValueChange={(v) => { setWithTime(v); setIsDirty(true); }}
              size="md"
              classNames={{
                base: "!w-full",
                wrapper: "group-data-[selected=true]:!bg-[#34D399]",
              }}
            />
          </div>
          {withTime && (
            <div className="flex gap-2 flex-1">
              <Input
                label="Hora inicio"
                type="time"
                value={timeStart}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setTimeStart(newStart);
                  setIsDirty(true);
                  if (newStart >= timeEnd) {
                    const [h, m] = newStart.split(":").map(Number);
                    const total = h * 60 + m + 30;
                    setTimeEnd(`${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`);
                  }
                }}
                variant="faded"
                classNames={INPUT_CLASSNAMES}
              />
              <Input
                label="Hora fin"
                type="time"
                value={timeEnd}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  if (newEnd > timeStart) { setTimeEnd(newEnd); setIsDirty(true); }
                }}
                variant="faded"
                classNames={INPUT_CLASSNAMES}
              />
            </div>
          )}
      </div>

      <div>
        <Select
          label="Frecuencia"
          selectedKeys={[frequency]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            if (selected) { setFrequency(selected); setIsDirty(true); }
          }}
          options={frequencyOptions}
          variant="faded"
          classNames={{
            label: "!text-[#265197]",
            value: "!text-[#265197]",
            trigger: "bg-white !border-[#D4DEED]",
            selectorIcon: "text-[#678CC5]",
          }}
        />
      </div>

      {frequency === "custom" && (
        <CustomRecurrencePanel
          value={customRecurrence}
          onChange={(v) => { setCustomRecurrence(v); setIsDirty(true); }}
        />
      )}

      <Textarea
        label="Mensaje"
        placeholder="Agregar mensaje"
        value={message}
        onChange={(e) => { setMessage(e.target.value); setIsDirty(true); }}
        classNames={TEXTAREA_CLASSNAMES}
        className=""
      />
    </DrawerCitricaAdmin>
  );
};

export default CreateReminderModal;
