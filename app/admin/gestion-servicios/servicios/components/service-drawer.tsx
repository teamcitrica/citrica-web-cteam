"use client";

import { useState, useEffect } from "react";
import { Switch } from "@heroui/switch";

import { Text, Button, Input, Select } from "citrica-ui-toolkit";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";

import type { Service, ServiceInput } from "@/hooks/services/use-services";
import type { ServiceType } from "@/hooks/services/use-service-types";

interface ServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ServiceInput) => void;
  service: Service | null;
  serviceTypes: ServiceType[];
}

export default function ServiceDrawer({
  isOpen,
  onClose,
  onSave,
  service,
  serviceTypes,
}: ServiceDrawerProps) {
  const [formData, setFormData] = useState({
    name: "",
    type_id: 0,
    reference_amount: 0,
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (service) {
        setFormData({
          name: service.name,
          type_id: service.type_id,
          reference_amount: service.reference_amount,
          is_active: service.is_active,
        });
      } else {
        setFormData({
          name: "",
          type_id: 0,
          reference_amount: 0,
          is_active: true,
        });
      }
    }
  }, [isOpen, service]);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.type_id) return;
    onSave(formData);
  };

  const activeTypes = serviceTypes.filter((t) => t.is_active);

  const selectOptions = activeTypes.map((t) => ({
    value: t.id.toString(),
    label: t.name,
  }));

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      title={service ? "Editar servicio" : "Nuevo servicio"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button isAdmin={true} variant="secondary" className="border-[#42668A] text-[#42668A] rounded-[8px]" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            isAdmin
            isDisabled={!formData.name.trim() || !formData.type_id}
            variant="primary"
            onPress={handleSubmit}
          >
            {service ? "Guardar cambios" : "Crear servicio"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nombre"
          placeholder="Ej: Hosting básico"
          required
          value={formData.name}
          variant="primary"
          onValueChange={(value) =>
            setFormData({ ...formData, name: value })
          }
        />

        <Select
          className="[&_button]:bg-white"
          label="Tipo de servicio"
          options={selectOptions}
          placeholder="Selecciona un tipo"
          required
          selectedKeys={formData.type_id ? [formData.type_id.toString()] : []}
          variant="bordered"
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;

            setFormData({ ...formData, type_id: parseInt(selected) || 0 });
          }}
        />

        <Input
          label="Monto referencial (S/.)"
          placeholder="Ej: 50"
          type="number"
          value={formData.reference_amount.toString()}
          variant="primary"
          onValueChange={(value) =>
            setFormData({
              ...formData,
              reference_amount: parseFloat(value) || 0,
            })
          }
        />

        <div className="flex items-center gap-2">
          <Text color="#A1A1AA" variant="label">
            Servicio activo
          </Text>
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
