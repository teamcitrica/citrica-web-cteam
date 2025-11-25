"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Asset } from "@/hooks/assets/use-assets";

interface AssetDetailModalProps {
  asset: Asset;
  onClose: () => void;
}

export default function AssetDetailModal({
  asset,
  onClose,
}: AssetDetailModalProps) {
  const formatAssetsOptions = () => {
    if (!asset.assets_options) return "-";
    try {
      return JSON.stringify(asset.assets_options, null, 2);
    } catch (e) {
      return "-";
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Detalles del Asset
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Nombre</p>
              <p className="text-gray-800">{asset.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Tabla</p>
              <p className="text-gray-800">{asset.tabla || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-600">Supabase URL</p>
              <p className="text-gray-800 break-all">{asset.supabase_url || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-600">Supabase Anon Key</p>
              <p className="text-gray-800 break-all font-mono text-xs">
                {asset.supabase_anon_key || "-"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-600">Assets Options (Filtros)</p>
              <pre className="text-gray-800 bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto">
                {formatAssetsOptions()}
              </pre>
            </div>
            {asset.created_at && (
              <div>
                <p className="text-sm font-semibold text-gray-600">Fecha de Creación</p>
                <p className="text-gray-800">{new Date(asset.created_at).toLocaleString()}</p>
              </div>
            )}
            {asset.updated_at && (
              <div>
                <p className="text-sm font-semibold text-gray-600">Última Actualización</p>
                <p className="text-gray-800">{new Date(asset.updated_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
