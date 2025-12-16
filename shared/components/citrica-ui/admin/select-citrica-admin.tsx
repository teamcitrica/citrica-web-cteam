"use client";
import React from "react";
import { Select as HeroUISelect, SelectProps as HeroUISelectProps } from "@heroui/react";
import type { CollectionChildren } from "@react-types/shared";

export interface SelectCitricaAdminProps extends Omit<HeroUISelectProps, 'classNames' | 'variant' | 'children'> {
  children: CollectionChildren<object>;
}

/**
 * Select component specifically styled for Citrica Admin
 *
 * Features consistent styling:
 * - Rounded borders (24px)
 * - Citrica blue color scheme
 * - Hover and focus states
 */
export const SelectCitricaAdmin: React.FC<SelectCitricaAdminProps> = ({
  children,
  className = "min-w-[264px]",
  ...props
}) => {
  return (
    <HeroUISelect
      className={className}
      classNames={{
        trigger: "bg-white !border-[#D4DEED] !rounded-[12px] data-[focus=true]:!border-[#D4DEED] data-[open=true]:!border-[#D4DEED] data-[hover=true]:!border-[#B8D4E5]",
        label: "!text-[#265197]",
        value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
        selectorIcon: "text-[#678CC5]",
        popoverContent: "bg-white",
        innerWrapper: "!rounded-[12px]",
      }}
      variant="bordered"
      {...props}
    >
      {children}
    </HeroUISelect>
  );
};

export default SelectCitricaAdmin;
