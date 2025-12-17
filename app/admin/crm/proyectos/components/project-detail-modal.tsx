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
import { ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import { DetailModal } from "@/shared/components/citrica-ui";

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
          <p className="text-sm font-semibold text-[#265197] pb-2">
            Nombre: {toCamelCase(project.name) || "-"}
          </p>
          <div className="flex flex-col gap-1">
            {isLoadingCompany ? (
              <Skeleton className="h-5 w-48 rounded-lg" />
            ) : (
              <p className="text-sm text-[#265197]">
                Empresa: {companyName ? toCamelCase(companyName) : "Sin empresa"}
              </p>
            )}
            <p className="text-sm text-[#265197]">
              Estado: {toCamelCase(project.status) || "-"}
            </p>
            <p className="text-sm text-[#265197]">
              Assets: {project.asset_count ?? 0}
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
              <p key={user.id} className="text-sm text-[#265197]">
                {toCamelCase(user.first_name)} {toCamelCase(user.last_name)}
              </p>
            ))
          ) : (
            <p className="text-sm text-[#265197]">No hay usuarios asignados</p>
          )}
        </div>
      ),
    },
    {
      title: "",
      content: (
        <div className="flex items-center gap-2 text-sm text-[#678CC5]">
          <span>
            Creado el: {project.created_at ? new Date(project.created_at).toLocaleDateString('es-ES') : '-'}
          </span>
          <Divider orientation="vertical" className="h-4" />
          <span>
            Por: {project.created_by_user ? `${toCamelCase(project.created_by_user.first_name)} ${toCamelCase(project.created_by_user.last_name)}` : '-'}
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
        <ButtonCitricaAdmin variant="modal" onPress={onClose}>
          Cerrar
        </ButtonCitricaAdmin>
      }
    />
  );
}
