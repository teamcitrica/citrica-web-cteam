import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Project } from "@/hooks/projects/use-projects";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
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

// Función para generar un color único basado en el nombre
const getAvatarColor = (name: string): string => {
  const colors = [
    "from-[#FFB457] to-[#FF705B]", // Naranja a rojo
    "from-[#5EA67D] to-[#3E8A5E]", // Verde claro a verde oscuro
    "from-[#5B9FED] to-[#3B7DBD]", // Azul claro a azul oscuro
    "from-[#A78BFA] to-[#7C5CC8]", // Púrpura claro a púrpura oscuro
    "from-[#F472B6] to-[#DB2777]", // Rosa claro a rosa oscuro
    "from-[#FBBF24] to-[#D97706]", // Amarillo a naranja
    "from-[#34D399] to-[#059669]", // Verde esmeralda claro a oscuro
    "from-[#60A5FA] to-[#2563EB]", // Azul cielo a azul
    "from-[#C084FC] to-[#9333EA]", // Lavanda a púrpura
    "from-[#FB923C] to-[#EA580C]", // Naranja melocotón
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Función para obtener las iniciales
const getInitials = (name: string): string => {
  const names = name.trim().split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
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
          className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => onNavigateToAssets?.(project.id)}
        >
          <Avatar
            classNames={{
              base: `bg-gradient-to-br ${getAvatarColor(name)}`,
              icon: "text-white",
            }}
            name={getInitials(name)}
            size="sm"
          />
          <div className="flex flex-col gap-1">
            <div className="text-[#16305A] font-medium">{name}</div>
            <div className="text-[#678CC5] text-sm">
              Assets: {assetCount}
            </div>
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
      const accessCount = accessCounts[project.id] || 0;

      return (
        <div className="flex flex-col gap-1">
          <div className="text-[#16305A] font-medium">{getCompanyName(project.company_id)}</div>
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
              startContent={
                <Icon className="w-4 h-4 text-green-500" name="SquarePen" />
              }
            >
              Editar
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Icon className="w-4 h-4" name="Trash2" />}
            >
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  },
];
