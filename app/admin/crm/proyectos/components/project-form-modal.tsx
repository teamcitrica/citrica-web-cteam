"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Divider,
} from "@heroui/react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { addToast } from "@heroui/toast";

import { useProjectCRUD, ProjectInput, Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useContactCRUD } from "@/hooks/contacts/use-contacts";
import { useProjectContacts } from "@/hooks/project-contacts/use-project-contacts";
import { useUserCRUD } from "@/hooks/users/use-users";
import { useUserProjects } from "@/hooks/user-projects/use-user-projects";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  project?: Project;
}

export default function ProjectFormModal({
  isOpen,
  onClose,
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

  useEffect(() => {
    if (mode === "edit" && project) {
      setFormData({
        name: project.name,
        company_id: project.company_id,
        status: project.status,
        nombre_responsable: project.nombre_responsable,
        email_responsable: project.email_responsable,
        phone_responsable: project.phone_responsable,
        tabla: project.tabla,
        supabase_url: project.supabase_url,
        supabase_anon_key: project.supabase_anon_key,
      });

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
          } else {
            setSelectedUserIds([]);
          }
        } catch (error) {
          console.log("No hay usuarios asociados al proyecto");
          setSelectedUserIds([]);
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

  // Obtener usuarios clientes ordenados alfabéticamente
  const clientUsers = users
    .filter(user => user.role_id === 12)
    .sort((a, b) => {
      const nameA = a.first_name || '';
      const nameB = b.first_name || '';
      return nameA.localeCompare(nameB);
    });

  // Obtener usuarios seleccionados
  const selectedUsers = clientUsers.filter(u => selectedUserIds.includes(u.id));

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
          onClose();
        }
      } else {
        await updateProject(project!.id, cleanedData);

        // Sincronizar contactos del proyecto
        await syncProjectContacts(project!.id, Array.from(selectedContactIds));

        // Sincronizar usuarios del proyecto
        await syncProjectUsers(project!.id, selectedUserIds);

        onClose();
      }
    } catch (error) {
      console.error(`Error al ${mode === "create" ? "crear" : "actualizar"} proyecto:`, error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {mode === "create" ? "Agregar Nuevo Proyecto" : "Editar Proyecto"}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Proyecto"
              placeholder="Ingrese el nombre"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              isRequired
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
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
                aria-label='Seleccione usuarios clientes'
                label="Usuarios Asignados al Proyecto (Clientes)"
                listboxProps={{
                  emptyContent: "No hay coincidencias",
                }}
                inputValue={searchValue}
                onInputChange={setSearchValue}
                placeholder="Buscar y seleccionar usuarios clientes"
                onSelectionChange={handleAddUser}
                allowsCustomValue={false}
                menuTrigger="input"
                classNames={{
                  base: "w-full",
                }}
              >
                {clientUsers
                  .filter(user => !selectedUserIds.includes(user.id))
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
                        onClose={() => handleRemoveUser(user.id)}
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
                  No hay usuarios clientes disponibles
                </p>
              )}

              <Divider className="my-4" />
            </div>

            <Input
              label="Nombre del Responsable"
              placeholder="Ingrese el nombre del responsable"
              value={formData.nombre_responsable || ""}
              onChange={(e) => handleInputChange("nombre_responsable", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />

            <Input
              label="Email del Responsable"
              placeholder="email@ejemplo.com"
              type="email"
              value={formData.email_responsable || ""}
              onChange={(e) => handleInputChange("email_responsable", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
            />

            <Input
              label="Teléfono del Responsable"
              placeholder="Ingrese el teléfono"
              value={formData.phone_responsable || ""}
              onChange={(e) => handleInputChange("phone_responsable", e.target.value)}
              classNames={{
                label: "text-gray-700",
                input: "text-gray-800",
              }}
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
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[#42668A] text-white"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            {mode === "create" ? "Crear Proyecto" : "Guardar Cambios"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
