import { Tooltip } from "@heroui/tooltip";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Switch } from "@heroui/switch";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Icon } from "citrica-ui-toolkit";
import type { ServiceType } from "@/hooks/services/use-service-types";

type ServiceTypeColumnsConfig = {
  onEdit: (type: ServiceType) => void;
  onDelete: (type: ServiceType) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
};

export const getServiceTypeColumns = ({
  onEdit,
  onDelete,
  onToggleActive,
}: ServiceTypeColumnsConfig): Column<ServiceType>[] => [
  {
    name: "NOMBRE",
    uid: "name",
    sortable: true,
    render: (type) => (
      <Text color="#1F2937" variant="label" weight="bold">
        {type.name}
      </Text>
    ),
  },
  {
    name: "DESCRIPCIÓN",
    uid: "description",
    render: (type) => (
      <Text color="#4B5563" variant="label">
        {type.description || "-"}
      </Text>
    ),
  },
  {
    name: "ESTADO",
    uid: "is_active",
    render: (type) => (
      <Switch
        classNames={{
          base: "group !bg-transparent transition-colors",
          wrapper:
            "bg-gray-300 group-data-[selected=true]:bg-[#265197] rounded-full transition-colors",
          thumb: "!bg-white",
        }}
        color="default"
        isSelected={type.is_active}
        size="sm"
        onChange={() => onToggleActive(type.id, !type.is_active)}
      />
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    align: "end",
    render: (type) => (
      <div className="relative flex justify-end items-center gap-2">
        <Tooltip content="Editar">
          <button
            className="text-lg cursor-pointer active:opacity-50 text-default-400 hover:text-blue-500"
            onClick={() => onEdit(type)}
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
            aria-label="Acciones tipo de servicio"
            onAction={(key) => {
              if (key === "delete") onDelete(type);
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
