"use client";
import { useState, useCallback, useMemo } from "react";

import CreateContactModal from "./components/create-contact-modal";
import ContactDetailModal from "./components/contact-detail-modal";
import EditContactModal from "./components/edit-contact-modal";
import DeleteContactModal from "./components/delete-contact-modal";
import GrantAccessModal from "./components/grant-access-modal";
import RevokeAccessModal from "./components/revoke-access-modal";
import { getContactColumns, getContactExportColumns } from "./columns/contact-columns";

import { useContactCRUD, Contact } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { Col, Container } from "@/styles/07-objects/objects";

export default function ContactosPage() {
  const { contacts, isLoading, refreshContacts, deleteContact } = useContactCRUD();
  const { companies, isLoading: isLoadingCompanies } = useCompanyCRUD();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);
  const [isRevokeAccessModalOpen, setIsRevokeAccessModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const getCompanyName = useCallback(
    (companyId: number | null) => {
      if (!companyId) return "-";
      if (isLoadingCompanies) return "Cargando...";
      const company = companies.find((c) => c.id === companyId);
      return company?.name || "-";
    },
    [companies, isLoadingCompanies]
  );

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    refreshContacts();
  };

  const handleViewContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  }, []);

  const handleGrantAccess = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsGrantAccessModalOpen(true);
  }, []);

  const handleRevokeAccess = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsRevokeAccessModalOpen(true);
  }, []);

  const handleDeleteContact = useCallback((contact: Contact) => {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      getContactColumns({
        getCompanyName,
        onView: handleViewContact,
        onEdit: handleEditContact,
        onDelete: handleDeleteContact,
        onGrantAccess: handleGrantAccess,
        onRevokeAccess: handleRevokeAccess,
      }),
    [getCompanyName, handleViewContact, handleEditContact, handleDeleteContact, handleGrantAccess, handleRevokeAccess]
  );

  const exportColumns = useMemo(
    () => getContactExportColumns({ getCompanyName }),
    [getCompanyName]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!contactToDelete) return;

    try {
      await deleteContact(contactToDelete.id);
      setIsDeleteModalOpen(false);
      setContactToDelete(null);
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
    }
  }, [contactToDelete, deleteContact]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setContactToDelete(null);
  }, []);

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-[#265197] mb-6">
            <span className="text-[#678CC5]">CRM</span> {'>'} Gestión de Contactos
          </h1>

          <DataTable<Contact>
            data={contacts}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Buscar contactos..."
            searchFields={["name", "email", "phone", "cargo", "address"]}
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Contacto"
            emptyContent="No se encontraron contactos"
            headerColor="#42668A"
            headerTextColor="#ffffff"
            paginationColor="#42668A"
            getRowKey={(contact) => contact.id}
            enableExport={true}
            exportColumns={exportColumns}
            exportTitle="Gestión de Contactos"
            tableName="contactos"
            showRowsPerPageSelector={true}
            showCompanyFilter={true}
            companies={companies}
            companyFilterField="company_id"
            companyFilterPlaceholder="Filtrar por empresa"
          />

          <CreateContactModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
          />

          {isDetailModalOpen && selectedContact && (
            <ContactDetailModal
              contact={selectedContact}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedContact(null);
              }}
            />
          )}

          {isEditModalOpen && selectedContact && (
            <EditContactModal
              isOpen={isEditModalOpen}
              contact={selectedContact}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedContact(null);
              }}
              onSuccess={() => {
                refreshContacts();
              }}
            />
          )}

          {isGrantAccessModalOpen && selectedContact && (
            <GrantAccessModal
              isOpen={isGrantAccessModalOpen}
              contact={selectedContact}
              onClose={() => {
                setIsGrantAccessModalOpen(false);
                setSelectedContact(null);
              }}
              onSuccess={() => {
                refreshContacts();
              }}
            />
          )}

          {isRevokeAccessModalOpen && selectedContact && (
            <RevokeAccessModal
              isOpen={isRevokeAccessModalOpen}
              contact={selectedContact}
              onClose={() => {
                setIsRevokeAccessModalOpen(false);
                setSelectedContact(null);
              }}
              onSuccess={() => {
                refreshContacts();
              }}
            />
          )}

          {isDeleteModalOpen && contactToDelete && (
            <DeleteContactModal
              contact={contactToDelete}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
        </div>
      </Col>
    </Container>
  );
}
