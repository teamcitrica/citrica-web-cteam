import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Button, Icon } from "citrica-ui-toolkit";

import type { ContractedService } from "@/hooks/contracted-services/use-contracted-services";
import { RECURRENCE_LABELS, STATUS_LABELS } from "../types";

import type { Recurrence, PaymentStatus } from "../types";

type ContractedServiceColumnsConfig = {
  onEdit: (item: ContractedService) => void;
  onDelete: (item: ContractedService) => void;
  onViewDetail: (item: ContractedService) => void;
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
  onViewDetail,
}: ContractedServiceColumnsConfig): Column<ContractedService>[] => [
  {
    name: "CLIENTE Y EMPRESA",
    uid: "client_company",
    sortable: true,
    render: (item) => (
      <div className="flex flex-col gap-0.5">
        <Text color="#1F2937" variant="label" weight="bold">
          {`${item.contact?.name || ""} ${item.contact?.last_name || ""}`.trim() || "Sin contacto"}
        </Text>
        <Text color="#678CC5" variant="label">
          {item.company?.name || "Sin empresa"}
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
          {RECURRENCE_LABELS[item.recurrence as Recurrence]} {item.is_indefinite ? "· Indefinido" : `x ${item.periods}`}
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
          {item.is_indefinite || !item.end_date ? "Indefinido" : formatDate(item.end_date)}
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
        {STATUS_LABELS[item.status as PaymentStatus]}
      </Chip>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    align: "end",
    render: (item) => (
      <div
        className="relative flex justify-end items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          isAdmin={true}
          isIconOnly
          variant="flat"
          className="hover:!bg-transparent !p-1 !min-w-0"
          onPress={() => onViewDetail(item)}
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
            aria-label="Acciones servicio contratado"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(item);
                  break;
                case "delete":
                  onDelete(item);
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
