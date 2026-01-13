"use client";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { Button, Autocomplete } from "citrica-ui-toolkit";

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
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
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
  const handleAddUser = (key: string | null) => {
    if (!key) return;

    // No agregar si ya está seleccionado
    if (selectedUserIds.includes(key)) {
      addToast({
        title: "Usuario ya seleccionado",
        description: "Este usuario ya está asignado al proyecto",
        color: "warning",
      });
      setSelectedKey(null);
      setInputValue('');
      return;
    }

    setSelectedUserIds(prev => [...prev, key]);
    setSelectedKey(null);
    setInputValue('');
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
          <Button isAdmin variant="secondary" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            isAdmin
            variant="primary"
            className="bg-[#42668A]"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!hasChanges() || isLoading}
          >
            Guardar Cambios
          </Button>
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
            label="Agregar Usuarios al Proyecto"
            placeholder="Buscar y seleccionar usuarios"
            selectedKey={selectedKey}
            inputValue={inputValue}
            onSelectionChange={handleAddUser}
            onInputChange={setInputValue}
            allowsCustomValue={false}
            menuTrigger="input"
            isClearable
            fullWidth
            variant="bordered"
            color="primary"
            options={clientUsers
              .filter(user => user.id && !selectedUserIds.includes(user.id))
              .map((user) => ({
                value: user.id!,
                label: user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.email || '',
              }))}
            classNames={{
              base: "w-full [&_label]:!text-[#265197] [&_input]:!text-[#265197] [&_input::placeholder]:!text-[#A7BDE2]",
              selectorButton: "!text-[#678CC5]",
              listboxWrapper: "!text-[#265197]",
              popoverContent: "[&_li]:!text-[#265197]",
            }}
            className="[&>div>div]:bg-white [&>div>div]:!border-[#D4DEED]"
          />

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
