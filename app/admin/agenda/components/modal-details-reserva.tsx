"use client";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import React from "react";
import { Text, Button } from "citrica-ui-toolkit";
import { Reserva, ReservaEstado } from "@/hooks/reservas/use-reservas";

interface ReservaDetailModalProps {
  reserva: Reserva;
  onClose: () => void;
}

export default function ReservaDetailModal({
  reserva,
  onClose,
}: ReservaDetailModalProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha";
    try {
      // Parsear la fecha manualmente para evitar problemas de zona horaria
      // dateString viene en formato YYYY-MM-DD
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month es 0-indexed en Date
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getStatusColor = (status: ReservaEstado) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: ReservaEstado) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50",
        base: "bg-white",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">
          <Text isAdmin={true} variant="title" weight="bold" textColor="color-primary">
            Detalles de la Reserva
          </Text>
        </ModalHeader>
        <ModalBody className="py-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text isAdmin={true} variant="label" weight="bold" textColor="color-on-surface">
                  Nombre
                </Text>
                <Text isAdmin={true} variant="body" textColor="color-on-surface-var">
                  {reserva.name}
                </Text>
              </div>
              <div>
                <Text isAdmin={true} variant="label" weight="bold" textColor="color-on-surface">
                  Email
                </Text>
                <Text isAdmin={true} variant="body" textColor="color-on-surface-var">
                  {reserva.email}
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text isAdmin={true} variant="label" weight="bold" textColor="color-on-surface">
                  Fecha de Reunión
                </Text>
                <Text isAdmin={true} variant="body" textColor="color-on-surface-var">
                  {formatDate(reserva.booking_date)}
                </Text>
              </div>
              <div>
                <Text isAdmin={true} variant="label" weight="bold" textColor="color-on-surface">
                  Horario
                </Text>
                <Text isAdmin={true} variant="body" textColor="color-on-surface-var">
                  {reserva.time_slots && reserva.time_slots.length > 0
                    ? reserva.time_slots.join(', ')
                    : "Sin horario"}
                </Text>
              </div>
            </div>

            <div>
              <Text isAdmin={true} variant="label" weight="bold" textColor="color-on-surface">
                Estado
              </Text>
              <div className="mt-2">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(reserva.status || 'pending')}`}>
                  {getStatusLabel(reserva.status || 'pending')}
                </span>
              </div>
            </div>

            <div>
              <Text variant="label" weight="bold" textColor="color-on-surface">
                Mensaje
              </Text>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <Text isAdmin={true} variant="body" textColor="color-on-surface-var">
                  {reserva.message || "Sin mensaje"}
                </Text>
              </div>
            </div>

            <div>
              <Text isAdmin={true} variant="label" weight="bold" textColor="color-on-surface">
                Fecha de Creación
              </Text>
              <Text isAdmin={true} variant="body" textColor="color-on-surface-var">
                {formatDateTime(reserva.created_at)}
              </Text>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-t border-gray-200">
          <Button
            isAdmin
            variant="secondary"
            onPress={onClose}
          >
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
