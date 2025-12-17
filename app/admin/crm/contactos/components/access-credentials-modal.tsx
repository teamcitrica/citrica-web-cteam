"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Button,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { Contact } from "@/hooks/contact/use-contact";
import Text from "@/shared/components/citrica-ui/atoms/text";
import Icon from "@/shared/components/citrica-ui/atoms/icon";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";

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

interface AccessCredentialsModalProps {
  contact: Contact;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AccessCredentialsModal({
  contact,
  onClose,
  onSuccess,
}: AccessCredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);

  const hasUserAccess = contact.user_id !== null;
  const isActive = contact.active_users === true;
  const isFirstTime = contact.user_id === null;
  const isReactivation = contact.user_id !== null && contact.active_users === false;

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: `${label} copiado`,
      description: `${label} ha sido copiado al portapapeles`,
      color: "success",
    });
  };

  const handleGeneratePassword = () => {
    const generatedPassword = generateSecurePassword();
    setNewPassword(generatedPassword);
    addToast({
      title: "Contraseña generada",
      description: "Se ha generado una contraseña segura",
      color: "success",
    });
  };

  const handleToggleAccess = async () => {
    setIsLoading(true);

    try {
      if (isActive) {
        // Quitar acceso
        const response = await fetch('/api/admin/activate-contact-access', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contact_id: contact.id }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Error al desactivar acceso');
        }

        addToast({
          title: "Acceso desactivado",
          description: "El contacto ya no puede acceder al sistema",
          color: "success",
        });
      } else {
        // Dar acceso o reactivar
        if (isFirstTime && !newPassword) {
          addToast({
            title: "Error",
            description: "La contraseña es requerida para la primera activación",
            color: "danger",
          });
          setIsLoading(false);
          return;
        }

        if (!contact.email) {
          addToast({
            title: "Error",
            description: "El contacto debe tener un email",
            color: "danger",
          });
          setIsLoading(false);
          return;
        }

        if (!contact.name) {
          addToast({
            title: "Error",
            description: "El contacto debe tener un nombre",
            color: "danger",
          });
          setIsLoading(false);
          return;
        }

        // Separar nombre y apellido
        const nameParts = contact.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Determinar el role_id basándose en la empresa
        const roleId = contact.company_id === 1 ? 1 : 12;

        const response = await fetch('/api/admin/activate-contact-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contact_id: contact.id,
            password: isFirstTime ? newPassword : undefined,
            email_access: contact.email,
            user_data: {
              first_name: firstName,
              last_name: lastName,
              full_name: contact.name,
              role_id: roleId,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Error en la respuesta:', result);
          throw new Error(result.error || 'Error al activar acceso');
        }

        addToast({
          title: isReactivation ? "Acceso reactivado" : "Acceso activado",
          description: isReactivation
            ? "Usuario reactivado correctamente"
            : "Usuario creado correctamente",
          color: "success",
          timeout: 5000,
        });
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      addToast({
        title: isActive ? "Error al desactivar acceso" : "Error al activar acceso",
        description: error.message || `No se pudo ${isActive ? 'desactivar' : 'activar'} el acceso`,
        color: "danger",
        timeout: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      className="w-[360px]"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-[#265197]">
            Credenciales de Acceso
          </h3>
        </ModalHeader>

        <ModalBody className="bg-[#EEF1F7] rounded-xl">
          <div className="flex flex-col gap-4">
            {/* Información del contacto */}
            <div className="flex flex-col gap-1">
              <Text variant="label" color="#666">Nombre del Contacto</Text>
              <Text variant="body" color="#265197" weight="bold">{contact.name || "-"}</Text>
            </div>

            {hasUserAccess ? (
              <>
                {/* Email de Acceso */}
                <div className="flex flex-col gap-2">
                  <Text variant="label" color="#666">Email de Acceso</Text>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <Icon className="w-4 h-4 text-gray-500" name="Mail" />
                    <Text variant="body" color="#333" className="flex-1 font-mono text-sm">
                      {contact.email_access || contact.email || "-"}
                    </Text>
                    {(contact.email_access || contact.email) && (
                      <Tooltip content="Copiar email">
                        <div
                          className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => handleCopyToClipboard(contact.email_access || contact.email || "", "Email")}
                        >
                          <Icon name="Copy" className="text-gray-500 w-4 h-4" />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Contraseña */}
                {contact.code && (
                  <div className="flex flex-col gap-2">
                    <Text variant="label" color="#666">Contraseña</Text>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <Icon className="w-4 h-4 text-gray-500" name="Lock" />
                      <Text variant="body" color="#333" className="flex-1 font-mono text-sm">
                        {showPassword ? contact.code : "••••••••••••"}
                      </Text>
                      <div className="flex items-center gap-1">
                        <Tooltip content={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Icon
                              name={showPassword ? "EyeOff" : "Eye"}
                              className="text-gray-500 w-4 h-4"
                            />
                          </div>
                        </Tooltip>
                        <Tooltip content="Copiar contraseña">
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                            onClick={() => handleCopyToClipboard(contact.code || "", "Contraseña")}
                          >
                            <Icon name="Copy" className="text-gray-500 w-4 h-4" />
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700">
                      Esta es la contraseña generada cuando se dio acceso al sistema.
                    </p>
                  </div>
                )}

                {/* Estado del Usuario */}
                <div className="flex items-center gap-2 p-3 rounded-lg border" style={{
                  backgroundColor: isActive ? '#f0fdf4' : '#fef2f2',
                  borderColor: isActive ? '#86efac' : '#fca5a5'
                }}>
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-green-600" : "text-red-600"}`}
                    name={isActive ? "CheckCircle" : "XCircle"}
                  />
                  <Text variant="body" color={isActive ? "#059669" : "#DC2626"}>
                    {isActive ? "Acceso activo al sistema" : "Acceso desactivado"}
                  </Text>
                </div>
              </>
            ) : (
              <>
                {/* Mensaje cuando no tiene acceso */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Este contacto aún no tiene acceso al sistema.
                  </p>
                </div>

                {/* Formulario para dar acceso por primera vez */}
                {showNewPasswordInput && (
                  <div className="flex flex-col gap-2">
                    <Text variant="label" color="#666">Contraseña *</Text>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <InputCitricaAdmin
                          name="new-password"
                          autoComplete="new-password"
                          placeholder="Ingrese o genere una contraseña"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          isRequired
                          endContent={
                            <Tooltip content="Mostrar/Ocultar contraseña">
                              <div
                                className="cursor-pointer"
                                onClick={() => setShowPassword((prev) => !prev)}
                              >
                                <Icon
                                  name={showPassword ? "EyeOff" : "Eye"}
                                  className="text-gray-500 w-5 h-5"
                                />
                              </div>
                            </Tooltip>
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Tooltip content="Generar contraseña">
                        <Button
                          size="sm"
                          className="bg-[#42668A] text-white"
                          onPress={handleGeneratePassword}
                        >
                          <Icon name="Shuffle" className="w-4 h-4" />
                          Generar
                        </Button>
                      </Tooltip>
                      <Tooltip content="Copiar al portapapeles">
                        <Button
                          size="sm"
                          className="bg-green-600 text-white"
                          onPress={() => handleCopyToClipboard(newPassword, "Contraseña")}
                          isDisabled={!newPassword}
                        >
                          <Icon name="Copy" className="w-4 h-4" />
                          Copiar
                        </Button>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-gray-500">
                      Esta contraseña será la que el usuario utilice para iniciar sesión
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between">
          <ButtonCitricaAdmin
            variant="secondary"
            onPress={onClose}
            className="w-[162px]"
          >
            Cerrar
          </ButtonCitricaAdmin>

          {isActive ? (
            <ButtonCitricaAdmin
              variant="primary"
              className="bg-[#42668A] w-[162px]"
              onPress={handleToggleAccess}
              isLoading={isLoading}
            >
              Quitar Acceso
            </ButtonCitricaAdmin>
          ) : (
            <ButtonCitricaAdmin
              variant="primary"
              className="bg-[#42668A] w-[162px]"
              onPress={() => {
                if (isFirstTime && !showNewPasswordInput) {
                  setShowNewPasswordInput(true);
                } else {
                  handleToggleAccess();
                }
              }}
              isLoading={isLoading}
              isDisabled={isFirstTime && showNewPasswordInput && !newPassword}
            >
              {isReactivation ? "Reactivar Acceso" : "Dar Acceso"}
            </ButtonCitricaAdmin>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
