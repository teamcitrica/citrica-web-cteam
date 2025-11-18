"use client";
import { useState, useCallback } from "react";

import CreateContactModal from "./components/create-contact-modal";
import ContactDetailModal from "./components/contact-detail-modal";
import EditContactModal from "./components/edit-contact-modal";
import DeleteContactModal from "./components/delete-contact-modal";

import { useContactCRUD, Contact } from "@/hooks/contacts/use-contacts";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { DataTable, Column } from "@/shared/components/citrica-ui/organism/data-table";
import { Col, Container } from "@/styles/07-objects/objects";
import Icon from "@ui/atoms/icon";

export default function ContactosPage() {
  const { contacts, isLoading, refreshContacts, deleteContact } = useContactCRUD();
  const { companies } = useCompanyCRUD();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "-";
    const company = companies.find(c => c.id === companyId);
    return company?.name || "-";
  };

  const columns: Column<Contact>[] = [
    {
      name: "NOMBRE Y CARGO",
      uid: "name",
      sortable: true,
      render: (contact) => (
        <div className="flex flex-col gap-1">
          <div className="text-black font-medium">{contact.name || "-"}</div>
          <div className="text-gray-500 text-sm">{contact.cargo || "-"}</div>
        </div>
      ),
    },
    {
      name: "EMPRESA Y DIRECCIÓN",
      uid: "company",
      sortable: false,
      render: (contact) => (
        <div className="flex flex-col gap-1">
          <div className="text-black font-medium">{getCompanyName(contact.company_id)}</div>
          <div className="text-gray-500 text-sm">{contact.address || "-"}</div>
        </div>
      ),
    },
    {
      name: "CONTACTO",
      uid: "contact_info",
      sortable: false,
      render: (contact) => (
        <div className="flex flex-col gap-2">
          {contact.phone && (
            <a
              href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <Icon className="w-4 h-4" name="Phone" />
              <span className="text-sm">{contact.phone}</span>
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Icon className="w-4 h-4" name="Mail" />
              <span className="text-sm">{contact.email}</span>
            </a>
          )}
          {!contact.phone && !contact.email && <span className="text-gray-400">-</span>}
        </div>
      ),
    },
  ];

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

  const handleDeleteContact = useCallback((contact: Contact) => {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  }, []);

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

  const renderActions = useCallback(
    (contact: Contact) => (
      <div className="flex items-end justify-center w-full gap-2">
        <button
          className="text-blue-500 hover:text-blue-700"
          onClick={() => handleViewContact(contact)}
        >
          <Icon className="w-5 h-5" name="Eye" />
        </button>
        <button
          className="text-green-500 hover:text-green-700"
          onClick={() => handleEditContact(contact)}
        >
          <Icon className="w-5 h-5" name="SquarePen" />
        </button>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => handleDeleteContact(contact)}
        >
          <Icon className="w-5 h-5" name="Trash2" />
        </button>
      </div>
    ),
    [handleViewContact, handleEditContact, handleDeleteContact]
  );

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Gestión de Contactos
          </h1>

          <DataTable<Contact>
            data={contacts}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Buscar por nombre..."
            searchKey="name"
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Contacto"
            emptyContent="No se encontraron contactos"
            headerColor="#42668A"
            headerTextColor="#ffffff"
            paginationColor="#42668A"
            getRowKey={(contact) => contact.id}
            renderActions={renderActions}
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
