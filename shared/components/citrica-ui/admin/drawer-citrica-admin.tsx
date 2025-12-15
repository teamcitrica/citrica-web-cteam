"use client";
import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerProps,
} from "@heroui/react";

export interface DrawerCitricaAdminProps extends Omit<DrawerProps, 'placement' | 'classNames'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
}

/**
 * Drawer component specifically styled for Citrica Admin
 *
 * Features:
 * - Slides in from the right side
 * - Citrica admin styling
 * - Supports custom header, body, and footer
 * - Built on HeroUI Drawer
 */
export const DrawerCitricaAdmin: React.FC<DrawerCitricaAdminProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "2xl",
  ...props
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size={size}
      {...props}
    >
      <DrawerContent>
        {title && (
          <DrawerHeader className="flex flex-col gap-1 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </DrawerHeader>
        )}
        <DrawerBody className="py-6">{children}</DrawerBody>
        {footer && (
          <DrawerFooter className="border-t border-gray-200">{footer}</DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerCitricaAdmin;
