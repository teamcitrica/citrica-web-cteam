import { Tooltip } from "@heroui/tooltip";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Icon } from "citrica-ui-toolkit";

import type { ContractedService } from "../types";
import { RECURRENCE_LABELS, STATUS_LABELS } from "../types";

type ContractedServiceColumnsConfig = {
  onEdit: (item: ContractedService) => void;
  onDelete: (item: ContractedService) => void;
};

const formatAmount = (amount: number) => {
  return `S/. ${amount.toFixed(2)}`;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getContractedServiceColumns = ({
  onEdit,
  onDelete,
}: ContractedServiceColumnsConfig): Column<ContractedService>[] => [
  {
    name: "CLIENTE Y EMPRESA",
    uid: "client_company",
    sortable: true,
    render: (item) => (
      <div className="flex flex-col gap-0.5">
        <Text color="#1F2937" variant="label" weight="bold">
          {item.contact_name}
        </Text>
        <Text color="#678CC5" variant="label">
          {item.company_name}
        </Text>
      </div>
    ),
  },
  {
    name: "SERVICIO",
    uid: "service",
    render: (item) => (
      <div className="flex flex-col gap-0.5">
        <Text color="#1F2937" variant="label" weight="bold">
          {item.service_name}
        </Text>
        <Text color="#678CC5" variant="label">
          {item.service_type_name}
        </Text>
      </div>
    ),
  },
  {
    name: "MONTO Y RECURRENCIA",
    uid: "amount_recurrence",
    render: (item) => (
      <div className="flex flex-col gap-0.5">
        <Text color="#374151" variant="label" weight="bold">
          {formatAmount(item.amount)}
        </Text>
        <Text color="#678CC5" variant="label">
          {RECURRENCE_LABELS[item.recurrence]} x {item.periods}
        </Text>
      </div>
    ),
  },
  {
    name: "VIGENCIA",
    uid: "dates",
    render: (item) => (
      <div className="flex flex-col gap-0.5">
        <Text color="#1F2937" variant="label" weight="bold">
          {formatDate(item.start_date)}
        </Text>
        <Text color="#678CC5" variant="label">
          {formatDate(item.end_date)}
        </Text>
      </div>
    ),
  },
  {
    name: "ESTADO",
    uid: "status",
    render: (item) => (
      <Chip
        color={item.status === "al_dia" ? "success" : "danger"}
        size="sm"
        variant="flat"
      >
        {STATUS_LABELS[item.status]}
      </Chip>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    align: "end",
    render: (item) => (
      <div className="relative flex justify-end items-center gap-2">
        <Tooltip content="Ver detalle">
          <button
            className="text-lg cursor-pointer active:opacity-50 text-default-400 hover:text-blue-500"
          >
            <Icon name="Eye" size={20} />
          </button>
        </Tooltip>
        <Tooltip content="Editar">
          <button
            className="text-lg cursor-pointer active:opacity-50 text-default-400 hover:text-blue-500"
            onClick={() => onEdit(item)}
          >
            <Icon name="Edit" size={20} />
          </button>
        </Tooltip>
        <Dropdown shouldBlockScroll={false}>
          <DropdownTrigger>
            <button className="text-lg cursor-pointer active:opacity-50 text-default-400">
              <Icon name="MoreVertical" size={20} />
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Acciones servicio contratado"
            onAction={(key) => {
              if (key === "delete") onDelete(item);
            }}
          >
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Icon name="Trash2" size={16} />}
            >
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  },
];
