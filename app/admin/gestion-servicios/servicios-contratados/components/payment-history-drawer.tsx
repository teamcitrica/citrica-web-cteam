"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@heroui/drawer";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Spinner } from "@heroui/spinner";

import { Tooltip } from "@heroui/tooltip";

import { Text, Icon } from "citrica-ui-toolkit";

import { useServicePayments } from "@/hooks/contracted-services/use-service-payments";

import MarkPaidModal from "./mark-paid-modal";

import type { ContractedService } from "@/hooks/contracted-services/use-contracted-services";

const formatDate = (dateStr: string) => {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatAmount = (amount: number) => {
  return `S/. ${amount.toFixed(2)}`;
};

type VisualStatus = "pagado" | "pendiente" | "programado";

const getVisualStatus = (status: string, dueDate: string): VisualStatus => {
  if (status === "pagado") return "pagado";
  const today = new Date().toISOString().split("T")[0];

  return dueDate <= today ? "pendiente" : "programado";
};

const STATUS_CHIP_CONFIG: Record<VisualStatus, { color: "success" | "danger" | "default"; label: string }> = {
  pagado: { color: "success", label: "Pagado" },
  pendiente: { color: "danger", label: "Pendiente" },
  programado: { color: "default", label: "Programado" },
};

interface PaymentHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contractedService: ContractedService | null;
  onStatusUpdated?: () => void;
}

export default function PaymentHistoryDrawer({
  isOpen,
  onClose,
  contractedService,
  onStatusUpdated,
}: PaymentHistoryDrawerProps) {
  const {
    payments,
    isLoading,
    fetchPayments,
    markAsPaid,
    markAsPending,
  } = useServicePayments();

  const [paymentToMark, setPaymentToMark] = useState<{ id: number; periodNumber: number } | null>(null);

  useEffect(() => {
    if (isOpen && contractedService) {
      fetchPayments(contractedService.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contractedService]);

  const handleConfirmPaid = async (paymentDate: string) => {
    if (!paymentToMark || !contractedService) return;
    const success = await markAsPaid(paymentToMark.id, paymentDate, contractedService.id);

    if (success && onStatusUpdated) onStatusUpdated();
    setPaymentToMark(null);
  };

  const handleRevert = async (paymentId: number) => {
    if (!contractedService) return;
    const success = await markAsPending(paymentId, contractedService.id);

    if (success && onStatusUpdated) onStatusUpdated();
  };

  const contactName = contractedService
    ? `${contractedService.contact?.name || ""} ${contractedService.contact?.last_name || ""}`.trim()
    : "";

  return (
    <>
      <Drawer
        className="bg-[#F4F4F5] rounded-tl-[40px] rounded-bl-[40px]"
        isOpen={isOpen}
        size="xl"
        onClose={onClose}
      >
        <DrawerContent>
          <DrawerHeader>
            <div className="bg-[#265197] p-3 flex flex-col w-full rounded-[8px]">
              <Text color="#FFFFFF" variant="label" weight="bold">
                Historial de Pagos
              </Text>
              <Text color="#D4DEED" variant="label">
                {contractedService?.service_name} — {contactName}
              </Text>
            </div>
          </DrawerHeader>

          <DrawerBody>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner color="primary" />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex justify-center py-8">
                <Text color="#678CC5" variant="body">
                  No hay pagos registrados
                </Text>
              </div>
            ) : (
              <Table
                aria-label="Historial de pagos"
                classNames={{
                  th: "bg-[#265197] text-white text-xs",
                  td: "py-3",
                }}
              >
                <TableHeader>
                  <TableColumn>#</TableColumn>
                  <TableColumn>VENCIMIENTO</TableColumn>
                  <TableColumn>MONTO</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>FECHA PAGO</TableColumn>
                  <TableColumn>ACCIÓN</TableColumn>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const visualStatus = getVisualStatus(payment.status, payment.due_date);
                    const chipConfig = STATUS_CHIP_CONFIG[visualStatus];

                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Text color="#1F2937" variant="label" weight="bold">
                            {payment.period_number}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <Text color="#4B5563" variant="label">
                            {formatDate(payment.due_date)}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <Text color="#374151" variant="label" weight="bold">
                            {formatAmount(payment.amount)}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={chipConfig.color}
                            size="sm"
                            variant="flat"
                          >
                            {chipConfig.label}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Text color="#4B5563" variant="label">
                            {payment.payment_date ? formatDate(payment.payment_date) : "—"}
                          </Text>
                        </TableCell>
                        <TableCell>
                          {visualStatus === "pagado" ? (
                            <Tooltip content="Revertir pago">
                              <button
                                className="text-lg cursor-pointer active:opacity-50 text-default-400 hover:text-orange-500"
                                onClick={() => handleRevert(payment.id)}
                              >
                                <Icon name="Undo2" size={24} />
                              </button>
                            </Tooltip>
                          ) : (
                            <Tooltip content="Marcar como pagado">
                              <button
                                className="text-lg cursor-pointer active:opacity-50 text-default-400 hover:text-green-500"
                                onClick={() =>
                                  setPaymentToMark({
                                    id: payment.id,
                                    periodNumber: payment.period_number,
                                  })
                                }
                              >
                                <Icon name="CircleCheck" size={24} />
                              </button>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {paymentToMark && (
        <MarkPaidModal
          periodNumber={paymentToMark.periodNumber}
          onConfirm={handleConfirmPaid}
          onCancel={() => setPaymentToMark(null)}
        />
      )}
    </>
  );
}
