"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Divider,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { Contact } from "@/hooks/contact/use-contact";
import { Text, Button } from "citrica-ui-toolkit";
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
  const { companies } = useCompanyCRUD();

  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "Sin empresa asignada";
    const company = companies.find(c => c.id === companyId);
    return company?.name || "Empresa no encontrada";
  };

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
          <div className="flex items-center gap-3">
            <div className="rounded-full flex items-center justify-center overflow-hidden" style={{ width: '46px', height: '46px' }}>
              <img src="/avatar-login.png" alt="Avatar" width="46" height="46" />
            </div>
            <div className="flex flex-col">
              <Text variant="body" weight="bold" color="#265197">{`${contact.name || "Sin nombre"} ${contact.last_name || ""}`}</Text>
              <Text variant="label" weight="bold" color="#678CC5">{contact.cargo || "-"}</Text>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="bg-[#EEF1F7] rounded-xl">
          <div className="flex flex-col gap-4">
            {/* Información del contacto */}
            <div className="flex flex-row gap-2">
              <Text variant="body" weight="bold" color="#265197">Empresa</Text>
              <Text variant="body" weight="bold" color="#265197">{getCompanyName(contact.company_id)}</Text>
            </div>
            <div className="flex flex-col gap-1">
              <Text variant="label" color="#678CC5">Rol</Text>
              <Text variant="body" color="#16305A">{contact.user?.role?.name || "-"}</Text>
            </div>

            {hasUserAccess ? (
              <>
                {/* Email de Acceso */}
                <div className="flex flex-col">
                  <Text variant="label" color="#678CC5">Email de Acceso</Text>
                  <div className="flex items-center gap-2 ">
                    <Text variant="body" color="#333" className="flex-1 font-mono text-sm">
                      {contact.email_access || contact.email || "-"}
                    </Text>
                    {(contact.email_access || contact.email) && (
                      <Tooltip content="Copiar email">
                        <div
                          className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => handleCopyToClipboard(contact.email_access || contact.email || "", "Email")}
                        >
                          <Icon name="Copy" color="#678CC5" size={20} />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Contraseña */}
                {contact.code && (
                  <div className="flex flex-col">
                    <Text variant="label" color="#678CC5">Clave</Text>
                    <div className="flex items-center gap-2">
                      <Text variant="body" color="#333" className="flex-1 font-mono text-sm">
                        {showPassword ? contact.code : "••••••••••••"}
                      </Text>
                      <div className="flex items-center gap-1">
                        <Tooltip content={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Icon name={showPassword ? "EyeOff" : "Eye"} color="#678CC5" size={20} />
                          </div>
                        </Tooltip>
                        <Tooltip content="Copiar contraseña">
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                            onClick={() => handleCopyToClipboard(contact.code || "", "Contraseña")}
                          >
                            <Icon name="Copy" color="#678CC5" size={20} />
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                )}
                <Divider className="bg-[#A7BDE2]" />

                {/* Estado del Usuario */}
                <div className="flex flex-col gap-2 mb-4 ">
                  <div className="flex flex-row gap-2">
                    <Text variant="body" weight="bold" color="#265197">Acceso:</Text>
                    <div className="flex flex-row gap-1">
                      <Icon size={20} className={`${isActive ? "text-[#10E5A4]" : "text-[#F04242]"}`}
                        name={isActive ? "ShieldCheck" : "ShieldX"}
                      />
                      <Text variant="body" weight="bold" color={isActive ? "#059669" : "#DC2626"}>{isActive ? "Habilitado" : "Inhabilitado"}</Text>
                    </div>
                  </div>

                  <Text variant="label" color="#678CC5">
                    {isActive ? "" : "Este usuario tiene el acceso inhabilitado. Puedes reactivarlo para permitirle iniciar sesión nuevamente."}
                  </Text>
                </div>
              </>
            ) : (
              <>
                {/* Mensaje cuando no tiene acceso */}
                <div className="mb-4">
                  <Divider className="bg-[#A7BDE2]"/>
                  <p className="mt-2">
                    <Text variant="label" color="#678CC5">Este contacto aún no tiene acceso al sistema.</Text>
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
              className="bg-[#F04242] w-[162px] !border-0"
              onPress={handleToggleAccess}
              isLoading={isLoading}
            >
              Inhabilitar
            </ButtonCitricaAdmin>
          ) : (
            <ButtonCitricaAdmin
              variant="primary"
              className="bg-[#10E5A4] text-[#16305A] w-[162px] !border-0"
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
              {isReactivation ? "Habilitar" : "Habilitar"}
            </ButtonCitricaAdmin>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
