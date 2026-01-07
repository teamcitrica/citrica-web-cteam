import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Project } from "@/hooks/projects/use-projects";
import Icon from "@ui/atoms/icon";
import { Text, Button } from "citrica-ui-toolkit";

type ProjectColumnsConfig = {
  getCompanyName: (companyId: number | null) => string;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onManageUsers: (project: Project) => void;
  onNavigateToAssets?: (projectId: string) => void;
  assetCounts: Record<string, number>;
  accessCounts: Record<string, number>;
};

export const getProjectColumns = ({
  getCompanyName,
  onView,
  onEdit,
  onDelete,
  onManageUsers,
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
          className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity items-start"
          onClick={() => onNavigateToAssets?.(project.id)}
        >
          <Text variant="body" weight="bold" color="#16305A">{name}</Text>
          <Text variant="label" color="#678CC5">
            Assets: {assetCount}
          </Text>
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
        <div className="flex flex-col">
          <Text variant="body" weight="bold" color="#16305A">{companyName}</Text>
          <Text variant="label" color="#678CC5">
            Accesos: {accessCount}
          </Text>
        </div>
      );
    },
  },
  {
    name: "ESTATUS",
    uid: "status",
    sortable: true,
    render: (project) => {
      const status = project.status || "abierto";
      const statusConfig: Record<string, { dotColor: string; label: string }> = {
        abierto: { dotColor: "#10E5A4", label: "Abierto" },
        inactivo: { dotColor: "#FF4D4F", label: "Inactivo" },
        cerrado: { dotColor: "#6B7280", label: "Cerrado" },
      };
      const config = statusConfig[status] || { dotColor: "#6B7280", label: status };

      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "91px",
            height: "24px",
            borderRadius: "16px",
            border: "1.5px solid #A7BDE2",
            backgroundColor: "#F9FAFB",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: config.dotColor,
            }}
          />
          <span style={{ color: "#1F2937", fontSize: "14px", fontWeight: "500" }}>
            {config.label}
          </span>
        </div>
      );
    },
  },
  {
    name: "ACCIONES",
    uid: "actions",
    sortable: false,
    align: "end",
    render: (project) => (
      <div
        className="relative flex justify-end items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          isIconOnly
          variant="flat"
          onPress={() => onView(project)}
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
            aria-label="Acciones del proyecto"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(project);
                  break;
                case "manageUsers":
                  onManageUsers(project);
                  break;
                case "delete":
                  onDelete(project);
                  break;
              }
            }}
          >
            <DropdownItem key="edit">
              Editar
            </DropdownItem>
            <DropdownItem key="manageUsers">
              Gestionar Usuarios
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
