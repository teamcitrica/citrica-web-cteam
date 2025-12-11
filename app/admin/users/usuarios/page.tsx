"use client";
import { useState, useCallback, useMemo } from "react";

import CreateUserModal from "../../test-crud/create-user-modal";
import UserDetailModal from "../components/modal-details-users";
import EditUserModal from "../components/modal-edit-users";
import ModalDeleteUser from "../components/modal-delete-user";
import { getUserColumns, getUserExportColumns } from "../columns/user-columns";

import { useUserCRUD } from "@/hooks/users/use-users";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useContactCRUD } from "@/hooks/contact/use-contact";
import { UserType } from "@/shared/types/types";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { Col, Container } from "@/styles/07-objects/objects";
import { addToast } from "@heroui/toast";

export default function UsersPage() {
  const { users, isLoading, refreshUsers, deleteUser } = useUserCRUD();
  const { companies } = useCompanyCRUD();
  const { contacts } = useContactCRUD();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  // Filtrar usuarios con role_id === 5
  const filteredUsers = useMemo(() => {
    return users.filter((user) => user.role_id !== 5);
  }, [users]);

  // Crear mapa de contactos por user_id para identificar usuarios creados desde contactos
  const contactAccessMap = useMemo(() => {
    const map: Record<string, { hasSystemAccess: boolean; isActive: boolean }> = {};
    contacts.forEach((contact) => {
      if (contact.user_id) {
        map[contact.user_id] = {
          hasSystemAccess: contact.has_system_access || false,
          isActive: contact.active_users || false,
        };
      }
    });
    return map;
  }, [contacts]);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleViewUser = useCallback((user: UserType) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditUser = useCallback((user: UserType) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteUser = useCallback((user: UserType) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      getUserColumns({
        onView: handleViewUser,
        onEdit: handleEditUser,
        onDelete: handleDeleteUser,
        contactAccessMap,
      }),
    [handleViewUser, handleEditUser, handleDeleteUser, contactAccessMap]
  );

  const exportColumns = useMemo(() => getUserExportColumns(), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!userToDelete?.id) return;

    const userName =
      userToDelete.full_name ||
      userToDelete.name ||
      `${userToDelete.first_name} ${userToDelete.last_name}`;

    try {
      await deleteUser(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);

      addToast({
        title: "Usuario eliminado",
        description: `El usuario ${userName} ha sido eliminado correctamente`,
        color: "success",
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      addToast({
        title: "Error",
        description: "Hubo un error al eliminar el usuario",
        color: "danger",
      });
    }
  }, [userToDelete, deleteUser]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  }, []);

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-[#265197] mb-6">
            <span className="text-[#678CC5]"></span>Usuarios
          </h1>

          <DataTable<UserType>
            data={filteredUsers}
            columns={columns}
            isLoading={isLoading}
            searchFields={["full_name", "name", "first_name", "last_name", "email"]}
            searchPlaceholder="Buscar por nombre o email..."
            onAdd={handleOpenCreateModal}
            addButtonText="Crear Usuario"
            emptyContent="No se encontraron usuarios"
            headerColor="#42668A"
            headerTextColor="#ffffff"
            paginationColor="#42668A"
            getRowKey={(user) => user.id || ""}
            enableExport={true}
            exportColumns={exportColumns}
            exportTitle="Gestión de Usuarios"
            tableName="usuarios"
            showRowsPerPageSelector={true}
            showCompanyFilter={true}
            companies={companies}
            companyFilterField="company_id"
            companyFilterPlaceholder="Filtrar por empresa..."
          />

          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
          />

          {isDetailModalOpen && selectedUser && (
            <UserDetailModal
              user={selectedUser}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedUser(null);
              }}
            />
          )}

          {isEditModalOpen && selectedUser && (
            <EditUserModal
              isOpen={isEditModalOpen}
              user={selectedUser}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
              }}
              onSuccess={() => {
                refreshUsers();
              }}
            />
          )}

          {isDeleteModalOpen && userToDelete && (
            <ModalDeleteUser
              user={userToDelete}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}
        </div>
      </Col>
    </Container>
  );
}
