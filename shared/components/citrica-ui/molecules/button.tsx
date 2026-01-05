// 'use client'
// import React from "react";
// import Text from "../atoms/text";
// import {Button as ButtonHeroUI} from "@heroui/react";
// import clsx from 'clsx';
// import { get } from "http";

// type ButtonProps = {
//   onClick?: () => void;
//   label?: string;
//   children?: React.ReactNode;
//   variant?: "primary" | "secondary" | "flat" | "success" | "warning" | "danger";
//   colorVariant?: "primary" | "secondary" | "tertiary" | "quaternary" | "quinary" | "clean";
//   textVariant?: "label" | "body" | "title" | "display" | "headline" | "subtitle";
//   size?: "sm" | "md" | "lg";
//   // radius?: "none" | "sm" | "md" | "lg" | "full";
//   className?: string;
//   type?: "button" | "submit" | "reset";
//   disabled?: boolean;
//   isLoading?: boolean;
//   startContent?: React.ReactNode;
//   endContent?: React.ReactNode;
//   fullWidth?: boolean;
//   disableAnimation?: boolean;
// };

// const getTextColorByVariant = (variant: string) => {
//   switch (variant) {
//     case "primary":
//       return "color-on-primary";
//     case "secondary":
//       return "color-on-secondary";
//     case "success":
//       return "color-on-success";
//     case "warning":
//       return "color-on-warning";
//     case "danger":
//       return "color-on-danger";
//     case "flat":
//       return "color-black";
//     default:
//       return "color-on-primary";
//   }
// }

// const getBtnClassByVariant = (variant: string) => {
//   switch (variant) {
//     case "primary":
//       return "btn-primary";
//     case "secondary":
//       return "btn-secondary";
//     case "success":
//       return "btn-success";
//     case "warning":
//       return "btn-warning";
//     case "danger":
//       return "btn-danger";
//     case "flat":
//       return "btn-flat";
//     default:
//       return "btn-primary";
//   }
// }

// const getBtnColorClassByVariant = (btnColorVariant: string) => {
//   switch (btnColorVariant) {
//     case "primary":
//       return "btn-color-primary";
//     case "secondary":
//       return "btn-color-secondary";
//     case "tertiary":
//     case "success":
//       return "btn-color-tertiary";
//     case "quaternary":
//     case "warning":
//       return "btn-color-quaternary";
//     case "quinary":
//     case "danger":
//       return "btn-color-danger";
//     case "clean":
//     case "flat":
//       return "btn-color-clean";
//     default:
//       return "btn-color-primary";
//   }
// }

// const Button = ({ 
//   onClick, 
//   label,
//   children,
//   textVariant = "label", // Set default text variant
//   variant = "primary",
//   colorVariant,
//   size = "md",
//   className = "",
//   type = "button",
//   disabled = false,
//   isLoading = false,
//   startContent,
//   endContent,
//   fullWidth = false,
//   disableAnimation = false
// }: ButtonProps) => {
//   const btnColorVariant = colorVariant || variant;
//   const content = children || (label && (
//     <Text 
//       variant={textVariant} 
//       textColor={getTextColorByVariant(variant)}
//     >
//       {label}
//     </Text>
//   ));

//   return (
//     <ButtonHeroUI 
//       color="default" 
//       onPress={onClick} 
//       className={clsx(
//         "btn-citrica-ui",
//         getBtnClassByVariant(variant),
//         getBtnColorClassByVariant(btnColorVariant),
//         className
//       )}
//       // variant={variant}
//       size={size}
//       radius={"none"}
//       type={type}
//       isDisabled={disabled}
//       isLoading={isLoading}
//       startContent={startContent}
//       endContent={endContent}
//       fullWidth={fullWidth}
//       disableAnimation={disableAnimation}
//     >
//       {content}
//     </ButtonHeroUI>
//   )
// }

// export default Button;