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
import { Text } from 'citrica-ui-toolkit';
import { createBuilding } from "@/public/icon-svg/icon-create-building";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";
import { Divider } from "@heroui/react";

export default function EmpresasPage() {
  const { companies, isLoading, refreshCompanies, deleteCompany } = useCompanyCRUD();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // IDs de tipos de contacto
  const CLIENTE_TYPE_ID = 1;
  const PROVEEDOR_TYPE_ID = 5;

  // Filtrar empresas por tipo seleccionado
  const filteredCompanies = useMemo(() => {
    if (typeFilter === "cliente") {
      return companies.filter((company) => company.type_id === CLIENTE_TYPE_ID);
    } else if (typeFilter === "proveedor") {
      return companies.filter((company) => company.type_id === PROVEEDOR_TYPE_ID);
    }
    return companies;
  }, [companies, typeFilter]);

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
        <div className="">
          <h1 className="text-2xl font-bold text-[#265197] mb-5">
            <Text variant="title" weight="bold" color="#678CC5">CRM</Text> {'>'}  <Text variant="title" weight="bold" color="#265197">Empresas</Text>
          </h1>

          <DataTable<Company>
            data={filteredCompanies}
            columns={columns}
            isLoading={isLoading}
            searchFields={[]}
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Empresa"
            addButtonIcon={createBuilding()} 
            emptyContent="No se encontraron empresas"
            headerColor="#265197"
            headerTextColor="#ffffff"
            paginationColor="#265197"
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
            customFilters={
              <div className="w-full flex flex-col">
                <div className="pb-4" style={{ width: "280px" }}>
                  <FilterButtonGroup
                    buttons={[
                      { value: "all", label: "Todas" },
                      { value: "cliente", label: "Clientes" },
                      { value: "proveedor", label: "Proveedores" },
                    ]}
                    selectedValue={typeFilter}
                    onValueChange={setTypeFilter}
                    height="38px"
                  />
                </div>
                <Divider className="bg-[#D4DEED]"/>
              </div>
            }
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
