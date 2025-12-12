"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { useSupabase } from "@/shared/context/supabase-context";
import { useUserAssets } from "@/hooks/user-assets/use-user-assets";
import { Spinner } from "@heroui/react";
import { Col, Container } from "@/styles/07-objects/objects";

interface ExternalTableData {
  [key: string]: any;
}

export default function AssetDataPage() {
  const params = useParams();
  const assetId = params.assetId as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
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
  }, [supabase]);

  // Obtener los assets del usuario
  const { assets, isLoading: isLoadingAssets } = useUserAssets(currentUser?.id);

  // Cargar datos de la tabla externa cuando se tiene el assetId
  useEffect(() => {
    const fetchExternalData = async () => {
      if (!assetId || !assets.length) {
        setTableData([]);
        setColumns([]);
        return;
      }

      const selectedAsset = assets.find((a) => a.id === assetId);
      if (!selectedAsset) {
        console.error("Asset no encontrado");
        return;
      }

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
  }, [assetId, assets, supabase]);

  const selectedAsset = assets.find((a) => a.id === assetId);
  const isLoading = isLoadingAssets || !currentUser || isLoadingData;

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-[#265197] mb-6">
            Mis Datos
          </h1>

          {/* Título del asset seleccionado */}
          {selectedAsset && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#265197]">
                {selectedAsset.name || "Sin nombre"}
              </h2>
              <p className="text-sm text-[#678CC5]">
                Proyecto: {selectedAsset.project_name || "Sin proyecto"}
              </p>
            </div>
          )}

          {/* Mostrar mensaje de error si no existe el asset */}
          {!isLoading && !selectedAsset ? (
            <p className="text-gray-600">
              El asset seleccionado no existe o no tienes acceso a él.
            </p>
          ) : (
            /* Tabla de datos */
            <DataTable
              data={tableData}
              columns={columns.length > 0 ? columns : [{ name: "CARGANDO", uid: "loading", sortable: false }]}
              isLoading={isLoading}
              paginationColor="#42668A"
              headerColor="#42668A"
              headerTextColor="#ffffff"
              searchPlaceholder="Buscar..."
              getRowKey={(item) => item.id || JSON.stringify(item)}
              searchFields={columns.map(col => col.uid as any)}
              emptyContent="No hay datos disponibles en esta tabla."
            />
          )}
        </div>
      </Col>
    </Container>
  );
}
