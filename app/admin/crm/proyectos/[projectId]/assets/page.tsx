"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import AssetFormModal from "./components/asset-form-modal";
import AssetDetailModal from "./components/asset-detail-modal";
import DeleteAssetModal from "./components/delete-asset-modal";

import { useAssetCRUD, Asset } from "@/hooks/assets/use-assets";
import { useProjectCRUD } from "@/hooks/projects/use-projects";
import { useSupabase } from "@/shared/context/supabase-context";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { getAssetColumns } from "./columns/asset-columns";
import { Col, Container } from "@/styles/07-objects/objects";
import { Button } from "@heroui/react";
import Icon from "@ui/atoms/icon";

export default function AssetsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { supabase } = useSupabase();
  const { deleteAsset, isLoading } = useAssetCRUD();
  const { fetchProjectById } = useProjectCRUD();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const refreshAssets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAssets(data);
      }
    } catch (err) {
      console.error("Error al cargar assets:", err);
    }
  }, [supabase, projectId]);

  // Cargar proyecto y assets
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);

      try {
        // Cargar información del proyecto
        const project = await fetchProjectById(projectId);
        if (project) {
          setProjectName(project.name || "Sin nombre");
        }

        // Cargar assets del proyecto
        const { data, error } = await supabase
          .from("assets")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setAssets(data);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleOpenCreateModal = () => {
    setFormMode("create");
    setSelectedAsset(null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = async () => {
    setIsFormModalOpen(false);
    setSelectedAsset(null);
    await refreshAssets();
  };

  const handleViewAsset = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditAsset = useCallback((asset: Asset) => {
    setFormMode("edit");
    setSelectedAsset(asset);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteAsset = useCallback((asset: Asset) => {
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!assetToDelete) return;

    try {
      await deleteAsset(assetToDelete.id);
      setIsDeleteModalOpen(false);
      setAssetToDelete(null);
      await refreshAssets();
    } catch (error) {
      console.error("Error al eliminar asset:", error);
    }
  }, [assetToDelete, deleteAsset]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setAssetToDelete(null);
  }, []);

  const handleBackToProjects = () => {
    router.push("/admin/crm/proyectos");
  };

  const columns = useMemo(
    () =>
      getAssetColumns({
        onView: handleViewAsset,
        onEdit: handleEditAsset,
        onDelete: handleDeleteAsset,
      }),
    [handleViewAsset, handleEditAsset, handleDeleteAsset]
  );

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <Button
              isIconOnly
              variant="light"
              onPress={handleBackToProjects}
              className="text-[#265197]"
            >
              <Icon name="ChevronLeft" className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-[#265197]">
              <span className="text-[#678CC5]">CRM</span> {'>'}{" "}
              <span className="text-[#678CC5]">Proyectos</span> {'>'} {projectName}
            </h1>
          </div>

          <DataTable<Asset>
            data={assets}
            columns={columns}
            isLoading={isLoadingData || isLoading}
            searchPlaceholder="Buscar assets..."
            searchFields={["name", "tabla"]}
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Asset"
            emptyContent="No se encontraron assets para este proyecto"
            headerColor="#42668A"
            headerTextColor="#ffffff"
            paginationColor="#42668A"
            getRowKey={(asset) => asset.id}
          />

          <AssetFormModal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            mode={formMode}
            asset={formMode === "edit" ? selectedAsset || undefined : undefined}
            projectId={projectId}
          />

          {isDetailModalOpen && selectedAsset && (
            <AssetDetailModal
              asset={selectedAsset}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedAsset(null);
              }}
            />
          )}

          {isDeleteModalOpen && assetToDelete && (
            <DeleteAssetModal
              asset={assetToDelete}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
        </div>
      </Col>
    </Container>
  );
}
