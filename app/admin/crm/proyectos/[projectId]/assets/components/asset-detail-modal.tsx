"use client";
import { Asset } from "@/hooks/assets/use-assets";
import { DetailModal } from "@/shared/components/citrica-ui";

interface AssetDetailModalProps {
  asset: Asset;
  onClose: () => void;
}

export default function AssetDetailModal({
  asset,
  onClose,
}: AssetDetailModalProps) {
  const sections = [
    {
      title: "Datos del Asset",
      content: (
        <div className="flex flex-col">
          <div className="flex">
            <p className="text-sm text-[#265197]">Nombre: {asset.name || "-"}</p>
          </div>
          <div className="flex">
            <p className="text-sm text-[#265197]">Tabla: {asset.tabla || "-"}</p>
          </div>
          <div className="flex">
            <p className="text-sm text-[#265197] break-all">
              Supabase URL: {asset.supabase_url || "-"}
            </p>
          </div>
          <div className="flex">
            <p className="text-sm text-[#265197] break-all font-mono">
              Supabase Anon Key: {asset.supabase_anon_key || "-"}
            </p>
          </div>
          {asset.created_at && (
            <div className="flex">
              <p className="text-sm text-[#265197]">
                Fecha de Creación: {new Date(asset.created_at).toLocaleDateString("es-PE")}
              </p>
            </div>
          )}
          {asset.updated_at && (
            <div className="flex">
              <p className="text-sm text-[#265197]">
                Última Actualización: {new Date(asset.updated_at).toLocaleDateString("es-PE")}
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <DetailModal
      isOpen={true}
      onClose={onClose}
      title={asset.name || "Sin nombre"}
      sections={sections}
    />
  );
}
