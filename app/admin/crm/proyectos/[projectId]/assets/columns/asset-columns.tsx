import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Asset } from "@/hooks/assets/use-assets";
import { Button, Icon } from "citrica-ui-toolkit";

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
    align: "end",
    render: (asset) => (
      <div
        className="relative flex justify-end items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          isAdmin={true}
          isIconOnly
          variant="flat"
          onPress={() => onView(asset)}
          className=" hover:!bg-transparent !p-1 !min-w-0"
        >
          <Icon className="w-5 h-5 text-[#265197]" name="Eye" />
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button isAdmin={true} isIconOnly variant="flat" size="sm" className="!p-1 !min-w-0 hover:!bg-transparent">
              <Icon className="text-[#265197] w-5 h-5" name="EllipsisVertical" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Acciones del asset"
            onAction={(key) => {
              switch (key) {
                case "edit":
                  onEdit(asset);
                  break;
                case "delete":
                  onDelete(asset);
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
