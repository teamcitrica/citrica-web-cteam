"use client";
import { ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
} from "@heroui/react";
import { Text } from "citrica-ui-toolkit";

interface DetailModalSection {
  title: string;
  content: ReactNode;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | ReactNode;
  sections: DetailModalSection[];
  footer?: ReactNode;
  width?: string;
  height?: string;
}

export default function DetailModal({
  isOpen,
  onClose,
  title,
  sections,
  footer,
  width,
  height,
}: DetailModalProps) {
  const customStyle: React.CSSProperties = {};
  if (width) customStyle.width = width;
  if (height) customStyle.height = height;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      classNames={{
        base: width ? `max-w-none` : "w-[360px]",
      }}
    >
      <ModalContent style={customStyle} className={width ? "max-w-none" : ""}>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <h3>
            <Text variant="body" weight="bold" color="#265197">{title}</Text>
          </h3>
        </ModalHeader>
          <Divider className="bg-[#A7BDE2] mt-2" />
        <ModalBody
          className="rounded-xl"
        >
          {sections.map((section, index) => (
            <div key={index}>
              {section.title && (
                <h3 className={index > 0 ? "mb-[-5px]" : ""}>
                  <Text variant="subtitle" color="#265197" weight="bold">
                    {section.title}
                  </Text>
                </h3>
              )}
              {section.content}
              {index < sections.length - 1 && <Divider className="bg-[#A7BDE2]" />}
            </div>
          ))}
        </ModalBody>
        {footer && (
          <ModalFooter className="flex justify-end items-center py-4">
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
