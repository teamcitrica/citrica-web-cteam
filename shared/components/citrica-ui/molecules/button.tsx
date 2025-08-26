'use client'
import Text from "../atoms/text";
import { Button as ButtonHeroUI } from "@heroui/react";

type ButtonProps = {
  onClick: () => void;
  label: string;
  variant?: "primary" | "secondary";
  textVariant?: "label" | "body" | "title" | "display" | "headline" | "subtitle";
  color?: "primary" | "secondary" | "default" | "success" | "warning" | "danger";
  className?: string;
  textClassName?: string; // <-- para controlar el color del texto
};

const getTextColor = (color: string) => {
  switch (color) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-white";
    case "default":
      return "text-white";
    case "success":
      return "text-white";
    default:
      return "text-black";
  }
};

const Button = ({
  onClick,
  label,
  color = "primary",
  textVariant = "label",
  variant = "primary",
  className = "",
  textClassName = "", // <-- nuevo prop
}: ButtonProps) => {
  return (
    <ButtonHeroUI
      color={color}
      onPress={onClick}
      className={`py-2 px-2 ${className}`}
      variant={variant === "primary" ? "solid" : "bordered"}
    >
      <Text
        variant={textVariant}
        className={`${getTextColor(color)} ${textClassName}`}
      >
        {label}
      </Text>
    </ButtonHeroUI>
  );
};

export default Button;
