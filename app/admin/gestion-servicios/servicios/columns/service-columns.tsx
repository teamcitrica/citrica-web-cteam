import { Tooltip } from "@heroui/tooltip";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Switch } from "@heroui/switch";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Icon } from "citrica-ui-toolkit";
import type { Service } from "@/hooks/services/use-services";

type ServiceColumnsConfig = {
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
};

const formatAmount = (amount: number) => {
  return `S/. ${amount.toFixed(2)}`;
};

export const getServiceColumns = ({
  onEdit,
  onDelete,
  onToggleActive,
}: ServiceColumnsConfig): Column<Service>[] => [
  {
    name: "NOMBRE",
    uid: "name",
    sortable: true,
    render: (service) => (
      <Text color="#1F2937" variant="label" weight="bold">
        {service.name}
      </Text>
    ),
  },
  {
    name: "TIPO DE SERVICIO",
    uid: "type_id",
    render: (service) => (
      <Text color="#4B5563" variant="label">
        {service.service_type?.name || "Sin tipo"}
      </Text>
    ),
  },
  {
    name: "MONTO REF.",
    uid: "reference_amount",
    render: (service) => (
      <Text color="#374151" variant="label" weight="bold">
        {formatAmount(service.reference_amount)}
      </Text>
    ),
  },
  {
    name: "ESTADO",
    uid: "is_active",
    render: (service) => (
      <Switch
        classNames={{
          base: "group !bg-transparent transition-colors",
          wrapper:
            "bg-gray-300 group-data-[selected=true]:bg-[#265197] rounded-full transition-colors",
          thumb: "!bg-white",
        }}
        color="default"
        isSelected={service.is_active}
        size="sm"
        onChange={() => onToggleActive(service.id, !service.is_active)}
      />
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    align: "end",
    render: (service) => (
      <div className="relative flex justify-end items-center gap-2">
        <Tooltip content="Editar">
          <button
            className="text-lg cursor-pointer active:opacity-50 text-default-400 hover:text-blue-500"
            onClick={() => onEdit(service)}
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
            aria-label="Acciones servicio"
            onAction={(key) => {
              if (key === "delete") onDelete(service);
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
