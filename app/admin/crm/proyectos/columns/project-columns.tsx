import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Project } from "@/hooks/projects/use-projects";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
} from "@heroui/react";
import Icon from "@ui/atoms/icon";

type ProjectColumnsConfig = {
  getCompanyName: (companyId: number | null) => string;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onNavigateToAssets?: (projectId: string) => void;
  assetCounts: Record<string, number>;
  accessCounts: Record<string, number>;
};

export const getProjectColumns = ({
  getCompanyName,
  onView,
  onEdit,
  onDelete,
  onNavigateToAssets,
  assetCounts,
  accessCounts,
}: ProjectColumnsConfig): Column<Project>[] => [
  {
    name: "PROYECTO",
    uid: "name",
    sortable: true,
    render: (project) => {
      const name = project.name || "Sin nombre";
      const assetCount = assetCounts[project.id] || 0;

      return (
        <div
          className="flex flex-col gap-1 cursor-pointer hover:opacity-70 transition-opacity items-start"
          onClick={() => onNavigateToAssets?.(project.id)}
        >
          <div className="text-[#16305A] font-medium">{name}</div>
          <div className="text-[#678CC5] text-sm">
            Assets: {assetCount}
          </div>
        </div>
      );
    },
  },
  {
    name: "EMPRESA",
    uid: "company_id",
    sortable: true,
    render: (project) => {
      // Usar access_count del proyecto (viene del hook) o del accessCounts (por compatibilidad)
      const accessCount = project.access_count ?? accessCounts[project.id] ?? 0;
      // Usar la información de empresa que viene con el proyecto (JOIN) o fallback a getCompanyName
      const companyName = project.company?.name || getCompanyName(project.company_id);

      return (
        <div className="flex flex-col gap-1">
          <div className="text-[#16305A] font-medium">{companyName}</div>
          <div className="text-[#678CC5] text-sm">
            Accesos: {accessCount}
          </div>
        </div>
      );
    },
  },
  {
    name: "ESTADO",
    uid: "status",
    sortable: true,
    render: (project) => {
      const status = project.status || "abierto";
      const statusConfig: Record<string, { color: "success" | "warning" | "danger" | "default"; variant: "flat" | "solid" }> = {
        abierto: { color: "success", variant: "flat" },
        inactivo: { color: "warning", variant: "flat" },
        cerrado: { color: "danger", variant: "flat" },
      };
      const config = statusConfig[status] || { color: "default" as const, variant: "flat" as const };

      return (
        <Chip
          color={config.color}
          variant={config.variant}
          size="sm"
          className="capitalize"
        >
          {status}
        </Chip>
      );
    },
  },
  {
    name: "ACCIONES",
    uid: "actions",
    sortable: false,
    render: (project) => (
      <div className="relative flex justify-center items-center gap-2">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => onView(project)}
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
            aria-label="Acciones del proyecto"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(project);
                  break;
                case "delete":
                  onDelete(project);
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
