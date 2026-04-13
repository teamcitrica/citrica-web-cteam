import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Button, Icon } from "citrica-ui-toolkit";
import type { ServiceType } from "@/hooks/services/use-service-types";

type ServiceTypeColumnsConfig = {
  onEdit: (type: ServiceType) => void;
  onDelete: (type: ServiceType) => void;
};

export const getServiceTypeColumns = ({
  onEdit,
  onDelete,
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
    align: "center",
    render: (type) => (
      <Text color="#4B5563" variant="label">
        {type.description || "-"}
      </Text>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    align: "end",
    render: (type) => (
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
            aria-label="Acciones tipo de servicio"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(type);
                  break;
                case "delete":
                  onDelete(type);
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
