"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button, Select, Col, Container, Text, Icon } from "citrica-ui-toolkit";
import Modal from "@/shared/components/citrica-ui/molecules/modal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

const INITIAL_MESSAGE_CONTENT =
  "¡Hola! Soy tu asistente potenciado con Gemini File Search. Puedo buscar información en tus documentos usando búsqueda vectorial avanzada. Selecciona una base de datos o usa 'Todas las bases' para buscar en todos los documentos. ¿En qué puedo ayudarte?";

const makeInitialMessages = (): Message[] => [
  {
    id: "initial",
    role: "assistant",
    content: INITIAL_MESSAGE_CONTENT,
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const [selectedDatabase, setSelectedDatabase] = useState<string>("all");
  const [storages, setStorages] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [responseProfile, setResponseProfile] = useState<string>("balanced");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  const [costUsed, setCostUsed] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>(makeInitialMessages());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStorages = useCallback(async () => {
    try {
      const response = await fetch("/api/rag/storage");
      const data = await response.json();
      if (data.storages) {
        setStorages(data.storages);

        // Si hay un storage seleccionado, actualizar sus tokens/costo
        if (selectedDatabase && selectedDatabase !== "all") {
          const currentStorage = data.storages.find((s: any) => s.id === selectedDatabase);
          if (currentStorage) {
            setTokensUsed(currentStorage.total_tokens_used || 0);
            setCostUsed(currentStorage.total_cost_usd || 0);
          }
        } else {
          // Si es "all", sumar todos los tokens
          const totalTokens = data.storages.reduce((sum: number, s: any) => sum + (s.total_tokens_used || 0), 0);
          const totalCost = data.storages.reduce((sum: number, s: any) => sum + (s.total_cost_usd || 0), 0);
          setTokensUsed(totalTokens);
          setCostUsed(totalCost);
        }
      }
    } catch (error) {
      console.error("Error fetching storages:", error);
    }
  }, [selectedDatabase]);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch("/api/ai/models?active_only=true");
      const data = await response.json();
      if (data.models) {
        setAvailableModels(data.models);

        // Establecer el modelo por defecto
        const defaultModel = data.models.find((m: any) => m.is_default);
        if (defaultModel && !selectedModel) {
          setSelectedModel(defaultModel.model_id);
        }
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  }, [selectedModel]);

  // Cargar storages y modelos al montar
  useEffect(() => {
    fetchStorages();
    fetchModels();
  }, [fetchStorages, fetchModels]);

  const fetchChatHistory = useCallback(async (storageId: string) => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/rag/chat/history?storageId=${storageId}`);
      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        // Convertir al formato de useChat
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        }));
        setMessages([...makeInitialMessages(), ...formattedMessages]);
      } else {
        setMessages(makeInitialMessages());
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [setMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cambiar historial cuando se selecciona otra base de datos
  const handleDatabaseChange = useCallback((dbId: string) => {
    setSelectedDatabase(dbId);

    // Si es "all", no cargar historial, empezar limpio
    if (dbId === "all") {
      setMessages(makeInitialMessages());
    } else {
      // Para bases de datos específicas, cargar su historial
      fetchChatHistory(dbId);
    }
  }, [fetchChatHistory, setMessages]);

  // Limpiar historial del chat actual
  const handleClearHistory = useCallback(async () => {
    try {
      // Llamar al endpoint para eliminar conversaciones
      const storageParam = selectedDatabase === "all" ? "all" : selectedDatabase;
      const response = await fetch(`/api/rag/chat/history?storageId=${storageParam}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(makeInitialMessages());
        setIsDeleteModalOpen(false);
      } else {
        alert("Error al eliminar el historial");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      alert("Error al eliminar el historial");
    }
  }, [selectedDatabase, setMessages]);

  // Función para enviar mensaje con streaming
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    // Agregar mensaje del usuario
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Crear mensaje del asistente vacío que se irá llenando
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Crear AbortController para cancelar si es necesario
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          storageId: selectedDatabase,
          profile: responseProfile,
          modelId: selectedModel || undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let serverMessage = "";
        try {
          serverMessage = JSON.parse(errorText)?.error || "";
        } catch {
          // El body no era JSON, usar el mensaje genérico
        }
        throw new Error(serverMessage || `Error ${response.status}: ${response.statusText}`);
      }

      // Leer el stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No se pudo obtener el stream");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Actualizar el mensaje del asistente con el texto acumulado
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedText }
              : msg
          )
        );
      }

      // Stream terminó sin texto: avisar en vez de dejar la burbuja vacía
      if (accumulatedText.trim() === "") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    "⚠️ El modelo no devolvió respuesta. Puede ser un límite de tokens muy bajo (perfil 'Concisa') o un problema con la API. Intenta con otro perfil o modelo.",
                }
              : msg
          )
        );
      }

    } catch (error: any) {
      if (error.name === "AbortError") {
        return;
      }

      setError(error);

      // Actualizar el mensaje del asistente con error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                // Los mensajes del servidor ya vienen formateados con ⚠️/❌
                content:
                  error.message?.startsWith("⚠️") || error.message?.startsWith("❌")
                    ? error.message
                    : `❌ Lo siento, ocurrió un error al procesar tu mensaje. ${error.message || "Por favor intenta de nuevo."}`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;

      // Recargar tokens después del mensaje
      setTimeout(() => {
        fetchStorages();
      }, 500);
    }
  }, [input, isLoading, messages, selectedDatabase, responseProfile, selectedModel, fetchStorages]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const reload = useCallback(async () => {
    if (messages.length < 2) return;

    // Obtener el último mensaje del usuario
    const lastUserMessageIndex = messages.findLastIndex((m) => m.role === "user");
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];

    // Simular el submit con el último mensaje
    setInput(lastUserMessage.content);

    // Esperar un tick para que el input se actualice
    setTimeout(() => {
      handleSubmit(new Event("submit") as any);
    }, 0);
  }, [messages, handleSubmit]);

  const selectedDatabaseName =
    selectedDatabase === "all"
      ? "Todas las bases"
      : storages.find((s) => s.id === selectedDatabase)?.name || "";
  const selectedModelName =
    availableModels.find((m) => m.model_id === selectedModel)?.display_name || selectedModel;
  const messagesSent = Math.max(1, Math.floor(messages.length / 2));

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="h-[calc(100vh-100px)] flex flex-col">
          {/* Header compacto: título + stats + acciones */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h1 className="text-2xl font-bold text-[#265197]">
              <Text isAdmin={true} variant="title" weight="bold" color="#678CC5">IA</Text> {'>'}  <Text isAdmin={true} variant="title" weight="bold" color="#16305A">Chat RAG</Text>
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Stats compactas */}
              <div
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700"
                title="Tokens usados (entrada + salida). Los límites de Gemini son dinámicos según tu tier de cuenta."
              >
                <Icon name="Zap" size={14} color="#2563eb" />
                <span className="font-semibold">{tokensUsed.toLocaleString()}</span>
              </div>
              <div
                className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700"
                title="Costo total acumulado (USD)"
              >
                <Icon name="DollarSign" size={14} color="#16a34a" />
                <span className="font-semibold">${costUsed.toFixed(4)}</span>
              </div>
              <div
                className="hidden md:flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700"
                title={`Promedio por mensaje (~${messages.length > 1 ? Math.floor(tokensUsed / messagesSent).toLocaleString() : "0"} tokens)`}
              >
                <Icon name="TrendingUp" size={14} color="#9333ea" />
                <span className="font-semibold">
                  ${messages.length > 1 ? (costUsed / messagesSent).toFixed(4) : "0.0000"}/msg
                </span>
              </div>

              {/* Toggle de configuración */}
              <button
                type="button"
                onClick={() => setShowSettings((prev) => !prev)}
                className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs transition-colors ${
                  showSettings
                    ? "bg-[#265197] border-[#265197] text-white"
                    : "bg-white border-[#D4DEED] text-[#265197] hover:bg-blue-50"
                }`}
                title="Mostrar / ocultar configuración"
              >
                <Icon name="SlidersHorizontal" size={14} color={showSettings ? "white" : "#265197"} />
                <span>Configuración</span>
              </button>

              {/* Eliminar historial */}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                title="Eliminar historial"
              >
                <Icon name="Trash2" size={14} color="white" />
              </button>
            </div>
          </div>

          {/* Panel de configuración colapsable */}
          {showSettings ? (
            <div className="mb-2 grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Selector de Base de Datos */}
              <Select
                label="Base de Datos"
                selectedKeys={[selectedDatabase]}
                onSelectionChange={(keys: any) => {
                  const selected = Array.from(keys)[0] as string;
                  handleDatabaseChange(selected);
                }}
                className="w-full"
                variant="faded"
                classNames={{
                  trigger: "bg-white !border-[#D4DEED] !rounded-[12px]",
                  label: "!text-[#265197]",
                  value: "!text-[#265197]",
                  selectorIcon: "text-[#678CC5]",
                }}
                options={[
                  { value: "all", label: "Todas las bases de datos" },
                  ...storages.map((storage) => ({
                    value: storage.id,
                    label: storage.name,
                  }))
                ]}
              />

              {/* Selector de Modelo IA */}
              <Select
                label="Modelo IA"
                selectedKeys={selectedModel ? [selectedModel] : []}
                onSelectionChange={(keys: any) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedModel(selected);
                }}
                className="w-full"
                variant="faded"
                classNames={{
                  trigger: "bg-white !border-[#D4DEED] !rounded-[12px]",
                  label: "!text-[#265197]",
                  value: "!text-[#265197]",
                  selectorIcon: "text-[#678CC5]",
                }}
                options={availableModels.map((model) => ({
                  value: model.model_id,
                  label: model.display_name,
                }))}
              />

              {/* Selector de Perfil de Respuesta */}
              <Select
                label="Calidad de Respuesta"
                selectedKeys={[responseProfile]}
                onSelectionChange={(keys: any) => {
                  const selected = Array.from(keys)[0] as string;
                  setResponseProfile(selected);
                }}
                className="w-full"
                variant="faded"
                classNames={{
                  trigger: "bg-white !border-[#D4DEED] !rounded-[12px]",
                  label: "!text-[#265197]",
                  value: "!text-[#265197]",
                  selectorIcon: "text-[#678CC5]",
                }}
                options={[
                  { value: "concise", label: "Concisa (~400 palabras)" },
                  { value: "balanced", label: "Balanceada (~1600 palabras)" },
                  { value: "detailed", label: "Detallada (~3200 palabras)" },
                  { value: "comprehensive", label: "Completa (~6400 palabras)" }
                ]}
              />
            </div>
          ) : (
            /* Resumen de selección actual cuando el panel está cerrado */
            <div className="mb-2 flex items-center gap-2 flex-wrap text-xs text-[#678CC5]">
              <span className="flex items-center gap-1">
                <Icon name="Database" size={12} color="#678CC5" />
                {selectedDatabaseName}
              </span>
              <span className="text-[#D4DEED]">|</span>
              <span className="flex items-center gap-1">
                <Icon name="Bot" size={12} color="#678CC5" />
                {selectedModelName || "Modelo por defecto"}
              </span>
              <span className="text-[#D4DEED]">|</span>
              <span className="capitalize">{responseProfile}</span>
            </div>
          )}

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 mb-3 space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Icon name="Loader2" size={32} color="#265197" className="animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cargando historial...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-[#265197] flex items-center justify-center flex-shrink-0">
                        <Icon name="Bot" size={16} color="white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-[#265197] text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      {/* Mostrar error si existe */}
                      {error && index === messages.length - 1 && message.role === "assistant" && (
                        <div className="mt-3 pt-3 border-t border-red-300">
                          <p className="text-xs text-red-600 mb-2">
                            ❌ Error: {error.message || "Ocurrió un error al procesar tu mensaje"}
                          </p>
                          <button
                            onClick={() => reload()}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-[#265197] text-white rounded-lg hover:bg-[#1e3f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <Icon name="RefreshCw" size={16} className={`${isLoading ? 'animate-spin' : ''}`} />
                            <span>Reintentar</span>
                          </button>
                        </div>
                      )}

                      {/* Timestamp */}
                      {message.timestamp && (
                        <span className="text-xs opacity-70 mt-2 block">
                          {message.timestamp.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-[#678CC5] flex items-center justify-center flex-shrink-0">
                        <Icon name="User" size={16} color="white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-[#265197] flex items-center justify-center flex-shrink-0">
                      <Icon name="Bot" size={16} color="white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <Icon name="Loader2" size={20} color="#265197" className="animate-spin" />
                      <span className="text-xs text-gray-500 ml-2">Escribiendo...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input de Mensaje */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta aquí..."
                disabled={isLoading}
                className="w-full text-black px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#265197] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <Icon name="MessageSquare" size={16} color="#9ca3af" className="absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <Button
              isAdmin
              variant="primary"
              type="submit"
              disabled={!input.trim() || isLoading}
              onClick={(e) => {
                // Llamar explícitamente a handleSubmit porque citrica-ui-toolkit Button no propaga bien el submit
                handleSubmit(e as any);
              }}
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} color="white" className="animate-spin" />
              ) : (
                <>
                  <Icon name="Send" size={16} color="white" />
                  <span>Enviar</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </Col>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación de Historial"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              isAdmin
              onClick={() => setIsDeleteModalOpen(false)}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              isAdmin
              onClick={handleClearHistory}
              style={{ backgroundColor: "#dc2626" }}
            >
              Eliminar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar el historial de conversaciones
            {selectedDatabase === "all" ? (
              <strong className="text-[#265197]"> de todas las bases de datos</strong>
            ) : (
              <>
                {" "}de{" "}
                <strong className="text-[#265197]">
                  {storages.find(s => s.id === selectedDatabase)?.name || "esta base de datos"}
                </strong>
              </>
            )}
            ?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              ⚠️ Esta acción eliminará todas las conversaciones y no se puede deshacer.
            </p>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
