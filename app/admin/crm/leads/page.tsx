"use client";
import { useState, useMemo, useCallback } from "react";
import { useLeadsCRUD, Lead } from "@/hooks/leads/use-leads-crud";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Col, Container } from "citrica-ui-toolkit";
import { getLeadColumns, getLeadExportColumns } from "./columns/lead-columns";
import LeadDetailModal from "./components/lead-detail-modal";
import DeleteLeadModal from "./components/delete-lead-modal";
import ContactFormDrawer from "@/app/admin/crm/contactos/components/contact-form-drawer";
import { ContactInput } from "@/hooks/contact/use-contact";

export default function LeadsPage() {
  const { leads, isLoading, deleteLead, refreshLeads } = useLeadsCRUD();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isConvertDrawerOpen, setIsConvertDrawerOpen] = useState(false);
  const [convertInitialData, setConvertInitialData] = useState<Partial<ContactInput> | null>(null);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);

  const handleViewLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  }, []);

  const handleDeleteLead = useCallback((lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConvertLead = useCallback((lead: Lead) => {
    setLeadToConvert(lead);
    setConvertInitialData({
      name: lead.name || null,
      email: lead.email || null,
      phone: lead.phone ? `${lead.phoneCode || "+51"} ${lead.phone}` : null,
    });
    setIsConvertDrawerOpen(true);
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
    () => getLeadColumns({ onView: handleViewLead, onDelete: handleDeleteLead, onConvert: handleConvertLead }),
    [handleViewLead, handleDeleteLead, handleConvertLead]
  );

  const exportColumns = useMemo(() => getLeadExportColumns(), []);

  const filteredLeads = leads;

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

            <ContactFormDrawer
              isOpen={isConvertDrawerOpen}
              onClose={() => {
                setIsConvertDrawerOpen(false);
                setConvertInitialData(null);
                setLeadToConvert(null);
              }}
              onSuccess={async () => {
                if (leadToConvert) {
                  await deleteLead(leadToConvert.id);
                  refreshLeads();
                }
                setIsConvertDrawerOpen(false);
                setConvertInitialData(null);
                setLeadToConvert(null);
              }}
              mode="create"
              initialData={convertInitialData}
            />
          </div>
        </Col>
      </Container>
    </div>
  );
}
