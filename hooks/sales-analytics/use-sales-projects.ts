// =============================================
// Hook: use-sales-projects
// Gestión de proyectos de Sales Analytics
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  SalesProject,
  CreateProjectRequest,
  DetectSchemaResponse,
  GenerateScriptResponse,
  VerifySetupResponse,
} from '@/types/sales-analytics';

export function useSalesProjects() {
  const queryClient = useQueryClient();

  // =============================================
  // Queries
  // =============================================

  const {
    data: projects = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['sales-projects'],
    queryFn: async () => {
      const response = await fetch('/api/sales-analytics/projects');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.projects as SalesProject[];
    },
  });

  // =============================================
  // Get single project
  // =============================================

  const getProject = async (projectId: string): Promise<SalesProject> => {
    const response = await fetch(`/api/sales-analytics/projects?id=${projectId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.project;
  };

  // =============================================
  // Create project
  // =============================================

  const createProjectMutation = useMutation({
    mutationFn: async (formData: CreateProjectRequest) => {
      const response = await fetch('/api/sales-analytics/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['sales-projects'] });
    },
    onError: (error: Error) => {
      console.error('Error creando proyecto:', error.message);
    },
  });

  // =============================================
  // Update project
  // =============================================

  const updateProjectMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<SalesProject>;
    }) => {
      const response = await fetch('/api/sales-analytics/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.project;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['sales-projects'] });
    },
    onError: (error: Error) => {
      console.error('Error actualizando proyecto:', error.message);
    },
  });

  // =============================================
  // Delete project
  // =============================================

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(
        `/api/sales-analytics/projects?id=${projectId}`,
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
      await queryClient.refetchQueries({ queryKey: ['sales-projects'] });
    },
    onError: (error: Error) => {
      console.error('Error eliminando proyecto:', error.message);
    },
  });

  // =============================================
  // Detect schema
  // =============================================

  const detectSchema = async (
    supabaseUrl: string,
    supabaseAnonKey: string
  ): Promise<DetectSchemaResponse> => {
    const response = await fetch(
      '/api/sales-analytics/projects/detect-schema',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseUrl, supabaseAnonKey }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return {
      strategy: data.strategy,
      message: data.message,
      rpc_name: data.rpc_name,
      available_columns: data.available_columns,
      requires_mapping: data.requires_mapping,
      requires_setup: data.requires_setup,
      requires_script: data.requires_script,
      ready: data.ready,
    };
  };

  // =============================================
  // Generate setup script
  // =============================================

  const generateSetupScript = async (
    projectId: string
  ): Promise<GenerateScriptResponse> => {
    const response = await fetch(
      '/api/sales-analytics/projects/generate-setup-script',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return {
      script: data.script,
      instructions: data.instructions,
    };
  };

  // =============================================
  // Verify setup
  // =============================================

  const verifySetup = async (
    projectId: string
  ): Promise<VerifySetupResponse> => {
    const response = await fetch(
      '/api/sales-analytics/projects/verify-setup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      }
    );

    const data = await response.json();

    return {
      success: data.success,
      error: data.error,
      message: data.message,
    };
  };

  return {
    // State
    projects,
    isLoading,

    // Actions
    refetch,
    getProject,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    detectSchema,
    generateSetupScript,
    verifySetup,

    // Loading states
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
}
