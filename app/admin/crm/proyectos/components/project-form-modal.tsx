"use client";
import { Select } from "citrica-ui-toolkit";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";
import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { Button, Input } from "citrica-ui-toolkit";

import { useProjectCRUD, ProjectInput, Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useProjectContacts } from "@/hooks/project-contacts/use-project-contacts";

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
  const { getProjectContacts, syncProjectContacts } = useProjectContacts();
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<ProjectInput>({
    name: project?.name || null,
    company_id: project?.company_id || null,
    status: project?.status || "abierto",
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

  useEffect(() => {
    if (isOpen) {
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

        loadProjectContacts();
      } else {
        // Limpiar todo el formulario cuando es modo crear
        setFormData({
          name: null,
          company_id: null,
          status: "abierto",
          nombre_responsable: null,
          email_responsable: null,
          phone_responsable: null,
          tabla: null,
          supabase_url: null,
          supabase_anon_key: null,
        });
        setOriginalData({
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
      }
    }
  }, [isOpen, project, mode, getProjectContacts]);

  const handleInputChange = (field: keyof ProjectInput, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  // Verificar si hay cambios en el formulario
  const hasChanges = () => {
    // Comparar campos del formulario
    return (
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
  };

  // Validar si el formulario está completo
  const isFormValid = () => {
    if (mode === "create") {
      return !!(formData.name && formData.company_id);
    }
    // En modo edit, verificar si hay cambios
    return hasChanges();
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
        description: "La empresa es requerida",
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
          onSuccess?.();
          onClose();
        }
      } else {
        await updateProject(project!.id, cleanedData);

        // Sincronizar contactos del proyecto (sin toast individual)
        await syncProjectContacts(project!.id, Array.from(selectedContactIds), false);

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
          <Button isAdmin variant="secondary" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            isAdmin
            variant="primary"
            className="bg-[#42668A]"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!isFormValid() || isLoading}
          >
            {mode === "create" ? "Crear Proyecto" : "Guardar Cambios"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1">
            <Select
              label="Empresa"
              placeholder="Seleccione una empresa"
              selectedKeys={formData.company_id ? [String(formData.company_id)] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleInputChange("company_id", selected ? parseInt(selected) : null);
              }}
              options={companies.map((company) => ({ value: String(company.id), label: company.name || "Sin nombre" }))}
              variant="faded"
              required
              classNames={{
                label: "!text-[#265197]",
                value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
                trigger: "bg-white !border-[#D4DEED]",
                selectorIcon: "text-[#678CC5]",
              }}
            />

        {mode === "edit" && (
          <Select
            label="Estatus"
            placeholder="Seleccione el estatus"
            selectedKeys={formData.status ? [formData.status] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              handleInputChange("status", selected || null);
            }}
            options={[
              { value: "abierto", label: "Abierto" },
              { value: "inactivo", label: "Inactivo" },
              { value: "cerrado", label: "Cerrado" }
            ]}
            variant="faded"
            classNames={{
              label: "!text-[#265197]",
              value: "!text-[#265197] data-[placeholder=true]:!text-[#A7BDE2]",
              trigger: "bg-white !border-[#D4DEED]",
              selectorIcon: "text-[#678CC5]",
            }}
          />
        )}

        <Input
          label="Nombre del Proyecto"
          placeholder="Ingrese el nombre"
          value={formData.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
          variant="faded"
          classNames={{
            inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
            label: "!text-[#265197]",
            input: "placeholder:text-[#A7BDE2] !text-[#265197]",
          }}
        />

        <Input
              label="Nombre del Responsable"
              placeholder="Ingrese el nombre del responsable"
              value={formData.nombre_responsable || ""}
              onChange={(e) => handleInputChange("nombre_responsable", e.target.value)}
              variant="faded"
              classNames={{
                inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                label: "!text-[#265197]",
                input: "placeholder:text-[#A7BDE2] !text-[#265197]",
              }}
            />

            <Input
              label="Email del Responsable"
              placeholder="email@ejemplo.com"
              type="email"
              value={formData.email_responsable || ""}
              onChange={(e) => handleInputChange("email_responsable", e.target.value)}
              variant="faded"
              classNames={{
                inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                label: "!text-[#265197]",
                input: "placeholder:text-[#A7BDE2] !text-[#265197]",
              }}
            />

            <Input
              label="Teléfono del Responsable"
              placeholder="Ingrese el teléfono"
              value={formData.phone_responsable || ""}
              onChange={(e) => handleInputChange("phone_responsable", e.target.value)}
              variant="faded"
              classNames={{
                inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                label: "!text-[#265197]",
                input: "placeholder:text-[#A7BDE2] !text-[#265197]",
              }}
            />
          </div>
    </DrawerCitricaAdmin>
  );
}
