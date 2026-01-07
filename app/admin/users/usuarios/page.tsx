"use client";
import { Divider } from "@heroui/divider";
import { useState, useCallback, useMemo } from "react";

import UserFormModal from "../components/modal-user-form";
import UserDetailModal from "../components/modal-details-users";
import ModalDeleteUser from "../components/modal-delete-user";
import AccessCredentialsModal from "../components/access-credentials-modal";
import { getUserColumns, getUserExportColumns } from "../columns/user-columns";
import { useUserCRUD } from "@/hooks/users/use-users";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { UserType } from "@/shared/types/types";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { Col, Container } from "@/styles/07-objects/objects";
import { addToast } from "@heroui/toast";
import { UserAuth } from "@/shared/context/auth-context";
import FilterButtonGroup from "@/shared/components/citrica-ui/molecules/filter-button-group";
import { createUsers } from "@/public/icon-svg/create-users";
import { Text } from "citrica-ui-toolkit";

export default function UsersPage() {
  const { users, isLoading, refreshUsers, deleteUser, updateUserByRole } =
    useUserCRUD();
  const { companies } = useCompanyCRUD();
  const { userSession } = UserAuth();
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAccessCredentialsModalOpen, setIsAccessCredentialsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // IDs de roles
  const CITRICA_ROLE_ID = 1;
  const CLIENTE_ROLE_ID = 12;

  // Filtrar usuarios por rol seleccionado y búsqueda por nombre
  const filteredUsers = useMemo(() => {
    // Primero excluir usuarios con role_id === 5
    let filtered = users.filter((user) => user.role_id !== 5);

    // Filtrar según el rol seleccionado
    if (roleFilter === "citrica") {
      filtered = filtered.filter((user) => user.role_id === CITRICA_ROLE_ID);
    } else if (roleFilter === "cliente") {
      filtered = filtered.filter((user) => user.role_id === CLIENTE_ROLE_ID);
    }

    // Filtrar por usuario seleccionado en el autocomplete
    if (selectedUserId && selectedUserId !== "all") {
      filtered = filtered.filter((user) => user.id === selectedUserId);
    }

    return filtered;
  }, [users, roleFilter, selectedUserId]);

  const handleOpenCreateModal = () => {
    setUserToEdit(null);
    setIsUserFormModalOpen(true);
  };

  const handleCloseUserFormModal = () => {
    setIsUserFormModalOpen(false);
    setUserToEdit(null);
  };

  const handleViewUser = useCallback((user: UserType) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditUser = useCallback((user: UserType) => {
    setUserToEdit(user);
    setIsUserFormModalOpen(true);
  }, []);

  const handleDeleteUser = useCallback((user: UserType) => {
    // Prevenir que un usuario se elimine a sí mismo
    if (userSession?.user?.id && user.id === userSession.user.id) {
      addToast({
        title: "Acción no permitida",
        description: "No puedes eliminar tu propio usuario mientras estás conectado",
        color: "warning",
      });
      return;
    }

    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }, [userSession]);

  const handleAccessCredentials = useCallback((user: UserType) => {
    setSelectedUser(user);
    setIsAccessCredentialsModalOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      getUserColumns({
        onView: handleViewUser,
        onEdit: handleEditUser,
        onDelete: handleDeleteUser,
        onAccessCredentials: handleAccessCredentials,
      }),
    [handleViewUser, handleEditUser, handleDeleteUser, handleAccessCredentials],
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
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error);

      const errorMessage = error?.message || String(error);

      // Cerrar el modal antes de mostrar el error
      setIsDeleteModalOpen(false);
      setUserToDelete(null);

      // Detectar si el error es por relación con proyectos
      if (errorMessage.includes("Database error deleting user") ||
          errorMessage.includes("Error al eliminar autenticación")) {
        addToast({
          title: "No se puede eliminar el usuario",
          description: `${userName} está asignado a uno o más proyectos. Desvincúlelo de todos los proyectos antes de eliminarlo.`,
          color: "warning",
        });
      } else {
        addToast({
          title: "Error",
          description: "Hubo un error al eliminar el usuario",
          color: "danger",
        });
      }
    }
  }, [userToDelete, deleteUser]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  }, []);

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div>         
          <h1 className="mb-4">
            <Text variant="title" weight="bold" color="#265197">Usuarios del sistema</Text>
          </h1>

          <DataTable<UserType>
            data={filteredUsers}
            columns={columns}
            isLoading={isLoading}
            onAdd={handleOpenCreateModal}
            addButtonText="Crear Usuario"
            addButtonIcon={createUsers()}
            emptyContent="No se encontraron usuarios"
            headerColor="#265197"
            headerTextColor="#ffffff"
            paginationColor="#265197"
            getRowKey={(user) => user.id || ""}
            enableExport={true}
            exportColumns={exportColumns}
            exportTitle="Usuarios del S"
            tableName="usuarios"
            showRowsPerPageSelector={true}
            showCustomAutocomplete={true}
            customAutocompleteItems={[
              { id: 'all', name: 'Todos los usuarios' },
              ...users
                .filter((user) => user.role_id !== 5)
                .map(u => ({
                  id: String(u.id),
                  name: u.full_name || u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Sin nombre'
                }))
            ]}
            customAutocompletePlaceholder="Buscar por nombre..."
            customAutocompleteSelectedKey={selectedUserId || "all"}
            onCustomAutocompleteChange={(key) => setSelectedUserId(key)}
            customFilters={
              <>
              <div className="flex gap-3 pb-4">
                <FilterButtonGroup
                  buttons={[
                    { value: "all", label: "Todos" },
                    { value: "citrica", label: "Citrica" },
                    { value: "cliente", label: "Clientes" },
                  ]}
                  selectedValue={roleFilter}
                  onValueChange={setRoleFilter}
                />
              </div>
              <Divider className="bg-[#D4DEED]"/>
              </>
            }
          />

          <UserFormModal
            isOpen={isUserFormModalOpen}
            onClose={handleCloseUserFormModal}
            user={userToEdit}
            onSuccess={() => {
              refreshUsers();
            }}
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

          {userToDelete && (
            <ModalDeleteUser
              isOpen={isDeleteModalOpen}
              user={userToDelete}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          )}

          {isAccessCredentialsModalOpen && selectedUser && (
            <AccessCredentialsModal
              user={selectedUser}
              onClose={() => {
                setIsAccessCredentialsModalOpen(false);
                setSelectedUser(null);
              }}
              onSuccess={() => {
                refreshUsers();
              }}
            />
          )}
        </div> 
      </Col>
    </Container>
  );
}
