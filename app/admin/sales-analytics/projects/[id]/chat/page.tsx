"use client";

// =============================================
// Page: /sales-analytics/projects/[id]/chat
// Chat interactivo con IA (RAG)
// =============================================

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import {
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import { useSalesChat } from '@/hooks/sales-analytics/use-sales-chat';

export default function ProjectChatPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const {
    conversations,
    messages,
    currentConversationId,
    isLoadingConversations,
    isLoadingMessages,
    sendMessage,
    deleteConversation,
    startNewConversation,
    selectConversation,
    isSending,
    isDeleting,
  } = useSalesChat(projectId);

  const [inputMessage, setInputMessage] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await sendMessage({
        message: inputMessage,
        includeContext,
      });
      setInputMessage('');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('¿Eliminar esta conversación?')) return;

    try {
      await deleteConversation(convId);
      alert('Conversación eliminada exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={() =>
              router.push(`/admin/sales-analytics/projects/${projectId}`)
            }
            className="mb-4"
          >
            Volver al Proyecto
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chat Interactivo con IA
              </h1>
              <p className="text-gray-600 mt-2">
                Consulta tus datos de ventas en tiempo real
              </p>
            </div>

            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={startNewConversation}
            >
              Nueva Conversación
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar - Conversaciones */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-250px)]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Conversaciones</h3>
                </div>
              </CardHeader>

              <CardBody className="pt-2 overflow-y-auto">
                {isLoadingConversations ? (
                  <p className="text-sm text-gray-600 text-center py-4">
                    Cargando...
                  </p>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      No hay conversaciones
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentConversationId === conv.id
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => selectConversation(conv.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {conv.title || 'Sin título'}
                          </p>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Button
                              size="sm"
                              isIconOnly
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteConversation(conv.id)}
                              isLoading={isDeleting}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(conv.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-3">
            <Card className="h-[calc(100vh-250px)] flex flex-col">
              <CardHeader className="pb-2 border-b border-gray-200">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      {currentConversationId
                        ? 'Conversación Actual'
                        : 'Nueva Conversación'}
                    </h3>
                  </div>

                  <Switch
                    size="sm"
                    isSelected={includeContext}
                    onValueChange={setIncludeContext}
                  >
                    <span className="text-sm">Incluir contexto (RAG)</span>
                  </Switch>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardBody className="flex-1 overflow-y-auto p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-600">Cargando mensajes...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Bot className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Comienza una conversación
                    </h3>
                    <p className="text-sm text-gray-600 max-w-md">
                      Pregunta sobre tus ventas, productos top, tendencias, o
                      cualquier insight que necesites
                    </p>
                    {includeContext && (
                      <p className="text-xs text-green-600 mt-3">
                        ✓ RAG activado - Usaré contexto de tus últimos reportes
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-primary" />
                          </div>
                        )}

                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            msg.role === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </p>

                          {msg.role === 'assistant' && msg.total_cost && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                              <p className="text-xs text-gray-600">
                                Tokens: {msg.prompt_tokens} + {msg.completion_tokens} | Costo: $
                                {msg.total_cost.toFixed(6)}
                              </p>
                            </div>
                          )}
                        </div>

                        {msg.role === 'user' && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-gray-700" />
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardBody>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe tu pregunta..."
                    value={inputMessage}
                    onValueChange={setInputMessage}
                    onKeyPress={handleKeyPress}
                    variant="faded"
                    classNames={{
                      input: "text-sm",
                    }}
                  />
                  <Button
                    color="primary"
                    isIconOnly
                    onPress={handleSendMessage}
                    isLoading={isSending}
                    isDisabled={!inputMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Presiona Enter para enviar, Shift+Enter para nueva línea
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
