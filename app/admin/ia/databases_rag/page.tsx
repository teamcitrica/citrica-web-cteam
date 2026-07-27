"use client";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { useState, useEffect } from "react";
import { Button, Input, Col, Container, Icon, Text } from "citrica-ui-toolkit";
import Modal from "@/shared/components/citrica-ui/molecules/modal";
import { addToast } from "@heroui/toast";
import { Divider } from "@heroui/divider";
import { Switch } from "@heroui/switch";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import StorageFilesModal from "./components/StorageFilesModal";
import { validateRagFile, ACCEPT_ATTRIBUTE, LIMITS_LABEL } from "@/lib/ai/rag-file-support";

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
  total_tokens_used?: number;
  total_cost_usd?: number;
  strict_mode?: boolean;
  custom_prompt?: string | null;
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
  const [newStorageStrictMode, setNewStorageStrictMode] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<DocumentStorage | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [reprocessingStorages, setReprocessingStorages] = useState<Record<string, boolean>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [storageToDelete, setStorageToDelete] = useState<DocumentStorage | null>(null);
  const [selectedStorageForFiles, setSelectedStorageForFiles] = useState<DocumentStorage | null>(null);
  const [promptModalStorage, setPromptModalStorage] = useState<DocumentStorage | null>(null);
  const [promptDraft, setPromptDraft] = useState("");
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [ragDefaults, setRagDefaults] = useState<{ base: string; strict: string } | null>(null);

  // Cargar storages y prompts default al montar el componente
  useEffect(() => {
    fetchStorages();
    fetch("/api/rag/prompts")
      .then((res) => res.json())
      .then((data) => {
        if (data.defaults) setRagDefaults(data.defaults);
      })
      .catch((error) => console.error("Error fetching RAG prompt defaults:", error));
  }, []);

  const fetchStorages = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
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
      if (!silent) {
        setIsLoading(false);
      }
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
          strict_mode: newStorageStrictMode,
        }),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setNewStorageName("");
        setNewStorageDescription("");
        setNewStorageStrictMode(false);
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

    // Validar formato y tamaño ANTES de subir — feedback inmediato
    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      const error = validateRagFile(file.name, file.size);
      if (error) {
        addToast({
          title: `No se puede subir "${file.name}"`,
          description: error,
          color: "danger",
        });
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      event.target.value = "";
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [storageId]: true }));

    let uploadedCount = 0;
    let totalSize = 0;

    try {
      // Procesar cada archivo
      for (const file of validFiles) {
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
        uploadedCount++;
        totalSize += file.size;
      }

      addToast({
        title: "Éxito",
        description: `${uploadedCount} archivo(s) procesado(s) exitosamente`,
        color: "success",
      });

      // ✅ MEJORA: Actualización optimista - solo actualizar el storage afectado
      setStorages(prev => prev.map(storage => {
        if (storage.id === storageId) {
          return {
            ...storage,
            fileCount: storage.fileCount + uploadedCount,
            totalSize: storage.totalSize + totalSize,
            status: "processing" as const, // Se actualizará cuando Gemini termine
          };
        }
        return storage;
      }));

      // Actualizar storage específico en background (sin bloquear UI)
      setTimeout(async () => {
        try {
          const response = await fetch("/api/rag/storage");
          const data = await response.json();
          if (data.storages) {
            const updatedStorage = data.storages.find((s: any) => s.id === storageId);
            if (updatedStorage) {
              setStorages(prev => prev.map(storage =>
                storage.id === storageId
                  ? {
                      ...storage,
                      ...updatedStorage,
                      createdAt: updatedStorage.created_at,
                      embeddingModel: updatedStorage.embedding_model,
                    }
                  : storage
              ));
            }
          }
        } catch (error) {
          console.error("Error refreshing storage:", error);
        }
      }, 1000); // Esperar 1 segundo para que Gemini procese

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

  // Reindexa en Gemini File Search los archivos pendientes/fallidos del storage
  // usando los respaldos del bucket (no requiere volver a subir los archivos)
  const handleReprocess = async (storageId: string) => {
    setReprocessingStorages(prev => ({ ...prev, [storageId]: true }));
    setStorages(prev => prev.map(s => s.id === storageId ? { ...s, status: "processing" as const } : s));

    try {
      const response = await fetch("/api/rag/storage/reprocess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al reprocesar");
      }

      const failedDetail = (result.files || [])
        .filter((f: any) => f.state === "FAILED")
        .map((f: any) => f.fileName)
        .join(", ");

      addToast({
        title: result.failed > 0 ? "Reproceso con errores" : "Reproceso completado",
        description: `${result.processed} indexado(s), ${result.skipped} sin cambios, ${result.failed} fallido(s)${failedDetail ? `: ${failedDetail}` : ""}`,
        color: result.failed > 0 ? "warning" : "success",
      });
    } catch (error: any) {
      console.error("Error reprocessing storage:", error);
      addToast({
        title: "Error",
        description: error.message || "Error al reprocesar el storage",
        color: "danger",
      });
    } finally {
      setReprocessingStorages(prev => ({ ...prev, [storageId]: false }));
      await fetchStorages(true);
    }
  };

  const handleToggleStrictMode = async (storage: DocumentStorage, value: boolean) => {
    // Actualización optimista; revertir si el PATCH falla
    setStorages(prev => prev.map(s => s.id === storage.id ? { ...s, strict_mode: value } : s));

    try {
      const response = await fetch("/api/rag/storage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: storage.id, strict_mode: value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar modo estricto");
      }

      addToast({
        title: value ? "Modo estricto activado" : "Modo estricto desactivado",
        description: value
          ? "El chat responderá solo con el contenido del documento, siguiendo su estructura."
          : "El chat puede complementar con conocimiento general.",
        color: "success",
      });
    } catch (error: any) {
      setStorages(prev => prev.map(s => s.id === storage.id ? { ...s, strict_mode: !value } : s));
      addToast({
        title: "Error",
        description: error.message || "Error al actualizar modo estricto",
        color: "danger",
      });
    }
  };

  // Abrir editor de prompt personalizado, prefilled con el custom o el default efectivo
  const openPromptModal = (storage: DocumentStorage) => {
    const effectiveDefault = storage.strict_mode
      ? ragDefaults?.strict || ""
      : ragDefaults?.base || "";
    setPromptDraft(storage.custom_prompt || effectiveDefault);
    setPromptModalStorage(storage);
  };

  // custom_prompt: string guarda, null limpia (vuelve al default global)
  const patchStoragePrompt = async (storage: DocumentStorage, customPrompt: string | null) => {
    setIsSavingPrompt(true);
    try {
      const response = await fetch("/api/rag/storage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: storage.id, custom_prompt: customPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el prompt");
      }

      setStorages(prev => prev.map(s =>
        s.id === storage.id ? { ...s, custom_prompt: customPrompt } : s
      ));
      setPromptModalStorage(null);
      addToast({
        title: customPrompt ? "Prompt personalizado guardado" : "Prompt restaurado al default",
        description: customPrompt
          ? `"${storage.name}" usará su propio prompt en el chat.`
          : `"${storage.name}" volverá a usar el prompt default global.`,
        color: "success",
      });
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Error al guardar el prompt",
        color: "danger",
      });
    } finally {
      setIsSavingPrompt(false);
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

          {/* Info compacta con tooltip */}
          <Tooltip
            placement="bottom-start"
            content={
              <div className="max-w-xs p-1 text-xs text-[#265197]">
                Los documentos se indexan en Gemini File Search: Gemini genera los
                embeddings (gemini-embedding-001) y hace la búsqueda semántica.
                El índice es persistente y el chat responde solo con los fragmentos relevantes.
              </div>
            }
          >
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg cursor-help">
              <Icon name="Info" size={14} color="#265197" />
              <span className="text-xs font-medium text-[#265197]">Gemini File Search + Vector Stores</span>
            </div>
          </Tooltip>

          {/* Barra de búsqueda y botón Crear Storage */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  isPressable
                  onPress={() => setSelectedStorageForFiles(storage)}
                  className="w-full hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <CardHeader className="p-3 flex-col items-start">
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

                  <CardBody className="p-3">
                    {/* Stats compactas en una línea */}
                    <div className="flex items-center flex-wrap gap-1.5 mb-2 text-xs">
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1" title="Archivos y tamaño">
                        <Icon name="FileText" size={12} color="#4B5563" />
                        <span className="font-semibold text-[#265197]">{storage.fileCount}</span>
                        <span className="text-gray-500">· {formatFileSize(storage.totalSize)}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1" title="Tokens usados">
                        <Icon name="Zap" size={12} color="#2563eb" />
                        <span className="font-semibold text-blue-600">{storage.total_tokens_used?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-lg px-2 py-1" title="Costo acumulado (USD)">
                        <Icon name="DollarSign" size={12} color="#16a34a" />
                        <span className="font-semibold text-green-600">${(storage.total_cost_usd || 0).toFixed(4)}</span>
                      </div>
                    </div>

                    {/* Estado + fecha */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(storage.status)}
                        <Text isAdmin={true} variant="label" color="#265197">{getStatusText(storage.status)}</Text>
                      </div>
                      <Text isAdmin={true} variant="label" color="#4B5563">{new Date(storage.createdAt).toLocaleDateString("es-ES")}</Text>
                    </div>

                    {/* Modo estricto */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="Lock" size={14} color="#b45309" />
                        <Text isAdmin={true} variant="label" color="#92400E">Modo estricto (solo documento)</Text>
                      </div>
                      <Switch
                        size="sm"
                        isSelected={!!storage.strict_mode}
                        onValueChange={(value) => handleToggleStrictMode(storage, value)}
                        aria-label="Modo estricto"
                      />
                    </div>

                    {/* Prompt personalizado */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        openPromptModal(storage);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          openPromptModal(storage);
                        }
                      }}
                      className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1.5 mt-2 cursor-pointer hover:bg-indigo-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="PenLine" size={14} color="#4338ca" />
                        <Text isAdmin={true} variant="label" color="#3730A3">Prompt del chat</Text>
                      </div>
                      <Chip size="sm" variant="flat" color={storage.custom_prompt ? "secondary" : "default"}>
                        {storage.custom_prompt ? "Personalizado" : "Default"}
                      </Chip>
                    </div>
                  </CardBody>

                  <CardFooter className="p-3 pt-0 flex-col gap-1">
                    <div className="flex gap-2 w-full">
                    {/* Upload Button */}
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 border-2 border-dashed border-[#265197] text-[#265197] rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${uploadingFiles[storage.id] ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {uploadingFiles[storage.id] ? (
                        <>
                          <Icon name="Loader2" size={16} className="animate-spin" />
                          <span className="text-sm font-medium">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Upload" size={16} />
                          <span className="text-sm font-medium">
                            Subir Archivos
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept={ACCEPT_ATTRIBUTE}
                        onChange={(e) => handleFileUpload(storage.id, e)}
                        disabled={uploadingFiles[storage.id]}
                        className="hidden"
                      />
                    </label>

                    {/* Reprocess Button */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!reprocessingStorages[storage.id]) {
                          handleReprocess(storage.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && !reprocessingStorages[storage.id]) {
                          e.stopPropagation();
                          handleReprocess(storage.id);
                        }
                      }}
                      title="Reindexar archivos pendientes desde el respaldo"
                      className={`flex items-center justify-center px-3 py-1.5 border-2 border-[#265197] text-[#265197] rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${reprocessingStorages[storage.id] ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      <Icon
                        name="RefreshCw"
                        size={16}
                        className={reprocessingStorages[storage.id] ? "animate-spin" : ""}
                      />
                    </div>
                    </div>

                    {/* Límites visibles para el usuario */}
                    <p className="text-[11px] text-gray-400 text-center w-full">
                      {LIMITS_LABEL}
                    </p>
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

          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <div>
              <Text isAdmin={true} variant="label" weight="bold" color="#92400E">Modo estricto</Text>
              <p className="text-xs text-amber-700">
                El chat responderá solo con el contenido de los documentos, siguiendo su estructura al pie de la letra.
              </p>
            </div>
            <Switch
              size="sm"
              isSelected={newStorageStrictMode}
              onValueChange={setNewStorageStrictMode}
              aria-label="Modo estricto"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Prompt Personalizado */}
      <Modal
        isOpen={!!promptModalStorage}
        onClose={() => setPromptModalStorage(null)}
        title={`Prompt del chat — ${promptModalStorage?.name || ""}`}
        size="md"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              isAdmin
              variant="secondary"
              onClick={() => setPromptModalStorage(null)}
              disabled={isSavingPrompt}
            >
              Cancelar
            </Button>
            {promptModalStorage?.custom_prompt && (
              <Button
                isAdmin
                variant="secondary"
                onClick={() => promptModalStorage && patchStoragePrompt(promptModalStorage, null)}
                disabled={isSavingPrompt}
              >
                Volver al default
              </Button>
            )}
            <Button
              isAdmin
              variant="primary"
              onClick={() => promptModalStorage && patchStoragePrompt(promptModalStorage, promptDraft.trim())}
              disabled={isSavingPrompt || !promptDraft.trim()}
            >
              {isSavingPrompt ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Este prompt define cómo responde el chat de esta base. Al guardarlo, la base deja
            de usar el prompt default global ({promptModalStorage?.strict_mode ? "modo estricto" : "modo normal"})
            y los cambios futuros a ese default ya no le aplicarán.
          </p>
          <textarea
            value={promptDraft}
            onChange={(e) => setPromptDraft(e.target.value)}
            rows={8}
            placeholder="Escribe el prompt del sistema para esta base..."
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#265197] resize-y"
          />
          {promptModalStorage?.strict_mode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                Esta base tiene modo estricto activado: la temperature seguirá limitada a 0.3
                aunque uses un prompt personalizado. Mantén la instrucción de responder solo
                con el documento si quieres conservar ese comportamiento.
              </p>
            </div>
          )}
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

      {/* Modal Archivos del Storage */}
      <StorageFilesModal
        storageId={selectedStorageForFiles?.id || null}
        storageName={selectedStorageForFiles?.name || ""}
        isOpen={!!selectedStorageForFiles}
        onClose={() => setSelectedStorageForFiles(null)}
        onRefresh={fetchStorages}
      />
    </Container>
  );
}
