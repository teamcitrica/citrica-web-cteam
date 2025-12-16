"use client";
import { useState, useCallback, useMemo } from "react";

import CreateCompanyModal from "./components/create-company-modal";
import CompanyDetailModal from "./components/company-detail-modal";
import EditCompanyModal from "./components/edit-company-modal";
import DeleteCompanyModal from "./components/delete-company-modal";
import { getCompanyColumns, getCompanyExportColumns } from "./columns/company-columns";

import { useCompanyCRUD, Company } from "@/hooks/companies/use-companies";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { Col, Container } from "@/styles/07-objects/objects";

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
  };

  const handleCreateSuccess = () => {
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

  const columns = useMemo(
    () =>
      getCompanyColumns({
        onView: handleViewCompany,
        onEdit: handleEditCompany,
        onDelete: handleDeleteCompany,
      }),
    [handleViewCompany, handleEditCompany, handleDeleteCompany]
  );

  const exportColumns = useMemo(() => getCompanyExportColumns(), []);

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

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-[#265197] mb-6">
            <span className="text-[#678CC5]">CRM</span> {'>'} Gestión de Empresas
          </h1>

          <DataTable<Company>
            data={companies}
            columns={columns}
            isLoading={isLoading}
            searchFields={[]}
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Empresa"
            emptyContent="No se encontraron empresas"
            headerColor="#42668A"
            headerTextColor="#ffffff"
            paginationColor="#42668A"
            getRowKey={(company) => company.id}
            enableExport={true}
            exportColumns={exportColumns}
            exportTitle="Gestión de Empresas"
            tableName="empresas"
            showRowsPerPageSelector={true}
            showCompanyFilter={true}
            companies={companies}
            companyFilterField="id"
            companyFilterPlaceholder="Filtrar por empresa"
          />

          <CreateCompanyModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onSuccess={handleCreateSuccess}
          />

          {isDetailModalOpen && selectedCompany && (
            <CompanyDetailModal
              company={selectedCompany}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedCompany(null);
              }}
              width="360px"
            />
          )}

          {isEditModalOpen && selectedCompany && (
            <EditCompanyModal
              isOpen={isEditModalOpen}
              company={selectedCompany}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedCompany(null);
              }}
              onSuccess={handleCreateSuccess}
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
