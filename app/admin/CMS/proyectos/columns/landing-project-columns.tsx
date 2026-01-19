import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { LandingProject } from "@/hooks/landing-projects/use-landing-projects";
import Icon from "@ui/atoms/icon";
import { Text, Button } from "citrica-ui-toolkit";

type LandingProjectColumnsConfig = {
  onView: (project: LandingProject) => void;
  onEdit: (project: LandingProject) => void;
  onDelete: (project: LandingProject) => void;
};

export const getLandingProjectColumns = ({
  onView,
  onEdit,
  onDelete,
}: LandingProjectColumnsConfig): Column<LandingProject>[] => [
  {
    name: "PROYECTO",
    uid: "hero_title",
    sortable: true,
    render: (project) => {
      return (
        <div className="flex items-center gap-3">
          {project.hero_image && (
            <img
              src={project.hero_image}
              alt={project.hero_title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Text variant="body" weight="bold" color="#16305A">{project.hero_title}</Text>
              {project.featured && (
                <Icon name="Star" className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <Text variant="label" color="#678CC5">{project.hero_category}</Text>
          </div>
        </div>
      );
    },
  },
  {
    name: "SLUG",
    uid: "slug",
    sortable: true,
    render: (project) => (
      <div className="flex flex-col">
        <Text variant="body" color="#16305A">/projects/{project.slug}</Text>
      </div>
    ),
  },
  {
    name: "SERVICIOS",
    uid: "services",
    sortable: false,
    render: (project) => (
      <Text variant="body" color="#16305A">{project.services?.length || 0}</Text>
    ),
  },
  {
    name: "TECNOLOGÍAS",
    uid: "technologies",
    sortable: false,
    render: (project) => (
      <Text variant="body" color="#16305A">{project.technologies?.length || 0}</Text>
    ),
  },
  {
    name: "ESTADO",
    uid: "is_active",
    sortable: true,
    render: (project) => {
      const isActive = project.is_active;
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
              backgroundColor: isActive ? "#10E5A4" : "#6B7280",
            }}
          />
          <span style={{ color: "#1F2937", fontSize: "14px", fontWeight: "500" }}>
            {isActive ? "Activo" : "Inactivo"}
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
          className="hover:!bg-transparent !p-1 !min-w-0"
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
                case "delete":
                  onDelete(project);
                  break;
              }
            }}
          >
            <DropdownItem key="edit">Editar</DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger">
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  },
];
