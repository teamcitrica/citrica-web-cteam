"use client";
import { useEffect, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";

import { useSupabase } from "@/shared/context/supabase-context";

export interface WaConversation {
  id: string;
  wa_id: string;
  contact_name: string | null;
  storage_id: string | null;
  ai_enabled: boolean;
  unread_count: number;
  last_message_at: string | null;
  last_user_message_at: string | null;
  last_message_preview: string | null;
  context_since: string;
  created_at: string;
  updated_at: string;
}

// ================================================================
// Ventana de servicio de 24h de WhatsApp
// Solo los mensajes DEL CLIENTE la abren/renuevan; expira 24h después
// del último. Cerrada = solo se pueden enviar plantillas aprobadas.
// ================================================================

const WA_WINDOW_MS = 24 * 60 * 60 * 1000;
const WA_WINDOW_WARN_MS = 3 * 60 * 60 * 1000; // aviso cuando quedan < 3h

export type WaWindowState = "open" | "closing" | "closed" | "none";

export interface WaWindowInfo {
  state: WaWindowState;
  remainingMs: number;
  /** "5h 23m" / "45m" — vacío si no aplica */
  remainingLabel: string;
}

export function getWaWindowInfo(
  lastUserMessageAt: string | null,
  now: number = Date.now()
): WaWindowInfo {
  if (!lastUserMessageAt) return { state: "none", remainingMs: 0, remainingLabel: "" };

  const remainingMs = new Date(lastUserMessageAt).getTime() + WA_WINDOW_MS - now;
  if (remainingMs <= 0) return { state: "closed", remainingMs: 0, remainingLabel: "" };

  const hours = Math.floor(remainingMs / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  const remainingLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return {
    state: remainingMs <= WA_WINDOW_WARN_MS ? "closing" : "open",
    remainingMs,
    remainingLabel,
  };
}

export const useWaConversations = () => {
  const { supabase } = useSupabase();
  const [conversations, setConversations] = useState<WaConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("wa_conversations")
        .select("*")
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) {
        console.error("Error al obtener conversaciones:", error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar las conversaciones",
          color: "danger",
        });
        return;
      }
      setConversations(data || []);
    } catch (err) {
      console.error("Error en fetchConversations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime: nuevos chats, cambios de estado y mensajes reordenan la lista
  useEffect(() => {
    const channel = supabase
      .channel("wa-conversations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wa_conversations" },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchConversations]);

  // Apagar la IA = takeover humano: el webhook lo consulta en cada mensaje
  const toggleAi = useCallback(
    async (id: string, enabled: boolean) => {
      // Optimista: el switch responde al instante y realtime confirma
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ai_enabled: enabled } : c))
      );

      const { error } = await supabase
        .from("wa_conversations")
        .update({ ai_enabled: enabled })
        .eq("id", id);

      if (error) {
        console.error("Error al cambiar estado de IA:", error);
        addToast({
          title: "Error",
          description: "No se pudo cambiar el estado de la IA",
          color: "danger",
        });
        fetchConversations();
        return false;
      }

      addToast({
        title: enabled ? "IA activada" : "IA desactivada",
        description: enabled
          ? "El bot responderá automáticamente"
          : "Las respuestas automáticas están pausadas en este chat",
        color: enabled ? "success" : "warning",
      });
      return true;
    },
    [supabase, fetchConversations]
  );

  // storageId null = volver al storage por defecto del canal.
  // context_since se resetea: la memoria del documento anterior contaminaría
  // las respuestas del nuevo (la IA seguiría el guion viejo).
  const setStorage = useCallback(
    async (id: string, storageId: string | null) => {
      const { error } = await supabase
        .from("wa_conversations")
        .update({ storage_id: storageId, context_since: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Error al asignar storage:", error);
        addToast({
          title: "Error",
          description: "No se pudo asignar la base de conocimiento",
          color: "danger",
        });
        return false;
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, storage_id: storageId } : c))
      );
      addToast({
        title: "Base de conocimiento cambiada",
        description: "La memoria del chat se reinició para el nuevo documento",
        color: "success",
      });
      return true;
    },
    [supabase]
  );

  const markRead = useCallback(
    async (id: string) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c))
      );

      const { error } = await supabase
        .from("wa_conversations")
        .update({ unread_count: 0 })
        .eq("id", id);

      if (error) console.error("Error al marcar como leído:", error);
    },
    [supabase]
  );

  return {
    conversations,
    isLoading,
    fetchConversations,
    toggleAi,
    setStorage,
    markRead,
  };
};
