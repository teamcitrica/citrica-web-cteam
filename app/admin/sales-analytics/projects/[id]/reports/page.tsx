"use client";

// =============================================
// Page: /admin/sales-analytics/projects/[id]/reports
// Historial de reportes generados — lee las columnas reales
// (ai_analysis, recommendations, key_insights, top_products, trends)
// =============================================

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { addToast } from '@heroui/toast';
import {
  ArrowLeft,
  FileText,
  Download,
  Trash2,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useSalesReports } from '@/hooks/sales-analytics/use-sales-reports';
import type { SalesWeeklyReport } from '@/types/sales-analytics';

export default function ProjectReportsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { reports, isLoading, deleteReport, isDeleting } =
    useSalesReports(projectId);

  const handleDelete = async (reportId: string) => {
    if (!confirm('¿Eliminar este reporte?')) return;

    try {
      await deleteReport(reportId);
      addToast({ title: 'Reporte eliminado', color: 'success' });
    } catch (error: any) {
      addToast({ title: 'Error', description: error.message, color: 'danger' });
    }
  };

  const handleDownload = (report: SalesWeeklyReport) => {
    const exportData = {
      period: { start: report.period_start, end: report.period_end },
      analysis: report.ai_analysis,
      recommendations: report.recommendations,
      keyInsights: report.key_insights,
      topProducts: report.top_products,
      worstProducts: report.worst_products,
      trends: report.trends,
      model: report.model_used,
      tokens: report.total_tokens,
      costUsd: report.cost_usd,
      generatedAt: report.generated_at,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${report.period_start}-${report.period_end}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Costos de IA son fracciones de centavo — con 2 decimales siempre saldría $0.00
  const formatCost = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
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
                Historial de Reportes
              </h1>
              <p className="text-gray-600 mt-2">
                Reportes generados con IA sobre las ventas reales
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {reports && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reportes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reports.length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Último Reporte</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(reports[0].generated_at).toLocaleDateString(
                        'es-ES'
                      )}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Costo Total IA</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCost(
                        reports.reduce(
                          (sum: number, r: SalesWeeklyReport) => sum + Number(r.cost_usd || 0),
                          0
                        )
                      )}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Reports List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando reportes...</p>
          </div>
        ) : !reports || reports.length === 0 ? (
          <Card>
            <CardBody className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay reportes generados
              </h3>
              <p className="text-gray-600">
                Usa "Generar Reporte Manual" en el proyecto, o espera la próxima
                ejecución programada
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report: SalesWeeklyReport) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Reporte {report.period_start} - {report.period_end}
                        </h3>
                        {report.generated_by === 'system' && (
                          <Chip size="sm" variant="flat" color="secondary">
                            Automático
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Generado el{' '}
                        {new Date(report.generated_at).toLocaleString('es-ES')}
                        {report.model_used ? ` · ${report.model_used}` : ''}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Download className="w-4 h-4" />}
                        onPress={() => handleDownload(report)}
                      >
                        Descargar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<Trash2 className="w-4 h-4" />}
                        onPress={() => handleDelete(report.id)}
                        isLoading={isDeleting}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="pt-2">
                  {/* Análisis */}
                  {report.ai_analysis && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Análisis
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {report.ai_analysis}
                      </p>
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {report.recommendations && report.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Recomendaciones
                      </h4>
                      <ul className="list-disc ml-5 space-y-1">
                        {report.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-700">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Top productos */}
                  {report.top_products && report.top_products.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Productos Destacados
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {report.top_products.slice(0, 6).map((p, i) => (
                          <div key={i} className="bg-green-50 p-2 rounded-lg text-sm">
                            <span className="font-medium text-green-900">{p.name}</span>
                            {p.revenue !== undefined && (
                              <span className="text-green-700 block text-xs">
                                {formatCurrency(Number(p.revenue))}
                                {p.quantity !== undefined ? ` · ${p.quantity} uds` : ''}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {report.key_insights && Object.keys(report.key_insights).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Insights
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(report.key_insights).map(([key, value]) => (
                          <p key={key} className="text-sm text-gray-700">
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                            {String(value)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tendencias */}
                  {report.trends && Object.keys(report.trends).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Tendencias
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(report.trends).map(([key, value]) => (
                          <p key={key} className="text-sm text-gray-700">
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                            {String(value)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Tokens: {report.prompt_tokens || 0} + {report.completion_tokens || 0}
                      </span>
                      <span>Costo: {formatCost(Number(report.cost_usd || 0))}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
