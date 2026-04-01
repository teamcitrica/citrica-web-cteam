"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { Text, Button, Input } from "citrica-ui-toolkit";

interface MarkPaidModalProps {
  periodNumber: number;
  onConfirm: (paymentDate: string) => void;
  onCancel: () => void;
}

export default function MarkPaidModal({
  periodNumber,
  onConfirm,
  onCancel,
}: MarkPaidModalProps) {
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  return (
    <Modal isOpen={true} size="md" onClose={onCancel}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 mt-4">
          <Text as="h2" className="text-center" color="#265197" variant="title" weight="bold">
            Registrar Pago
          </Text>
          <Text as="p" className="text-center" color="#678CC5" variant="label">
            Periodo {periodNumber}
          </Text>
        </ModalHeader>
        <ModalBody>
          <Input
            label="Fecha de pago"
            required
            type="date"
            value={paymentDate}
            variant="primary"
            onValueChange={setPaymentDate}
          />
        </ModalBody>
        <ModalFooter>
          <div className="flex gap-3 justify-end">
            <Button
              isAdmin
              className="w-[162px]"
              variant="secondary"
              onPress={onCancel}
            >
              Cancelar
            </Button>
            <Button
              isAdmin
              className="w-[162px]"
              isDisabled={!paymentDate}
              variant="primary"
              onPress={() => onConfirm(paymentDate)}
            >
              Confirmar
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
