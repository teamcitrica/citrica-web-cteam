"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Divider,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { useContactCRUD, Contact, ContactInput } from "@/hooks/contacts/use-contacts";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";

interface EditContactModalProps {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
}

export default function EditContactModal({
  isOpen,
  contact,
  onClose,
}: EditContactModalProps) {
  const { updateContact, isLoading, activateContactAccess, deactivateContactAccess } = useContactCRUD();
  const { companies } = useCompanyCRUD();
  const [isTogglingAccess, setIsTogglingAccess] = useState(false);
  const [formData, setFormData] = useState<ContactInput>({
    name: contact.name,
    cargo: contact.cargo,
    tipo: contact.tipo,
    email: contact.email,
    address: contact.address,
    phone: contact.phone,
    company_id: contact.company_id,
    user_id: contact.user_id,
    has_system_access: contact.has_system_access,
    type_id: contact.type_id,
    active_users: contact.active_users,
  });

  useEffect(() => {
    setFormData({
      name: contact.name,
      cargo: contact.cargo,
      tipo: contact.tipo,
      email: contact.email,
      address: contact.address,
      phone: contact.phone,
      company_id: contact.company_id,
      user_id: contact.user_id,
      has_system_access: contact.has_system_access,
      type_id: contact.type_id,
      active_users: contact.active_users,
    });
  }, [contact]);

  const handleInputChange = (field: keyof ContactInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleToggleAccess = async (value: boolean) => {
    if (!formData.email) {
      addToast({
        title: "Error",
        description: "El contacto debe tener un email para activar el acceso al sistema",
        color: "danger",
      });
      return;
    }

    setIsTogglingAccess(true);

    try {
      if (value) {
        // Activar acceso
        const result = await activateContactAccess(contact.id);
        if (result.success) {
          setFormData((prev) => ({ ...prev, has_system_access: true }));
        }
      } else {
        // Desactivar acceso
        const result = await deactivateContactAccess(contact.id);
        if (result.success) {
          setFormData((prev) => ({ ...prev, has_system_access: false, user_id: null }));
        }
      }
    } catch (error) {
      console.error("Error al cambiar acceso:", error);
    } finally {
      setIsTogglingAccess(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      addToast({
        title: "Error",
        description: "El nombre del contacto es requerido",
        color: "danger",
      });
      return;
    }

    try {
      // No incluir user_id y has_system_access en la actualización normal
      const { user_id, has_system_access, ...updateData } = formData;
      await updateContact(contact.id, updateData);
      onClose();
    } catch (error) {
      console.error("Error al actualizar contacto:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Editar Contacto
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Contacto"
              placeholder="Ingrese el nombre completo"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              isRequired
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Cargo"
              placeholder="Cargo o posición"
              value={formData.cargo || ""}
              onChange={(e) => handleInputChange("cargo", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Email"
              placeholder="correo@ejemplo.com"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Teléfono"
              placeholder="Número de teléfono"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Input
              label="Dirección"
              placeholder="Dirección completa"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />
            <Select
              label="Empresa"
              placeholder="Seleccione una empresa"
              selectedKeys={formData.company_id ? [String(formData.company_id)] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                handleInputChange("company_id", selected ? Number(selected) : "");
              }}
              classNames={{
                label: "text-gray-700",
                value: "text-gray-800",
              }}
            >
              {companies.map((company) => (
                <SelectItem key={String(company.id)}>
                  {company.name || `Empresa ${company.id}`}
                </SelectItem>
              ))}
            </Select>
          </div>

          <Divider className="my-4" />

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Acceso al Sistema</h4>
            <Switch
              isSelected={formData.has_system_access || false}
              onValueChange={handleToggleAccess}
              isDisabled={isTogglingAccess || !formData.email}
              classNames={{
                wrapper: "group-data-[selected=true]:bg-[#42668A]",
              }}
            >
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">
                  {formData.has_system_access ? "Acceso activado" : "Sin acceso al sistema"}
                </span>
                <span className="text-xs text-gray-500">
                  {formData.has_system_access
                    ? "Este contacto puede iniciar sesión y ver sus proyectos"
                    : "Activar para permitir que este contacto acceda al sistema"}
                </span>
                {!formData.email && (
                  <span className="text-xs text-danger mt-1">
                    Se requiere un email para activar el acceso
                  </span>
                )}
              </div>
            </Switch>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[#42668A] text-white"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Actualizar Contacto
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
