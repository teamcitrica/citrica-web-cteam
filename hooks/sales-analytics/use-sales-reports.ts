// =============================================
// Hook: use-sales-reports
// Gestión de reportes de Sales Analytics
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SalesWeeklyReport } from '@/types/sales-analytics';

export function useSalesReports(projectId: string) {
  const queryClient = useQueryClient();

  // =============================================
  // Get reports for project
  // =============================================

  const {
    data: reports = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['sales-reports', projectId],
    queryFn: async () => {
      const response = await fetch(
        `/api/sales-analytics/reports?project_id=${projectId}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.reports as SalesWeeklyReport[];
    },
    enabled: !!projectId, // Solo ejecutar si hay projectId
  });

  // =============================================
  // Delete report
  // =============================================

  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(
        `/api/sales-analytics/reports?id=${reportId}`,
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
        queryKey: ['sales-reports', projectId],
      });
    },
    onError: (error: Error) => {
      console.error('Error eliminando reporte:', error.message);
    },
  });

  return {
    // State
    reports,
    isLoading,

    // Actions
    refetch,
    deleteReport: deleteReportMutation.mutateAsync,

    // Loading states
    isDeleting: deleteReportMutation.isPending,
  };
}
