"use client";
import { Divider } from "@heroui/divider";
import { LandingProject } from "@/hooks/landing-projects/use-landing-projects";
import { DetailModal } from "@/shared/components/citrica-ui";
import { Text, Button } from "citrica-ui-toolkit";

interface LandingProjectDetailModalProps {
  project: LandingProject;
  onClose: () => void;
}

export default function LandingProjectDetailModal({
  project,
  onClose,
}: LandingProjectDetailModalProps) {
  const sections = [
    {
      title: "Información General",
      content: (
        <div className="flex flex-col gap-2 my-2">
          <div className="flex flex-col">
            <Text isAdmin={true} variant="label" color="#678CC5">Título:</Text>
            <Text isAdmin={true} variant="body" color="#265197" weight="bold">{project.hero_title}</Text>
          </div>
          <div className="flex flex-col">
            <Text isAdmin={true} variant="label" color="#678CC5">Slug:</Text>
            <Text isAdmin={true} variant="body" color="#265197">/projects/{project.slug}</Text>
          </div>
          <div className="flex flex-col">
            <Text isAdmin={true} variant="label" color="#678CC5">Categoría:</Text>
            <Text isAdmin={true} variant="body" color="#265197">{project.hero_category}</Text>
          </div>
          <div className="flex flex-col">
            <Text isAdmin={true} variant="label" color="#678CC5">Subtítulo:</Text>
            <Text isAdmin={true} variant="body" color="#265197">{project.hero_subtitle || "-"}</Text>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Text isAdmin={true} variant="label" color="#678CC5">Estado:</Text>
              <span className={`px-2 py-1 rounded-full text-xs ${project.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                {project.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Text isAdmin={true} variant="label" color="#678CC5">Destacado:</Text>
              <span className={`px-2.5 py-1 rounded-full text-xs ${project.featured ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                {project.featured ? "Sí" : "No"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Descripción del Proyecto",
      content: (
        <div className="flex flex-col gap-2 my-2">
          <Text isAdmin={true} variant="label" color="#265197" weight="bold">{project.description_main_title || "-"}</Text>
          <Text isAdmin={true} variant="label" color="#678CC5">{project.description_text || "-"}</Text>
        </div>
      ),
    },
    {
      title: "Desafío",
      content: (
        <div className="flex flex-col gap-2 my-2">
          <Text isAdmin={true} variant="label" color="#678CC5">{project.challenge_description || "-"}</Text>
        </div>
      ),
    },
    {
      title: "Solución",
      content: (
        <div className="flex flex-col gap-2 my-2">
          <Text isAdmin={true} variant="label" color="#678CC5">{project.solution_description || "-"}</Text>
        </div>
      ),
    },
    {
      title: `Servicios (${project.services?.length || 0})`,
      content: (
        <div className="flex flex-wrap gap-2 my-3">
          {project.services && project.services.length > 0 ? (
            project.services.map((service, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                <Text isAdmin={true} variant="label" color="#265197">{service.title}</Text>
              </span>
            ))
          ) : (
            <Text isAdmin={true} variant="label" color="#678CC5">Sin servicios</Text>
          )}
        </div>
      ),
    },
    {
      title: `Tecnologías (${project.technologies?.length || 0})`,
      content: (
        <div className="flex flex-wrap gap-2 my-3">
          {project.technologies && project.technologies.length > 0 ? (
            project.technologies.map((tech, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                {tech.name}
              </span>
            ))
          ) : (
            <Text isAdmin={true} variant="label" color="#678CC5">Sin tecnologías</Text>
          )}
        </div>
      ),
    },
    {
      title: "",
      content: (
        <div className="flex items-center gap-2 text-sm text-[#678CC5]">
          <span>
            <Text isAdmin={true} variant="label" color="#678CC5">Creado el: </Text>
            <Text isAdmin={true} variant="label" color="#678CC5">{project.created_at ? new Date(project.created_at).toLocaleDateString('es-ES') : '-'}</Text>
          </span>
          <Divider orientation="vertical" className="h-4" />
          <span>
            <Text isAdmin={true} variant="label" color="#678CC5">Orden: </Text>
            <Text isAdmin={true} variant="label" color="#678CC5">{project.sort_order}</Text>
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
