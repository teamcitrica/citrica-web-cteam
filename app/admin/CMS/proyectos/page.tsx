"use client";
import { useState, useCallback, useMemo } from "react";
import LandingProjectFormModal from "./components/landing-project-form-modal";
import LandingProjectDetailModal from "./components/landing-project-detail-modal";
import DeleteLandingProjectModal from "./components/delete-landing-project-modal";
import { useLandingProjects, LandingProject } from "@/hooks/landing-projects/use-landing-projects";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { getLandingProjectColumns } from "./columns/landing-project-columns";
import { Text, Col, Container } from "citrica-ui-toolkit";
import FilterDropdown from "@/shared/components/citrica-ui/molecules/filter-dropdown";

export default function CMSProyectosPage() {
  const { projects, isLoading, refreshProjects, deleteProject } = useLandingProjects();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProject, setSelectedProject] = useState<LandingProject | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<LandingProject | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filteredProjects = useMemo(() => {
    if (statusFilter === "activos") {
      return projects.filter((project) => project.is_active);
    } else if (statusFilter === "inactivos") {
      return projects.filter((project) => !project.is_active);
    } else if (statusFilter === "destacados") {
      return projects.filter((project) => project.featured);
    }
    return projects;
  }, [projects, statusFilter]);

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

  const handleViewProject = useCallback((project: LandingProject) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditProject = useCallback((project: LandingProject) => {
    setFormMode("edit");
    setSelectedProject(project);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteProject = useCallback((project: LandingProject) => {
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
      getLandingProjectColumns({
        onView: handleViewProject,
        onEdit: handleEditProject,
        onDelete: handleDeleteProject,
      }),
    [handleViewProject, handleEditProject, handleDeleteProject]
  );

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="">
          <h1 className="text-2xl font-bold text-[#265197] mb-4">
            <Text variant="title" weight="bold" color="#678CC5">CMS</Text> {'>'} <Text variant="title" weight="bold" color="#265197">Proyectos Landing</Text>
          </h1>

          <DataTable<LandingProject>
            data={filteredProjects}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Buscar proyectos..."
            searchFields={["hero_title", "slug", "hero_category"]}
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Proyecto"
            emptyContent="No se encontraron proyectos"
            headerColor="#265197"
            headerTextColor="#ffffff"
            paginationColor="#265197"
            getRowKey={(project) => project.id}
            headerActions={
              <FilterDropdown
                options={[
                  { value: "todos", label: "Todos" },
                  { value: "activos", label: "Activos" },
                  { value: "inactivos", label: "Inactivos" },
                  { value: "destacados", label: "Destacados" },
                ]}
                selectedValue={statusFilter}
                onValueChange={setStatusFilter}
                defaultValue="todos"
              />
            }
          />

          <LandingProjectFormModal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            onSuccess={handleFormSuccess}
            mode={formMode}
            project={formMode === "edit" ? selectedProject || undefined : undefined}
          />

          {isDetailModalOpen && selectedProject && (
            <LandingProjectDetailModal
              project={selectedProject}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedProject(null);
              }}
            />
          )}

          {isDeleteModalOpen && projectToDelete && (
            <DeleteLandingProjectModal
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
