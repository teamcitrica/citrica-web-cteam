"use client";
import React from "react";
import { Input, Text, Select } from "citrica-ui-toolkit";
import { Checkbox } from "@heroui/checkbox";

const UNIT_OPTIONS = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
];

const WEEK_DAYS = [
  { key: "0", label: "D" },
  { key: "1", label: "L" },
  { key: "2", label: "M" },
  { key: "3", label: "M" },
  { key: "4", label: "J" },
  { key: "5", label: "V" },
  { key: "6", label: "S" },
];

export interface CustomRecurrenceData {
  interval: number;
  unit: string;
  days: string[];
  endType: "never" | "date" | "count";
  endDate: string;
  endCount: number;
}

interface CustomRecurrencePanelProps {
  value: CustomRecurrenceData;
  onChange: (data: CustomRecurrenceData) => void;
}

const INPUT_CLASSNAMES = {
  inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
  label: "!text-[#265197]",
  input: "placeholder:text-[#A7BDE2] !text-[#265197]",
};

const RadioCircle: React.FC<{ selected: boolean; onPress: () => void }> = ({ selected, onPress }) => (
  <button
    type="button"
    onClick={onPress}
    className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors bg-white"
    style={{ borderColor: selected ? "#265197" : "#D4DEED" }}
  >
    {selected && (
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#265197" }} />
    )}
  </button>
);

export const CustomRecurrencePanel: React.FC<CustomRecurrencePanelProps> = ({ value, onChange }) => {
  const update = (partial: Partial<CustomRecurrenceData>) => {
    onChange({ ...value, ...partial });
  };

  const toggleDay = (dayKey: string) => {
    const days = value.days.includes(dayKey)
      ? value.days.filter((d) => d !== dayKey)
      : [...value.days, dayKey];
    update({ days });
  };

  return (
    <div className="border rounded-[12px] px-4 py-3 flex flex-col gap-3" style={{ borderColor: "#A7BDE2", backgroundColor: "#D4DEED" }}>
      <Text isAdmin variant="subtitle" color="#265197" weight="bold">
        Recurrencia personalizada
      </Text>

      {/* Repetir cada [1] [Semana] - todo en una fila */}
      <div className="flex items-center gap-2">
        <Text isAdmin variant="label" color="#265197" className="font-medium shrink-0">
          Repetir cada
        </Text>
        <Input
          type="number"
          value={String(value.interval)}
          onChange={(e) => {
            const val = Math.max(1, parseInt(e.target.value) || 1);
            update({ interval: val });
          }}
          variant="faded"
          classNames={INPUT_CLASSNAMES}
          className="w-[70px]"
          min={1}
          size="sm"
        />
        <div className="flex-1">
          <Select
            selectedKeys={[value.unit]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              if (selected) update({ unit: selected });
            }}
            options={UNIT_OPTIONS}
            variant="faded"
            size="sm"
            classNames={{
              label: "!text-[#265197]",
              value: "!text-[#265197]",
              trigger: "bg-white !border-[#D4DEED]",
              selectorIcon: "text-[#678CC5]",
            }}
          />
        </div>
      </div>

      {/* Repetir el □D □L □M ... - todo en una fila */}
      {value.unit === "week" && (
        <div className="flex items-center gap-1">
          <Text isAdmin variant="label" color="#265197" className="font-medium shrink-0 mr-1">
            Repetir el
          </Text>
          {WEEK_DAYS.map((day) => (
            <Checkbox
              key={day.key}
              isSelected={value.days.includes(day.key)}
              onValueChange={() => toggleDay(day.key)}
              size="sm"
              classNames={{
                wrapper: "before:!border-[#D4DEED] before:!bg-white after:!bg-[#265197]",
                icon: "!text-white",
                label: "!text-[#265197] !text-xs",
              }}
            >
              {day.label}
            </Checkbox>
          ))}
        </div>
      )}

      {/* Finaliza */}
      <div className="flex items-start gap-2">
        <Text isAdmin variant="label" color="#265197" className="font-medium shrink-0 pt-0.5">
          Finaliza
        </Text>
        <div className="grid gap-y-2 gap-x-2 items-center" style={{ gridTemplateColumns: "18px 1fr" }}>
          {/* Fila 1: ● Nunca */}
          <RadioCircle selected={value.endType === "never"} onPress={() => update({ endType: "never" })} />
          <Text isAdmin variant="label" color="#265197" className="font-medium cursor-pointer" onClick={() => update({ endType: "never" })}>Nunca</Text>

          {/* Fila 2: ○ El [fecha] */}
          <RadioCircle selected={value.endType === "date"} onPress={() => update({ endType: "date" })} />
          <div className="flex items-center gap-2">
            <Text isAdmin variant="label" color="#265197" className="font-medium shrink-0">El</Text>
            <Input
              type="date"
              value={value.endDate}
              onChange={(e) => update({ endDate: e.target.value, endType: "date" })}
              variant="faded"
              classNames={INPUT_CLASSNAMES}
              className="w-[130px]"
              size="sm"
            />
          </div>

          {/* Fila 3: ○ Después de [24] Concurrencias */}
          <RadioCircle selected={value.endType === "count"} onPress={() => update({ endType: "count" })} />
          <div className="flex items-center gap-2">
            <Text isAdmin variant="label" color="#265197" className="font-medium shrink-0">Después de</Text>
            <Input
              type="number"
              value={String(value.endCount)}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                update({ endCount: val, endType: "count" });
              }}
              variant="faded"
              classNames={INPUT_CLASSNAMES}
              className="w-[70px]"
              min={1}
              size="sm"
            />
            <Text isAdmin variant="label" color="#265197" className="font-medium shrink-0">Concurrencias</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomRecurrencePanel;
