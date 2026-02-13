"use client";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { useState, useEffect } from "react";
import { Button, Input, Col, Container, Icon, Text } from "citrica-ui-toolkit";
import Modal from "@/shared/components/citrica-ui/molecules/modal";
import { addToast } from "@heroui/toast";
import { Divider } from "@heroui/divider";

// Tipo para los storage de documentos
interface DocumentStorage {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  totalSize: number;
  embeddingModel: string;
  status: "ready" | "processing" | "error";
  createdAt: string;
  files: StorageFile[];
}

interface StorageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  processed: boolean;
}

export default function DatabasesRAGPage() {
  const [storages, setStorages] = useState<DocumentStorage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStorageName, setNewStorageName] = useState("");
  const [newStorageDescription, setNewStorageDescription] = useState("");
  const [selectedStorage, setSelectedStorage] = useState<DocumentStorage | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [storageToDelete, setStorageToDelete] = useState<DocumentStorage | null>(null);

  // Cargar storages al montar el componente
  useEffect(() => {
    fetchStorages();
  }, []);

  const fetchStorages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/rag/storage");
      const data = await response.json();

      if (data.storages) {
        setStorages(data.storages.map((s: any) => ({
          ...s,
          createdAt: s.created_at,
          embeddingModel: s.embedding_model,
          files: [],
        })));
      }
    } catch (error) {
      console.error("Error fetching storages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleCreateStorage = async () => {
    if (!newStorageName.trim()) return;

    try {
      const response = await fetch("/api/rag/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStorageName,
          description: newStorageDescription,
        }),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setNewStorageName("");
        setNewStorageDescription("");
        await fetchStorages(); // Recargar lista
      }
    } catch (error) {
      console.error("Error creating storage:", error);
      alert("Error al crear el storage");
    }
  };

  const handleFileUpload = async (
    storageId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(prev => ({ ...prev, [storageId]: true }));

    try {
      // Procesar cada archivo
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("storageId", storageId);
        formData.append("file", file);

        const response = await fetch("/api/rag/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.error || `Error subiendo ${file.name}`);
        }

        const result = await response.json();
        console.log("Upload result:", result);
      }

      addToast({
        title: "Éxito",
        description: `${files.length} archivo(s) procesado(s) exitosamente`,
        color: "success",
      });
      await fetchStorages(); // Recargar lista
    } catch (error: any) {
      console.error("Error uploading files:", error);
      addToast({
        title: "Error",
        description: error.message || "Error al procesar archivos",
        color: "danger",
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [storageId]: false }));
    }
  };

  const openDeleteModal = (storage: DocumentStorage) => {
    setStorageToDelete(storage);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteStorage = async () => {
    if (!storageToDelete) return;

    try {
      const response = await fetch(`/api/rag/storage?id=${storageToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchStorages(); // Recargar lista
        setIsDeleteModalOpen(false);
        setStorageToDelete(null);
      } else {
        alert("Error al eliminar el storage");
      }
    } catch (error) {
      console.error("Error deleting storage:", error);
      alert("Error al eliminar el storage");
    }
  };

  const getStatusIcon = (status: DocumentStorage["status"]) => {
    switch (status) {
      case "ready":
        return <Icon name="CheckCircle" size={16} color="#22c55e" />;
      case "processing":
        return <Icon name="Loader2" size={16} color="#eab308" className="animate-spin" />;
      case "error":
        return <Icon name="AlertCircle" size={16} color="#ef4444" />;
    }
  };

  const getStatusText = (status: DocumentStorage["status"]) => {
    switch (status) {
      case "ready":
        return "Listo";
      case "processing":
        return "Procesando";
      case "error":
        return "Error";
    }
  };

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <div>
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#265197]">
              <Text isAdmin={true} variant="title" weight="bold" color="#678CC5">IA</Text> {'>'}  <Text isAdmin={true} variant="title" weight="bold" color="#16305A">Bases de Datos RAG</Text>
            </h1>
            <p>
              <Text isAdmin={true} variant="label" color="#16305A">Gestiona tus storages de documentos para el sistema RAG</Text>
            </p>
          </div>

          {/* Info Card */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Database" size={24} color="#16305A" />
              <div>
                <h3 className="mb-1">
                  <Text isAdmin={true} variant="body" weight="bold" color="#16305A">Gemini File Search + Vector Stores</Text>
                </h3>
                <p>
                  <Text isAdmin={true} variant="body" color="#265197">
                    Los documentos se suben a Gemini File API y se procesan automáticamente.
                    Gemini genera los embeddings y realiza búsquedas vectoriales internamente,
                    proporcionando respuestas contextualizadas en el chat.
                  </Text>
                </p>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda y botón Crear Storage */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <Input
              type="text"
              placeholder="Buscar storages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon size={16} color="#265197" name="Search" />}
              className="w-full sm:w-64"
              variant="faded"
              classNames={{
                inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
                label: "!text-[#265197]",
                input: "placeholder:text-[#A7BDE2] !text-[#265197]",
              }}
            />
            <Button
              isAdmin
              variant="primary"
              startContent={<Icon size={16} name="Plus" />}
              onClick={() => setIsCreateModalOpen(true)}
              label="Nuevo Storage"
            />
          </div>
          {/* Grid de Storage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skeleton Loader */}
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="w-full">
                    <CardHeader className="bg-gradient-to-r from-[#265197] to-[#42668A] p-4">
                      <Skeleton className="w-3/4 h-6 rounded-lg bg-white/20" />

                    </CardHeader>
                    <CardBody className="p-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <Skeleton className="w-full h-16 rounded-lg" />
                        <Skeleton className="w-full h-16 rounded-lg" />
                      </div>
                      <Skeleton className="w-full h-4 rounded-lg mb-2" />
                      <Skeleton className="w-2/3 h-4 rounded-lg mb-4" />
                    </CardBody>
                    <CardFooter className="p-4 pt-0">
                      <Skeleton className="w-full h-10 rounded-lg" />
                    </CardFooter>
                  </Card>
                ))}
              </>
            ) : storages.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Icon name="FolderOpen" size={64} color="#9CA3AF" />
                <h3 className="text-lg font-semibold text-gray-600 mb-1">
                  <Text isAdmin={true} variant="body" weight="bold" color="#16305A">No hay storages creados</Text>
                </h3>
                <p className="text-sm text-gray-500">
                  <Text isAdmin={true} variant="body" color="#4B5563">
                    Crea tu primer storage para comenzar a subir documentos
                  </Text>
                </p>
              </div>
            ) : (
              storages.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((storage) => (
                <Card
                  key={storage.id}
                  onPress={() => setSelectedStorage(storage)}
                  className="w-full hover:scale-[1.02] transition-transform"
                >
                  <CardHeader className="p-4 flex-col items-start">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Icon name="Database" size={16} color="#16305A" />
                        <h3 className="truncate">
                          <Text isAdmin={true} variant="body" weight="bold" color="#16305A">{storage.name}</Text>
                        </h3>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(storage);
                        }}
                        className="text-white hover:text-red-300 transition-colors cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            openDeleteModal(storage);
                          }
                        }}
                      >
                        <Icon name="Trash2" size={20} color="#EF4444" />
                      </div>
                    </div>
                    <p className="text-blue-100 text-sm mt-1">
                      <Text isAdmin={true} variant="label" color="#265197">{storage.description || "Chat"}</Text>
                    </p>
                  </CardHeader>

                  <Divider />

                  <CardBody className="p-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">
                          <Text isAdmin={true} variant="label" color="#4B5563">Archivos</Text>
                        </div>
                        <div className="text-xl font-bold text-[#265197]">
                          <Text isAdmin={true} variant="body" color="#265197">{storage.fileCount}</Text>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">
                          <Text isAdmin={true} variant="label" color="#4B5563">Tamaño</Text>
                        </div>
                        <div className="text-xl font-bold text-[#265197]">
                          <Text isAdmin={true} variant="body" color="#265197">{formatFileSize(storage.totalSize)}</Text>
                        </div>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="flex items-center gap-2">
                        <Text isAdmin={true} variant="label" color="#4B5563">Estado:</Text>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(storage.status)}
                          <Text isAdmin={true} variant="label" color="#265197">{getStatusText(storage.status)}</Text>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <Text isAdmin={true} variant="label" color="#4B5563">Creado: {new Date(storage.createdAt).toLocaleDateString("es-ES")}</Text>
                      </div>
                    </div>
                  </CardBody>

                  <CardFooter className="p-4 pt-0">
                    {/* Upload Button */}
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-[#265197] text-[#265197] rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${uploadingFiles[storage.id] ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {uploadingFiles[storage.id] ? (
                        <>
                          <Icon name="Loader2" size={20} className="animate-spin" />
                          <span className="text-sm font-medium">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Upload" size={20} />
                          <span className="text-sm font-medium">
                            Subir Archivos
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.txt,.doc,.docx,.md"
                        onChange={(e) => handleFileUpload(storage.id, e)}
                        disabled={uploadingFiles[storage.id]}
                        className="hidden"
                      />
                    </label>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </Col>

      {/* Modal Crear Storage */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Storage"
        size="md"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              isAdmin
              onClick={() => setIsCreateModalOpen(false)}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              isAdmin
              onClick={handleCreateStorage}
              disabled={!newStorageName.trim()}
            >
              Crear Storage
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Storage"
            type="text"
            value={newStorageName}
            onChange={(e) => setNewStorageName(e.target.value)}
            placeholder="Ej: Documentación de Ventas"
            variant="faded"
            classNames={{
              inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
              label: "!text-[#265197]",
              input: "placeholder:text-[#A7BDE2] !text-[#265197]",
            }}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={newStorageDescription}
              onChange={(e) => setNewStorageDescription(e.target.value)}
              placeholder="Breve descripción del contenido..."
              rows={3}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#265197]"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStorageToDelete(null);
        }}
        title="Confirmar Eliminación"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              isAdmin
              onClick={() => {
                setIsDeleteModalOpen(false);
                setStorageToDelete(null);
              }}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              isAdmin
              onClick={handleDeleteStorage}
              style={{ backgroundColor: "#dc2626" }}
            >
              Eliminar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar el storage{" "}
            <strong className="text-[#265197]">"{storageToDelete?.name}"</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              ⚠️ Esta acción eliminará todos los documentos asociados y no se puede deshacer.
            </p>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
