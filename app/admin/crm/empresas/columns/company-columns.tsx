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
import { Company } from "@/hooks/companies/use-companies";
import { Text } from "@/shared/components/citrica-ui";

type CompanyColumnsConfig = {
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
};

type CompanyExportConfig = Record<string, never>;

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

export const getCompanyColumns = ({
  onView,
  onEdit,
  onDelete,
}: CompanyColumnsConfig): Column<Company>[] => [
  {
    name: "EMPRESA Y SECTOR",
    uid: "name",
    sortable: true,
    render: (company) => (
      <div className="flex items-center gap-3">
        <Avatar
          classNames={{
            base: `bg-gradient-to-br ${getAvatarColor(company.name || "Company")}`,
            icon: "text-white",
          }}
          name={getInitials(company.name || "?")}
          size="sm"
        />
        <div className="flex flex-col">
          <Text variant="body" weight="bold" color="#16305A">{company.name || "-"}</Text>
          <Text variant="label" color="#678CC5" className="truncate max-w-[200px]">.</Text>
        </div>
      </div>
    ),
  },
  {
    name: "RELACIÓN Y UBICACIÓN",
    uid: "location",
    sortable: false,
    render: (company) => {
      const location = [company.departament, company.country]
        .filter(Boolean)
        .join(", ") || "-";
      return (
        <div className="flex flex-col items-start">
          <Text variant="body" weight="bold" color="#16305A">{location}</Text>
          <Text variant="label" color="#678CC5">.</Text>
        </div>
      );
    },
  },
  {
    name: "TELÉFONO Y MAIL",
    uid: "contact_info",
    sortable: false,
    render: (company) => (
      <div className="flex flex-col">
        {company.contact_phone && (
          <a
            href={`https://wa.me/${company.contact_phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#16305A] hover:text-green-700"
          >
            <Icon size={12} name="Phone" />
            <Text variant="body" weight="bold" color="#16305A">{company.contact_phone}</Text>
          </a>
        )}
        {company.contact_email && (
          <a
            href={`mailto:${company.contact_email}`}
            className="flex items-center gap-2 text-[#678CC5] hover:text-blue-700"
          >
            <Icon size={12} name="Mail" />
            <Text variant="label" color="#678CC5">{company.contact_email}</Text>
          </a>
        )}
        {!company.contact_phone && !company.contact_email && (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    sortable: false,
    render: (company) => (
      <div className="relative flex justify-center items-center gap-2">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => onView(company)}
          className="text-blue-500 hover:bg-blue-100"
        >
          <Icon className="w-5 h-5" name="Eye" />
        </Button>
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
            aria-label="Acciones de la empresa"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(company);
                  break;
                case "delete":
                  onDelete(company);
                  break;
              }
            }}
          >
            <DropdownItem
              key="edit"
            >
              Editar
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

export const getCompanyExportColumns = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _config?: CompanyExportConfig
): ExportColumn[] => [
  {
    header: "EMPRESA",
    key: "name",
  },
  {
    header: "DEPARTAMENTO",
    key: "departament",
  },
  {
    header: "PAÍS",
    key: "country",
  },
  {
    header: "SECTOR/DESCRIPCIÓN",
    key: "description",
  },
  {
    header: "TELÉFONO",
    key: "contact_phone",
  },
  {
    header: "EMAIL",
    key: "contact_email",
  },
];
