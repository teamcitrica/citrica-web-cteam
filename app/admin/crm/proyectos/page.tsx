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
import { Text } from "citrica-ui-toolkit";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";
import { Divider } from "@heroui/react";
import { createUsers } from "@/public/icon-svg/create-users";

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
  const [statusFilter, setStatusFilter] = useState<string>("abiertos");

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

  // Filtrar proyectos por estado
  const filteredProjects = useMemo(() => {
    if (statusFilter === "abiertos") {
      return projects.filter((project) => project.status === "abierto");
    } else if (statusFilter === "inactivos") {
      return projects.filter((project) => project.status === "inactivo");
    } else if (statusFilter === "cerrados") {
      return projects.filter((project) => project.status === "cerrado");
    }
    return projects;
  }, [projects, statusFilter]);

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
          <h1 className="text-2xl font-bold text-[#265197] mb-4">
            <Text variant="title" weight="bold" color="#678CC5">CRM</Text> {'>'}  <Text variant="title" weight="bold" color="#265197">Proyectos</Text>
          </h1>

          <DataTable<Project>
            data={filteredProjects}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Buscar proyectos..."
            searchFields={["name", "status", "tabla"]}
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Proyecto"
            addButtonIcon={createUsers()}
            emptyContent="No se encontraron proyectos"
            headerColor="#265197"
            headerTextColor="#ffffff"
            paginationColor="#265197"
            getRowKey={(project) => project.id}
            showCompanyFilter={true}
            companies={companies}
            companyFilterField="company_id"
            companyFilterPlaceholder="Filtrar por empresa"
            customFilters={
              <div className="w-full flex flex-col">
                <div style={{ width: "245px" }}>
                  <FilterButtonGroup
                    buttons={[
                      { value: "abiertos", label: "Abiertos" },
                      { value: "inactivos", label: "Inactivos" },
                      { value: "cerrados", label: "Cerrados" },
                    ]}
                    selectedValue={statusFilter}
                    onValueChange={setStatusFilter}
                    height="38px"
                  />
                </div>
                <Divider className="bg-[#D4DEED] mt-3"/>
              </div>
            }
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
