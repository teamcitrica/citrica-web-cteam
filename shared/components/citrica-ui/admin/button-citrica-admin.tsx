"use client";
import React from "react";
import { Button as HeroUIButton, ButtonProps as HeroUIButtonProps } from "@heroui/react";

export interface ButtonCitricaAdminProps
  extends Omit<HeroUIButtonProps, 'variant'> {
  variant?: "primary" | "secondary" | "export" |"modal"|"modalv2";
  children?: React.ReactNode;
  className?: string;
}

/**
 * Button component specifically styled for Citrica Admin
 *
 * Variants:
 * - primary: Main action button with header color background
 * - secondary: Transparent button with border
 * - export: Button styled for export actions
 */
export const ButtonCitricaAdmin: React.FC<ButtonCitricaAdminProps> = ({
  variant = "primary",
  children,
  style,
  className = "",
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "text-white py-[6px] px-[6px] rounded-lg border-2 border-white";
      case "secondary":
        return "border-[#42668A] border-[2px] bg-transparent text-[#42668A] rounded-[8px]";
      case "export":
        return "bg-transparent border-2 border-[#D4DEED] text-gray-700 py-4";
         case "modal":
        return "bg-[#265197] text-white py-4 w-[142px]";
         case "modalv2":
        return "bg-transparent border-2 border-[#265197] text-[#265197] py-4 w-[142px]";
      default:
        return "";
    }
  };

  return (
    <HeroUIButton
      className={`${getVariantStyles()} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </HeroUIButton>
  );
};

export default ButtonCitricaAdmin;
