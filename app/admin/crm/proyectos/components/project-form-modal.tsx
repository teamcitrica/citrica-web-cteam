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
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { useProjectCRUD, ProjectInput, Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useContactCRUD } from "@/hooks/contacts/use-contacts";
import { useProjectContacts } from "@/hooks/project-contacts/use-project-contacts";

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
  const { getProjectContacts, syncProjectContacts } = useProjectContacts();
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<ProjectInput>({
    name: project?.name || null,
    company_id: project?.company_id || null,
    supabase_url: project?.supabase_url || null,
    supabase_anon_key: project?.supabase_anon_key || null,
    status: project?.status || null,
    tabla: project?.tabla || null,
  });

  useEffect(() => {
    if (mode === "edit" && project) {
      setFormData({
        name: project.name,
        company_id: project.company_id,
        supabase_url: project.supabase_url,
        supabase_anon_key: project.supabase_anon_key,
        status: project.status,
        tabla: project.tabla,
      });

      // Cargar contactos asociados al proyecto
      const loadProjectContacts = async () => {
        const projectContacts = await getProjectContacts(project.id);
        const contactIds = new Set(projectContacts.map(c => c.id));
        setSelectedContactIds(contactIds);
      };

      loadProjectContacts();
    } else {
      // Limpiar selección cuando es modo crear
      setSelectedContactIds(new Set());
    }
  }, [project, mode, getProjectContacts]);

  const handleInputChange = (field: keyof ProjectInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleConsultTables = async () => {
    if (!formData.supabase_url || !formData.supabase_anon_key) {
      addToast({
        title: "Error",
        description: "Debe ingresar la URL y Anon Key de Supabase",
        color: "danger",
      });
      return;
    }

    try {
      setIsLoadingTables(true);

      // Usar el endpoint REST de Supabase para obtener el schema
      const restUrl = `${formData.supabase_url}/rest/v1/`;

      const response = await fetch(restUrl, {
        method: 'GET',
        headers: {
          'apikey': formData.supabase_anon_key,
          'Authorization': `Bearer ${formData.supabase_anon_key}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // El response contiene un objeto con las definiciones de las tablas
      // Extraemos los nombres de las tablas del objeto 'definitions' o 'paths'
      let tables: string[] = [];

      if (data.definitions) {
        tables = Object.keys(data.definitions).filter(key => !key.startsWith('_'));
      } else if (data.paths) {
        // Extraer nombres de tablas de los paths
        const pathKeys = Object.keys(data.paths);
        const tableSet = new Set<string>();
        pathKeys.forEach(path => {
          const match = path.match(/^\/([^\/]+)/);
          if (match && match[1] !== 'rpc') {
            tableSet.add(match[1]);
          }
        });
        tables = Array.from(tableSet);
      }

      if (tables.length === 0) {
        addToast({
          title: "Advertencia",
          description: "No se encontraron tablas o no hay acceso a ellas",
          color: "warning",
        });
      } else {
        setAvailableTables(tables);
        addToast({
          title: "Éxito",
          description: `Se encontraron ${tables.length} tablas`,
          color: "success",
        });
      }
    } catch (err) {
      console.error("Error al consultar tablas:", err);
      addToast({
        title: "Error",
        description: "Error al conectar con Supabase. Verifique las credenciales.",
        color: "danger",
      });
    } finally {
      setIsLoadingTables(false);
    }
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

    if (!formData.company_id) {
      addToast({
        title: "Error",
        description: "Debe seleccionar una empresa",
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
          // Si se creó el proyecto y hay contactos seleccionados, asociarlos
          if (selectedContactIds.size > 0) {
            const projectId = result[0].id;
            await syncProjectContacts(projectId, Array.from(selectedContactIds));
          }

          setFormData({
            name: null,
            company_id: null,
            supabase_url: null,
            supabase_anon_key: null,
            status: null,
            tabla: null,
          });
          setAvailableTables([]);
          setSelectedContactIds(new Set());
          onClose();
        }
      } else {
        await updateProject(project!.id, cleanedData);

        // Sincronizar contactos del proyecto
        await syncProjectContacts(project!.id, Array.from(selectedContactIds));

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
              label="Empresa"
              placeholder="Seleccione una empresa"
              selectedKeys={formData.company_id ? [formData.company_id.toString()] : []}
              onChange={(e) => {
                handleInputChange("company_id", parseInt(e.target.value));
                // Limpiar contactos seleccionados cuando cambia la empresa
                setSelectedContactIds(new Set());
              }}
              isRequired
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

            {formData.company_id && (
              <div className="col-span-2">
                <Select
                  label="Contactos del Proyecto"
                  placeholder="Seleccione los contactos"
                  selectionMode="multiple"
                  selectedKeys={selectedContactIds}
                  onSelectionChange={(keys) => setSelectedContactIds(keys as Set<string>)}
                  classNames={{
                    label: "text-gray-700",
                    value: "text-gray-800",
                  }}
                >
                  {contacts
                    .filter(contact => contact.company_id === formData.company_id)
                    .map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name || "Sin nombre"} {contact.cargo ? `- ${contact.cargo}` : ""}
                      </SelectItem>
                    ))}
                </Select>
                {contacts.filter(contact => contact.company_id === formData.company_id).length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No hay contactos disponibles para esta empresa
                  </p>
                )}
              </div>
            )}

            <div className="col-span-2">
              <Input
                label="Supabase URL"
                placeholder="https://..."
                value={formData.supabase_url || ""}
                onChange={(e) => handleInputChange("supabase_url", e.target.value)}
                classNames={{
                  label: "text-gray-700",
                  input: "text-gray-800",
                }}
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Supabase Anon Key"
                placeholder="Ingrese la anon key"
                value={formData.supabase_anon_key || ""}
                onChange={(e) => handleInputChange("supabase_anon_key", e.target.value)}
                classNames={{
                  label: "text-gray-700",
                  input: "text-gray-800",
                }}
              />
            </div>

            <div className="col-span-2">
              <Button
                color="primary"
                variant="flat"
                onPress={handleConsultTables}
                isLoading={isLoadingTables}
                isDisabled={!formData.supabase_url || !formData.supabase_anon_key}
                className="w-full"
              >
                Consultar Tablas
              </Button>
            </div>

            {availableTables.length > 0 && (
              <Select
                label="Tabla"
                placeholder="Seleccione una tabla"
                selectedKeys={formData.tabla ? [formData.tabla] : []}
                onChange={(e) => handleInputChange("tabla", e.target.value)}
                classNames={{
                  label: "text-gray-700",
                  value: "text-gray-800",
                }}
              >
                {availableTables.map((table) => (
                  <SelectItem key={table}>
                    {table}
                  </SelectItem>
                ))}
              </Select>
            )}

            {availableTables.length === 0 && formData.tabla && (
              <Input
                label="Tabla"
                placeholder="Nombre de la tabla"
                value={formData.tabla || ""}
                onChange={(e) => handleInputChange("tabla", e.target.value)}
                classNames={{
                  label: "text-gray-700",
                  input: "text-gray-800",
                }}
              />
            )}

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
