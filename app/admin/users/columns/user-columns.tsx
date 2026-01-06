import React from "react";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from "@heroui/react";
import Icon from "@ui/atoms/icon";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { ExportColumn } from "@/shared/hooks/useTableFeatures";
import { UserType } from "@/shared/types/types";
import { Button } from "citrica-ui-toolkit";

type UserColumnsConfig = {
  onView: (user: UserType) => void;
  onEdit: (user: UserType) => void;
  onDelete: (user: UserType) => void;
  onAccessCredentials: (user: UserType) => void;
};

type UserExportConfig = Record<string, never>;

// Función para generar un color único basado en el nombre
const getAvatarColor = (name: string): string => {
  const colors = [
    "from-[#FFB457] to-[#FF705B]", // Naranja a rojo
    "from-[#5EA67D] to-[#3E8A5E]", // Verde claro a verde oscuro
    "from-[#5B9FED] to-[#3B7DBD]", // Azul claro a azul oscuro
    "from-[#A78BFA] to-[#7C5CC8]", // Púrpura claro a púrpura oscuro
    "from-[#F472B6] to-[#DB2777]", // Rosa claro a rosa oscuro
    "from-[#FBBF24] to-[#D97706]", // Amarillo a naranja
    "from-[#34D399] to-[#059669]", // Verde esmeralda claro a oscuro
    "from-[#60A5FA] to-[#2563EB]", // Azul cielo a azul
    "from-[#C084FC] to-[#9333EA]", // Lavanda a púrpura
    "from-[#FB923C] to-[#EA580C]", // Naranja melocotón
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

export const getUserColumns = ({
  onView,
  onEdit,
  onDelete,
  onAccessCredentials,
}: UserColumnsConfig): Column<UserType>[] => [
  {
    name: "USUARIO",
    uid: "usuario",
    sortable: true,
    render: (user) => {
      const userName =
        user.full_name ||
        user.name ||
        `${user.first_name || ""} ${user.last_name || ""}`.trim();
      const isActive = user.active_users === true;

      return (
        <div className="flex items-center gap-3">
          <Avatar
            classNames={{
              base: `bg-gradient-to-br ${getAvatarColor(userName || "User")}`,
              icon: "text-white",
            }}
            name={getInitials(userName || "?")}
            size="sm"
          />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-black font-medium">{userName || "-"}</span>
              {user.active_users !== undefined && (
                <Tooltip
                  content={
                    isActive
                      ? "Usuario con acceso activo"
                      : "Usuario sin acceso activo"
                  }
                  delay={200}
                  closeDelay={0}
                >
                  <div className="flex items-center">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-green-600" : "text-[#b5b5b5]"}`}
                      name="ShieldCheck"
                    />
                  </div>
                </Tooltip>
              )}
            </div>
            <span className="text-[#678CC5] text-xs">{user.cargo || "-"}</span>
          </div>
        </div>
      );
    },
  },
  {
    name: "EMPRESA",
    uid: "empresa",
    sortable: true,
    render: (user) => (
      <div className="text-black font-medium">
        {user.company?.name || "-"}
      </div>
    ),
  },
  {
    name: "ROL",
    uid: "rol_acceso",
    sortable: true,
    render: (user) => (
      <div className="text-black font-medium capitalize">
        {user.role?.name || "-"}
      </div>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    sortable: false,
    align: "end",
    render: (user) => (
      <div
        className="relative flex justify-end items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          isIconOnly
          variant="flat"
          onPress={() => onView(user)}
          className=" hover:!bg-transparent !p-1 !min-w-0"
        >
          <Icon className="w-5 h-5 text-[#265197]" name="Eye" />
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="flat" size="sm" className="!p-1 !min-w-0">
              <Icon className="text-[#265197] w-5 h-5" name="EllipsisVertical" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Acciones del usuario"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(user);
                  break;
                case "access-credentials":
                  onAccessCredentials(user);
                  break;
                case "delete":
                  onDelete(user);
                  break;
              }
            }}
          >
            <DropdownItem key="edit">
              Editar
            </DropdownItem>
            <DropdownItem key="access-credentials">
              Accesos
            </DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger">
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  },
];

export const getUserExportColumns = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _config?: UserExportConfig,
): ExportColumn[] => [
  {
    header: "NOMBRE",
    key: "full_name",
  },
  {
    header: "ROL",
    key: "role.name",
  },
  {
    header: "EMAIL",
    key: "email",
  },
];
