// =============================================
// Hook: use-sales-chat
// Chat interactivo con IA — un registro por intercambio
// (esquema real de sales_chat_conversations)
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SalesChatExchange } from '@/types/sales-analytics';

export function useSalesChat(projectId: string) {
  const queryClient = useQueryClient();

  // =============================================
  // Historial de intercambios del proyecto
  // =============================================

  const {
    data: exchanges = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['sales-chat-exchanges', projectId],
    queryFn: async () => {
      const response = await fetch(
        `/api/sales-analytics/chat?project_id=${projectId}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.exchanges as SalesChatExchange[];
    },
    enabled: !!projectId,
  });

  // =============================================
  // Enviar mensaje
  // =============================================

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      message,
      includeContext = true,
    }: {
      message: string;
      includeContext?: boolean;
    }) => {
      const response = await fetch('/api/sales-analytics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          message,
          include_context: includeContext,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['sales-chat-exchanges', projectId],
      });
    },
    onError: (error: Error) => {
      console.error('Error enviando mensaje:', error.message);
    },
  });

  // =============================================
  // Borrar un intercambio o todo el historial
  // =============================================

  const deleteExchangeMutation = useMutation({
    mutationFn: async (exchangeId: string) => {
      const response = await fetch(`/api/sales-analytics/chat?id=${exchangeId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['sales-chat-exchanges', projectId],
      });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/sales-analytics/chat?project_id=${projectId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['sales-chat-exchanges', projectId],
      });
    },
  });

  return {
    // State
    exchanges,
    isLoadingHistory,

    // Actions
    sendMessage: sendMessageMutation.mutateAsync,
    deleteExchange: deleteExchangeMutation.mutateAsync,
    clearHistory: clearHistoryMutation.mutateAsync,
    refetchHistory,

    // Loading states
    isSending: sendMessageMutation.isPending,
    isDeleting: deleteExchangeMutation.isPending || clearHistoryMutation.isPending,
  };
}
