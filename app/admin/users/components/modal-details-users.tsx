"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Chip } from "@heroui/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { UserType } from "@/shared/types/types";
import Text from "@/shared/components/citrica-ui/atoms/text";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import Icon from "@/shared/components/citrica-ui/atoms/icon";

interface UserDetailModalProps {
  user: UserType | null;
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

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  const userName = user.full_name || user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const createdDate = user.created_at ? format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es }) : "-";
  const updatedDate = user.updated_at ? format(new Date(user.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: es }) : "-";

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
          <Text variant="headline" color="#265197">Detalles del Usuario</Text>
        </ModalHeader>

        <ModalBody className="py-6">
          <div className="flex flex-col gap-6">
            {/* Información principal con avatar */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar
                classNames={{
                  base: `bg-gradient-to-br ${getAvatarColor(userName || "User")} w-20 h-20`,
                  icon: "text-white text-2xl",
                }}
                name={getInitials(userName || "?")}
                size="lg"
              />
              <div className="flex flex-col gap-2 flex-1">
                <Text variant="headline" color="#265197">{userName || "-"}</Text>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" name="Mail" />
                  <Text variant="body" color="#666">{user.email || "-"}</Text>
                </div>
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
                    {user.role?.name || "Sin rol"}
                  </Chip>
                </div>
              </div>
            </div>

            {/* Información detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Nombre</Text>
                <Text variant="body" color="#333">{user.first_name || "-"}</Text>
              </div>

              {/* Apellido */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Apellido</Text>
                <Text variant="body" color="#333">{user.last_name || "-"}</Text>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Correo Electrónico</Text>
                <Text variant="body" color="#333">{user.email || "-"}</Text>
              </div>

              {/* Rol */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Rol</Text>
                <Text variant="body" color="#333">{user.role?.name || "-"}</Text>
              </div>

              {/* Empresa */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Empresa</Text>
                <Text variant="body" color="#333">{user.company?.name || "-"}</Text>
              </div>

              {/* ID de Usuario */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">ID de Usuario</Text>
                <Text variant="body" color="#333" className="font-mono text-xs">{user.id || "-"}</Text>
              </div>

              {/* Accesos a Proyectos */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Accesos a Proyectos</Text>
                <Text variant="body" color="#333">
                  {user.user_metadata?.project_access_count || 0} proyecto(s)
                </Text>
              </div>

              {/* ID de Rol */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">ID de Rol</Text>
                <Text variant="body" color="#333">{user.role_id || "-"}</Text>
              </div>

              {/* ID de Empresa */}
              {user.company_id && (
                <div className="flex flex-col gap-1">
                  <Text variant="label" color="#666">ID de Empresa</Text>
                  <Text variant="body" color="#333">{user.company_id}</Text>
                </div>
              )}

              {/* Fecha de creación */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Fecha de Creación</Text>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" name="Calendar" />
                  <Text variant="body" color="#333">{createdDate}</Text>
                </div>
              </div>

              {/* Última actualización */}
              <div className="flex flex-col gap-1">
                <Text variant="label" color="#666">Última Actualización</Text>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" name="Calendar" />
                  <Text variant="body" color="#333">{updatedDate}</Text>
                </div>
              </div>
            </div>
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
};

export default UserDetailModal;
