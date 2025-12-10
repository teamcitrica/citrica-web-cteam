"use client";
import { useState, useRef, useEffect } from "react";
import { Col, Container } from "@/styles/07-objects/objects";
import { SelectCitricaAdmin, ButtonCitricaAdmin } from "@/shared/components/citrica-ui/admin";
import { SelectItem } from "@heroui/react";
import {
  Send,
  Bot,
  User,
  Database,
  Loader2,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy tu asistente potenciado con Gemini File Search. Puedo buscar información en tus documentos usando búsqueda vectorial avanzada. Selecciona una base de datos o usa 'Todas las bases' para buscar en todos los documentos. ¿En qué puedo ayudarte?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("all");
  const [storages, setStorages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          storageId: selectedDatabase,
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
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "❌ Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta de nuevo.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
        <div className="p-4 h-[calc(100vh-120px)] flex flex-col">
          <h1 className="text-2xl font-bold text-[#265197] mb-4">
            <span className="text-[#678CC5]">IA</span> {'>'} Chat RAG
          </h1>

          {/* Selector de Base de Datos */}
          <div className="mb-4">
            <SelectCitricaAdmin
              label="Base de Datos"
              value={selectedDatabase}
              onChange={(e) => setSelectedDatabase(e.target.value)}
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

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-4">
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
              onClick={handleSendMessage}
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
    </Container>
  );
}
