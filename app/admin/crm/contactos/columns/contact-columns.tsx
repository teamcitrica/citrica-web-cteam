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
import { Contact } from "@/hooks/contacts-clients/use-contacts-clients";

type ContactColumnsConfig = {
  getCompanyName: (companyId: number | null) => string;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
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
        <div className="flex flex-col items-start gap-1">
          <div className="text-[#16305A] font-medium">{contact.name || "-"}</div>
          <div className="text-[#678CC5] text-sm">{contact.cargo || "-"}</div>
        </div>
      </div>
    ),
  },
  {
    name: "EMPRESA Y LOCACIÓN",
    uid: "company",
    sortable: false,
    render: (contact) => (
      <div className="flex flex-col gap-1 items-start">
        <div className="text-[#16305A] font-medium">
          {getCompanyName(contact.company_id)}
        </div>
        <div className="text-[#678CC5] text-sm">{contact.address || "-"}</div>
      </div>
    ),
  },
  {
    name: "WHATSAPP Y MAIL",
    uid: "contact_info",
    sortable: false,
    render: (contact) => (
      <div className="flex flex-col gap-2">
        {contact.phone && (
          <a
            href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#16305A] hover:text-green-700"
          >
            <Icon className="w-4 h-4" name="Phone" />
            <span className="text-sm">{contact.phone}</span>
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2 text-[#678CC5] hover:text-blue-700"
          >
            <Icon className="w-4 h-4" name="Mail" />
            <span className="text-sm">{contact.email}</span>
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
    render: (contact) => (
      <div className="relative flex justify-center items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <Icon className="text-default-400 w-5 h-5" name="EllipsisVertical" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Acciones del contacto"
            onAction={(key) => {
              switch (key) {
                case "view":
                  onView(contact);
                  break;
                case "edit":
                  onEdit(contact);
                  break;
                case "delete":
                  onDelete(contact);
                  break;
              }
            }}
          >
            <DropdownItem
              key="view"
              startContent={<Icon className="w-4 h-4 text-blue-500" name="Eye" />}
            >
              Ver
            </DropdownItem>
            <DropdownItem
              key="edit"
              startContent={<Icon className="w-4 h-4 text-green-500" name="SquarePen" />}
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
