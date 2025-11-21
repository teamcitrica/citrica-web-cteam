import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Project } from "@/hooks/projects/use-projects";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import Icon from "@ui/atoms/icon";

type ProjectColumnsConfig = {
  getCompanyName: (companyId: number | null) => string;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
};

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

export const getProjectColumns = ({
  getCompanyName,
  onView,
  onEdit,
  onDelete,
}: ProjectColumnsConfig): Column<Project>[] => [
  {
    name: "PROYECTO",
    uid: "name",
    sortable: true,
    render: (project) => {
      const name = project.name || "Sin nombre";
      const color = stringToColor(name);
      const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <Avatar
            name={initials}
            size="sm"
            style={{ backgroundColor: color, color: "white" }}
            classNames={{
              base: "flex-shrink-0",
              name: "text-xs font-semibold",
            }}
          />
          <div className="text-[#16305A] font-medium">{name}</div>
        </div>
      );
    },
  },
  {
    name: "EMPRESA",
    uid: "company_id",
    sortable: true,
    render: (project) => (
      <div className="text-[#16305A]">{getCompanyName(project.company_id)}</div>
    ),
  },
  {
    name: "TABLA",
    uid: "tabla",
    sortable: true,
    render: (project) => (
      <div className="text-[#16305A]">{project.tabla || "-"}</div>
    ),
  },
  {
    name: "ESTADO",
    uid: "status",
    sortable: true,
    render: (project) => (
      <div className="text-[#16305A] capitalize">{project.status || "-"}</div>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    sortable: false,
    render: (project) => (
      <div className="flex justify-center">
        <Dropdown>
          <DropdownTrigger>
            <button className="text-[#678CC5] hover:text-[#16305A] transition-colors">
              <Icon className="w-5 h-5" name="EllipsisVertical" />
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Acciones del proyecto">
            <DropdownItem
              key="view"
              startContent={<Icon className="w-4 h-4" name="Eye" />}
              onPress={() => onView(project)}
            >
              Ver detalles
            </DropdownItem>
            <DropdownItem
              key="edit"
              startContent={<Icon className="w-4 h-4" name="SquarePen" />}
              onPress={() => onEdit(project)}
            >
              Editar
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Icon className="w-4 h-4" name="Trash2" />}
              onPress={() => onDelete(project)}
            >
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  },
];
