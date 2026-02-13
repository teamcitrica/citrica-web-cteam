"use client";
import { Divider } from "@heroui/divider";
import { useState, useCallback, useMemo } from "react";
import ContactFormDrawer from "./components/contact-form-drawer";
import ContactDetailModal from "./components/contact-detail-modal";
import DeleteContactModal from "./components/delete-contact-modal";
import AccessCredentialsModal from "./components/access-credentials-modal";
import { getContactColumns, getContactExportColumns } from "./columns/contact-columns";
import { useContactCRUD, Contact } from "@/hooks/contact/use-contact";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { Text, Col, Container } from 'citrica-ui-toolkit';
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";

export default function ContactosPage() {
  const { contacts, isLoading, refreshContacts, deleteContact } = useContactCRUD();
  const { companies, isLoading: isLoadingCompanies } = useCompanyCRUD();
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAccessCredentialsModalOpen, setIsAccessCredentialsModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [accessFilter, setAccessFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const getCompanyName = useCallback(
    (companyId: number | null) => {
      if (!companyId) return "-";
      if (isLoadingCompanies) return "Cargando...";
      const company = companies.find((c) => c.id === companyId);
      return company?.name || "-";
    },
    [companies, isLoadingCompanies]
  );

  const handleOpenCreateModal = () => {
    setFormMode("create");
    setSelectedContact(null);
    setIsFormDrawerOpen(true);
  };

  const handleViewContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditContact = useCallback((contact: Contact) => {
    setFormMode("edit");
    setSelectedContact(contact);
    setIsFormDrawerOpen(true);
  }, []);

  const handleAccessCredentials = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsAccessCredentialsModalOpen(true);
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
        onAccessCredentials: handleAccessCredentials,
      }),
    [getCompanyName, handleViewContact, handleEditContact, handleDeleteContact, handleAccessCredentials]
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

  // Filtrar contactos según filtros activos
  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    // Filtro de acceso
    if (accessFilter === "con-acceso") {
      filtered = filtered.filter((contact) => contact.user_id !== null && contact.active_users === true);
    } else if (accessFilter === "sin-acceso") {
      filtered = filtered.filter((contact) => contact.user_id === null || contact.active_users === false);
    }

    // Filtro de tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((contact) => contact.type_id === Number(typeFilter));
    }

    return filtered;
  }, [contacts, accessFilter, typeFilter]);

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <div>
          <h1 className="text-2xl font-bold text-[#265197] mb-5">
            <Text isAdmin={true} variant="title" weight="bold" color="#678CC5">CRM</Text> {'>'}  <Text isAdmin={true} variant="title" weight="bold" color="#265197">Contactos</Text>
          </h1>

          <DataTable<Contact>
            data={filteredContacts}
            customFilters={
              <>
              <div className="flex flex-col md:flex-row gap-3 pb-4 w-full">
                <div className="w-full md:w-auto">
                  <FilterButtonGroup
                    buttons={[
                      { value: "all", label: "Todos" },
                      { value: "con-acceso", label: "Con acceso" },
                      { value: "sin-acceso", label: "Sin acceso" },
                    ]}
                    selectedValue={accessFilter}
                    onValueChange={setAccessFilter}
                  />
                </div>
                <Divider className="h-[36px] hidden md:block" orientation="vertical"/>
                <div className="w-full md:w-auto">
                  <FilterButtonGroup
                    buttons={[
                      { value: "all", label: "Todos" },
                      { value: "4", label: "Internos" },
                      { value: "1", label: "Cliente" },
                      { value: "5", label: "Proveedores" },
                    ]}
                    selectedValue={typeFilter}
                    onValueChange={setTypeFilter}
                  />
                </div>
              </div>
              <Divider className="bg-[#D4DEED]"/>
              </>
              
            }
            columns={columns}
            isLoading={isLoading || isLoadingCompanies}
            searchPlaceholder="Buscar contactos..."
            searchFields={["name", "email", "phone", "cargo", "address"]}
            onAdd={handleOpenCreateModal}
            addButtonText="Agregar Contacto"
            emptyContent="No se encontraron contactos"
            headerColor="#265197"
            headerTextColor="#ffffff"
            paginationColor="#265197"
            getRowKey={(contact) => contact.id}
            enableExport={true}
            exportColumns={exportColumns}
            exportTitle="Gestión de Contactos"
            tableName="contactos"
            showRowsPerPageSelector={true}
            showCompanyFilter={true}
            companies={companies}
            companyFilterField="company_id"
            companyFilterPlaceholder="Seleccione empresa"
          />

          <ContactFormDrawer
            isOpen={isFormDrawerOpen}
            onClose={() => {
              setIsFormDrawerOpen(false);
              setSelectedContact(null);
            }}
            onSuccess={() => {
              refreshContacts();
            }}
            contact={selectedContact}
            mode={formMode}
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

          {isAccessCredentialsModalOpen && selectedContact && (
            <AccessCredentialsModal
              contact={selectedContact}
              onClose={() => {
                setIsAccessCredentialsModalOpen(false);
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
