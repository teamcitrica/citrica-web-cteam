"use client";
import { useState, useCallback } from "react";

import ProjectFormModal from "./components/project-form-modal";
import ProjectDetailModal from "./components/project-detail-modal";
import DeleteProjectModal from "./components/delete-project-modal";

import { useProjectCRUD, Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { DataTable, Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Col, Container } from "@/styles/07-objects/objects";
import Icon from "@ui/atoms/icon";

export default function ProyectosPage() {
  const { projects, isLoading, refreshProjects, deleteProject } = useProjectCRUD();
  const { companies } = useCompanyCRUD();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "-";
    const company = companies.find(c => c.id === companyId);
    return company?.name || "-";
  };

  const columns: Column<Project>[] = [
    {
      name: "NOMBRE",
      uid: "name",
      sortable: true,
      render: (project) => (
        <div className="text-black font-medium">{project.name || "-"}</div>
      ),
    },
    {
      name: "EMPRESA",
      uid: "company_id",
      sortable: true,
      render: (project) => (
        <div className="text-black">{getCompanyName(project.company_id)}</div>
      ),
    },
    {
      name: "TABLA",
      uid: "tabla",
      sortable: true,
      render: (project) => (
        <div className="text-black">{project.tabla || "-"}</div>
      ),
    },
    {
      name: "ESTADO",
      uid: "status",
      sortable: true,
      render: (project) => (
        <div className="text-black capitalize">{project.status || "-"}</div>
      ),
    },
  ];

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

  const renderActions = useCallback(
    (project: Project) => (
      <div className="flex items-end justify-center w-full gap-2">
        <button
          className="text-blue-500 hover:text-blue-700"
          onClick={() => handleViewProject(project)}
        >
          <Icon className="w-5 h-5" name="Eye" />
        </button>
        <button
          className="text-green-500 hover:text-green-700"
          onClick={() => handleEditProject(project)}
        >
          <Icon className="w-5 h-5" name="SquarePen" />
        </button>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => handleDeleteProject(project)}
        >
          <Icon className="w-5 h-5" name="Trash2" />
        </button>
      </div>
    ),
    [handleViewProject, handleEditProject, handleDeleteProject]
  );

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Gestión de Proyectos
          </h1>

          <DataTable<Project>
            data={projects}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Buscar por nombre..."
            searchKey="name"
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Proyecto"
            emptyContent="No se encontraron proyectos"
            headerColor="#42668A"
            headerTextColor="#ffffff"
            paginationColor="#42668A"
            getRowKey={(project) => project.id}
            renderActions={renderActions}
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
