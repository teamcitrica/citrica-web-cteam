import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Tooltip } from "@heroui/tooltip";
import React from "react";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { ExportColumn } from "@/shared/hooks/useTableFeatures";
import { Contact } from "@/hooks/contact/use-contact";
import { Icon, Text, Button } from "citrica-ui-toolkit";
import { AvatarTables } from "@/public/icon-svg/avatar-tables";
import { getAvatarColor } from "@/shared/utils/avatar-colors";

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
        <AvatarTables color={getAvatarColor(contact.name || "User")} size={32} />
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <Text isAdmin={true} variant="body" weight="bold" color="#16305A">{contact.name || "-"}</Text>
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
          <Text isAdmin={true} variant="body" weight="bold" color="#16305A">{getCompanyName(contact.company_id)}</Text>
        </div>
        <Text isAdmin={true} variant="label" color="#678CC5">{contact.types_contact?.name || "-"}</Text>
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
            <Text isAdmin={true} variant="body" weight="bold" color="#16305A">{contact.phone}</Text>
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2 text-[#678CC5] hover:text-blue-700"
          >
            <Icon size={12} name="Mail" />
            <Text isAdmin={true} variant="label" color="#678CC5">{contact.email}</Text>
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
          isAdmin={true}
          isIconOnly
          variant="flat"
          onPress={() => onView(contact)}
          className=" hover:!bg-transparent !p-1 !min-w-0"
        >
          <Icon className="w-5 h-5 text-[#265197]" name="Eye" />
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button isAdmin={true} isIconOnly variant="flat" size="sm" className="!p-1 !min-w-0 hover:!bg-transparent">
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
            <DropdownItem key="edit">
              Editar
            </DropdownItem>
            <DropdownItem key="access-credentials">
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
