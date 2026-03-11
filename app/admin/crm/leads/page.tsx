"use client";
import { useState, useMemo, useCallback } from "react";
import { Divider } from "@heroui/divider";
import { useLeadsCRUD, Lead } from "@/hooks/leads/use-leads-crud";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Col, Container } from "citrica-ui-toolkit";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";
import { getLeadColumns, getLeadExportColumns } from "./columns/lead-columns";
import LeadDetailModal from "./components/lead-detail-modal";
import DeleteLeadModal from "./components/delete-lead-modal";

export default function LeadsPage() {
  const { leads, isLoading, deleteLead } = useLeadsCRUD();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const handleViewLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  }, []);

  const handleDeleteLead = useCallback((lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead(leadToDelete.id);
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
    } catch (error) {
      console.error("Error al eliminar lead:", error);
    }
  }, [leadToDelete, deleteLead]);

  const columns = useMemo(
    () => getLeadColumns({ onView: handleViewLead, onDelete: handleDeleteLead }),
    [handleViewLead, handleDeleteLead]
  );

  const exportColumns = useMemo(() => getLeadExportColumns(), []);

  const filteredLeads = useMemo(() => {
    if (statusFilter === "all") return leads;
    return leads.filter((r) => r.status === statusFilter);
  }, [leads, statusFilter]);

  return (
    <div className="pb-[100px]">
      <Container>
        <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
          <div>
            <h1 className="text-2xl font-bold text-[#265197] mb-5">
              <Text isAdmin={true} variant="title" weight="bold" color="#678CC5">CRM</Text>
              {" > "}
              <Text isAdmin={true} variant="title" weight="bold" color="#265197">Leads</Text>
            </h1>

            <DataTable<Lead>
              data={filteredLeads}
              customFilters={
                <>
                  <div className="flex flex-col md:flex-row gap-3 pb-4 w-full">
                    <div className="w-full md:w-auto">
                      <FilterButtonGroup
                        buttons={[
                          { value: "all", label: "Todos" },
                          { value: "pendiente", label: "Pendientes" },
                        ]}
                        selectedValue={statusFilter}
                        onValueChange={setStatusFilter}
                      />
                    </div>
                  </div>
                  <Divider className="bg-[#D4DEED]" />
                </>
              }
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Buscar leads..."
              searchFields={["name", "email", "message"]}
              emptyContent="No se encontraron leads"
              headerColor="#265197"
              headerTextColor="#ffffff"
              paginationColor="#265197"
              getRowKey={(lead) => lead.id}
              enableExport={true}
              exportColumns={exportColumns}
              exportTitle="Leads - Contactos del formulario"
              tableName="leads"
              showRowsPerPageSelector={true}
            />

            {isDetailModalOpen && selectedLead && (
              <LeadDetailModal
                lead={selectedLead}
                onClose={() => {
                  setIsDetailModalOpen(false);
                  setSelectedLead(null);
                }}
              />
            )}

            <DeleteLeadModal
              isOpen={isDeleteModalOpen}
              lead={leadToDelete}
              onConfirm={handleConfirmDelete}
              onCancel={() => {
                setIsDeleteModalOpen(false);
                setLeadToDelete(null);
              }}
            />
          </div>
        </Col>
      </Container>
    </div>
  );
}
