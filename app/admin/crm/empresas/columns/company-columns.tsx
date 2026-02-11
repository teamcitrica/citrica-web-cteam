import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import React from "react";
import Icon from "@ui/atoms/icon";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { ExportColumn } from "@/shared/hooks/useTableFeatures";
import { Company } from "@/hooks/companies/use-companies";
import { Text, Button } from 'citrica-ui-toolkit';
import { AvatarTables } from "@/public/icon-svg/avatar-tables";
import { getAvatarColor } from "@/shared/utils/avatar-colors";

type CompanyColumnsConfig = {
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
};

type CompanyExportConfig = Record<string, never>;

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
        <AvatarTables color={getAvatarColor(company.name || "Company")} size={32} />
        <div className="flex flex-col">
          <Text variant="body" weight="bold" color="#16305A">{company.name || "-"}</Text>
          <Text variant="label" color="#678CC5" className="truncate max-w-[200px]">{company.sector || "-"}</Text>
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
      const relation = company.types_contact?.name || "-";
      return (
        <div className="flex flex-col items-start">
          <Text variant="body" weight="bold" color="#16305A">{relation}</Text>
          <Text variant="label" color="#678CC5">{location}</Text>
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
    align: "end",
    render: (company) => (
      <div
        className="relative flex justify-end items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          isIconOnly
          variant="flat"
          onPress={() => onView(company)}
          className=" hover:!bg-transparent !p-1 !min-w-0"
        >
          <Icon className="w-5 h-5 text-[#265197]" name="Eye" />
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="flat" size="sm" className="!p-1 !min-w-0 hover:!bg-transparent">
              <Icon className="text-[#265197] w-5 h-5" name="EllipsisVertical" />
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
            <DropdownItem key="edit">
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
