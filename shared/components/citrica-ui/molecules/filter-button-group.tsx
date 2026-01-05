"use client";
import { ButtonGroup } from "@heroui/react";
import { Button } from "citrica-ui-toolkit";
export interface FilterButton {
  value: string;
  label: string;
}

interface FilterButtonGroupProps {
  buttons: FilterButton[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  height?: string;
  containerClassName?: string;
  activeButtonClassName?: string;
  inactiveButtonClassName?: string;
}

export default function FilterButtonGroup({
  buttons,
  selectedValue,
  onValueChange,
  size = "sm",
  height,
  containerClassName = "bg-[#D4DEED] p-1 rounded-md",
  activeButtonClassName = "bg-white text-[#265197] !rounded-md",
  inactiveButtonClassName = "bg-[#D4DEED] text-[#265197] border border-[#D4DEED]",
}: FilterButtonGroupProps) {
  return (
    <div className={containerClassName} style={height ? { height } : undefined}>
      <ButtonGroup size={size} className="w-full h-full">
        {buttons.map((button) => (
          <Button
            key={button.value}
            // radius="md"
            className={`flex-1 h-full px-4 ${
              selectedValue === button.value
                ? activeButtonClassName
                : inactiveButtonClassName
            }`}
            onPress={() => onValueChange(button.value)}
          >
            {button.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}
