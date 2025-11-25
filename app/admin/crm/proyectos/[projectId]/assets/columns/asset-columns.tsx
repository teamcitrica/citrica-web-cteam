import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Asset } from "@/hooks/assets/use-assets";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import Icon from "@ui/atoms/icon";

type AssetColumnsConfig = {
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
};

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

export const getAssetColumns = ({
  onView,
  onEdit,
  onDelete,
}: AssetColumnsConfig): Column<Asset>[] => [
  {
    name: "ASSET",
    uid: "name",
    sortable: true,
    render: (asset) => {
      const name = asset.name || "Sin nombre";
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
    name: "TABLA",
    uid: "tabla",
    sortable: true,
    render: (asset) => (
      <div className="text-[#16305A]">{asset.tabla || "-"}</div>
    ),
  },
  {
    name: "SUPABASE URL",
    uid: "supabase_url",
    sortable: true,
    render: (asset) => (
      <div className="text-[#16305A] text-xs truncate max-w-[200px]" title={asset.supabase_url || ""}>
        {asset.supabase_url || "-"}
      </div>
    ),
  },
  {
    name: "ACCIONES",
    uid: "actions",
    sortable: false,
    render: (asset) => (
      <div className="relative flex justify-center items-center gap-2">
        <button
          onClick={() => onView(asset)}
          className="text-blue-500 hover:bg-blue-100 p-1 rounded transition-colors"
        >
          <Icon className="w-5 h-5" name="Eye" />
        </button>
        <Dropdown>
          <DropdownTrigger>
            <button className="text-[#678CC5] hover:text-[#16305A] transition-colors p-1">
              <Icon className="w-5 h-5" name="EllipsisVertical" />
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Acciones del asset">
            <DropdownItem
              key="edit"
              startContent={<Icon className="w-4 h-4 text-green-500" name="SquarePen" />}
              onPress={() => onEdit(asset)}
            >
              Editar
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Icon className="w-4 h-4" name="Trash2" />}
              onPress={() => onDelete(asset)}
            >
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  },
];
