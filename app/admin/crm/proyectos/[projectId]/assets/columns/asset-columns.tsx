import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Asset } from "@/hooks/assets/use-assets";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import Icon from "@ui/atoms/icon";

type AssetColumnsConfig = {
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
};

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

      return (
        <div className="text-[#16305A] font-medium">{name}</div>
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
              onPress={() => onEdit(asset)}
            >
              Editar
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
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
