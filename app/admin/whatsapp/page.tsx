"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button, Select, Col, Container, Text, Icon } from "citrica-ui-toolkit";
import { Switch } from "@heroui/switch";
import { Select as HeroSelect, SelectItem } from "@heroui/select";
import Modal from "@/shared/components/citrica-ui/molecules/modal";

import {
  useWaConversations,
  getWaWindowInfo,
  type WaConversation,
  type WaWindowInfo,
} from "@/hooks/whatsapp/use-wa-conversations";
import { useWaMessages, type WaMessage } from "@/hooks/whatsapp/use-wa-messages";
import { useWaSettings } from "@/hooks/whatsapp/use-wa-settings";

const DEFAULT_STORAGE_KEY = "__default__";

const formatTime = (value: string | null) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDay = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? formatTime(value)
    : date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
};

// Chip de la ventana de 24h (verde abierta / ámbar por cerrar / gris cerrada)
const WindowChip = ({ info, compact = false }: { info: WaWindowInfo; compact?: boolean }) => {
  if (info.state === "none") return null;

  const styles = {
    open: "bg-green-50 border-green-200 text-green-700",
    closing: "bg-amber-50 border-amber-200 text-amber-700",
    closed: "bg-gray-100 border-gray-200 text-gray-500",
  }[info.state];
  const iconColor = { open: "#16a34a", closing: "#b45309", closed: "#6b7280" }[info.state];
  const label =
    info.state === "closed"
      ? compact ? "cerrada" : "Ventana cerrada"
      : compact ? info.remainingLabel : `Ventana abierta · ${info.remainingLabel}`;
  const title =
    info.state === "closed"
      ? "Pasaron más de 24h del último mensaje del cliente: WhatsApp rechaza texto libre hasta que vuelva a escribir"
      : `La ventana de 24h expira en ${info.remainingLabel} (se renueva con cada mensaje del cliente)`;

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full font-semibold ${styles} ${
        compact ? "px-1.5 py-0 text-[10px]" : "px-2 py-1 text-xs"
      }`}
      title={title}
    >
      <Icon name="Clock" size={compact ? 10 : 14} color={iconColor} />
      {label}
    </span>
  );
};

export default function WhatsAppPage() {
  const { conversations, isLoading, toggleAi, setStorage, deleteConversation, markRead } =
    useWaConversations();
  const { settings, storages, updateSettings } = useWaSettings();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { messages, isLoading: isLoadingMessages, isSending, sendManual } =
    useWaMessages(selectedId);

  const [input, setInput] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tick por minuto: refresca los contadores de la ventana de 24h sin refetch
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const selected: WaConversation | undefined = useMemo(
    () => conversations.find((c) => c.id === selectedId),
    [conversations, selectedId]
  );

  const selectedWindow = useMemo(
    () => getWaWindowInfo(selected?.last_user_message_at ?? null, now),
    [selected?.last_user_message_at, now]
  );

  const defaultStorageName = useMemo(
    () => storages.find((s) => s.id === settings?.default_storage_id)?.name,
    [storages, settings?.default_storage_id]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setDraftPrompt(settings?.system_prompt || "");
  }, [settings?.system_prompt]);

  const handleSelect = (conversation: WaConversation) => {
    setSelectedId(conversation.id);
    if (conversation.unread_count > 0) markRead(conversation.id);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedId || isSending) return;

    setInput("");
    const ok = await sendManual(text);
    if (!ok) setInput(text); // devolver el texto para que no se pierda
  };

  const bubbleStyles = (message: WaMessage) => {
    if (message.sender_type === "user") return "bg-gray-100 text-gray-800";
    if (message.sender_type === "ai") return "bg-[#265197] text-white";
    return "bg-[#0f9d58] text-white"; // agente humano
  };

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <div className="h-[calc(100vh-100px)] flex flex-col">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h1 className="text-2xl font-bold">
              <Text isAdmin variant="title" weight="bold" color="#678CC5">
                WHATSAPP
              </Text>{" "}
              {">"}{" "}
              <Text isAdmin variant="title" weight="bold" color="#16305A">
                Conversaciones
              </Text>
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`flex items-center gap-1 px-2 py-1 border rounded-lg text-xs ${
                  settings?.ai_enabled
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
                title="Estado global del bot"
              >
                <Icon
                  name="Bot"
                  size={14}
                  color={settings?.ai_enabled ? "#16a34a" : "#b45309"}
                />
                <span className="font-semibold">
                  {settings?.ai_enabled ? "IA global activa" : "IA global pausada"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#D4DEED] text-[#265197] hover:bg-blue-50 rounded-lg text-xs transition-colors"
                title="Configuración del canal"
              >
                <Icon name="SlidersHorizontal" size={14} color="#265197" />
                <span>Configuración</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex gap-3 min-h-0">
            {/* ============ Lista de conversaciones ============ */}
            <div className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-y-auto">
              {isLoading && conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <Icon name="Loader2" size={24} color="#265197" className="animate-spin mx-auto" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Aún no hay conversaciones. Aparecerán aquí cuando alguien escriba al número.
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => handleSelect(conversation)}
                    className={`w-full text-left px-3 py-3 border-b border-gray-100 transition-colors ${
                      conversation.id === selectedId ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-[#16305A] truncate">
                        {conversation.contact_name || conversation.wa_id}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {formatDay(conversation.last_message_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-xs text-gray-500 truncate">
                        {conversation.last_message_preview || "Sin mensajes"}
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="flex-shrink-0 bg-[#0f9d58] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <WindowChip
                        info={getWaWindowInfo(conversation.last_user_message_at, now)}
                        compact
                      />
                      {!conversation.ai_enabled && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700">
                          <Icon name="UserCheck" size={10} color="#b45309" />
                          Atención humana
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* ============ Conversación ============ */}
            <div className="flex-1 flex flex-col min-w-0">
              {!selected ? (
                <div className="flex-1 flex items-center justify-center bg-white border border-gray-200 rounded-lg">
                  <div className="text-center">
                    <Icon name="MessageCircle" size={32} color="#9ca3af" className="mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Selecciona una conversación para ver los mensajes
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Cabecera del chat — compacta, una sola fila */}
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2">
                        <p className="font-semibold text-sm text-[#16305A] truncate">
                          {selected.contact_name || selected.wa_id}
                        </p>
                        <span className="text-[11px] text-gray-400 hidden sm:inline flex-shrink-0">
                          +{selected.wa_id}
                        </span>
                        <WindowChip info={selectedWindow} compact />
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <HeroSelect
                          aria-label="Base de conocimiento"
                          size="sm"
                          selectedKeys={[selected.storage_id || DEFAULT_STORAGE_KEY]}
                          onSelectionChange={(keys: any) => {
                            const value = Array.from(keys)[0] as string;
                            setStorage(
                              selected.id,
                              value === DEFAULT_STORAGE_KEY ? null : value
                            );
                          }}
                          className="w-44"
                          classNames={{
                            trigger:
                              "h-8 min-h-8 bg-white border border-[#D4DEED] rounded-lg shadow-none",
                            value: "!text-[#265197] text-xs",
                            selectorIcon: "text-[#678CC5]",
                          }}
                        >
                          {[
                            {
                              id: DEFAULT_STORAGE_KEY,
                              name: `Default (${defaultStorageName || "sin asignar"})`,
                            },
                            ...storages,
                          ].map((option) => (
                            <SelectItem key={option.id} textValue={option.name}>
                              <span className="text-xs">{option.name}</span>
                            </SelectItem>
                          ))}
                        </HeroSelect>

                        <div
                          className="flex items-center gap-1"
                          title={
                            selected.ai_enabled
                              ? "IA respondiendo automáticamente — apágala para responder tú"
                              : "IA pausada: respondes tú (takeover)"
                          }
                        >
                          <Switch
                            size="sm"
                            isSelected={selected.ai_enabled}
                            onValueChange={(value) => toggleAi(selected.id, value)}
                          />
                          <span className="text-[11px] text-gray-600">IA</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsDeleteOpen(true)}
                          className="flex items-center p-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          title="Eliminar conversación"
                        >
                          <Icon name="Trash2" size={13} color="white" />
                        </button>
                      </div>
                    </div>

                    {!settings?.default_storage_id && !selected.storage_id && (
                      <p className="mt-1 text-[11px] text-amber-700">
                        ⚠️ Sin base de conocimiento asignada: el bot no responderá en este chat.
                      </p>
                    )}
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 mb-2 space-y-3">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Icon name="Loader2" size={28} color="#265197" className="animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center">Sin mensajes todavía.</p>
                    ) : (
                      messages.map((message) => {
                        const isIncoming = message.sender_type === "user";

                        return (
                          <div
                            key={message.id}
                            className={`flex gap-2 ${isIncoming ? "justify-start" : "justify-end"}`}
                          >
                            {isIncoming && (
                              <div className="w-7 h-7 rounded-full bg-[#678CC5] flex items-center justify-center flex-shrink-0">
                                <Icon name="User" size={14} color="white" />
                              </div>
                            )}

                            <div
                              className={`max-w-[70%] rounded-lg px-3 py-2 ${bubbleStyles(message)} ${
                                message.status === "failed" ? "border-2 border-red-500" : ""
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>

                              <div className="flex items-center gap-2 mt-1 text-[10px] opacity-80">
                                <span>{formatTime(message.created_at)}</span>
                                {message.sender_type === "ai" && message.total_tokens ? (
                                  <span>
                                    · {message.model} · {message.total_tokens} tokens
                                  </span>
                                ) : null}
                                {message.sender_type === "agent" && <span>· tú</span>}
                              </div>

                              {message.status === "failed" && (
                                <p className="mt-1 text-[10px] bg-red-50 text-red-700 rounded px-2 py-1">
                                  No enviado: {message.error_message || "error desconocido"}
                                </p>
                              )}
                            </div>

                            {!isIncoming && (
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  message.sender_type === "ai" ? "bg-[#265197]" : "bg-[#0f9d58]"
                                }`}
                              >
                                <Icon
                                  name={message.sender_type === "ai" ? "Bot" : "UserCheck"}
                                  size={14}
                                  color="white"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Avisos compactos: ventana cerrada / IA activa */}
                  {selectedWindow.state === "closed" ? (
                    <p className="mb-1 px-1 text-[11px] text-gray-500 flex items-center gap-1">
                      <Icon name="Clock" size={11} color="#6b7280" />
                      Ventana de 24h cerrada: WhatsApp rechazará el mensaje hasta que el cliente
                      vuelva a escribir.
                    </p>
                  ) : selected.ai_enabled ? (
                    <p className="mb-1 px-1 text-[11px] text-blue-700 flex items-center gap-1">
                      <Icon name="Bot" size={11} color="#1d4ed8" />
                      IA activa — apágala antes de escribir para evitar respuestas dobles.
                    </p>
                  ) : null}

                  {/* Input */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Escribe un mensaje..."
                      disabled={isSending}
                      className="flex-1 text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#265197] disabled:bg-gray-100"
                    />
                    <Button
                      isAdmin
                      variant="primary"
                      disabled={!input.trim() || isSending}
                      onClick={handleSend}
                    >
                      {isSending ? (
                        <Icon name="Loader2" size={20} color="white" className="animate-spin" />
                      ) : (
                        <>
                          <Icon name="Send" size={16} color="white" />
                          <span>Enviar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Col>

      {/* ============ Confirmar eliminación de conversación ============ */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Eliminar Conversación"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button isAdmin variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              isAdmin
              disabled={isDeleting}
              style={{ backgroundColor: "#dc2626" }}
              onClick={async () => {
                if (!selected) return;
                setIsDeleting(true);
                const ok = await deleteConversation(selected.id);
                setIsDeleting(false);
                if (ok) {
                  setIsDeleteOpen(false);
                  setSelectedId(null);
                }
              }}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Eliminar la conversación con{" "}
            <strong className="text-[#265197]">
              {selected?.contact_name || selected?.wa_id}
            </strong>{" "}
            y todos sus mensajes?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              ⚠️ Esta acción no se puede deshacer. Solo se borra del admin — el chat en el
              teléfono del cliente no se ve afectado; si vuelve a escribir, se creará una
              conversación nueva.
            </p>
          </div>
        </div>
      </Modal>

      {/* ============ Configuración del canal ============ */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Configuración de WhatsApp"
        size="lg"
        footer={
          <div className="flex gap-3 w-full">
            <Button isAdmin variant="secondary" onClick={() => setIsSettingsOpen(false)}>
              Cerrar
            </Button>
            <Button
              isAdmin
              onClick={async () => {
                const ok = await updateSettings({ system_prompt: draftPrompt.trim() || null });
                if (ok) setIsSettingsOpen(false);
              }}
            >
              Guardar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[#16305A] text-sm">Respuestas automáticas</p>
              <p className="text-xs text-gray-500">
                Apagarlo pausa el bot en TODAS las conversaciones
              </p>
            </div>
            <Switch
              isSelected={!!settings?.ai_enabled}
              onValueChange={(value) => updateSettings({ ai_enabled: value })}
            />
          </div>

          <div>
            <p className="font-semibold text-[#16305A] text-sm mb-1">
              Base de conocimiento por defecto
            </p>
            <Select
              label="Storage RAG"
              selectedKeys={
                settings?.default_storage_id ? [settings.default_storage_id] : []
              }
              onSelectionChange={(keys: any) => {
                const value = Array.from(keys)[0] as string;
                if (value) updateSettings({ default_storage_id: value });
              }}
              className="w-full"
              variant="faded"
              classNames={{
                trigger: "bg-white !border-[#D4DEED] !rounded-[12px]",
                label: "!text-[#265197]",
                value: "!text-[#265197]",
                selectorIcon: "text-[#678CC5]",
              }}
              options={storages.map((storage) => ({
                value: storage.id,
                label: storage.name,
              }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Se usa en todas las conversaciones que no tengan una asignada.
            </p>
          </div>

          <div>
            <p className="font-semibold text-[#16305A] text-sm mb-1">
              Instrucciones extra del canal
            </p>
            <textarea
              value={draftPrompt}
              onChange={(e) => setDraftPrompt(e.target.value)}
              rows={5}
              placeholder="Ej: Preséntate como el asistente de Citrica y ofrece agendar una reunión al cierre."
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#265197] text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se añaden al prompt del storage RAG, no lo reemplazan.
            </p>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
