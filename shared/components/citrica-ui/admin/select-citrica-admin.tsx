"use client";
import { Select } from "citrica-ui-toolkit";
import React from "react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

export interface SelectCitricaAdminProps {
  label?: string;
  placeholder?: string;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: any) => void;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  className?: string;
  name?: string;
}

/**
 * Select component specifically styled for Citrica Admin
 *
 * Features consistent styling:
 * - Rounded borders (12px)
 * - Citrica blue color scheme
 * - Hover and focus states
 */
export const SelectCitricaAdmin: React.FC<SelectCitricaAdminProps> = ({
  className = "min-w-[264px]",
  ...props
}) => {
  return (
    <Select
      variant="faded"
      className={className}
      classNames={{
        trigger: "bg-white !border-[#D4DEED] !rounded-[12px] data-[focus=true]:!border-[#D4DEED] data-[open=true]:!border-[#D4DEED] data-[hover=true]:!border-[#B8D4E5]",
        label: "!text-[#265197]",
        value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
        selectorIcon: "text-[#678CC5]",
      }}
      {...props}
    />
  );
};

export default SelectCitricaAdmin;
