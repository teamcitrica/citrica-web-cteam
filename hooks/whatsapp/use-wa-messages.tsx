"use client";
import { useEffect, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface WaMessage {
  id: string;
  conversation_id: string;
  direction: "in" | "out";
  sender_type: "user" | "ai" | "agent";
  content: string;
  wa_message_id: string | null;
  status: "received" | "sent" | "failed";
  error_message: string | null;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cost_usd: number | null;
  created_at: string;
}

export const useWaMessages = (conversationId: string | null) => {
  const { supabase } = useSupabase();
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("wa_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error al obtener mensajes:", error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar los mensajes",
          color: "danger",
        });
        return;
      }
      setMessages(data || []);
    } catch (err) {
      console.error("Error en fetchMessages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime filtrado por conversación: los mensajes entrantes y las respuestas
  // del bot aparecen sin recargar
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`wa-messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wa_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as WaMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId]);

  // El envío pasa por la API: el token de WhatsApp solo existe en el servidor
  const sendManual = useCallback(
    async (text: string) => {
      if (!conversationId || !text.trim()) return false;

      try {
        setIsSending(true);
        const response = await fetch("/api/wa/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, text }),
        });

        const result = await response.json();

        // El mensaje se guarda aunque falle el envío; realtime lo pinta igual
        if (!response.ok || result.error) {
          addToast({
            title: "No se pudo enviar",
            description: result.error || "Error enviando el mensaje",
            color: "danger",
          });
          await fetchMessages();
          return false;
        }

        return true;
      } catch (err: any) {
        console.error("Error en sendManual:", err);
        addToast({
          title: "Error",
          description: err?.message || "Error enviando el mensaje",
          color: "danger",
        });
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, fetchMessages]
  );

  return { messages, isLoading, isSending, fetchMessages, sendManual };
};
