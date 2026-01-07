"use client";
import { useEffect, useState } from "react";
import {
  Divider,
  Skeleton,
} from "@heroui/react";

import { Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";
import { useUserProjects } from "@/hooks/user-projects/use-user-projects";
import { UserType } from "@/shared/types/types";
import { DetailModal } from "@/shared/components/citrica-ui";
import { Text, Button } from "citrica-ui-toolkit";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

// Función para convertir texto a Camel Case (primera letra mayúscula, resto minúscula)
const toCamelCase = (text: string | undefined | null): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export default function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  const { companies } = useCompanyCRUD();
  const { getProjectUsers } = useUserProjects();
  const [projectUsers, setProjectUsers] = useState<UserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  const companyName = companies.find(c => c.id === project.company_id)?.name;

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      const users = await getProjectUsers(project.id);
      setProjectUsers(users);
      setIsLoadingUsers(false);
    };
    fetchUsers();
  }, [project.id, getProjectUsers]);

  useEffect(() => {
    // Esperar a que companies esté cargado
    if (companies.length > 0 || project.company_id === null) {
      setIsLoadingCompany(false);
    }
  }, [companies, project.company_id]);

  const sections = [
    {
      title: "",
      content: (
        <div className="flex flex-col">
          <p className="pb-2">
            <Text variant="body" color="#265197" weight="bold">Nombre: {toCamelCase(project.name) || "-"}</Text>
          </p>
          <div className="flex flex-col gap-1">
            {isLoadingCompany ? (
              <Skeleton className="h-5 w-48 rounded-lg" />
            ) : (
              <p className="flex flex-col pb-2">
                <Text variant="label" color="#678CC5">Empresa:</Text>
                <Text variant="body" color="#265197" weight="bold">{companyName ? toCamelCase(companyName) : "Sin empresa"}</Text>
              </p>
            )}
            <p className="flex flex-col pb-2">
              <Text variant="label" color="#678CC5">Estado:</Text>
              <Text variant="body" color="#265197" weight="bold">{toCamelCase(project.status) || "-"}</Text>
            </p>
            <p className="flex flex-col pb-2">
              <Text variant="label" color="#678CC5">Assets:</Text>
              <Text variant="body" color="#265197" weight="bold">{project.asset_count ?? 0}</Text>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: `${project.access_count ?? 0} ${(project.access_count ?? 0) === 1 ? "Usuario invitado" : "Usuarios invitados"}`,
      content: (
        <div className="flex flex-col gap-1">
          {isLoadingUsers ? (
            <>
              <Skeleton className="h-4 w-40 rounded-lg mb-1" />
              <Skeleton className="h-4 w-36 rounded-lg mb-1" />
              <Skeleton className="h-4 w-44 rounded-lg" />
            </>
          ) : projectUsers.length > 0 ? (
            projectUsers.map((user) => (
              <p key={user.id} className="py-2">
                <Text variant="label" color="#678CC5">{toCamelCase(user.first_name)} {toCamelCase(user.last_name)}</Text>
              </p>
            ))
          ) : (
            <p className="py-2">
              <Text variant="label" color="#678CC5">No hay usuarios asignados</Text>
            </p>
          )}
        </div>
      ),
    },
    {
      title: "",
      content: (
        <div className="flex items-center gap-2 text-sm text-[#678CC5]">
          <span>
            <Text variant="label" color="#678CC5">Creado el: </Text>
            <Text variant="label" color="#678CC5">{project.created_at ? new Date(project.created_at).toLocaleDateString('es-ES') : '-'}</Text>
          </span>
          <Divider orientation="vertical" className="h-4" />
          <span>
            <Text variant="label" color="#678CC5">Por: </Text>
            <Text variant="label" color="#678CC5">{project.created_by_user ? `${toCamelCase(project.created_by_user.first_name)} ${toCamelCase(project.created_by_user.last_name)}` : '-'}</Text>
          </span>
        </div>
      ),
    },
  ];

  return (
    <DetailModal
      isOpen={true}
      onClose={onClose}
      title="DETALLES DEL PROYECTO"
      sections={sections}
      footer={
        <Button isAdmin variant="secondary" onPress={onClose}>
          Cerrar
        </Button>
      }
    />
  );
}
