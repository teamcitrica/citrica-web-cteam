"use client";
import React from "react";
import { Input as HeroUIInput, InputProps as HeroUIInputProps } from "@heroui/react";

export interface InputCitricaAdminProps extends Omit<HeroUIInputProps, 'classNames' | 'variant'> {
  endContent?: React.ReactNode;
}

/**
 * Input component specifically styled for Citrica Admin
 *
 * Features consistent styling:
 * - Rounded borders (24px)
 * - Citrica blue color scheme
 * - Hover and focus states
 * - Support for end content (e.g., search icon)
 */
export const InputCitricaAdmin: React.FC<InputCitricaAdminProps> = ({
  className = "text-[#265197] min-w-[264px] bg-white",
  endContent,
  ...props
}) => {
  return (
    <HeroUIInput
      className={className}
      classNames={{
        inputWrapper:
          "!text-[#3E688E] !rounded-[12px] !border-[#D4DEED] data-[focus=true]:!border-[#D4DEED] data-[hover=true]:!border-[#B8D4E5] focus-within:!border-[#D4DEED]",
        mainWrapper: "",
        label: "!text-[#265197]",
        input: "placeholder:text-[#A7BDE2] !rounded-[12px]",
        innerWrapper: "!rounded-[12px]",
        base: "!rounded-[12px]",
      }}
      variant="bordered"
      endContent={endContent}
      {...props}
    />
  );
};

export default InputCitricaAdmin;
