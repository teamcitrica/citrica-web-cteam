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
import { Icon } from "@/shared/components/citrica-ui";

import { useContactCRUD, Contact, ContactInput } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";

// Función para generar contraseña segura aleatoria
const generateSecurePassword = (): string => {
  const length = 12;
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%&*';
  const allChars = lowercase + uppercase + numbers + symbols;

  let password = '';

  // Asegurar al menos un carácter de cada tipo
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Rellenar el resto
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar la contraseña
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

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
  const { updateContact, isLoading, deactivateContactAccess, refreshContacts } = useContactCRUD();
  const { companies } = useCompanyCRUD();
  const [isTogglingAccess, setIsTogglingAccess] = useState(false);
  const [showUserFields, setShowUserFields] = useState(false);
  const [formData, setFormData] = useState<ContactInput>({
    name: contact.name,
    cargo: contact.cargo,
    email: contact.email,
    address: contact.address,
    phone: contact.phone,
    company_id: contact.company_id,
    user_id: contact.user_id,
    has_system_access: contact.has_system_access,
    type_id: contact.type_id,
    code: contact.code,
    email_access: contact.email_access,
    last_name: contact.last_name,
  });
  const [userFormData, setUserFormData] = useState({
    first_name: '',
    last_name: '',
    email_access: '',
    password: '',
    avatar_url: '',
  });
  const [showPassword, setShowPassword] = useState(false);

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
      code: contact.code,
      email_access: contact.email_access,
      last_name: contact.last_name,
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
        email_access: formData.email || '',
        password: '',
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
        setUserFormData({
          first_name: '',
          last_name: '',
          email_access: '',
          password: '',
          avatar_url: '',
        });
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

    if (!userFormData.email_access) {
      addToast({
        title: "Error",
        description: "El email de acceso es requerido",
        color: "danger",
      });
      return;
    }

    if (!userFormData.password) {
      addToast({
        title: "Error",
        description: "La contraseña es requerida",
        color: "danger",
      });
      return;
    }

    setIsTogglingAccess(true);

    try {
      // Llamar al endpoint para activar acceso (esto hace todo el proceso en el backend)
      const response = await fetch('/api/admin/activate-contact-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contact.id,
          password: userFormData.password,
          email_access: userFormData.email_access,
          user_data: {
            first_name: userFormData.first_name,
            last_name: userFormData.last_name,
            full_name: `${userFormData.first_name} ${userFormData.last_name}`.trim(),
            role_id: 12, // Cliente
            avatar_url: userFormData.avatar_url || undefined,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error en la respuesta:', result);
        throw new Error(result.error || 'Error al activar acceso');
      }

      // Éxito - mostrar mensaje con la contraseña
      addToast({
        title: "Acceso activado",
        description: `Usuario creado correctamente. La contraseña es: ${userFormData.password}`,
        color: "success",
        timeout: 15000, // 15 segundos para copiar la contraseña
      });

      // Actualizar el estado local
      setFormData((prev) => ({
        ...prev,
        has_system_access: true,
        code: userFormData.password,
        email_access: userFormData.email_access,
        last_name: userFormData.last_name,
      }));

      setShowUserFields(false);
      setUserFormData({
        first_name: '',
        last_name: '',
        email_access: '',
        password: '',
        avatar_url: '',
      });

      // Refrescar la lista de contactos
      await refreshContacts();
    } catch (error: any) {
      console.error("Error al activar acceso:", error);
      addToast({
        title: "Error al activar acceso",
        description: error.message || "No se pudo activar el acceso",
        color: "danger",
        timeout: 8000,
      });
    } finally {
      setIsTogglingAccess(false);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setUserFormData((prev) => ({ ...prev, password: newPassword }));
    addToast({
      title: "Contraseña generada",
      description: "Se ha generado una contraseña segura",
      color: "success",
    });
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
          {/* Campos normales del contacto - Ocultos cuando showUserFields está activo */}
          {!showUserFields && (
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
          )}

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
                        label="Email de acceso *"
                        placeholder="correo@ejemplo.com"
                        type="email"
                        value={userFormData.email_access}
                        onChange={(e) => setUserFormData((prev) => ({ ...prev, email_access: e.target.value }))}
                        isRequired
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-800",
                        }}
                        description="Email que usará para iniciar sesión"
                      />
                      <div className="flex gap-2 items-end">
                        <Input
                          label="Contraseña *"
                          placeholder="Ingrese o genere una contraseña"
                          type={showPassword ? "text" : "password"}
                          value={userFormData.password}
                          onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))}
                          isRequired
                          classNames={{
                            label: "text-gray-700",
                            input: "text-gray-800",
                          }}
                          endContent={
                            <Icon
                              name="Eye"
                              className="text-gray-500 cursor-pointer w-5 h-5"
                              onClick={() => setShowPassword((prev) => !prev)}
                            />
                          }
                          className="flex-1"
                        />
                        <Button
                          size="md"
                          className="bg-[#42668A] text-white"
                          onPress={handleGeneratePassword}
                        >
                          Generar
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Nota:</strong> El nombre completo se generará automáticamente como "{userFormData.first_name} {userFormData.last_name}".
                        La contraseña se guardará de forma segura y el usuario podrá cambiarla después de iniciar sesión.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {showUserFields ? (
            <>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  setShowUserFields(false);
                  setUserFormData({
                    first_name: '',
                    last_name: '',
                    email_access: '',
                    password: '',
                    avatar_url: '',
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#42668A] text-white"
                onPress={handleActivateAccess}
                isLoading={isTogglingAccess}
                isDisabled={
                  !userFormData.first_name ||
                  !userFormData.last_name ||
                  !userFormData.email_access ||
                  !userFormData.password
                }
              >
                Crear Acceso
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
