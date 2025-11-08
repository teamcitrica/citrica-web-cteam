"use client";
import React from "react";
import { Select as HeroSelect, SelectItem } from "@heroui/select";
import clsx from "clsx";

import Icon, { IconName } from "./icon";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  defaultSelectedKeys?: string[];
  selectedKeys?: string[];
  onSelectionChange?: (keys: any) => void;
  name?: string;
  variant?:
    | "primary"
    | "secondary"
    | "flat"
    | "bordered"
    | "faded"
    | "underlined";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  required?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  className?: string;
  classNames?: {
    base?: string;
    trigger?: string;
    label?: string;
    value?: string;
    selectorIcon?: string;
    description?: string;
    errorMessage?: string;
  };
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  startIcon?: IconName;
  endIcon?: IconName;
  iconSize?: number;
  iconColor?: string;
  fullWidth?: boolean;
  options: SelectOption[];
}

const Select = ({
  label,
  placeholder,
  defaultSelectedKeys,
  selectedKeys,
  onSelectionChange,
  name,
  variant = "primary",
  color = "default",
  size = "md",
  radius = "md",
  required = false,
  disabled = false,
  isInvalid = false,
  errorMessage,
  description,
  className,
  classNames,
  startContent,
  endContent,
  startIcon,
  endIcon,
  iconSize = 20,
  iconColor,
  fullWidth = true,
  options = [],
}: SelectProps) => {
  // Create icon content if icons are provided
  const startIconContent = startIcon ? (
    <Icon color={iconColor} name={startIcon} size={iconSize} />
  ) : (
    startContent
  );

  const endIconContent = endIcon ? (
    <Icon color={iconColor} name={endIcon} size={iconSize} />
  ) : (
    endContent
  );

  const getSelectClassByVariant = (variant: string) => {
    switch (variant) {
      case "primary":
        return "select-primary";
      case "secondary":
        return "select-secondary";
      case "flat":
      case "bordered":
      case "faded":
      case "underlined":
      default:
        return "";
    }
  };

  const shouldUseCustomVariant =
    variant === "primary" || variant === "secondary";
  const heroVariant = shouldUseCustomVariant ? "bordered" : variant;

  return (
    <HeroSelect
      className={clsx(
        "select-citrica-ui",
        getSelectClassByVariant(variant),
        className,
      )}
      classNames={classNames}
      color={color}
      defaultSelectedKeys={defaultSelectedKeys}
      description={description}
      endContent={endIconContent}
      errorMessage={errorMessage}
      fullWidth={fullWidth}
      isDisabled={disabled}
      isInvalid={isInvalid}
      isRequired={required}
      label={label}
      name={name}
      placeholder={placeholder}
      selectedKeys={selectedKeys}
      size={size}
      startContent={startIconContent}
      variant={heroVariant}
      onSelectionChange={onSelectionChange}
    >
      {options.map((option) => (
        <SelectItem
          key={option.value}
          className="select-item-citrica-ui"
          description={option.description}
          endContent={option.endContent}
          startContent={option.startContent}
          textValue={option.label}
        >
          {option.label}
        </SelectItem>
      ))}
    </HeroSelect>
  );
};

export default Select;
export type { SelectProps, SelectOption };
