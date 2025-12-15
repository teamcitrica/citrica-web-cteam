"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

import ProjectFormModal from "./components/project-form-modal";
import ProjectDetailModal from "./components/project-detail-modal";
import DeleteProjectModal from "./components/delete-project-modal";

import { useProjectCRUD, Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useSupabase } from "@/shared/context/supabase-context";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { getProjectColumns } from "./columns/project-columns";
import { Col, Container } from "@/styles/07-objects/objects";

export default function ProyectosPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { projects, isLoading, refreshProjects, deleteProject } = useProjectCRUD();
  const { companies } = useCompanyCRUD();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [assetCounts, setAssetCounts] = useState<Record<string, number>>({});
  const [accessCounts, setAccessCounts] = useState<Record<string, number>>({});

  // Cargar conteos de assets y accesos cuando los proyectos cambien
  useEffect(() => {
    if (projects.length === 0) return; // No cargar si no hay proyectos

    const loadCounts = async () => {
      // Obtener conteo de assets por proyecto
      const { data: assetsData } = await supabase
        .from("assets")
        .select("project_id");

      if (assetsData) {
        const counts: Record<string, number> = {};
        assetsData.forEach((asset) => {
          if (asset.project_id) {
            counts[asset.project_id] = (counts[asset.project_id] || 0) + 1;
          }
        });
        setAssetCounts(counts);
      }

      // Obtener conteo de accesos por proyecto
      const { data: accessData } = await supabase
        .from("proyect_acces")
        .select("project_id");

      if (accessData) {
        const counts: Record<string, number> = {};
        accessData.forEach((access) => {
          if (access.project_id) {
            counts[access.project_id] = (counts[access.project_id] || 0) + 1;
          }
        });
        setAccessCounts(counts);
      }
    };

    loadCounts();
  }, [supabase, projects]); // Agregar projects como dependencia

  const getCompanyName = useCallback((companyId: number | null) => {
    if (!companyId) return "-";
    if (companies.length === 0) return "Cargando..."; // Empresas aún no han cargado
    const company = companies.find(c => c.id === companyId);
    return company?.name || "-";
  }, [companies]);

  const handleOpenCreateModal = () => {
    setFormMode("create");
    setSelectedProject(null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedProject(null);
  };

  const handleFormSuccess = () => {
    refreshProjects();
  };

  const handleViewProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setFormMode("edit");
    setSelectedProject(project);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteProject = useCallback((project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete.id);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
    }
  }, [projectToDelete, deleteProject]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  }, []);

  const handleNavigateToAssets = useCallback((projectId: string) => {
    router.push(`/admin/crm/proyectos/${projectId}/assets`);
  }, [router]);

  const columns = useMemo(
    () =>
      getProjectColumns({
        getCompanyName,
        onView: handleViewProject,
        onEdit: handleEditProject,
        onDelete: handleDeleteProject,
        onNavigateToAssets: handleNavigateToAssets,
        assetCounts,
        accessCounts,
      }),
    [getCompanyName, handleViewProject, handleEditProject, handleDeleteProject, handleNavigateToAssets, assetCounts, accessCounts]
  );

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-[#265197] mb-6">
            <span className="text-[#678CC5]">CRM</span> {'>'} Gestión de Proyectos
          </h1>

          <DataTable<Project>
            data={projects}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Buscar proyectos..."
            searchFields={["name", "status", "tabla"]}
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Proyecto"
            emptyContent="No se encontraron proyectos"
            headerColor="#42668A"
            headerTextColor="#ffffff"
            paginationColor="#42668A"
            getRowKey={(project) => project.id}
          />

          <ProjectFormModal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            onSuccess={handleFormSuccess}
            mode={formMode}
            project={formMode === "edit" ? selectedProject || undefined : undefined}
          />

          {isDetailModalOpen && selectedProject && (
            <ProjectDetailModal
              project={selectedProject}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedProject(null);
              }}
            />
          )}

          {isDeleteModalOpen && projectToDelete && (
            <DeleteProjectModal
              project={projectToDelete}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
        </div>
      </Col>
    </Container>
  );
}
