"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/drawer";
import { Switch } from "@heroui/switch";

import { Text, Button, Input, Select, Textarea } from "citrica-ui-toolkit";

import type { Service, ServiceType } from "../page";

interface ServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Service, "id">) => void;
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
    typeId: 0,
    referenceAmount: 0,
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (service) {
        setFormData({
          name: service.name,
          typeId: service.typeId,
          referenceAmount: service.referenceAmount,
          description: service.description,
          is_active: service.is_active,
        });
      } else {
        setFormData({
          name: "",
          typeId: 0,
          referenceAmount: 0,
          description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, service]);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.typeId) return;
    onSave(formData);
  };

  const activeTypes = serviceTypes.filter((t) => t.is_active);

  const selectOptions = activeTypes.map((t) => ({
    value: t.id.toString(),
    label: t.name,
  }));

  return (
    <Drawer
      className="bg-[#F4F4F5] rounded-tl-[40px] rounded-bl-[40px]"
      isOpen={isOpen}
      size="lg"
      onClose={onClose}
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="bg-[#265197] p-3 flex w-full rounded-[8px]">
            <Text color="#FFFFFF" variant="label">
              {service ? "Editar servicio" : "Nuevo servicio"}
            </Text>
          </div>
        </DrawerHeader>

        <DrawerBody>
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
              selectedKeys={formData.typeId ? [formData.typeId.toString()] : []}
              variant="bordered"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;

                setFormData({ ...formData, typeId: parseInt(selected) || 0 });
              }}
            />

            <Input
              label="Monto referencial (USD)"
              placeholder="Ej: 50"
              type="number"
              value={formData.referenceAmount.toString()}
              variant="primary"
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  referenceAmount: parseFloat(value) || 0,
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
        </DrawerBody>

        <DrawerFooter className="justify-end gap-2">
          <Button isAdmin variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            isAdmin
            isDisabled={!formData.name.trim() || !formData.typeId}
            variant="primary"
            onPress={handleSubmit}
          >
            {service ? "Guardar cambios" : "Crear servicio"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
