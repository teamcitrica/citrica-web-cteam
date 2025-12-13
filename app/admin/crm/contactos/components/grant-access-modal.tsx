"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tooltip,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { Icon } from "@/shared/components/citrica-ui";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";

import { Contact } from "@/hooks/contact/use-contact";

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

interface GrantAccessModalProps {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GrantAccessModal({
  isOpen,
  contact,
  onClose,
  onSuccess,
}: GrantAccessModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setPassword(newPassword);
    addToast({
      title: "Contraseña generada",
      description: "Se ha generado una contraseña segura",
      color: "success",
    });
  };

  const handleCopyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      addToast({
        title: "Contraseña copiada",
        description: "La contraseña ha sido copiada al portapapeles",
        color: "success",
      });
    }
  };

  const handleSubmit = async () => {
    if (!password) {
      addToast({
        title: "Error",
        description: "La contraseña es requerida",
        color: "danger",
      });
      return;
    }

    if (!contact.email) {
      addToast({
        title: "Error",
        description: "El contacto debe tener un email",
        color: "danger",
      });
      return;
    }

    if (!contact.name) {
      addToast({
        title: "Error",
        description: "El contacto debe tener un nombre",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Separar nombre y apellido
      const nameParts = contact.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Determinar el role_id basándose en la empresa
      // company_id === 1 (Citrica) -> role_id = 1 (Admin/Staff)
      // Otras empresas -> role_id = 12 (Cliente)
      const roleId = contact.company_id === 1 ? 1 : 12;

      // Llamar al endpoint para activar acceso
      const response = await fetch('/api/admin/activate-contact-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contact.id,
          password: password,
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
        console.error('❌ Error en la respuesta:', result);
        throw new Error(result.error || 'Error al activar acceso');
      }

      // Éxito - mostrar mensaje
      addToast({
        title: "Acceso activado",
        description: "Usuario creado correctamente",
        color: "success",
        timeout: 5000,
      });

      // Refrescar la lista de contactos y cerrar el modal
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error al activar acceso:", error);
      addToast({
        title: "Error al activar acceso",
        description: error.message || "No se pudo activar el acceso",
        color: "danger",
        timeout: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
    >
      <ModalContent>
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-gray-800">
              Dar Acceso al Sistema
            </h3>
          </ModalHeader>
          <ModalBody>
          <div className="space-y-4">
            {contact.company_id === 1 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> Este contacto pertenece a Citrica y se creará como usuario administrador/staff (no cliente).
                </p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h5 className="text-sm font-semibold text-gray-700">Información del Contacto</h5>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Nombre</label>
                  <div className="px-3 py-2 bg-white rounded-lg border border-gray-200 mt-1">
                    <span className="text-sm text-gray-800">{contact.name || "-"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <div className="px-3 py-2 bg-white rounded-lg border border-gray-200 mt-1">
                    <span className="text-sm text-gray-800">{contact.email || "-"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">Contraseña *</label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1">
                      <InputCitricaAdmin
                        name="new-password"
                        autoComplete="new-password"
                        placeholder="Ingrese o genere una contraseña"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isRequired
                        endContent={
                          <div className="flex items-center gap-1">
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
                          </div>
                        }
                      />
                    </div>
                    <Tooltip content="Generar contraseña">
                      <Button
                        isIconOnly
                        className="bg-[#42668A] text-white"
                        onPress={handleGeneratePassword}
                      >
                        <Icon name="Shuffle" className="w-5 h-5" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Copiar al portapapeles">
                      <Button
                        isIconOnly
                        className="bg-green-600 text-white"
                        onPress={handleCopyPassword}
                        isDisabled={!password}
                      >
                        <Icon name="Copy" className="w-5 h-5" />
                      </Button>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Esta contraseña será la que el usuario utilice para iniciar sesión
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[#42668A] text-white"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!password}
          >
            Dar Acceso
          </Button>
        </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
