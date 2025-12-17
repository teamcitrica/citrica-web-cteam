"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import ProjectFormModal from "./components/project-form-modal";
import ProjectDetailModal from "./components/project-detail-modal";
import DeleteProjectModal from "./components/delete-project-modal";
import ManageUsersDrawer from "./components/manage-users-drawer";

import { useProjectCRUD, Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { getProjectColumns } from "./columns/project-columns";
import { Col, Container } from "@/styles/07-objects/objects";

export default function ProyectosPage() {
  const router = useRouter();
  const { projects, isLoading, refreshProjects, deleteProject } = useProjectCRUD();
  const { companies } = useCompanyCRUD();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isManageUsersDrawerOpen, setIsManageUsersDrawerOpen] = useState(false);
  const [projectToManageUsers, setProjectToManageUsers] = useState<Project | null>(null);

  // Crear mapas de conteos a partir de los proyectos
  const assetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((project) => {
      counts[project.id] = project.asset_count || 0;
    });
    return counts;
  }, [projects]);

  const accessCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((project) => {
      counts[project.id] = project.access_count || 0;
    });
    return counts;
  }, [projects]);

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

  const handleManageUsers = useCallback((project: Project) => {
    setProjectToManageUsers(project);
    setIsManageUsersDrawerOpen(true);
  }, []);

  const handleCloseManageUsers = useCallback(() => {
    setIsManageUsersDrawerOpen(false);
    setProjectToManageUsers(null);
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
        onManageUsers: handleManageUsers,
        onNavigateToAssets: handleNavigateToAssets,
        assetCounts,
        accessCounts,
      }),
    [getCompanyName, handleViewProject, handleEditProject, handleDeleteProject, handleManageUsers, handleNavigateToAssets, assetCounts, accessCounts]
  );

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="">
          <h1 className="text-2xl font-bold text-[#265197] mb-5">
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
            showCompanyFilter={true}
            companies={companies}
            companyFilterField="company_id"
            companyFilterPlaceholder="Filtrar por empresa"
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

          {isManageUsersDrawerOpen && projectToManageUsers && (
            <ManageUsersDrawer
              isOpen={isManageUsersDrawerOpen}
              project={projectToManageUsers}
              onClose={handleCloseManageUsers}
              onSuccess={refreshProjects}
            />
          )}
        </div>
      </Col>
    </Container>
  );
}
