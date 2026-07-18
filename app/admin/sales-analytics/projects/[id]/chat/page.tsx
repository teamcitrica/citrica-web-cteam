"use client";

// =============================================
// Page: /admin/sales-analytics/projects/[id]/chat
// Chat interactivo con IA sobre las ventas del proyecto.
// Historial = intercambios (pregunta + respuesta) por proyecto.
// =============================================

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { addToast } from '@heroui/toast';
import {
  ArrowLeft,
  Send,
  Trash2,
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
    exchanges,
    isLoadingHistory,
    sendMessage,
    clearHistory,
    isSending,
    isDeleting,
  } = useSalesChat(projectId);

  const [inputMessage, setInputMessage] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [exchanges, isSending]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const message = inputMessage;
    setInputMessage('');

    try {
      await sendMessage({ message, includeContext });
    } catch (error: any) {
      setInputMessage(message);
      addToast({
        title: 'Error',
        description: error.message || 'Error enviando el mensaje',
        color: 'danger',
      });
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setIsClearConfirmOpen(false);
      addToast({
        title: 'Historial borrado',
        description: 'Se eliminó el historial de chat del proyecto',
        color: 'success',
      });
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Error borrando el historial',
        color: 'danger',
      });
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
      <div className="max-w-5xl mx-auto">
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
                Consulta tus datos de ventas basados en los reportes generados
              </p>
            </div>

            <Button
              color="danger"
              variant="flat"
              startContent={<Trash2 className="w-4 h-4" />}
              onPress={() => setIsClearConfirmOpen(true)}
              isDisabled={exchanges.length === 0 || isDeleting}
            >
              Borrar historial
            </Button>
          </div>
        </div>

        {/* Confirmación de borrado */}
        {isClearConfirmOpen && (
          <Card className="mb-4 border-2 border-red-300">
            <CardBody className="flex flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-800">
                ¿Borrar todo el historial de chat de este proyecto? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="flat" onPress={() => setIsClearConfirmOpen(false)}>
                  Cancelar
                </Button>
                <Button size="sm" color="danger" onPress={handleClearHistory} isLoading={isDeleting}>
                  Borrar
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Chat Area */}
        <Card className="h-[calc(100vh-280px)] flex flex-col">
          <CardHeader className="pb-2 border-b border-gray-200">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Conversación</h3>
              </div>

              <Switch
                size="sm"
                isSelected={includeContext}
                onValueChange={setIncludeContext}
              >
                <span className="text-sm">Incluir contexto de reportes</span>
              </Switch>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardBody className="flex-1 overflow-y-auto p-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-600">Cargando historial...</p>
              </div>
            ) : exchanges.length === 0 && !isSending ? (
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
                    ✓ Usaré el contexto de tus últimos reportes generados
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {exchanges.map((exchange: import('@/types/sales-analytics').SalesChatExchange) => (
                  <div key={exchange.id} className="space-y-4">
                    {/* Mensaje del usuario */}
                    <div className="flex gap-3 justify-end">
                      <div className="max-w-[70%] rounded-lg p-4 bg-primary text-white">
                        <p className="text-sm whitespace-pre-wrap">{exchange.user_message}</p>
                      </div>
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>

                    {/* Respuesta del asistente */}
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div className="max-w-[70%] rounded-lg p-4 bg-gray-100 text-gray-900">
                        <p className="text-sm whitespace-pre-wrap">{exchange.assistant_response}</p>
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-xs text-gray-600">
                            {exchange.total_tokens} tokens · ${Number(exchange.cost_usd || 0).toFixed(6)}
                            {exchange.context_used ? ' · con contexto' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <div className="rounded-lg p-4 bg-gray-100 text-gray-500 text-sm">
                      Analizando...
                    </div>
                  </div>
                )}

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
              Presiona Enter para enviar
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
