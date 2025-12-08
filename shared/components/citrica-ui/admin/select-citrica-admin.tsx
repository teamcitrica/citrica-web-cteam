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
        trigger: "!text-[#3E688E] rounded-[24px] border-[#D4DEED] data-[focus=true]:border-[#D4DEED] data-[open=true]:border-[#D4DEED] focus:border-[#D4DEED] hover:border-[#B8D4E5]",
        popoverContent: "bg-white",
      }}
      variant="bordered"
      {...props}
    >
      {children}
    </HeroUISelect>
  );
};

export default SelectCitricaAdmin;
