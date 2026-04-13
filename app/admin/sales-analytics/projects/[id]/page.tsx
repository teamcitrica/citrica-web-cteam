"use client";

// =============================================
// Page: /sales-analytics/projects/[id]
// Detalle y gestión de proyecto individual
// =============================================

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Switch } from '@heroui/switch';
import {
  ArrowLeft,
  Settings,
  Pause,
  Play,
  Trash2,
  Activity,
  Calendar,
  Database,
  MessageSquare,
  BarChart,
} from 'lucide-react';
import { useSalesProjects } from '@/hooks/sales-analytics/use-sales-projects';
import type { SalesProject } from '@/types/sales-analytics';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { getProject, updateProject, deleteProject, isUpdating, isDeleting } =
    useSalesProjects();

  const [project, setProject] = useState<SalesProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar proyecto
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const data = await getProject(projectId);
      setProject(data);
    } catch (error: any) {
      console.error('Error cargando proyecto:', error);
      alert(`Error cargando proyecto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle activo/inactivo
  const handleToggleActive = async () => {
    if (!project) return;

    try {
      await updateProject({
        id: projectId,
        updates: { is_active: !project.is_active },
      });
      setProject({ ...project, is_active: !project.is_active });
      alert(
        `Proyecto ${!project.is_active ? 'activado' : 'desactivado'} exitosamente`
      );
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Toggle pausado
  const handleTogglePause = async () => {
    if (!project) return;

    try {
      await updateProject({
        id: projectId,
        updates: { is_paused: !project.is_paused },
      });
      setProject({ ...project, is_paused: !project.is_paused });
      alert(
        `Proyecto ${!project.is_paused ? 'pausado' : 'reanudado'} exitosamente`
      );
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Eliminar proyecto
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteProject(projectId);
      alert('Proyecto eliminado exitosamente');
      router.push('/admin/sales-analytics/projects');
    } catch (error: any) {
      alert(`Error eliminando proyecto: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <p className="text-gray-600">Cargando proyecto...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <Card>
          <CardBody className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Proyecto no encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              El proyecto que buscas no existe o fue eliminado
            </p>
            <Button onPress={() => router.push('/sales-analytics/projects')}>
              Volver a Proyectos
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={() => router.push('/admin/sales-analytics/projects')}
            className="mb-4"
          >
            Volver a Proyectos
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="flat"
                startContent={<Settings className="w-4 h-4" />}
                onPress={() =>
                  router.push(`/admin/sales-analytics/projects/${projectId}/settings`)
                }
              >
                Configuración
              </Button>
              <Button
                color="danger"
                variant="flat"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={handleDelete}
                isLoading={isDeleting}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>

        {/* Status Controls */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estado</p>
                    <Switch
                      isSelected={project.is_active}
                      onValueChange={handleToggleActive}
                      isDisabled={isUpdating}
                    >
                      {project.is_active ? 'Activo' : 'Inactivo'}
                    </Switch>
                  </div>
                </div>

                {project.is_active && (
                  <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    {project.is_paused ? (
                      <Play className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Pause className="w-5 h-5 text-gray-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">Ejecución</p>
                      <Switch
                        isSelected={!project.is_paused}
                        onValueChange={handleTogglePause}
                        isDisabled={isUpdating}
                      >
                        {project.is_paused ? 'Pausado' : 'Activo'}
                      </Switch>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!project.is_active ? (
                  <Chip color="danger" variant="flat">
                    Inactivo
                  </Chip>
                ) : project.is_paused ? (
                  <Chip color="warning" variant="flat">
                    Pausado
                  </Chip>
                ) : (
                  <Chip color="success" variant="flat">
                    Activo
                  </Chip>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Database Info */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Base de Datos</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">URL de Supabase</p>
                  <p className="text-sm font-mono text-gray-900 truncate">
                    {project.supabase_url}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estrategia de Extracción</p>
                  <Chip size="sm" variant="flat" className="mt-1">
                    {project.data_extraction_strategy === 'rpc'
                      ? 'RPC Function'
                      : project.data_extraction_strategy === 'direct_query'
                      ? 'Direct Query'
                      : 'Custom Query'}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Schedule Info */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Programación</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Expresión Cron</p>
                  <p className="text-sm font-mono text-gray-900">
                    {project.cron_expression}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Zona Horaria</p>
                  <p className="text-sm text-gray-900">{project.timezone}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            isPressable
            onPress={() =>
              router.push(`/admin/sales-analytics/projects/${projectId}/reports`)
            }
            className="hover:shadow-lg transition-shadow"
          >
            <CardBody className="p-6 text-center">
              <BarChart className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Ver Reportes
              </h3>
              <p className="text-sm text-gray-600">
                Historial de reportes generados
              </p>
            </CardBody>
          </Card>

          <Card
            isPressable
            onPress={() =>
              router.push(`/admin/sales-analytics/projects/${projectId}/chat`)
            }
            className="hover:shadow-lg transition-shadow"
          >
            <CardBody className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Chat Interactivo
              </h3>
              <p className="text-sm text-gray-600">
                Consulta datos con IA en tiempo real
              </p>
            </CardBody>
          </Card>

          <Card
            isPressable
            onPress={() =>
              router.push(`/sales-analytics/projects/${projectId}/settings`)
            }
            className="hover:shadow-lg transition-shadow"
          >
            <CardBody className="p-6 text-center">
              <Settings className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Configuración
              </h3>
              <p className="text-sm text-gray-600">
                Editar proyecto y ajustes
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
