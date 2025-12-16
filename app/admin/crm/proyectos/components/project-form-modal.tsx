"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectItem,
  Chip,
  Divider,
} from "@heroui/react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { addToast } from "@heroui/toast";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin/input-citrica-admin";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin/button-citrica-admin";

import { useProjectCRUD, ProjectInput, Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useContactCRUD } from "@/hooks/contact/use-contact";
import { useProjectContacts } from "@/hooks/project-contacts/use-project-contacts";
import { useUserCRUD } from "@/hooks/users/use-users";
import { useUserProjects } from "@/hooks/user-projects/use-user-projects";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode: "create" | "edit";
  project?: Project;
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  project,
}: ProjectFormModalProps) {
  const { createProject, updateProject, isLoading } = useProjectCRUD();
  const { companies } = useCompanyCRUD();
  const { contacts } = useContactCRUD();
  const { users } = useUserCRUD();
  const { getProjectContacts, syncProjectContacts } = useProjectContacts();
  const { getProjectUsers, syncProjectUsers } = useUserProjects();
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const [formData, setFormData] = useState<ProjectInput>({
    name: project?.name || null,
    company_id: project?.company_id || null,
    status: project?.status || null,
    nombre_responsable: project?.nombre_responsable || null,
    email_responsable: project?.email_responsable || null,
    phone_responsable: project?.phone_responsable || null,
    tabla: project?.tabla || null,
    supabase_url: project?.supabase_url || null,
    supabase_anon_key: project?.supabase_anon_key || null,
  });

  const [originalData, setOriginalData] = useState<ProjectInput>({
    name: project?.name || null,
    company_id: project?.company_id || null,
    status: project?.status || null,
    nombre_responsable: project?.nombre_responsable || null,
    email_responsable: project?.email_responsable || null,
    phone_responsable: project?.phone_responsable || null,
    tabla: project?.tabla || null,
    supabase_url: project?.supabase_url || null,
    supabase_anon_key: project?.supabase_anon_key || null,
  });

  const [originalUserIds, setOriginalUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (mode === "edit" && project) {
      const projectData = {
        name: project.name,
        company_id: project.company_id,
        status: project.status,
        nombre_responsable: project.nombre_responsable,
        email_responsable: project.email_responsable,
        phone_responsable: project.phone_responsable,
        tabla: project.tabla,
        supabase_url: project.supabase_url,
        supabase_anon_key: project.supabase_anon_key,
      };
      setFormData(projectData);
      setOriginalData(projectData);

      // Cargar contactos asociados al proyecto
      const loadProjectContacts = async () => {
        try {
          const projectContacts = await getProjectContacts(project.id);
          if (projectContacts && projectContacts.length > 0) {
            const contactIds = new Set(projectContacts.map(c => c.id));
            setSelectedContactIds(contactIds);
          } else {
            setSelectedContactIds(new Set());
          }
        } catch (error) {
          console.log("No hay contactos asociados al proyecto");
          setSelectedContactIds(new Set());
        }
      };

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

      loadProjectContacts();
      loadProjectUsers();
    } else {
      // Limpiar selección cuando es modo crear
      setSelectedContactIds(new Set());
      setSelectedUserIds([]);
    }
  }, [project, mode, getProjectContacts, getProjectUsers]);

  const handleInputChange = (field: keyof ProjectInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  // Verificar si hay cambios en el formulario
  const hasChanges = () => {
    // Comparar campos del formulario
    const formChanged = (
      formData.name !== originalData.name ||
      formData.company_id !== originalData.company_id ||
      formData.status !== originalData.status ||
      formData.nombre_responsable !== originalData.nombre_responsable ||
      formData.email_responsable !== originalData.email_responsable ||
      formData.phone_responsable !== originalData.phone_responsable ||
      formData.tabla !== originalData.tabla ||
      formData.supabase_url !== originalData.supabase_url ||
      formData.supabase_anon_key !== originalData.supabase_anon_key
    );

    // Comparar usuarios asignados
    const usersChanged = (
      selectedUserIds.length !== originalUserIds.length ||
      !selectedUserIds.every(id => originalUserIds.includes(id))
    );

    return formChanged || usersChanged;
  };

  // Obtener usuarios ordenados alfabéticamente
  // Solo mostrar usuarios de la empresa seleccionada en el proyecto
  const clientUsers = users
    .filter(user => user.company_id === formData.company_id)
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
    if (!formData.name) {
      addToast({
        title: "Error",
        description: "El nombre del proyecto es requerido",
        color: "danger",
      });
      return;
    }

    try {
      // Limpiar campos vacíos antes de enviar
      const cleanedData: any = {};

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "" && value !== undefined) {
          cleanedData[key] = value;
        }
      });

      if (mode === "create") {
        const result = await createProject(cleanedData as ProjectInput);
        if (result) {
          const projectId = result[0].id;

          // Si se creó el proyecto y hay contactos seleccionados, asociarlos
          if (selectedContactIds.size > 0) {
            await syncProjectContacts(projectId, Array.from(selectedContactIds));
          }

          // Si hay usuarios seleccionados, asociarlos
          if (selectedUserIds.length > 0) {
            await syncProjectUsers(projectId, selectedUserIds);
          }

          setFormData({
            name: null,
            company_id: null,
            status: null,
            nombre_responsable: null,
            email_responsable: null,
            phone_responsable: null,
            tabla: null,
            supabase_url: null,
            supabase_anon_key: null,
          });
          setSelectedContactIds(new Set());
          setSelectedUserIds([]);
          setSearchValue('');
          onSuccess?.();
          onClose();
        }
      } else {
        await updateProject(project!.id, cleanedData);

        // Sincronizar contactos del proyecto (sin toast individual)
        await syncProjectContacts(project!.id, Array.from(selectedContactIds), false);

        // Sincronizar usuarios del proyecto (sin toast individual)
        await syncProjectUsers(project!.id, selectedUserIds, false);

        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error(`Error al ${mode === "create" ? "crear" : "actualizar"} proyecto:`, error);
    }
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Agregar Nuevo Proyecto" : "Editar Proyecto"}
      size="2xl"
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
            isDisabled={mode === "edit" ? !hasChanges() : false}
          >
            {mode === "create" ? "Crear Proyecto" : "Guardar Cambios"}
          </ButtonCitricaAdmin>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputCitricaAdmin
          label="Nombre del Proyecto"
          placeholder="Ingrese el nombre"
          value={formData.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          isRequired
        />

            <Select
              label="Empresa (Opcional)"
              placeholder="Seleccione una empresa"
              selectedKeys={formData.company_id ? [formData.company_id.toString()] : []}
              onChange={(e) => {
                handleInputChange("company_id", parseInt(e.target.value));
              }}
              classNames={{
                label: "text-gray-700",
                value: "text-gray-800",
              }}
            >
              {companies.map((company) => (
                <SelectItem key={company.id.toString()}>
                  {company.name || "Sin nombre"}
                </SelectItem>
              ))}
            </Select>

            <div className="col-span-2">
              <Autocomplete
                aria-label='Seleccione usuarios'
                label="Usuarios Asignados al Proyecto"
                listboxProps={{
                  emptyContent: "No hay coincidencias",
                }}
                inputValue={searchValue}
                onInputChange={setSearchValue}
                placeholder="Buscar y seleccionar usuarios"
                onSelectionChange={handleAddUser}
                allowsCustomValue={false}
                menuTrigger="input"
                classNames={{
                  base: "w-full",
                }}
              >
                {clientUsers
                  .filter(user => user.id && !selectedUserIds.includes(user.id))
                  .map((user) => (
                    <AutocompleteItem key={user.id}>
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.email}
                    </AutocompleteItem>
                  ))}
              </Autocomplete>

              {/* Chips de usuarios seleccionados */}
              {selectedUsers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Seleccionados ({selectedUsers.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <Chip
                        key={user.id}
                        onClose={() => handleRemoveUser(user.id!)}
                        variant="flat"
                        color="primary"
                      >
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.email}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {clientUsers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No hay usuarios disponibles para esta empresa
                </p>
              )}

              <Divider className="my-4" />
            </div>

            <InputCitricaAdmin
              label="Nombre del Responsable"
              placeholder="Ingrese el nombre del responsable"
              value={formData.nombre_responsable || ""}
              onChange={(e) => handleInputChange("nombre_responsable", e.target.value)}
            />

            <InputCitricaAdmin
              label="Email del Responsable"
              placeholder="email@ejemplo.com"
              type="email"
              value={formData.email_responsable || ""}
              onChange={(e) => handleInputChange("email_responsable", e.target.value)}
            />

            <InputCitricaAdmin
              label="Teléfono del Responsable"
              placeholder="Ingrese el teléfono"
              value={formData.phone_responsable || ""}
              onChange={(e) => handleInputChange("phone_responsable", e.target.value)}
            />

            <Select
              label="Estado"
              placeholder="Seleccione un estado"
              selectedKeys={formData.status ? [formData.status] : []}
              onChange={(e) => handleInputChange("status", e.target.value)}
              classNames={{
                label: "text-gray-700",
                value: "text-gray-800",
              }}
            >
              <SelectItem key="abierto">Abierto</SelectItem>
              <SelectItem key="inactivo">Inactivo</SelectItem>
              <SelectItem key="cerrado">Cerrado</SelectItem>
            </Select>
          </div>
    </DrawerCitricaAdmin>
  );
}
