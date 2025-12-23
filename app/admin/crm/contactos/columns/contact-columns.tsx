import React from "react";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Tooltip,
} from "@heroui/react";
import Icon from "@ui/atoms/icon";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { ExportColumn } from "@/shared/hooks/useTableFeatures";
import { Contact } from "@/hooks/contact/use-contact";
import { Text } from "@/shared/components/citrica-ui";

type ContactColumnsConfig = {
  getCompanyName: (companyId: number | null) => string;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onAccessCredentials: (contact: Contact) => void;
};

type ContactExportConfig = {
  getCompanyName: (companyId: number | null) => string;
};

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

  // Generar hash del nombre
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Seleccionar color basado en el hash
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

export const getContactColumns = ({
  getCompanyName,
  onView,
  onEdit,
  onDelete,
  onAccessCredentials,
}: ContactColumnsConfig): Column<Contact>[] => [
  {
    name: "NOMBRE Y CARGO",
    uid: "name",
    sortable: true,
    render: (contact) => (
      <div className="flex items-center gap-3">
        <Avatar
          classNames={{
            base: `bg-gradient-to-br ${getAvatarColor(contact.name || "User")}`,
            icon: "text-white",
          }}
          name={getInitials(contact.name || "?")}
          size="sm"
        />
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <Text variant="body" weight="bold" color="#16305A">{contact.name || "-"}</Text>
            {contact.user_id !== null && (
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
                    className={`w-4 h-4 ${contact.active_users ? "text-green-600" : "text-[#b5b5b5]"}`}
                    name="ShieldCheck"
                  />
                </div>
              </Tooltip>
            )}
          </div>
          <Text variant="label" color="#678CC5">{contact.cargo || "-"}</Text>
        </div>
      </div>
    ),
  },
  {
    name: "EMPRESA",
    uid: "company",
    sortable: false,
    render: (contact) => (
      <div className="flex flex-col items-start">
        <div className="text-[#16305A] font-medium">
          <Text variant="body" weight="bold" color="#16305A">{getCompanyName(contact.company_id)}</Text>
        </div>
        <Text variant="label" color="#678CC5">{contact.types_contact?.name || "-"}</Text>
      </div>
    ),
  },
  {
    name: "WHATSAPP Y MAIL",
    uid: "contact_info",
    sortable: false,
    render: (contact) => (
      <div className="flex flex-col ">
        {contact.phone && (
          <a
            href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#16305A] hover:text-green-700"
          >
            <Icon size={12} name="Phone" />
            <Text variant="body" weight="bold" color="#16305A">{contact.phone}</Text>
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2 text-[#678CC5] hover:text-blue-700"
          >
            <Icon size={12} name="Mail" />
            <Text variant="label" color="#678CC5">{contact.email}</Text>
          </a>
        )}
        {!contact.phone && !contact.email && (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    sortable: false,
    align: "end",
    render: (contact) => (
      <div
        className="relative flex justify-end items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => onView(contact)}
          className="text-[#265197] hover:bg-blue-100"
        >
          <Icon className="w-5 h-5" name="Eye" />
        </Button>
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <Icon className="text-[#265197] w-5 h-5" name="EllipsisVertical" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Acciones del contacto"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(contact);
                  break;
                case "access-credentials":
                  onAccessCredentials(contact);
                  break;
                case "delete":
                  onDelete(contact);
                  break;
              }
            }}
          >
            <DropdownItem className="text-[#265197]" key="edit">
              Editar
            </DropdownItem>
            <DropdownItem className="text-[#265197]"
              key="access-credentials"
            >
              Accesos
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
            >
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  },
];

export const getContactExportColumns = ({
  getCompanyName,
}: ContactExportConfig): ExportColumn[] => [
  {
    header: "NOMBRE",
    key: "name",
  },
  {
    header: "CARGO",
    key: "cargo",
  },
  {
    header: "EMPRESA",
    key: "company_id",
    format: (value) => getCompanyName(value),
  },
  {
    header: "DIRECCIÓN",
    key: "address",
  },
  {
    header: "TELÉFONO",
    key: "phone",
  },
  {
    header: "EMAIL",
    key: "email",
  },
];
