"use client";
import { useEffect, useState } from "react";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { useSupabase } from "@/shared/context/supabase-context";
import { useUserAssets } from "@/hooks/user-assets/use-user-assets";
import { Select, SelectItem, Spinner } from "@heroui/react";

interface ExternalTableData {
  [key: string]: any;
}

export default function MisDatosPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [tableData, setTableData] = useState<ExternalTableData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [columns, setColumns] = useState<any[]>([]);
  const { supabase } = useSupabase();
  // Obtener el usuario actual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    getCurrentUser();
  }, []);

  // Obtener los assets del usuario
  const { assets, isLoading: isLoadingAssets } = useUserAssets(currentUser?.id);

  // Auto-seleccionar el primer asset si solo hay uno
  useEffect(() => {
    if (assets.length === 1 && !selectedAssetId) {
      setSelectedAssetId(assets[0].id);
    }
  }, [assets, selectedAssetId]);

  // Cargar datos de la tabla externa cuando se selecciona un asset
  useEffect(() => {
    const fetchExternalData = async () => {
      if (!selectedAssetId) {
        setTableData([]);
        setColumns([]);
        return;
      }

      const selectedAsset = assets.find((a) => a.id === selectedAssetId);
      if (!selectedAsset) return;

      if (
        !selectedAsset.supabase_url ||
        !selectedAsset.supabase_anon_key ||
        !selectedAsset.tabla
      ) {
        console.error("Asset incompleto:", selectedAsset);
        return;
      }

      try {
        setIsLoadingData(true);

        const cleanUrl = selectedAsset.supabase_url.replace(/\/$/, "");
        const columnsToSelect = selectedAsset.assets_options?.columns || ["*"];
        const selectQuery = columnsToSelect.join(",");

        // Fetch de la tabla externa
        const response = await fetch(
          `${cleanUrl}/rest/v1/${selectedAsset.tabla}?select=${selectQuery}`,
          {
            method: "GET",
            headers: {
              apikey: selectedAsset.supabase_anon_key,
              Authorization: `Bearer ${selectedAsset.supabase_anon_key}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setTableData(data || []);

        // Generar columnas dinámicamente
        if (data && data.length > 0) {
          const dynamicColumns = columnsToSelect.map((col) => ({
            name: col.toUpperCase().replace(/_/g, " "),
            uid: col,
            sortable: true,
            render: (row: ExternalTableData) => {
              const value = row[col];

              // Formatear fechas
              if (col.includes("_at") || col.includes("date")) {
                if (value) {
                  return (
                    <div className="text-black font-medium">
                      {new Date(value).toLocaleString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  );
                }
                return <div className="text-black font-medium">-</div>;
              }

              // Formatear valores nulos
              if (value === null || value === undefined) {
                return <div className="text-black font-medium">-</div>;
              }

              // Formatear booleanos
              if (typeof value === "boolean") {
                return (
                  <div className="text-black font-medium">
                    {value ? "Sí" : "No"}
                  </div>
                );
              }

              // Formatear objetos/arrays como JSON
              if (typeof value === "object") {
                return (
                  <div className="text-black font-medium">
                    {JSON.stringify(value)}
                  </div>
                );
              }

              return (
                <div className="text-black font-medium">{String(value)}</div>
              );
            },
          }));

          setColumns(dynamicColumns);
        }
      } catch (err: any) {
        console.error("Error al obtener datos de la tabla externa:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExternalData();
  }, [selectedAssetId, assets]);

  if (isLoadingAssets) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Mis Datos</h1>
        <p className="text-gray-600">
          No tienes acceso a ningún proyecto o asset en este momento.
        </p>
      </div>
    );
  }

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mis Datos</h1>

      {/* Selector de Asset si hay múltiples */}
      {assets.length > 1 && (
        <div className="mb-6 max-w-md">
          <Select
            label="Selecciona un conjunto de datos"
            placeholder="Selecciona un asset"
            selectedKeys={selectedAssetId ? [selectedAssetId] : []}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            classNames={{
              label: "text-gray-700",
              value: "text-gray-800",
            }}
          >
            {assets.map((asset) => (
              <SelectItem key={asset.id}>
                {asset.name || "Sin nombre"} - {asset.project_name || "Sin proyecto"}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* Título del asset seleccionado */}
      {selectedAsset && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedAsset.name || "Sin nombre"}
          </h2>
          <p className="text-sm text-gray-600">
            Proyecto: {selectedAsset.project_name || "Sin proyecto"}
          </p>
        </div>
      )}

      {/* Tabla de datos */}
      {isLoadingData ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : selectedAssetId && tableData.length > 0 ? (
        <DataTable
          data={tableData}
          columns={columns}
          paginationColor="#42668A"
          headerColor="#42668A"
          searchPlaceholder="Buscar..."
          getRowKey={(item) => item.id || JSON.stringify(item)}
          searchFields={columns.map(col => col.uid as any)}
        />
      ) : selectedAssetId ? (
        <p className="text-gray-600">No hay datos disponibles en esta tabla.</p>
      ) : (
        <p className="text-gray-600">Selecciona un conjunto de datos para visualizar.</p>
      )}
    </div>
  );
}
