"use client";
import { useState, useRef, useEffect } from "react";
import { Col, Container } from "@/styles/07-objects/objects";
import { SelectCitricaAdmin, ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import { SelectItem } from "@heroui/react";
import Modal from "@/shared/components/citrica-ui/molecules/modal";
import {
  Send,
  Bot,
  User,
  Database,
  Loader2,
  MessageSquare,
  Sparkles,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isError?: boolean;
  retryMessage?: string;
  sources?: {
    document: string;
    geminiUri?: string;
  }[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
}

export default function ChatPage() {
  const getInitialMessage = (): Message => ({
    id: "1",
    content:
      "¡Hola! Soy tu asistente potenciado con Gemini File Search. Puedo buscar información en tus documentos usando búsqueda vectorial avanzada. Selecciona una base de datos o usa 'Todas las bases' para buscar en todos los documentos. ¿En qué puedo ayudarte?",
    role: "assistant",
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("all");
  const [storages, setStorages] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [responseProfile, setResponseProfile] = useState<string>("balanced");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar storages al montar (sin historial inicial)
  useEffect(() => {
    fetchStorages();
  }, []);

  const fetchStorages = async () => {
    try {
      const response = await fetch("/api/rag/storage");
      const data = await response.json();
      if (data.storages) {
        setStorages(data.storages);
      }
    } catch (error) {
      console.error("Error fetching storages:", error);
    }
  };

  const fetchChatHistory = async (storageId: string) => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/rag/chat/history?storageId=${storageId}`);
      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        // Convertir timestamps de string a Date
        const messagesWithDates = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages([getInitialMessage(), ...messagesWithDates]);
      } else {
        setMessages([getInitialMessage()]);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setMessages([getInitialMessage()]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cambiar historial cuando se selecciona otra base de datos
  const handleDatabaseChange = (dbId: string) => {
    setSelectedDatabase(dbId);

    // Si es "all", no cargar historial, empezar limpio
    if (dbId === "all") {
      setMessages([getInitialMessage()]);
    } else {
      // Para bases de datos específicas, cargar su historial
      fetchChatHistory(dbId);
    }
  };

  // Limpiar historial del chat actual
  const handleClearHistory = async () => {
    try {
      // Llamar al endpoint para eliminar conversaciones
      const storageParam = selectedDatabase === "all" ? "all" : selectedDatabase;
      const response = await fetch(`/api/rag/chat/history?storageId=${storageParam}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages([getInitialMessage()]);
        setIsDeleteModalOpen(false);
      } else {
        alert("Error al eliminar el historial");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      alert("Error al eliminar el historial");
    }
  };

  const handleSendMessage = async (retryMessage?: string) => {
    const messageToSend = retryMessage || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    // Si es un retry, obtener el mensaje del usuario anterior
    let userMessageContent = messageToSend;
    if (retryMessage) {
      // Buscar el mensaje del usuario antes del error
      const messagesReversed = [...messages].reverse();
      const errorIndex = messagesReversed.findIndex(m => m.isError);
      if (errorIndex !== -1) {
        const userMsg = messagesReversed[errorIndex + 1];
        if (userMsg && userMsg.role === "user") {
          userMessageContent = userMsg.content;
        }
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: userMessageContent,
      role: "user",
      timestamp: new Date(),
    };

    // Solo agregar el mensaje del usuario si no es un retry
    if (!retryMessage) {
      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          storageId: selectedDatabase,
          profile: responseProfile,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
        sources: data.sources || [],
        usage: data.usage,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Recargar historial desde la base de datos solo si NO es "all"
      if (selectedDatabase !== "all") {
        setTimeout(() => fetchChatHistory(selectedDatabase), 500);
      }
    } catch (error: any) {
      console.error("Error sending message:", error?.message || error);

      // Detectar error 503 (modelo sobrecargado)
      const is503Error = error?.message?.includes("overloaded") ||
                         error?.message?.includes("503");

      let errorContent = "❌ Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta de nuevo.";

      if (is503Error) {
        errorContent = `⚠️ El modelo de IA está experimentando alta demanda en este momento.\n\n💡 Sugerencias:\n• Espera unos segundos e intenta de nuevo\n• El sistema reintentará automáticamente en breve\n\nPuedes hacer clic en "Reintentar" cuando estés listo.`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        role: "assistant",
        timestamp: new Date(),
        isError: true,
        retryMessage: messageToSend,
      };
      setMessages((prev) => {
        // Si es un retry, reemplazar el último mensaje de error
        if (retryMessage) {
          return [...prev.slice(0, -1), errorMessage];
        }
        return [...prev, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="h-[calc(100vh-120px)] flex flex-col">
          <h1 className="text-2xl font-bold text-[#265197] mb-4">
            <span className="text-[#678CC5]">IA</span> {'>'} Chat RAG
          </h1>

          {/* Selectores */}
          <div className="mb-4 flex flex-col md:flex-row gap-3">
            {/* Selector de Base de Datos */}
            <div className="flex-1">
              <SelectCitricaAdmin
                label="Base de Datos"
                value={selectedDatabase}
                onChange={(e) => handleDatabaseChange(e.target.value)}
                className="w-full"
              >
                <>
                  <SelectItem key="all">
                    Todas las bases de datos
                  </SelectItem>
                  {storages.map((storage) => (
                    <SelectItem key={storage.id}>
                      {storage.name}
                    </SelectItem>
                  ))}
                </>
              </SelectCitricaAdmin>
            </div>

            {/* Selector de Perfil de Respuesta */}
            <div className="flex-1">
              <SelectCitricaAdmin
                label="Calidad de Respuesta"
                selectedKeys={[responseProfile]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setResponseProfile(selected);
                }}
                className="w-full"
              >
                <>
                  <SelectItem key="concise">
                    Concisa (~400 palabras)
                  </SelectItem>
                  <SelectItem key="balanced">
                    Balanceada (~1600 palabras)
                  </SelectItem>
                  <SelectItem key="detailed">
                    Detallada (~3200 palabras)
                  </SelectItem>
                  <SelectItem key="comprehensive">
                    Completa (~6400 palabras)
                  </SelectItem>
                </>
              </SelectCitricaAdmin>
            </div>

            {/* Botón de eliminar historial */}
            <div className="flex items-center justify-center">
              <ButtonCitricaAdmin
                onClick={() => setIsDeleteModalOpen(true)}
                variant="secondary"
                style={{ backgroundColor: "#dc2626", color: "white", minWidth: "auto" }}
              >
                <Trash2 className="w-4 h-4" />
              </ButtonCitricaAdmin>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-[#265197] animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cargando historial...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[#265197] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
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

                  {message.isError && message.retryMessage && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <button
                        onClick={() => handleSendMessage(message.retryMessage)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#265197] text-white rounded-lg hover:bg-[#1e3f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Reintentar</span>
                      </button>
                    </div>
                  )}

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="flex items-center gap-1 mb-2">
                        <Sparkles className="w-3 h-3 text-[#265197]" />
                        <span className="text-xs font-semibold text-[#265197]">
                          Fuentes consultadas:
                        </span>
                      </div>
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-600 flex items-center gap-2 mt-1"
                        >
                          <span>📄 {source.document}</span>
                          <span className="text-green-600 font-semibold">
                            ✓ Usado como contexto
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.usage && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>🔢 {message.usage.totalTokens} tokens</span>
                        <span>💰 ${message.usage.estimatedCost.toFixed(6)}</span>
                      </div>
                    </div>
                  )}

                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#678CC5] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#265197] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <Loader2 className="w-5 h-5 text-[#265197] animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input de Mensaje */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta aquí..."
                disabled={isLoading}
                className="w-full text-black px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#265197] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <ButtonCitricaAdmin
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Enviar</span>
                </>
              )}
            </ButtonCitricaAdmin>
          </div>

          {/* Información adicional */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            💡 Este chat utiliza RAG (Retrieval-Augmented Generation) con embeddings
            de Gemini para proporcionar respuestas contextualizadas
          </div>
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
            <ButtonCitricaAdmin
              onClick={() => setIsDeleteModalOpen(false)}
              variant="secondary"
            >
              Cancelar
            </ButtonCitricaAdmin>
            <ButtonCitricaAdmin
              onClick={handleClearHistory}
              style={{ backgroundColor: "#dc2626" }}
            >
              Eliminar
            </ButtonCitricaAdmin>
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
