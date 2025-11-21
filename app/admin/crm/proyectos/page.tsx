"use client";
import { useState, useCallback, useMemo } from "react";

import ProjectFormModal from "./components/project-form-modal";
import ProjectDetailModal from "./components/project-detail-modal";
import DeleteProjectModal from "./components/delete-project-modal";

import { useProjectCRUD, Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { getProjectColumns } from "./columns/project-columns";
import { Col, Container } from "@/styles/07-objects/objects";

export default function ProyectosPage() {
  const { projects, isLoading, refreshProjects, deleteProject } = useProjectCRUD();
  const { companies } = useCompanyCRUD();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const getCompanyName = useCallback((companyId: number | null) => {
    if (!companyId) return "-";
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

  const columns = useMemo(
    () =>
      getProjectColumns({
        getCompanyName,
        onView: handleViewProject,
        onEdit: handleEditProject,
        onDelete: handleDeleteProject,
      }),
    [getCompanyName, handleViewProject, handleEditProject, handleDeleteProject]
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
