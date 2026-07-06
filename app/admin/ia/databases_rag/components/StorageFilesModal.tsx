"use client";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/shared/components/citrica-ui/molecules/modal";
import { Button, Icon, Text } from "citrica-ui-toolkit";
import { addToast } from "@heroui/toast";

interface StorageFile {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  gemini_file_state: string;
  processed: boolean;
}

interface Props {
  storageId: string | null;
  storageName: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function StorageFilesModal({
  storageId,
  storageName,
  isOpen,
  onClose,
  onRefresh,
}: Props) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<StorageFile | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const fetchFiles = useCallback(async (silent = false) => {
    if (!storageId) return;

    try {
      if (!silent) {
        setIsLoading(true);
      }
      const response = await fetch(`/api/rag/files?storageId=${storageId}`);
      const data = await response.json();

      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      if (!silent) {
        addToast({
          title: "Error",
          description: "Error al cargar los archivos",
          color: "danger",
        });
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [storageId]);

  // Cargar archivos cuando se abre el modal
  useEffect(() => {
    if (isOpen && storageId) {
      fetchFiles();
    }
  }, [isOpen, storageId, fetchFiles]);

  // Auto-refresh cada 5 segundos si el modal está abierto (para ver archivos nuevos subidos)
  useEffect(() => {
    if (!isOpen || !storageId) return;

    const interval = setInterval(() => {
      fetchFiles(true); // Silent refresh (sin loading ni toasts)
    }, 5000); // Refresh cada 5 segundos

    return () => clearInterval(interval);
  }, [isOpen, storageId, fetchFiles]);

  const handleDownload = useCallback(async (file: StorageFile) => {
    try {
      setIsDownloading(file.id);

      const response = await fetch(`/api/rag/files/download?fileId=${file.id}`);

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast({
        title: "Éxito",
        description: `Archivo "${file.file_name}" descargado`,
        color: "success",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      addToast({
        title: "Error",
        description: "Error al descargar el archivo",
        color: "danger",
      });
    } finally {
      setIsDownloading(null);
    }
  }, []);

  const openDeleteConfirm = useCallback((file: StorageFile) => {
    setFileToDelete(file);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!fileToDelete) return;

    try {
      setIsDeleting(fileToDelete.id);

      const response = await fetch(`/api/rag/files?fileId=${fileToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el archivo");
      }

      addToast({
        title: "Éxito",
        description: `Archivo "${fileToDelete.file_name}" eliminado`,
        color: "success",
      });

      // Refrescar lista de archivos
      await fetchFiles();
      onRefresh(); // Refrescar lista de storages también

      setIsDeleteConfirmOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error("Error deleting file:", error);
      addToast({
        title: "Error",
        description: "Error al eliminar el archivo",
        color: "danger",
      });
    } finally {
      setIsDeleting(null);
    }
  }, [fileToDelete, fetchFiles, onRefresh]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "ACTIVE":
        return <Icon name="CheckCircle" size={16} color="#22c55e" />;
      case "PROCESSING":
        return <Icon name="Loader2" size={16} color="#eab308" className="animate-spin" />;
      case "FAILED":
        return <Icon name="AlertCircle" size={16} color="#ef4444" />;
      default:
        return <Icon name="HelpCircle" size={16} color="#9ca3af" />;
    }
  };

  const getStateText = (state: string) => {
    switch (state) {
      case "ACTIVE":
        return "Activo";
      case "PROCESSING":
        return "Procesando";
      case "FAILED":
        return "Error";
      default:
        return "Desconocido";
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.file_size, 0);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`📁 Archivos de "${storageName}"`}
        size="3xl"
        footer={
          <div className="flex justify-end">
            <Button isAdmin variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Información del storage */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name="FileText" size={20} color="#265197" />
              <Text isAdmin variant="body" weight="bold" color="#265197">
                Total: {files.length} archivo{files.length !== 1 ? "s" : ""} ({formatFileSize(totalSize)})
              </Text>
            </div>
          </div>

          {/* Tabla de archivos */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} color="#265197" className="animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icon name="FolderOpen" size={48} color="#9CA3AF" />
              <Text isAdmin variant="body" weight="bold" color="#4B5563" className="mt-2">
                No hay archivos en este storage
              </Text>
              <Text isAdmin variant="label" color="#6B7280">
                Sube archivos usando el botón "Subir Archivos" en la tarjeta del storage
              </Text>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2">
                      <Text isAdmin variant="label" weight="bold" color="#4B5563">
                        Nombre
                      </Text>
                    </th>
                    <th className="text-left py-3 px-2">
                      <Text isAdmin variant="label" weight="bold" color="#4B5563">
                        Tamaño
                      </Text>
                    </th>
                    <th className="text-left py-3 px-2">
                      <Text isAdmin variant="label" weight="bold" color="#4B5563">
                        Fecha
                      </Text>
                    </th>
                    <th className="text-left py-3 px-2">
                      <Text isAdmin variant="label" weight="bold" color="#4B5563">
                        Estado
                      </Text>
                    </th>
                    <th className="text-center py-3 px-2">
                      <Text isAdmin variant="label" weight="bold" color="#4B5563">
                        Acciones
                      </Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Icon name="FileText" size={16} color="#265197" />
                          <Text isAdmin variant="body" color="#16305A" className="truncate max-w-xs">
                            {file.file_name}
                          </Text>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Text isAdmin variant="label" color="#4B5563">
                          {formatFileSize(file.file_size)}
                        </Text>
                      </td>
                      <td className="py-3 px-2">
                        <Text isAdmin variant="label" color="#4B5563">
                          {new Date(file.uploaded_at).toLocaleDateString("es-ES")}
                        </Text>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          {getStateIcon(file.gemini_file_state)}
                          <Text isAdmin variant="label" color="#4B5563">
                            {getStateText(file.gemini_file_state)}
                          </Text>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-2">
                          {/* Botón Descargar */}
                          <button
                            onClick={() => handleDownload(file)}
                            disabled={isDownloading === file.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Descargar archivo"
                          >
                            {isDownloading === file.id ? (
                              <Icon name="Loader2" size={18} className="animate-spin" />
                            ) : (
                              <Icon name="Download" size={18} />
                            )}
                          </button>

                          {/* Botón Eliminar */}
                          <button
                            onClick={() => openDeleteConfirm(file)}
                            disabled={isDeleting === file.id || file.gemini_file_state === "PROCESSING"}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar archivo"
                          >
                            {isDeleting === file.id ? (
                              <Icon name="Loader2" size={18} className="animate-spin" />
                            ) : (
                              <Icon name="Trash2" size={18} />
                            )}
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
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setFileToDelete(null);
        }}
        title="⚠️ Confirmar Eliminación"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              isAdmin
              variant="secondary"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setFileToDelete(null);
              }}
              disabled={!!isDeleting}
            >
              Cancelar
            </Button>
            <Button
              isAdmin
              onClick={handleDelete}
              disabled={!!isDeleting}
              style={{ backgroundColor: "#dc2626" }}
            >
              {isDeleting ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar el archivo{" "}
            <strong className="text-[#265197]">"{fileToDelete?.file_name}"</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
            <p className="text-sm text-red-800 font-medium">
              Esta acción eliminará el archivo de:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
              <li>Gemini File API (ya no podrás consultarlo en el chat)</li>
              <li>Supabase Storage (no podrás descargarlo)</li>
              <li>Base de datos</li>
            </ul>
            <p className="text-sm text-red-800 font-bold mt-2">
              ⚠️ Esta acción NO se puede deshacer.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
