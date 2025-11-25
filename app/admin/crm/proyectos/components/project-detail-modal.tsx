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
            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-600">Nombre del Proyecto</p>
              <p className="text-gray-800 text-lg">{project.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Empresa</p>
              <p className="text-gray-800">{companyName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Estado</p>
              <p className="text-gray-800 capitalize">{project.status || "-"}</p>
            </div>
            <div className="col-span-2 border-t pt-4 mt-2">
              <p className="text-sm font-semibold text-gray-600 mb-3">Información del Responsable</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Nombre</p>
                  <p className="text-gray-800">{project.nombre_responsable || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Email</p>
                  <p className="text-gray-800">{project.email_responsable || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Teléfono</p>
                  <p className="text-gray-800">{project.phone_responsable || "-"}</p>
                </div>
              </div>
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
