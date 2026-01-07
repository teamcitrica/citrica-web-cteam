"use client";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { useState, useEffect } from "react";
import { Col, Container } from "@/styles/07-objects/objects";
import { InputCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import { Button } from "citrica-ui-toolkit";
import Modal from "@/shared/components/citrica-ui/molecules/modal";
import { addToast } from "@heroui/toast";
import {
  Database,
  Upload,
  Trash2,
  FileText,
  Loader2,
  FolderOpen,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing":
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
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
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#265197] mb-2">
              <span className="text-[#678CC5]">IA</span> {'>'} Bases de Datos RAG
            </h1>
            <p className="text-sm text-gray-600">
              Gestiona tus storages de documentos para el sistema RAG
            </p>
          </div>

          {/* Info Card */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Database className="w-6 h-6 text-[#265197] mt-1" />
              <div>
                <h3 className="font-semibold text-[#265197] mb-1">
                  Gemini File Search + Vector Stores
                </h3>
                <p className="text-sm text-gray-700">
                  Los documentos se suben a Gemini File API y se procesan automáticamente.
                  Gemini genera los embeddings y realiza búsquedas vectoriales internamente,
                  proporcionando respuestas contextualizadas en el chat.
                </p>
              </div>
            </div>
          </div>

          {/* Botón Crear Storage */}
          <div className="mb-6">
            <Button isAdmin variant="primary"
              style={{ backgroundColor: "#42668A" }} onClick={() => setIsCreateModalOpen(true)}>
              <FolderOpen className="w-5 h-5" />
              Nuevo Storage
            </Button>
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
                <FolderOpen className="w-16 h-16 text-gray-300 mb-3" />
                <h3 className="text-lg font-semibold text-gray-600 mb-1">
                  No hay storages creados
                </h3>
                <p className="text-sm text-gray-500">
                  Crea tu primer storage para comenzar a subir documentos
                </p>
              </div>
            ) : (
              storages.map((storage) => (
                <Card
                  key={storage.id}
                  onPress={() => setSelectedStorage(storage)}
                  className="w-full hover:scale-[1.02] transition-transform"
                >
                  <CardHeader className="bg-gradient-to-r from-[#265197] to-[#42668A] p-4 flex-col items-start">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Database className="w-6 h-6 text-white" />
                        <h3 className="text-white font-bold text-lg truncate">
                          {storage.name}
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
                        <Trash2 className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-blue-100 text-sm mt-1">
                      {storage.description}
                    </p>
                  </CardHeader>

                  <CardBody className="p-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Archivos</div>
                        <div className="text-xl font-bold text-[#265197]">
                          {storage.fileCount}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Tamaño</div>
                        <div className="text-xl font-bold text-[#265197]">
                          {formatFileSize(storage.totalSize)}
                        </div>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estado:</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(storage.status)}
                          <span className="text-xs font-medium">
                            {getStatusText(storage.status)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Creado: {new Date(storage.createdAt).toLocaleDateString("es-ES")}
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
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm font-medium">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
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
          <InputCitricaAdmin
            label="Nombre del Storage"
            type="text"
            value={newStorageName}
            onChange={(e) => setNewStorageName(e.target.value)}
            placeholder="Ej: Documentación de Ventas"
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
