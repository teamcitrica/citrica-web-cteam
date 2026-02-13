"use client";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Button, Icon, Text } from "citrica-ui-toolkit";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  className?: string;
  defaultValue?: string; // Valor que se considera "sin filtro" (ej: "all")
}

export default function FilterDropdown({
  options,
  selectedValue,
  onValueChange,
  className = "",
  defaultValue = "all",
}: FilterDropdownProps) {
  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const isFiltered = selectedValue !== defaultValue;

  return (
    <Dropdown
      classNames={{
        content: "min-w-[200px] rounded-xl shadow-lg border border-[#E5E7EB]",
      }}
    >
      <DropdownTrigger>
        <Button
          isAdmin={true}
          variant="secondary"
          className={`
            ${isFiltered ? "bg-[#00226c] text-white" : "bg-[#D4DEED] text-[#00226c]"}
            !rounded-lg
            px-4
            min-w-unit-10
            hover:opacity-90
            gap-2
            ${className}
          `}
        >
          <Icon name="SlidersHorizontal" size={16} color="#00226c"/>
          {isFiltered && selectedOption && (
            <Text variant="label" className="}1rounded-lg">{selectedOption.label}</Text>
          )}
          <Icon name="ChevronDown" size={14} color="#00226c"/>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Filtros"
        selectionMode="single"
        selectedKeys={new Set([selectedValue])}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          if (selected) {
            onValueChange(selected);
          }
        }}
        classNames={{
          base: "py-2",
        }}
        itemClasses={{
          base: [
            "text-[#374151]",
            "data-[hover=true]:bg-[#F9FAFB]",
            "data-[selected=true]:text-[#00226c]",
            "data-[selected=true]:font-semibold",
            "px-4",
            "py-2.5",
            "rounded-none",
          ],
        }}
      >
        {options.map((option) => (
          <DropdownItem key={option.value}>
            {option.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
