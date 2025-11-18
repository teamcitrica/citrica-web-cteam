"use client";
import { useState, useCallback } from "react";

import CreateCompanyModal from "./components/create-company-modal";
import CompanyDetailModal from "./components/company-detail-modal";
import EditCompanyModal from "./components/edit-company-modal";
import DeleteCompanyModal from "./components/delete-company-modal";

import { useCompanyCRUD, Company } from "@/hooks/companies/use-companies";
import { DataTable, Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Col, Container } from "@/styles/07-objects/objects";
import Icon from "@ui/atoms/icon";

const columns: Column<Company>[] = [
  {
    name: "NOMBRE",
    uid: "name",
    sortable: true,
    render: (company) => (
      <div className="text-black font-medium">{company.name || "-"}</div>
    ),
  },
  {
    name: "RUC",
    uid: "ruc",
    sortable: true,
    render: (company) => (
      <div className="text-black">{company.ruc || "-"}</div>
    ),
  },
  {
    name: "CONTACTO",
    uid: "contact_name",
    sortable: true,
    render: (company) => (
      <div className="text-black">{company.contact_name || "-"}</div>
    ),
  },
  {
    name: "EMAIL",
    uid: "contact_email",
    sortable: false,
    render: (company) => (
      <div className="text-black">{company.contact_email || "-"}</div>
    ),
  },
  {
    name: "TELÉFONO",
    uid: "contact_phone",
    sortable: false,
    render: (company) => (
      <div className="text-black">{company.contact_phone || "-"}</div>
    ),
  },
];

export default function EmpresasPage() {
  const { companies, isLoading, refreshCompanies, deleteCompany } = useCompanyCRUD();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    refreshCompanies();
  };

  const handleViewCompany = useCallback((company: Company) => {
    setSelectedCompany(company);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditCompany = useCallback((company: Company) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteCompany = useCallback((company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!companyToDelete) return;

    try {
      await deleteCompany(companyToDelete.id);
      setIsDeleteModalOpen(false);
      setCompanyToDelete(null);
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
    }
  }, [companyToDelete, deleteCompany]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCompanyToDelete(null);
  }, []);

  const renderActions = useCallback(
    (company: Company) => (
      <div className="flex items-end justify-center w-full gap-2">
        <button
          className="text-blue-500 hover:text-blue-700"
          onClick={() => handleViewCompany(company)}
        >
          <Icon className="w-5 h-5" name="Eye" />
        </button>
        <button
          className="text-green-500 hover:text-green-700"
          onClick={() => handleEditCompany(company)}
        >
          <Icon className="w-5 h-5" name="SquarePen" />
        </button>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => handleDeleteCompany(company)}
        >
          <Icon className="w-5 h-5" name="Trash2" />
        </button>
      </div>
    ),
    [handleViewCompany, handleEditCompany, handleDeleteCompany]
  );

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Gestión de Empresas
          </h1>

          <DataTable<Company>
            data={companies}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Buscar por nombre..."
            searchKey="name"
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Empresa"
            emptyContent="No se encontraron empresas"
            headerColor="#42668A"
            headerTextColor="#ffffff"
            paginationColor="#42668A"
            getRowKey={(company) => company.id}
            renderActions={renderActions}
          />

          <CreateCompanyModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
          />

          {isDetailModalOpen && selectedCompany && (
            <CompanyDetailModal
              company={selectedCompany}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedCompany(null);
              }}
            />
          )}

          {isEditModalOpen && selectedCompany && (
            <EditCompanyModal
              isOpen={isEditModalOpen}
              company={selectedCompany}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedCompany(null);
                refreshCompanies();
              }}
            />
          )}

          {isDeleteModalOpen && companyToDelete && (
            <DeleteCompanyModal
              company={companyToDelete}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
        </div>
      </Col>
    </Container>
  );
}
