// =============================================
// Hook: use-sales-chat
// Gestión de chat interactivo con IA
// =============================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SalesChatConversation, SalesChatMessage } from '@/types/sales-analytics';

export function useSalesChat(projectId: string) {
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // =============================================
  // Get conversations list
  // =============================================

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['sales-chat-conversations', projectId],
    queryFn: async () => {
      const response = await fetch(
        `/api/sales-analytics/chat?project_id=${projectId}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.conversations as SalesChatConversation[];
    },
    enabled: !!projectId,
  });

  // =============================================
  // Get messages for conversation
  // =============================================

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['sales-chat-messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];

      const response = await fetch(
        `/api/sales-analytics/chat?project_id=${projectId}&conversation_id=${currentConversationId}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.messages as SalesChatMessage[];
    },
    enabled: !!currentConversationId,
  });

  // =============================================
  // Send message
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
          conversation_id: currentConversationId,
          include_context: includeContext,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: async (data) => {
      // Si es conversación nueva, actualizar el ID actual
      if (!currentConversationId && data.conversation_id) {
        setCurrentConversationId(data.conversation_id);
      }

      // Refetch mensajes
      await queryClient.refetchQueries({
        queryKey: ['sales-chat-messages', data.conversation_id || currentConversationId],
      });

      // Refetch conversaciones
      await queryClient.refetchQueries({
        queryKey: ['sales-chat-conversations', projectId],
      });
    },
    onError: (error: Error) => {
      console.error('Error enviando mensaje:', error.message);
    },
  });

  // =============================================
  // Delete conversation
  // =============================================

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(
        `/api/sales-analytics/chat?conversation_id=${conversationId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: async () => {
      // Si eliminamos la conversación actual, limpiar
      if (currentConversationId) {
        setCurrentConversationId(null);
      }

      // Refetch conversaciones
      await queryClient.refetchQueries({
        queryKey: ['sales-chat-conversations', projectId],
      });
    },
    onError: (error: Error) => {
      console.error('Error eliminando conversación:', error.message);
    },
  });

  // =============================================
  // Start new conversation
  // =============================================

  const startNewConversation = () => {
    setCurrentConversationId(null);
  };

  // =============================================
  // Select conversation
  // =============================================

  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  return {
    // State
    conversations,
    messages,
    currentConversationId,
    isLoadingConversations,
    isLoadingMessages,

    // Actions
    sendMessage: sendMessageMutation.mutateAsync,
    deleteConversation: deleteConversationMutation.mutateAsync,
    startNewConversation,
    selectConversation,
    refetchConversations,
    refetchMessages,

    // Loading states
    isSending: sendMessageMutation.isPending,
    isDeleting: deleteConversationMutation.isPending,
  };
}
