"use client";

// =============================================
// Page: /sales-analytics/config
// Configuración global del sistema
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import {
  ArrowLeft,
  Settings,
  Key,
  Sparkles,
  DollarSign,
  Activity,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { useSupabase } from '@/shared/context/supabase-context';

interface ModelConfig {
  id: string;
  model_id: string;
  model_name: string;
  provider: string;
  input_cost_per_million: number;
  output_cost_per_million: number;
  max_tokens: number;
  supports_vision: boolean;
  is_active: boolean;
}

interface ApiConfig {
  id: string;
  provider: string;
  encrypted_api_key: string;
  is_default: boolean;
  created_at: string;
}

export default function SalesAnalyticsConfigPage() {
  const router = useRouter();
  const { supabase } = useSupabase();

  const [models, setModels] = useState<ModelConfig[]>([]);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit states
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editingApiId, setEditingApiId] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});

  // Form states
  const [modelForm, setModelForm] = useState({
    model_name: '',
    input_cost: 0,
    output_cost: 0,
  });

  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Obtener API configs primero
      const { data: apiData } = await supabase
        .from('sales_api_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (apiData) setApiConfigs(apiData);

      // Solo cargar modelos si hay al menos una API key configurada
      if (apiData && apiData.length > 0) {
        const { data: modelsData } = await supabase
          .from('sales_model_config')
          .select('*')
          .order('created_at', { ascending: false });

        if (modelsData) setModels(modelsData);
      }
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateModel = async (modelId: string) => {
    try {
      const { error } = await supabase
        .from('sales_model_config')
        .update({
          model_name: modelForm.model_name,
          input_cost_per_million: modelForm.input_cost,
          output_cost_per_million: modelForm.output_cost,
        })
        .eq('id', modelId);

      if (error) throw error;

      alert('Modelo actualizado exitosamente');
      setEditingModelId(null);
      loadData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleToggleModelActive = async (modelId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sales_model_config')
        .update({ is_active: !currentStatus })
        .eq('id', modelId);

      if (error) throw error;

      loadData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddApiKey = async () => {
    if (!newApiKey.trim()) {
      alert('Ingresa una API key');
      return;
    }

    try {
      const { error } = await supabase
        .from('sales_api_config')
        .insert({
          provider: 'google',
          encrypted_api_key: newApiKey, // En producción, encriptar primero
          is_default: apiConfigs.length === 0, // Primera es default
        });

      if (error) throw error;

      alert('API Key agregada exitosamente');
      setNewApiKey('');
      loadData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSetDefaultApiKey = async (apiId: string) => {
    try {
      // Desactivar todos
      await supabase
        .from('sales_api_config')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Actualizar todos

      // Activar el seleccionado
      const { error } = await supabase
        .from('sales_api_config')
        .update({ is_default: true })
        .eq('id', apiId);

      if (error) throw error;

      alert('API Key por defecto actualizada');
      loadData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteApiKey = async (apiId: string) => {
    if (!confirm('¿Eliminar esta API Key?')) return;

    try {
      const { error } = await supabase
        .from('sales_api_config')
        .delete()
        .eq('id', apiId);

      if (error) throw error;

      alert('API Key eliminada exitosamente');
      loadData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const startEditingModel = (model: ModelConfig) => {
    setEditingModelId(model.id);
    setModelForm({
      model_name: model.model_name,
      input_cost: model.input_cost_per_million,
      output_cost: model.output_cost_per_million,
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
            onPress={() => router.push('/admin/sales-analytics/projects')}
            className="mb-4"
          >
            Volver a Proyectos
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Configuración Global
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona modelos de IA y API keys del sistema
              </p>
            </div>

            <Settings className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Modelos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {models.filter((m) => m.is_active).length}
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">API Keys</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {apiConfigs.length}
                  </p>
                </div>
                <Key className="w-8 h-8 text-green-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Proveedores</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(models.map((m) => m.provider)).size}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* API Keys Section - PRIMERO */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">API Keys de Google</h3>
              </div>
            </div>
          </CardHeader>

          <CardBody className="pt-2">
            {/* Add New API Key */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                ⚠️ Primero configura tu API Key de Google Gemini
              </p>
              <p className="text-xs text-blue-700 mb-3">
                Sin una API Key válida, no podrás generar reportes con IA. Los modelos se activarán automáticamente después de agregar la API Key.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="AIzaSy..."
                  value={newApiKey}
                  onValueChange={setNewApiKey}
                  variant="faded"
                  type="password"
                />
                <Button color="primary" onPress={handleAddApiKey}>
                  Agregar
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 Obtén tu API Key en: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
              </p>
            </div>

            {/* API Keys List */}
            {apiConfigs.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No hay API keys configuradas</p>
                <p className="text-sm text-gray-500 mt-1">Agrega una API Key arriba para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiConfigs.map((api) => (
                  <div
                    key={api.id}
                    className={`p-4 rounded-lg border-2 ${
                      api.is_default
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-medium text-gray-900">
                            {api.provider.toUpperCase()} API Key
                          </p>
                          {api.is_default && (
                            <Chip size="sm" color="success" variant="flat">
                              Por Defecto
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-600 font-mono">
                            {showApiKey[api.id]
                              ? api.encrypted_api_key
                              : '••••••••••••••••••••••••'}
                          </p>
                          <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            onPress={() =>
                              setShowApiKey({
                                ...showApiKey,
                                [api.id]: !showApiKey[api.id],
                              })
                            }
                          >
                            {showApiKey[api.id] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Creada: {new Date(api.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {!api.is_default && (
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => handleSetDefaultApiKey(api.id)}
                          >
                            Usar por Defecto
                          </Button>
                        )}
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleDeleteApiKey(api.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Models Section - SEGUNDO (solo si hay API Key) */}
        {apiConfigs.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Modelos de IA</h3>
              </div>
            </CardHeader>

            <CardBody className="pt-2">
              {isLoading ? (
                <p className="text-center py-4 text-gray-600">Cargando...</p>
              ) : models.length === 0 ? (
                <p className="text-center py-4 text-gray-600">
                  No hay modelos configurados
                </p>
              ) : (
              <div className="space-y-4">
                {models.map((model) => (
                  <Card key={model.id} className={model.is_active ? 'border-2 border-green-200' : ''}>
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {editingModelId === model.id ? (
                            <div className="space-y-3">
                              <Input
                                size="sm"
                                label="Nombre del Modelo"
                                value={modelForm.model_name}
                                onValueChange={(val) =>
                                  setModelForm({ ...modelForm, model_name: val })
                                }
                                variant="faded"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  size="sm"
                                  type="number"
                                  label="Costo Input (por millón)"
                                  value={modelForm.input_cost.toString()}
                                  onValueChange={(val) =>
                                    setModelForm({
                                      ...modelForm,
                                      input_cost: parseFloat(val),
                                    })
                                  }
                                  variant="faded"
                                  step="0.01"
                                />
                                <Input
                                  size="sm"
                                  type="number"
                                  label="Costo Output (por millón)"
                                  value={modelForm.output_cost.toString()}
                                  onValueChange={(val) =>
                                    setModelForm({
                                      ...modelForm,
                                      output_cost: parseFloat(val),
                                    })
                                  }
                                  variant="faded"
                                  step="0.01"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  color="primary"
                                  startContent={<Save className="w-3 h-3" />}
                                  onPress={() => handleUpdateModel(model.id)}
                                >
                                  Guardar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  startContent={<X className="w-3 h-3" />}
                                  onPress={() => setEditingModelId(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {model.model_name}
                                </h4>
                                {model.is_active && (
                                  <Chip size="sm" color="success" variant="flat">
                                    Activo
                                  </Chip>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                ID: {model.model_id}
                              </p>
                              <div className="flex gap-4 text-xs text-gray-600">
                                <span>
                                  <DollarSign className="w-3 h-3 inline mr-1" />
                                  Input: ${(model.input_cost_per_million ?? 0).toFixed(2)}/M
                                </span>
                                <span>
                                  <DollarSign className="w-3 h-3 inline mr-1" />
                                  Output: ${(model.output_cost_per_million ?? 0).toFixed(2)}/M
                                </span>
                                <span>Max Tokens: {model.max_tokens ?? 0}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {editingModelId !== model.id && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color={model.is_active ? 'warning' : 'success'}
                              onPress={() =>
                                handleToggleModelActive(model.id, model.is_active)
                              }
                            >
                              {model.is_active ? 'Desactivar' : 'Activar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              startContent={<Edit className="w-3 h-3" />}
                              onPress={() => startEditingModel(model)}
                            >
                              Editar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
