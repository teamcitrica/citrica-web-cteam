"use client";

// =============================================
// Page: /sales-analytics/projects/[id]/reports
// Historial de reportes generados
// =============================================

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import {
  ArrowLeft,
  FileText,
  Download,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useSalesReports } from '@/hooks/sales-analytics/use-sales-reports';

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
      alert('Reporte eliminado exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDownload = (report: any) => {
    // Crear un blob con el contenido del reporte
    const blob = new Blob([JSON.stringify(report.analysis_json, null, 2)], {
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
                Reportes generados automáticamente con IA
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
                      {new Date(reports[0].created_at).toLocaleDateString(
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
                      {formatCurrency(
                        reports.reduce((sum, r) => sum + (r.total_cost || 0), 0)
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
                Los reportes se generarán automáticamente según la programación
                del proyecto
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const analysis = report.analysis_json as any;
              const metrics = analysis?.metricas_clave || {};

              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Reporte {report.period_start} - {report.period_end}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          Generado el{' '}
                          {new Date(report.created_at).toLocaleString('es-ES')}
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
                    {/* Métricas Clave */}
                    {metrics && Object.keys(metrics).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {metrics.revenue_total !== undefined && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-700 mb-1">
                              Revenue Total
                            </p>
                            <p className="text-lg font-bold text-green-900">
                              {formatCurrency(metrics.revenue_total)}
                            </p>
                          </div>
                        )}

                        {metrics.total_orders !== undefined && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-700 mb-1">
                              Órdenes Totales
                            </p>
                            <p className="text-lg font-bold text-blue-900">
                              {metrics.total_orders}
                            </p>
                          </div>
                        )}

                        {metrics.avg_order_value !== undefined && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-xs text-purple-700 mb-1">
                              Ticket Promedio
                            </p>
                            <p className="text-lg font-bold text-purple-900">
                              {formatCurrency(metrics.avg_order_value)}
                            </p>
                          </div>
                        )}

                        {metrics.unique_customers !== undefined && (
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <p className="text-xs text-yellow-700 mb-1">
                              Clientes Únicos
                            </p>
                            <p className="text-lg font-bold text-yellow-900">
                              {metrics.unique_customers}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Resumen Ejecutivo */}
                    {analysis?.resumen_ejecutivo && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Resumen Ejecutivo
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {analysis.resumen_ejecutivo}
                        </p>
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Tokens: {report.prompt_tokens} + {report.completion_tokens}
                        </span>
                        <span>Costo: {formatCurrency(report.total_cost || 0)}</span>
                      </div>

                      {report.whatsapp_sent && (
                        <Chip size="sm" color="success" variant="flat">
                          Enviado por WhatsApp
                        </Chip>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
