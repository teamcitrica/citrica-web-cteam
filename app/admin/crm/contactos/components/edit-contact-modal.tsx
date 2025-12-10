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

import { useContactCRUD, Contact, ContactInput } from "@/hooks/contacts-clients/use-contacts-clients";
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
  const [showUserFields, setShowUserFields] = useState(false);
  const [formData, setFormData] = useState<Partial<ContactInput>>({
    name: contact.name,
    cargo: contact.cargo,
    email: contact.email,
    address: contact.address,
    phone: contact.phone,
    company_id: contact.company_id,
    user_id: contact.user_id,
    has_system_access: contact.has_system_access,
    type_id: contact.type_id,
  });
  const [userFormData, setUserFormData] = useState({
    first_name: '',
    last_name: '',
    avatar_url: '',
  });

  useEffect(() => {
    setFormData({
      name: contact.name,
      cargo: contact.cargo,
      email: contact.email,
      address: contact.address,
      phone: contact.phone,
      company_id: contact.company_id,
      user_id: contact.user_id,
      has_system_access: contact.has_system_access,
      type_id: contact.type_id,
    });
  }, [contact]);

  const handleInputChange = (field: keyof ContactInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleToggleAccess = (value: boolean) => {
    if (value) {
      if (!formData.email) {
        addToast({
          title: "Error",
          description: "El contacto debe tener un email para activar el acceso al sistema",
          color: "danger",
        });
        return;
      }

      if (!formData.name) {
        addToast({
          title: "Error",
          description: "El nombre del contacto es requerido",
          color: "danger",
        });
        return;
      }

      // Autocompletar campos del usuario con datos del contacto
      const nameParts = formData.name?.split(' ') || [];
      setUserFormData({
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        avatar_url: '',
      });

      setShowUserFields(true);
    } else {
      // Si ya tiene acceso, desactivarlo
      if (formData.has_system_access && formData.user_id) {
        handleDeactivateAccess();
      } else {
        setShowUserFields(false);
      }
    }
  };

  const handleDeactivateAccess = async () => {
    setIsTogglingAccess(true);
    try {
      const result = await deactivateContactAccess(contact.id);
      if (result.success) {
        setFormData((prev) => ({ ...prev, has_system_access: false, user_id: null }));
        setShowUserFields(false);
      }
    } catch (error) {
      console.error("Error al desactivar acceso:", error);
    } finally {
      setIsTogglingAccess(false);
    }
  };

  const handleActivateAccess = async () => {
    // Validar campos requeridos del usuario
    if (!userFormData.first_name || !userFormData.last_name) {
      addToast({
        title: "Error",
        description: "El nombre y apellido son requeridos",
        color: "danger",
      });
      return;
    }

    setIsTogglingAccess(true);

    try {
      // Primero actualizar los datos del contacto
      const { user_id, has_system_access, ...updateData } = formData;
      await updateContact(contact.id, updateData);

      // Luego activar acceso con los datos del usuario
      const result = await activateContactAccess(contact.id, {
        first_name: userFormData.first_name,
        last_name: userFormData.last_name,
        full_name: `${userFormData.first_name} ${userFormData.last_name}`.trim(),
        role_id: 12,
        avatar_url: userFormData.avatar_url || undefined,
      });

      if (result.success) {
        setFormData((prev) => ({ ...prev, has_system_access: true }));
        setShowUserFields(false);
        setUserFormData({
          first_name: '',
          last_name: '',
          avatar_url: '',
        });
      }
    } catch (error) {
      console.error("Error al activar acceso:", error);
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
                const newCompanyId = selected ? Number(selected) : null;

                // Si cambia a Citrica (id = 1) y tiene acceso, advertir al usuario
                if (newCompanyId === 1 && formData.has_system_access) {
                  addToast({
                    title: "Advertencia",
                    description: "Los contactos de Citrica no pueden tener acceso al sistema. Desactiva el acceso primero.",
                    color: "warning",
                  });
                  return;
                }

                setFormData((prev) => ({
                  ...prev,
                  company_id: newCompanyId,
                }));
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

          {formData.company_id && formData.company_id !== 1 && (
            <>
              <Divider className="my-4" />

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Acceso al Sistema</h4>
                <Switch
                  isSelected={formData.has_system_access || showUserFields}
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

                {showUserFields && !formData.has_system_access && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <h5 className="text-sm font-semibold text-gray-700">Datos del Usuario</h5>
                    <p className="text-xs text-gray-600">
                      Complete la información del usuario que tendrá acceso al sistema.
                      Los campos marcados con * son obligatorios.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        value={formData.email || ""}
                        isReadOnly
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-800 bg-gray-100",
                        }}
                        description="Email del contacto (no editable)"
                      />
                      <Input
                        label="Empresa"
                        value={companies.find((c) => c.id === formData.company_id)?.name || "Sin empresa"}
                        isReadOnly
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-800 bg-gray-100",
                        }}
                        description="Empresa del contacto (no editable)"
                      />
                      <Input
                        label="Nombre *"
                        placeholder="Nombre del usuario"
                        value={userFormData.first_name}
                        onChange={(e) => setUserFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                        isRequired
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-800",
                        }}
                      />
                      <Input
                        label="Apellido *"
                        placeholder="Apellido del usuario"
                        value={userFormData.last_name}
                        onChange={(e) => setUserFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                        isRequired
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-800",
                        }}
                      />
                      <Input
                        label="Avatar URL (opcional)"
                        placeholder="https://ejemplo.com/avatar.jpg"
                        value={userFormData.avatar_url}
                        onChange={(e) => setUserFormData((prev) => ({ ...prev, avatar_url: e.target.value }))}
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-800",
                        }}
                      />
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Nota:</strong> El nombre completo se generará automáticamente como "{userFormData.first_name} {userFormData.last_name}".
                        Se creará una contraseña temporal que se mostrará al finalizar.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => {
                          setShowUserFields(false);
                          setUserFormData({
                            first_name: '',
                            last_name: '',
                            avatar_url: '',
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-[#42668A] text-white"
                        size="sm"
                        onPress={handleActivateAccess}
                        isLoading={isTogglingAccess}
                      >
                        Crear Usuario
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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
