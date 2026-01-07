"use client";

import { Divider } from "@heroui/divider";
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { UserType } from "@/shared/types/types";
import { DetailModal } from "@/shared/components/citrica-ui";
import { Text } from "citrica-ui-toolkit";

interface UserDetailModalProps {
  user: UserType | null;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  const userName = user.full_name || user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const createdDate = user.created_at ? format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es }) : "-";
  const updatedDate = user.updated_at ? format(new Date(user.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: es }) : "-";

  const sections = [
    {
      title: `Empresa: ${user.company?.name || "-"}`,
      content: (
        <div className="flex flex-col pb-0">
          <div className="grid grid-cols-2 gap-x-6 pt-[12px] pb-[8px]">
            {/* Columna Izquierda */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex flex-col">
                <p>
                  <Text variant="label" color="#678CC5">Rol</Text>
                </p>
                <p>
                  <Text variant="body" color="#16305A">{user.role?.name || "-"}</Text>
                </p>
              </div>
              <div className="flex flex-col">
                <p>
                  <Text variant="label" color="#678CC5">Cargo</Text>
                </p>
                <p>
                  <Text variant="body" color="#16305A">{user.cargo || "-"}</Text>
                </p>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex flex-col">
                <p>
                  <Text variant="label" color="#678CC5">Email</Text>
                </p>
                <p>
                  <Text variant="body" color="#16305A">{user.email || "-"}</Text>
                </p>
              </div>
              <div className="flex flex-col">
                <p>
                  <Text variant="label" color="#678CC5">WhatsApp</Text>
                </p>
                <p>
                  <Text variant="body" color="#16305A">{user.phone || "-"}</Text>
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <Divider className="bg-[#A7BDE2] mb-[8px]" />

          {/* Sección de Accesos */}
          <div className="mb-[16px]">
            <p className="mb-[6px]">
              <Text variant="body" weight="bold" color="#265197">Accesos</Text>
            </p>
            <div className="grid grid-cols-2 gap-x-6 pb-0">
              <div className="flex flex-col">
                <p>
                  <Text variant="label" color="#678CC5">Proyectos</Text>
                </p>
                <p>
                  <Text variant="body" color="#16305A">{user.user_metadata?.project_access_count || 0}</Text>
                </p>
              </div>
              <div className="flex flex-col">
                <p>
                  <Text variant="label" color="#678CC5">Assets</Text>
                </p>
                <p>
                  <Text variant="body" color="#16305A">{user.user_metadata?.asset_access_count || 0}</Text>
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DetailModal
      isOpen={true}
      onClose={onClose}
      width="512px"
      title={
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center overflow-hidden" style={{ width: '46px', height: '46px' }}>
            <img src="/avatar-login.png" alt="Avatar" width="46" height="46" />
          </div>
          <div className="flex flex-col">
            <Text variant="body" weight="bold" color="#265197">{userName || "Sin nombre"}</Text>
            <Text variant="label" weight="bold" color="#678CC5">{user.role?.name || "-"}</Text>
          </div>
        </div>
      }
      sections={sections}
    />
  );
};

export default UserDetailModal;
