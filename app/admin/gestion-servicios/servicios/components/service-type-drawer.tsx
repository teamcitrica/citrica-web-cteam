"use client";

import { useState, useEffect } from "react";
import { Switch } from "@heroui/switch";

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
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (serviceType) {
        setFormData({
          name: serviceType.name,
          description: serviceType.description || "",
          is_active: serviceType.is_active,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          is_active: true,
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
          <Button isAdmin variant="flat" onPress={onClose}>
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

        <div className="flex items-center gap-2">
          <Switch
            classNames={{
              base: "group !bg-transparent transition-colors scale-75",
              wrapper:
                "bg-gray-300 group-data-[selected=true]:bg-[#265197] rounded-full transition-colors",
              thumb: "!bg-white",
            }}
            color="default"
            isSelected={formData.is_active}
            onValueChange={(value) =>
              setFormData({ ...formData, is_active: value })
            }
          />
        </div>
      </div>
    </DrawerCitricaAdmin>
  );
}
