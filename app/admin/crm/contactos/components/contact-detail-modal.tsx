"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Avatar,
  Chip,
  Tooltip,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { Contact } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import Text from "@/shared/components/citrica-ui/atoms/text";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import Icon from "@/shared/components/citrica-ui/atoms/icon";

interface ContactDetailModalProps {
  contact: Contact;
  onClose: () => void;
}

// Función para generar un color único basado en el nombre
const getAvatarColor = (name: string): string => {
  const colors = [
    "from-[#FFB457] to-[#FF705B]",
    "from-[#5EA67D] to-[#3E8A5E]",
    "from-[#5B9FED] to-[#3B7DBD]",
    "from-[#A78BFA] to-[#7C5CC8]",
    "from-[#F472B6] to-[#DB2777]",
    "from-[#FBBF24] to-[#D97706]",
    "from-[#34D399] to-[#059669]",
    "from-[#60A5FA] to-[#2563EB]",
    "from-[#C084FC] to-[#9333EA]",
    "from-[#FB923C] to-[#EA580C]",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Función para obtener las iniciales
const getInitials = (name: string): string => {
  const names = name.trim().split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function ContactDetailModal({
  contact,
  onClose,
}: ContactDetailModalProps) {
  const { companies } = useCompanyCRUD();
  const [showPassword, setShowPassword] = useState(false);

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

  const contactName = contact.name || "Sin nombre";
  const hasUserAccess = contact.user_id !== null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="2xl"
      placement="center"
      backdrop="opaque"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b">
          <Text variant="headline" color="#265197">Detalles del Contacto</Text>
        </ModalHeader>

        <ModalBody className="py-6">
          <div className="flex flex-col gap-6">
            {/* Información principal con avatar */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar
                classNames={{
                  base: `bg-gradient-to-br ${getAvatarColor(contactName)} w-20 h-20`,
                  icon: "text-white text-2xl",
                }}
                name={getInitials(contactName)}
                size="lg"
              />
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <Text variant="headline" color="#265197">{contactName}</Text>
                  {hasUserAccess && (
                    <Tooltip
                      content={
                        contact.active_users
                          ? "Usuario con acceso activo"
                          : "Usuario sin acceso activo"
                      }
                      delay={200}
                      closeDelay={0}
                    >
                      <div className="flex items-center">
                        <Icon
                          className={`w-5 h-5 ${contact.active_users ? "text-green-600" : "text-red-600"}`}
                          name="ShieldCheck"
                        />
                      </div>
                    </Tooltip>
                  )}
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-500" name="Mail" />
                    <Text variant="body" color="#666">{contact.email}</Text>
                  </div>
                )}
                {contact.cargo && (
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      classNames={{
                        base: "bg-blue-100",
                        content: "text-blue-700 font-medium",
                      }}
                    >
                      {contact.cargo}
                    </Chip>
                  </div>
                )}
              </div>
            </div>

            {/* Información detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Nombre</Text>
                <Text variant="body" color="#333">{contact.name || "-"}</Text>
              </div>

              {/* Apellido */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Apellido</Text>
                <Text variant="body" color="#333">{contact.last_name || "-"}</Text>
              </div>

              {/* Cargo */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Cargo</Text>
                <Text variant="body" color="#333">{contact.cargo || "-"}</Text>
              </div>

              {/* Teléfono */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Teléfono</Text>
                <Text variant="body" color="#333">{contact.phone || "-"}</Text>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Correo Electrónico</Text>
                <Text variant="body" color="#333">{contact.email || "-"}</Text>
              </div>

              {/* Dirección */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Dirección</Text>
                <Text variant="body" color="#333">{contact.address || "-"}</Text>
              </div>

              {/* Empresa */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <Text variant="label" color="#666">Empresa</Text>
                <Text variant="body" color="#333">{getCompanyName(contact.company_id)}</Text>
              </div>
            </div>

            {/* Sección de Credenciales de Acceso (solo si tiene user_id) */}
            {hasUserAccess && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-[#265197]" name="Key" />
                  <Text variant="headline" color="#265197">Credenciales de Acceso</Text>
                </div>

                <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
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
                        Esta es la contraseña generada cuando se dio acceso al sistema por primera vez.
                      </p>
                    </div>
                  )}

                  {/* Estado del Usuario */}
                  <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
                    <Icon
                      className={`w-4 h-4 ${contact.active_users ? "text-green-600" : "text-red-600"}`}
                      name={contact.active_users ? "CheckCircle" : "XCircle"}
                    />
                    <Text variant="body" color={contact.active_users ? "#059669" : "#DC2626"}>
                      {contact.active_users ? "Acceso activo al sistema" : "Acceso desactivado"}
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="border-t">
          <ButtonCitricaAdmin
            variant="primary"
            onClick={onClose}
          >
            Cerrar
          </ButtonCitricaAdmin>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
