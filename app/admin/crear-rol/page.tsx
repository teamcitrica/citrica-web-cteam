"use client";

import { useState, useEffect } from "react";
import { Button } from "citrica-ui-toolkit";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useUserRole, RoleType } from "@/hooks/role/use-role";
import CreateRoleModal from "./components/modal-create-role";
import EditRoleModal from "./components/modal-edit-role";
import DeleteRoleModal from "./components/modal-delete-role";
import { Col, Container } from "@/styles/07-objects/objects";

export default function CrearRolPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const { roles, fetchRolesWithCredentials, isLoading } = useUserRole();

  useEffect(() => {
    fetchRolesWithCredentials();
  }, [fetchRolesWithCredentials]);

  const handleEdit = (role: RoleType) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  const handleDelete = (role: RoleType) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  return (
    <Container>
      <Col cols={{lg:12,md:6,sm:4}}>
          <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Gestión de Roles</h1>
          <p className="text-gray-600 mt-2">
            Crea y administra los roles con credenciales asociadas
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={() => setIsModalOpen(true)}
        >
          Crear Rol
        </Button>
      </div>

      {/* Tabla de roles existentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-black mb-4">
          Roles con Credenciales
        </h2>
        {isLoading ? (
          <p className="text-gray-600">Cargando roles...</p>
        ) : roles.length === 0 ? (
          <p className="text-gray-600">No hay roles con credenciales asociadas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-black">ID</th>
                  <th className="text-left p-3 text-black">Nombre</th>
                  <th className="text-left p-3 text-black">Descripción</th>
                  <th className="text-left p-3 text-black">Fecha creación</th>
                  <th className="text-left p-3 text-black">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-black">{role.id}</td>
                    <td className="p-3 text-black font-medium">{role.name}</td>
                    <td className="p-3 text-black">{role.description}</td>
                    <td className="p-3 text-black">
                      {role.created_at
                        ? new Date(role.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="p-3 text-black">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para crear rol */}
      <CreateRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal para editar rol */}
      {selectedRole && (
        <EditRoleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
        />
      )}

      {/* Modal para eliminar rol */}
      {selectedRole && (
        <DeleteRoleModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
        />
      )}
    </div>
      </Col>
    </Container>

  );
}
