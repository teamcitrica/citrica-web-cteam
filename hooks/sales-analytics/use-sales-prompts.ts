// =============================================
// Hook: use-sales-prompts
// Gestión de prompts de Sales Analytics
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SalesPrompt } from '@/types/sales-analytics';

export function useSalesPrompts(projectId: string) {
  const queryClient = useQueryClient();

  // =============================================
  // Get prompts for project
  // =============================================

  const {
    data: prompts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['sales-prompts', projectId],
    queryFn: async () => {
      const response = await fetch(
        `/api/sales-analytics/prompts?project_id=${projectId}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.prompts as SalesPrompt[];
    },
    enabled: !!projectId,
  });

  // =============================================
  // Create prompt
  // =============================================

  const createPromptMutation = useMutation({
    mutationFn: async (promptData: Partial<SalesPrompt>) => {
      const response = await fetch('/api/sales-analytics/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.prompt;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['sales-prompts', projectId],
      });
    },
    onError: (error: Error) => {
      console.error('Error creando prompt:', error.message);
    },
  });

  // =============================================
  // Update prompt
  // =============================================

  const updatePromptMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<SalesPrompt>;
    }) => {
      const response = await fetch('/api/sales-analytics/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.prompt;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['sales-prompts', projectId],
      });
    },
    onError: (error: Error) => {
      console.error('Error actualizando prompt:', error.message);
    },
  });

  // =============================================
  // Delete prompt
  // =============================================

  const deletePromptMutation = useMutation({
    mutationFn: async (promptId: string) => {
      const response = await fetch(
        `/api/sales-analytics/prompts?id=${promptId}`,
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
      await queryClient.refetchQueries({
        queryKey: ['sales-prompts', projectId],
      });
    },
    onError: (error: Error) => {
      console.error('Error eliminando prompt:', error.message);
    },
  });

  // =============================================
  // Activate prompt (desactiva todos los demás)
  // =============================================

  const activatePrompt = async (promptId: string) => {
    // Desactivar todos los prompts del proyecto
    const deactivatePromises = prompts.map((p) =>
      updatePromptMutation.mutateAsync({
        id: p.id,
        updates: { is_active: false },
      })
    );

    await Promise.all(deactivatePromises);

    // Activar el seleccionado
    await updatePromptMutation.mutateAsync({
      id: promptId,
      updates: { is_active: true },
    });
  };

  return {
    // State
    prompts,
    isLoading,
    activePrompt: prompts.find((p) => p.is_active),

    // Actions
    refetch,
    createPrompt: createPromptMutation.mutateAsync,
    updatePrompt: updatePromptMutation.mutateAsync,
    deletePrompt: deletePromptMutation.mutateAsync,
    activatePrompt,

    // Loading states
    isCreating: createPromptMutation.isPending,
    isUpdating: updatePromptMutation.isPending,
    isDeleting: deletePromptMutation.isPending,
  };
}
