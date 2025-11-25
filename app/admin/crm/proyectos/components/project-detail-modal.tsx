"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import { Project } from "@/hooks/projects/use-projects";
import { useCompanyCRUD } from "@/hooks/companies/use-companies";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  const { companies } = useCompanyCRUD();

  const companyName = companies.find(c => c.id === project.company_id)?.name || "Sin empresa";

  return (
    <Modal isOpen={true} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Detalles del Proyecto
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Nombre</p>
              <p className="text-gray-800">{project.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Empresa</p>
              <p className="text-gray-800">{companyName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Estado</p>
              <p className="text-gray-800 capitalize">{project.status || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Tabla</p>
              <p className="text-gray-800">{project.tabla || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Nombre del Responsable</p>
              <p className="text-gray-800">{project.nombre_responsable || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Email del Responsable</p>
              <p className="text-gray-800">{project.email_responsable || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Teléfono del Responsable</p>
              <p className="text-gray-800">{project.phone_responsable || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-600">Supabase URL</p>
              <p className="text-gray-800 break-all">{project.supabase_url || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-600">Supabase Anon Key</p>
              <p className="text-gray-800 break-all font-mono text-xs">
                {project.supabase_anon_key || "-"}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
