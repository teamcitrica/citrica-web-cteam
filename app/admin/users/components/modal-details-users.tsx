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
      size="md"
      placement="center"
      backdrop="opaque"
      scrollBehavior="inside"
      classNames={{
        closeButton: "w-5 h-5 min-w-5 !text-base text-[#265197] border border-[#265197] rounded-full hover:bg-[#265197] hover:text-white transition-colors flex items-center justify-center",
        base: "rounded-2xl",
        body: "rounded-b-2xl",
      }}
    >
      <ModalContent className="rounded-2xl">
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-[#265197]">Detalles del Usuario</h3>
        </ModalHeader>

        <ModalBody
          style={{
            background: 'linear-gradient(180deg, #EEF1F7 0%, #FFFFFF 15%, #FFFFFF 85%, #EEF1F7 100%)'
          }}
        >
          <div className="flex flex-col gap-4">
            {/* Información principal con avatar centrado */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-300">
              <Avatar
                classNames={{
                  base: `bg-gradient-to-br ${getAvatarColor(userName || "User")} w-16 h-16`,
                  icon: "text-white text-xl",
                }}
                name={getInitials(userName || "?")}
                size="md"
              />
              <div className="flex flex-col gap-1 items-center">
                <h3 className="text-lg font-semibold text-[#265197]">{userName || "-"}</h3>
                <p className="text-sm text-[#265197]">{user.email || "-"}</p>
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: "bg-[#265197]",
                    content: "text-white font-medium",
                  }}
                >
                  {user.role?.name || "Sin rol"}
                </Chip>
              </div>
            </div>

            {/* Información detallada */}
            <h3>
              <Text variant="subtitle" color="#265197" weight="bold">Datos del usuario</Text>
            </h3> 
            <div className="flex flex-col gap-1 mb-[24px]">
              <p className="text-sm text-[#265197]">Nombre: {user.first_name || "-"}</p>
              <p className="text-sm text-[#265197]">Apellido: {user.last_name || "-"}</p>
              <p className="text-sm text-[#265197]">Email: {user.email || "-"}</p>
              <p className="text-sm text-[#265197]">Rol: {user.role?.name || "-"}</p>
              <p className="text-sm text-[#265197]">Empresa: {user.company?.name || "-"}</p>
              <p className="text-sm text-[#265197]">Accesos a Proyectos: {user.user_metadata?.project_access_count || 0} proyecto(s)</p>
              <p className="text-sm text-[#265197]">Fecha de Creación: {createdDate}</p>
              <p className="text-sm text-[#265197]">Última Actualización: {updatedDate}</p>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UserDetailModal;
