import React from "react";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import Icon from "@ui/atoms/icon";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { ExportColumn } from "@/shared/hooks/useTableFeatures";
import { UserType } from "@/shared/types/types";

type UserColumnsConfig = {
  onView: (user: UserType) => void;
  onEdit: (user: UserType) => void;
  onDelete: (user: UserType) => void;
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
}: UserColumnsConfig): Column<UserType>[] => [
  {
    name: "NOMBRE",
    uid: "nombre",
    sortable: true,
    render: (user) => {
      const userName = user.full_name || user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
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
          <div className="text-black font-medium">{userName || "-"}</div>
        </div>
      );
    },
  },
  {
    name: "ROL",
    uid: "rol",
    sortable: true,
    render: (user) => (
      <div className="text-black font-medium capitalize">
        {user.role?.name || "-"}
      </div>
    ),
  },
  {
    name: "CORREO",
    uid: "email",
    sortable: false,
    render: (user) => (
      <div className="flex items-center gap-2">
        {user.email ? (
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-2 text-black hover:text-[#ff5b00]"
          >
            <Icon className="w-4 h-4" name="Mail" />
            <span className="text-sm">{user.email}</span>
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    sortable: false,
    render: (user) => (
      <div className="relative flex justify-center items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <Icon
                className="text-default-400 w-5 h-5"
                name="EllipsisVertical"
              />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Acciones del usuario"
            onAction={(key) => {
              switch (key) {
                case "view":
                  onView(user);
                  break;
                case "edit":
                  onEdit(user);
                  break;
                case "delete":
                  onDelete(user);
                  break;
              }
            }}
          >
            <DropdownItem
              key="view"
              startContent={
                <Icon className="w-4 h-4 text-blue-500" name="Eye" />
              }
            >
              Ver
            </DropdownItem>
            <DropdownItem
              key="edit"
              startContent={
                <Icon className="w-4 h-4 text-green-500" name="SquarePen" />
              }
            >
              Editar
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Icon className="w-4 h-4" name="Trash2" />}
            >
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
  _config?: UserExportConfig
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
