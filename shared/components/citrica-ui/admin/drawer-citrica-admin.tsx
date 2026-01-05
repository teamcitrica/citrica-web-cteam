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
import { Text } from "citrica-ui-toolkit";

export interface DrawerCitricaAdminProps extends Omit<DrawerProps, 'placement' | 'classNames'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  customWidth?: string;
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
  size = "xl",
  customWidth,
  ...props
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size={customWidth ? undefined : size}
      style={customWidth ? { width: customWidth, maxWidth: customWidth } : { width: '450px', maxWidth: '450px' }}
      classNames={{
        closeButton: "w-8 h-8 min-w-8 text-[#265197] border-2 border-[#265197] rounded-full hover:bg-[#265197] hover:text-white transition-colors flex items-center justify-center items-center my-auto",
      }}
      {...props}
    >
      <DrawerContent>
        {title && (
          <DrawerHeader className="flex flex-col gap-1 border-b" style={{ borderColor: '#D4DEED' }}>
            <h3>
              <Text variant="subtitle" color="#16305A" weight="bold">
                {title}
              </Text>
            </h3>

          </DrawerHeader>
        )}
        <DrawerBody
          className="py-6"
          style={{
            background: '#EEF1F7'
          }}
        >
          {children}
        </DrawerBody>
        {footer && (
          <DrawerFooter className="border-t" style={{ borderColor: '#D4DEED' }}>{footer}</DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerCitricaAdmin;
