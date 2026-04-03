import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Switch } from "@heroui/switch";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Button, Icon } from "citrica-ui-toolkit";
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
      <div
        className="relative flex justify-end items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Dropdown>
          <DropdownTrigger>
            <Button isAdmin={true} isIconOnly variant="flat" size="sm" className="!p-1 !min-w-0 hover:!bg-transparent">
              <Icon className="text-[#265197] w-5 h-5" name="EllipsisVertical" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Acciones servicio"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(service);
                  break;
                case "delete":
                  onDelete(service);
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
