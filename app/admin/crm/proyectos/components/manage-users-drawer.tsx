"use client";
import { useState, useEffect } from "react";
import { Chip, Divider } from "@heroui/react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { addToast } from "@heroui/toast";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin/button-citrica-admin";

import { Project } from "@/hooks/projects/use-projects";
import { useUserCRUD } from "@/hooks/users/use-users";
import { useUserProjects } from "@/hooks/user-projects/use-user-projects";

interface ManageUsersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project: Project;
}

export default function ManageUsersDrawer({
  isOpen,
  onClose,
  onSuccess,
  project,
}: ManageUsersDrawerProps) {
  const { users } = useUserCRUD();
  const { getProjectUsers, syncProjectUsers } = useUserProjects();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [originalUserIds, setOriginalUserIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      // Cargar usuarios asociados al proyecto
      const loadProjectUsers = async () => {
        try {
          const projectUsers = await getProjectUsers(project.id);
          if (projectUsers && projectUsers.length > 0) {
            const userIds = projectUsers.map(u => u.id).filter((id): id is string => !!id);
            setSelectedUserIds(userIds);
            setOriginalUserIds(userIds);
          } else {
            setSelectedUserIds([]);
            setOriginalUserIds([]);
          }
        } catch (error) {
          console.log("No hay usuarios asociados al proyecto");
          setSelectedUserIds([]);
          setOriginalUserIds([]);
        }
      };

      loadProjectUsers();
    }
  }, [project, isOpen, getProjectUsers]);

  // Verificar si hay cambios
  const hasChanges = () => {
    return (
      selectedUserIds.length !== originalUserIds.length ||
      !selectedUserIds.every(id => originalUserIds.includes(id))
    );
  };

  // Obtener usuarios ordenados alfabéticamente
  // Solo mostrar usuarios de la empresa del proyecto
  const clientUsers = users
    .filter(user => user.company_id === project.company_id)
    .sort((a, b) => {
      const nameA = a.first_name || '';
      const nameB = b.first_name || '';
      return nameA.localeCompare(nameB);
    });

  // Obtener usuarios seleccionados
  const selectedUsers = clientUsers.filter(u => u.id && selectedUserIds.includes(u.id));

  // Agregar usuario a la selección
  const handleAddUser = (key: React.Key | null) => {
    const userId = key?.toString() || null;
    if (!userId) return;

    // No agregar si ya está seleccionado
    if (selectedUserIds.includes(userId)) {
      addToast({
        title: "Usuario ya seleccionado",
        description: "Este usuario ya está asignado al proyecto",
        color: "warning",
      });
      return;
    }

    setSelectedUserIds(prev => [...prev, userId]);
    setSearchValue(''); // Limpiar búsqueda
  };

  // Remover usuario de la selección
  const handleRemoveUser = (userId: string) => {
    setSelectedUserIds(prev => prev.filter(id => id !== userId));
  };

  const handleSubmit = async () => {
    if (!hasChanges()) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      // Sincronizar usuarios del proyecto (sin toast interno)
      await syncProjectUsers(project.id, selectedUserIds, false);

      addToast({
        title: "Éxito",
        description: "Usuarios actualizados correctamente",
        color: "success",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error al actualizar usuarios:", error);
      addToast({
        title: "Error",
        description: "No se pudieron actualizar los usuarios",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Usuarios del Proyecto"
      size="lg"
      footer={
        <>
          <ButtonCitricaAdmin variant="secondary" onPress={onClose}>
            Cancelar
          </ButtonCitricaAdmin>
          <ButtonCitricaAdmin
            variant="primary"
            className="bg-[#42668A]"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!hasChanges() || isLoading}
          >
            Guardar Cambios
          </ButtonCitricaAdmin>
        </>
      }
    >
      <div className="space-y-4">
        {/* Información del proyecto */}
        <div className="bg-white border border-[#D4DEED] p-4 rounded-lg">
          <p className="text-sm text-[#265197]">Proyecto</p>
          <p className="text-lg font-semibold text-[#16305A]">{project.name}</p>
          <p className="text-sm text-[#678CC5] mt-1">
            Empresa: {project.company?.name || "Sin empresa"}
          </p>
        </div>

        <Divider />

        {/* Autocomplete para agregar usuarios */}
        <div>
          <Autocomplete
            aria-label='Seleccione usuarios'
            label="Agregar Usuarios al Proyecto"
            listboxProps={{
              emptyContent: "No hay coincidencias",
            }}
            inputValue={searchValue}
            onInputChange={setSearchValue}
            placeholder="Buscar y seleccionar usuarios"
            onSelectionChange={handleAddUser}
            allowsCustomValue={false}
            menuTrigger="input"
            style={{
              width: "100%",
            }}
            classNames={{
              base: "w-full [&_label]:!text-[#265197] [&_input]:!text-[#265197] [&_input::placeholder]:!text-[#A7BDE2]",
              selectorButton: "!text-[#678CC5]",
              listboxWrapper: "!text-[#265197]",
              popoverContent: "[&_li]:!text-[#265197]",
            }}
            className="[&>div>div]:bg-white [&>div>div]:!border-[#D4DEED]"
          >
            {clientUsers
              .filter(user => user.id && !selectedUserIds.includes(user.id))
              .map((user) => (
                <AutocompleteItem key={user.id} className="text-[#265197]">
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email}
                </AutocompleteItem>
              ))}
          </Autocomplete>

          {/* Chips de usuarios seleccionados */}
          {selectedUsers.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-[#265197] mb-2">
                Usuarios asignados ({selectedUsers.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Chip
                    key={user.id}
                    onClose={() => handleRemoveUser(user.id!)}
                    variant="flat"
                    color="primary"
                    classNames={{
                      base: "bg-[#E8F0FE]",
                      content: "text-[#265197]",
                      closeButton: "text-[#265197]",
                    }}
                  >
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.email}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {selectedUsers.length === 0 && (
            <p className="text-sm text-[#678CC5] mt-2">
              No hay usuarios asignados a este proyecto
            </p>
          )}

          {clientUsers.length === 0 && (
            <p className="text-sm text-[#678CC5] mt-2">
              No hay usuarios disponibles para esta empresa
            </p>
          )}
        </div>
      </div>
    </DrawerCitricaAdmin>
  );
}
