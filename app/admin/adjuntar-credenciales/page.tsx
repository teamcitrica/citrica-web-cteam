"use client";

import { useState, useEffect } from "react";
import { Button } from "citrica-ui-toolkit";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import AttachCredentialsModal from "./components/modal-attach-credentials";
import ViewCredentialModal from "./components/modal-view-credential";
import EditCredentialModal from "./components/modal-edit-credential";
import DeleteCredentialModal from "./components/modal-delete-credential";
import { useCredentials, CredentialType } from "@/hooks/use-credentials";
import { Col, Container } from "@/styles/07-objects/objects";

export default function AdjuntarCredencialesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialType | null>(null);
  const { credentials, fetchCredentials, isLoading } = useCredentials();

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleView = (credential: CredentialType) => {
    setSelectedCredential(credential);
    setIsViewModalOpen(true);
  };

  const handleEdit = (credential: CredentialType) => {
    setSelectedCredential(credential);
    setIsEditModalOpen(true);
  };

  const handleDelete = (credential: CredentialType) => {
    setSelectedCredential(credential);
    setIsDeleteModalOpen(true);
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 10) return key;
    return `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
  };

  return (
    <Container>
      <Col cols={{lg:12,md:6,sm:4}}>
          <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Adjuntar Credenciales</h1>
          <p className="text-gray-600 mt-2">
            Configura las credenciales de Supabase para los roles
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={() => setIsModalOpen(true)}
        >
          Adjuntar Credenciales
        </Button>
      </div>

      {/* Tabla de credenciales existentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-black mb-4">
          Credenciales Existentes
        </h2>
        {isLoading ? (
          <p className="text-gray-600">Cargando credenciales...</p>
        ) : credentials.length === 0 ? (
          <p className="text-gray-600">No hay credenciales registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-black">ID</th>
                  <th className="text-left p-3 text-black">Rol</th>
                  <th className="text-left p-3 text-black">Supabase URL</th>
                  <th className="text-left p-3 text-black">Anon Key</th>
                  <th className="text-left p-3 text-black">Tabla</th>
                  <th className="text-left p-3 text-black">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((credential) => (
                  <tr key={credential.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-black">{credential.id}</td>
                    <td className="p-3 text-black font-medium">
                      {credential.role?.name || "N/A"}
                    </td>
                    <td className="p-3 text-black text-sm">
                      {credential.supabase_url}
                    </td>
                    <td className="p-3 text-black text-sm font-mono">
                      {maskKey(credential.supabase_anon_key)}
                    </td>
                    <td className="p-3 text-black">
                      {credential.table_name}
                    </td>
                    <td className="p-3 text-black">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(credential)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(credential)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(credential)}
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

      {/* Modal para adjuntar credenciales */}
      <AttachCredentialsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchCredentials(); // Recargar la lista después de agregar
        }}
      />

      {/* Modal para ver credencial */}
      {selectedCredential && (
        <ViewCredentialModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedCredential(null);
          }}
          credential={selectedCredential}
        />
      )}

      {/* Modal para editar credencial */}
      {selectedCredential && (
        <EditCredentialModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCredential(null);
          }}
          credential={selectedCredential}
        />
      )}

      {/* Modal para eliminar credencial */}
      {selectedCredential && (
        <DeleteCredentialModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedCredential(null);
          }}
          credential={selectedCredential}
        />
      )}
    </div>
      </Col>
    </Container>

  );
}
