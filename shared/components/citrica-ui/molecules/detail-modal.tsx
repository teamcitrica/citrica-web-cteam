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
import { Text } from "@/shared/components/citrica-ui";

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
      className="w-[360px]"
      scrollBehavior="inside"
    >
      <ModalContent className="!">
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-[#265197]">
            {title}
          </h3>
        </ModalHeader>
        <ModalBody className="bg-[#EEF1F7] rounded-xl">
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
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
}
