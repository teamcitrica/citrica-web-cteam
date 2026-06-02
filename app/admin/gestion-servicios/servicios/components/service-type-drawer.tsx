"use client";

import { useState, useEffect } from "react";

import { Button, Input } from "citrica-ui-toolkit";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";

import type { ServiceType, ServiceTypeInput } from "@/hooks/services/use-service-types";

interface ServiceTypeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ServiceTypeInput) => void;
  serviceType: ServiceType | null;
}

export default function ServiceTypeDrawer({
  isOpen,
  onClose,
  onSave,
  serviceType,
}: ServiceTypeDrawerProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (serviceType) {
        setFormData({
          name: serviceType.name,
          description: serviceType.description || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
        });
      }
    }
  }, [isOpen, serviceType]);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      title={serviceType ? "Editar tipo de servicio" : "Nuevo tipo de servicio"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button isAdmin={true} variant="secondary" className="border-[#42668A] text-[#42668A] rounded-[8px]" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            isAdmin
            isDisabled={!formData.name.trim()}
            variant="primary"
            onPress={handleSubmit}
          >
            {serviceType ? "Guardar cambios" : "Crear tipo"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nombre"
          placeholder="Ej: Hosting, Mantenimiento, Diseño Web"
          required
          value={formData.name}
          variant="primary"
          onValueChange={(value) =>
            setFormData({ ...formData, name: value })
          }
        />

        <Input
          label="Descripción (opcional)"
          placeholder="Describe brevemente este tipo de servicio"
          value={formData.description}
          variant="primary"
          onValueChange={(value) =>
            setFormData({ ...formData, description: value })
          }
        />

      </div>
    </DrawerCitricaAdmin>
  );
}
