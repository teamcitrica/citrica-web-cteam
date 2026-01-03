"use client";
import React from "react";
import { Input as HeroUIInput, InputProps as HeroUIInputProps } from "@heroui/react";

export interface InputCitricaAdminProps extends Omit<HeroUIInputProps, 'variant'> {
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
  className = "text-[#265197] min-w-[264px] bg-white [--color-primary-textarea-border-hover:#265197]",
  endContent,
  classNames: customClassNames,
  ...props
}) => {
  const defaultClassNames = {
    inputWrapper:
      "!text-[#3E688E] !rounded-[12px] !border-[#D4DEED] data-[hover=true]:!border-[#265197] data-[focus=true]:!border-[#265197] data-[focus-visible=true]:!border-[#265197] focus-within:!border-[#265197]",
    mainWrapper: "",
    label: "!text-[#265197]",
    input: "placeholder:text-[#A7BDE2]",
    innerWrapper: "",
    base: "!rounded-[12px]",
  };

  return (
    <div style={{ "--color-primary-textarea-border-hover": "#265197" } as React.CSSProperties}>
      <HeroUIInput
        className={className}
        classNames={{
          ...defaultClassNames,
          ...customClassNames,
        }}
        variant="bordered"
        endContent={endContent}
        {...props}
      />
    </div>
  );
};

export default InputCitricaAdmin;
