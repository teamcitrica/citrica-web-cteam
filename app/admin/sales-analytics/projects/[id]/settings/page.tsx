"use client";

// =============================================
// Page: /sales-analytics/projects/[id]/settings
// Configuración del proyecto y editor de prompts
// =============================================

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input, Textarea } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Switch } from '@heroui/switch';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useSalesPrompts } from '@/hooks/sales-analytics/use-sales-prompts';

export default function ProjectSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const {
    prompts,
    isLoading,
    activePrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    activatePrompt,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSalesPrompts(projectId);

  // Form state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    version_name: '',
    system_prompt: '',
    user_prompt_template: '',
    temperature: 0.7,
    max_tokens: 4000,
  });

  const handleCreate = async () => {
    if (!formData.system_prompt || !formData.user_prompt_template) {
      alert('System Prompt y User Prompt Template son requeridos');
      return;
    }

    try {
      await createPrompt({
        project_id: projectId,
        ...formData,
      });
      alert('Prompt creado exitosamente');
      setIsCreatingNew(false);
      setFormData({
        version_name: '',
        system_prompt: '',
        user_prompt_template: '',
        temperature: 0.7,
        max_tokens: 4000,
      });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdate = async (promptId: string) => {
    try {
      await updatePrompt({
        id: promptId,
        updates: formData,
      });
      alert('Prompt actualizado exitosamente');
      setEditingPromptId(null);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm('¿Eliminar este prompt?')) return;

    try {
      await deletePrompt(promptId);
      alert('Prompt eliminado exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleActivate = async (promptId: string) => {
    try {
      await activatePrompt(promptId);
      alert('Prompt activado exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const startEditing = (prompt: any) => {
    setEditingPromptId(prompt.id);
    setFormData({
      version_name: prompt.version_name,
      system_prompt: prompt.system_prompt,
      user_prompt_template: prompt.user_prompt_template,
      temperature: prompt.temperature,
      max_tokens: prompt.max_tokens,
    });
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
                Configuración y Prompts
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona los prompts de IA para análisis de ventas
              </p>
            </div>

            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setIsCreatingNew(true)}
              isDisabled={isCreatingNew}
            >
              Nuevo Prompt
            </Button>
          </div>
        </div>

        {/* Active Prompt Info */}
        {activePrompt && !isCreatingNew && (
          <Card className="mb-6 border-2 border-green-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Prompt Activo: {activePrompt.version_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Este prompt se usa actualmente para generar reportes
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Create New Prompt Form */}
        {isCreatingNew && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Nuevo Prompt</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-2 space-y-4">
              <Input
                label="Nombre de Versión"
                placeholder="ej: v1.0, experimental, etc."
                value={formData.version_name}
                onValueChange={(val) =>
                  setFormData({ ...formData, version_name: val })
                }
                variant="faded"
              />

              <Textarea
                label="System Prompt"
                placeholder="Instrucciones generales para la IA..."
                value={formData.system_prompt}
                onValueChange={(val) =>
                  setFormData({ ...formData, system_prompt: val })
                }
                variant="faded"
                minRows={6}
                isRequired
              />

              <Textarea
                label="User Prompt Template"
                placeholder="Template con placeholders {totalRevenue}, {totalOrders}, etc."
                value={formData.user_prompt_template}
                onValueChange={(val) =>
                  setFormData({ ...formData, user_prompt_template: val })
                }
                variant="faded"
                minRows={8}
                isRequired
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Temperature"
                  value={formData.temperature.toString()}
                  onValueChange={(val) =>
                    setFormData({ ...formData, temperature: parseFloat(val) })
                  }
                  variant="faded"
                  step="0.1"
                  min="0"
                  max="2"
                />

                <Input
                  type="number"
                  label="Max Tokens"
                  value={formData.max_tokens.toString()}
                  onValueChange={(val) =>
                    setFormData({ ...formData, max_tokens: parseInt(val) })
                  }
                  variant="faded"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="flat"
                  onPress={() => setIsCreatingNew(false)}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreate}
                  isLoading={isCreating}
                >
                  Crear Prompt
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Prompts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando prompts...</p>
          </div>
        ) : !prompts || prompts.length === 0 ? (
          <Card>
            <CardBody className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay prompts configurados
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primer prompt para comenzar a generar reportes con IA
              </p>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => setIsCreatingNew(true)}
              >
                Crear Primer Prompt
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <Card
                key={prompt.id}
                className={
                  prompt.is_active ? 'border-2 border-green-200' : ''
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prompt.version_name}
                        </h3>
                        {prompt.is_active && (
                          <Chip size="sm" color="success" variant="flat">
                            Activo
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Creado el{' '}
                        {new Date(prompt.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!prompt.is_active && (
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          onPress={() => handleActivate(prompt.id)}
                          isLoading={isUpdating}
                        >
                          Activar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Edit className="w-4 h-4" />}
                        onPress={() => startEditing(prompt)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<Trash2 className="w-4 h-4" />}
                        onPress={() => handleDelete(prompt.id)}
                        isLoading={isDeleting}
                        isDisabled={prompt.is_active}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="pt-2">
                  {editingPromptId === prompt.id ? (
                    <div className="space-y-4">
                      <Input
                        label="Nombre de Versión"
                        value={formData.version_name}
                        onValueChange={(val) =>
                          setFormData({ ...formData, version_name: val })
                        }
                        variant="faded"
                      />

                      <Textarea
                        label="System Prompt"
                        value={formData.system_prompt}
                        onValueChange={(val) =>
                          setFormData({ ...formData, system_prompt: val })
                        }
                        variant="faded"
                        minRows={4}
                      />

                      <Textarea
                        label="User Prompt Template"
                        value={formData.user_prompt_template}
                        onValueChange={(val) =>
                          setFormData({
                            ...formData,
                            user_prompt_template: val,
                          })
                        }
                        variant="faded"
                        minRows={6}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          label="Temperature"
                          value={formData.temperature.toString()}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              temperature: parseFloat(val),
                            })
                          }
                          variant="faded"
                          step="0.1"
                        />

                        <Input
                          type="number"
                          label="Max Tokens"
                          value={formData.max_tokens.toString()}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              max_tokens: parseInt(val),
                            })
                          }
                          variant="faded"
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="flat"
                          onPress={() => setEditingPromptId(null)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          color="primary"
                          onPress={() => handleUpdate(prompt.id)}
                          isLoading={isUpdating}
                        >
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          System Prompt
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {prompt.system_prompt}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          User Prompt Template
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {prompt.user_prompt_template}
                        </p>
                      </div>

                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>Temperature: {prompt.temperature}</span>
                        <span>Max Tokens: {prompt.max_tokens}</span>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
