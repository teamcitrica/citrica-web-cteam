"use client";

// =============================================
// Page: /sales-analytics/projects
// Dashboard de proyectos de Sales Analytics
// =============================================

import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Plus, Activity, Pause, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSalesProjects } from '@/hooks/sales-analytics/use-sales-projects';

export default function SalesAnalyticsProjectsPage() {
  const router = useRouter();
  const { projects, isLoading } = useSalesProjects();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sales Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona proyectos de análisis de ventas con IA
            </p>
          </div>

          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => router.push('/admin/sales-analytics/projects/new')}
          >
            Nuevo Proyecto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Proyectos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : projects?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {isLoading
                      ? '...'
                      : projects?.filter((p) => p.is_active && !p.is_paused).length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pausados</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {isLoading
                      ? '...'
                      : projects?.filter((p) => p.is_paused).length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Pause className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando proyectos...</p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <Card>
            <CardBody className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay proyectos configurados
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primer proyecto para comenzar a generar reportes de ventas con IA
              </p>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => router.push('/admin/sales-analytics/projects/new')}
              >
                Crear Primer Proyecto
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                isPressable
                onPress={() => router.push(`/admin/sales-analytics/projects/${project.id}`)}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex justify-between items-start pb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardBody className="pt-2">
                  <div className="space-y-3">
                    {/* Status */}
                    <div className="flex gap-2">
                      {!project.is_active ? (
                        <Chip size="sm" color="danger" variant="flat">
                          Inactivo
                        </Chip>
                      ) : project.is_paused ? (
                        <Chip size="sm" color="warning" variant="flat">
                          Pausado
                        </Chip>
                      ) : (
                        <Chip size="sm" color="success" variant="flat">
                          Activo
                        </Chip>
                      )}

                      <Chip size="sm" variant="flat">
                        {project.data_extraction_strategy === 'rpc'
                          ? 'RPC'
                          : project.data_extraction_strategy === 'direct_query'
                          ? 'Direct Query'
                          : 'Custom'}
                      </Chip>
                    </div>

                    {/* Schedule Info */}
                    <div className="text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Frecuencia:</span>
                        <span>{project.cron_expression}</span>
                      </p>
                      {project.timezone && (
                        <p className="flex items-center gap-2 mt-1">
                          <span className="font-medium">Zona horaria:</span>
                          <span>{project.timezone}</span>
                        </p>
                      )}
                    </div>

                    {/* Last Report */}
                    {project.created_at && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Creado: {new Date(project.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
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
