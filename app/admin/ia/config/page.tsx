"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button, Input, Col, Container, Text, Icon } from "citrica-ui-toolkit";
import Modal from "@/shared/components/citrica-ui/molecules/modal";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";

interface AIModel {
  id: string;
  model_id: string;
  display_name: string;
  description: string;
  provider: string;
  input_token_limit: number;
  output_token_limit: number;
  is_active: boolean;
  is_default: boolean;
  cost_per_1m_input_tokens: number;
  cost_per_1m_output_tokens: number;
  supports_file_api: boolean;
  supports_streaming: boolean;
  config: any;
}

interface ApiKeyEntry {
  id: string;
  name: string;
  api_key: string; // enmascarada
  is_selected: boolean;
  verification_status: string;
  models_count: number | null;
  error_message?: string | null;
}

export default function ConfigPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyName, setApiKeyName] = useState<string>("");
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [switchingKeyId, setSwitchingKeyId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<{
    step: string;
    current?: number;
    total?: number;
  } | null>(null);
  const [showAllModels, setShowAllModels] = useState(false);
  const [allAvailableModels, setAllAvailableModels] = useState<any[]>([]);

  useEffect(() => {
    fetchModels();
    fetchApiConfig();
  }, []);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      // Solo obtener modelos activos (disponibles)
      const response = await fetch("/api/ai/models?active_only=true");
      const data = await response.json();
      if (data.models) {
        setModels(data.models);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApiConfig = async () => {
    try {
      const response = await fetch("/api/ai/config");
      const data = await response.json();
      if (data.keys) {
        setApiKeys(data.keys);
      }
    } catch (error) {
      console.error("Error fetching API config:", error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;

    setIsSyncing(true);
    setSyncProgress({ step: "Verificando API Key y detectando modelos..." });

    try {
      const response = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          name: apiKeyName.trim() || `Key ${apiKeys.length + 1}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsApiKeyModalOpen(false);
        setApiKey("");
        setApiKeyName("");
        await fetchApiConfig();

        if (data.verification && data.verification.isValid) {
          const modelsCount = data.verification.metadata?.total_models;
          addToast({
            title: "✅ API Key verificada y guardada",
            description: `${modelsCount ?? "?"} modelos en catálogo. Los usables se determinan al ponerla en uso.`,
            color: "success",
          });

          // Si quedó seleccionada (primera key), sincronizar modelos del sistema
          if (data.config?.is_selected) {
            setSyncProgress({ step: "Sincronizando y probando modelos Gemini..." });
            await handleSyncModels();
            return;
          }
        } else {
          addToast({
            title: "API Key guardada con advertencia",
            description: `Falló la verificación: ${data.verification?.error || "Error desconocido"}`,
            color: "warning",
          });
        }
      } else {
        addToast({
          title: "Error",
          description: data.error || "No se pudo guardar la API Key",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      addToast({
        title: "Error",
        description: "Error al guardar la API Key",
        color: "danger",
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  // Cambiar la key en uso: selecciona y resincroniza los modelos del sistema
  const handleSelectKey = async (key: ApiKeyEntry) => {
    if (key.is_selected) return;

    setSwitchingKeyId(key.id);
    setIsSyncing(true);
    setSyncProgress({ step: `Cambiando a "${key.name}"...` });

    try {
      const response = await fetch("/api/ai/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: key.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo seleccionar la key");
      }

      await fetchApiConfig();
      setSyncProgress({ step: "Sincronizando modelos de la nueva key..." });
      await handleSyncModels();

      addToast({
        title: `Usando "${key.name}"`,
        description: "Modelos sincronizados con la nueva key",
        color: "success",
      });
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Error al cambiar de key",
        color: "danger",
      });
    } finally {
      setSwitchingKeyId(null);
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const handleDeleteKey = async (key: ApiKeyEntry) => {
    try {
      const response = await fetch(`/api/ai/config?id=${key.id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar la key");
      }

      await fetchApiConfig();
      addToast({
        title: "Key eliminada",
        description: `"${key.name}" fue eliminada`,
        color: "success",
      });
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Error al eliminar la key",
        color: "danger",
      });
    }
  };

  const handleSyncModels = async () => {
    try {
      console.log("Iniciando sincronización de modelos...");
      const response = await fetch("/api/ai/sync-models", {
        method: "POST",
      });

      const data = await response.json();
      console.log("Resultado de sincronización:", data);

      if (response.ok) {
        setSyncProgress({ step: `Finalizando... ${data.available} modelos encontrados` });
        await fetchModels();

        addToast({
          title: "✅ Sincronización completada",
          description: `${data.available} modelos Gemini disponibles y probados`,
          color: "success",
        });
      } else {
        addToast({
          title: "Error en sincronización",
          description: data.error || "Error desconocido",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error syncing models:", error);
      addToast({
        title: "Error",
        description: "Error al sincronizar modelos",
        color: "danger",
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const handleShowAllModels = async () => {
    try {
      setShowAllModels(true);
      const response = await fetch("/api/ai/list-all-models");
      const data = await response.json();
      if (response.ok) {
        setAllAvailableModels(data.models);
      }
    } catch (error) {
      console.error("Error fetching all models:", error);
    }
  };

  const handleSetDefault = async (model: AIModel) => {
    try {
      const response = await fetch("/api/ai/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: model.id,
          is_default: true,
        }),
      });

      if (response.ok) {
        await fetchModels();
      }
    } catch (error) {
      console.error("Error setting default model:", error);
    }
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toString();
  };

  return (
    <Container>
      <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
        <div>
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#265197]">
              <Text isAdmin={true} variant="title" weight="bold" color="#678CC5">IA</Text> {'>'}  <Text isAdmin={true} variant="title" weight="bold" color="#16305A">Configuración de Modelos</Text>
            </h1>
            <p>
              <Text isAdmin={true} variant="label" color="#16305A">Gestiona los modelos de IA disponibles para el sistema RAG</Text>
            </p>
          </div>

          {/* API Keys Card — múltiples keys con selector */}
          <Card className="mb-6">
            <CardHeader className="flex flex-col items-start p-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon name="Key" size={20} color="#265197" />
                  <Text isAdmin={true} variant="body" weight="bold" color="#16305A">
                    API Keys de Gemini
                  </Text>
                </div>
                <Chip size="sm" color="primary" variant="flat">
                  {apiKeys.length} key{apiKeys.length !== 1 ? "s" : ""}
                </Chip>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-4">
              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2">
                    No hay API keys configuradas. Agrega la primera para activar el sistema de IA.
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                        key.is_selected ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Text isAdmin variant="body" weight="bold" color="#16305A">
                            {key.name}
                          </Text>
                          {key.is_selected && (
                            <Chip size="sm" color="success" variant="flat">En uso</Chip>
                          )}
                          {key.verification_status !== "valid" ? (
                            <Chip size="sm" color="danger" variant="flat">Inválida</Chip>
                          ) : key.is_selected ? (
                            // Key en uso: modelos que pasaron la prueba real (los del grid)
                            <Chip size="sm" color="primary" variant="flat">
                              {models.length} modelos usables
                            </Chip>
                          ) : (
                            // Keys en espera: solo conocemos su catálogo; los usables
                            // se determinan al seleccionarla (sincronización + prueba real)
                            <Chip size="sm" color="default" variant="flat">
                              {key.models_count ?? "?"} en catálogo
                            </Chip>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1 truncate">
                          {key.api_key}
                        </div>
                        {key.verification_status !== "valid" && key.error_message && (
                          <div className="text-xs text-red-600 mt-1 truncate">{key.error_message}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!key.is_selected && (
                          <Button
                            isAdmin
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSelectKey(key)}
                            disabled={isSyncing || key.verification_status !== "valid"}
                          >
                            {switchingKeyId === key.id ? (
                              <Icon name="Loader2" size={14} className="animate-spin" />
                            ) : (
                              "Usar"
                            )}
                          </Button>
                        )}
                        {!key.is_selected && (
                          <button
                            onClick={() => handleDeleteKey(key)}
                            disabled={isSyncing}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar key"
                          >
                            <Icon name="Trash2" size={16} color="#EF4444" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    isAdmin
                    variant="primary"
                    onClick={() => setIsApiKeyModalOpen(true)}
                    disabled={isSyncing}
                    startContent={
                      isSyncing ? (
                        <Icon name="Loader2" size={16} className="animate-spin" />
                      ) : (
                        <Icon name="Plus" size={16} />
                      )
                    }
                  >
                    {isSyncing ? "Sincronizando..." : "Agregar API Key"}
                  </Button>

                  <Button
                    isAdmin
                    variant="secondary"
                    onClick={handleShowAllModels}
                    disabled={!apiKeys.some((k) => k.is_selected)}
                    startContent={<Icon name="List" size={16} />}
                  >
                    Ver Todos los Modelos
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  💡 "En catálogo" = todos los modelos que Google lista para esa key (incluye imagen, voz y modelos de pago).
                  "Usables" = los que pasaron una prueba real de chat con tu tier — son los que aparecen abajo y en el chat.
                  Al cambiar de key se vuelven a probar.
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Info Card */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={24} color="#16305A" />
              <div>
                <h3 className="mb-1">
                  <Text isAdmin={true} variant="body" weight="bold" color="#16305A">Modelos de IA</Text>
                </h3>
                <p>
                  <Text isAdmin={true} variant="body" color="#265197">
                    Cada modelo tiene características diferentes en términos de velocidad, costo y capacidad.
                    El modelo por defecto se usará en el chat cuando no se especifique uno.
                  </Text>
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Models */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <Icon name="Loader2" size={32} color="#265197" className="animate-spin mx-auto mb-2" />
                <Text isAdmin={true} variant="body" color="#265197">Cargando modelos...</Text>
              </div>
            ) : models.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Icon name="AlertCircle" size={48} color="#9CA3AF" />
                <Text isAdmin={true} variant="body" color="#4B5563">No hay modelos configurados</Text>
              </div>
            ) : (
              models.map((model) => (
                <Card
                  key={model.id}
                  className={`w-full ${model.is_default ? 'border-2 border-green-400' : ''}`}
                >
                  <CardHeader className="flex-col items-start p-4">
                    <div className="flex items-start justify-between w-full mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3>
                            <Text isAdmin={true} variant="body" weight="bold" color="#16305A">
                              {model.display_name}
                            </Text>
                          </h3>
                          {model.is_default && (
                            <Chip size="sm" color="success" variant="flat">
                              Por defecto
                            </Chip>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {model.description}
                        </p>
                        <div className="mt-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {model.model_id}
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <Divider />

                  <CardBody className="p-4">
                    {/* Límites de Tokens */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">Input Limit</div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatTokens(model.input_token_limit)}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">Output Limit</div>
                        <div className="text-lg font-bold text-purple-600">
                          {formatTokens(model.output_token_limit)}
                        </div>
                      </div>
                    </div>

                    {/* Costos */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">Costo Input</div>
                        <div className="text-sm font-bold text-green-600">
                          ${model.cost_per_1m_input_tokens}/1M
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">Costo Output</div>
                        <div className="text-sm font-bold text-green-600">
                          ${model.cost_per_1m_output_tokens}/1M
                        </div>
                      </div>
                    </div>

                    {/* Capacidades */}
                    <div className="flex gap-2 mb-4">
                      {model.supports_file_api && (
                        <Chip size="sm" variant="flat" color="primary">
                          <Icon name="File" size={12} className="mr-1" />
                          Files
                        </Chip>
                      )}
                      {model.supports_streaming && (
                        <Chip size="sm" variant="flat" color="secondary">
                          <Icon name="Zap" size={12} className="mr-1" />
                          Streaming
                        </Chip>
                      )}
                    </div>

                    {/* Botón para establecer como default */}
                    {!model.is_default && (
                      <Button
                        isAdmin
                        variant="secondary"
                        onClick={() => handleSetDefault(model)}
                        className="w-full"
                        size="sm"
                        disabled={isSyncing}
                      >
                        <Icon name="Star" size={16} />
                        Establecer como predeterminado
                      </Button>
                    )}
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </div>
      </Col>

      {/* Modal para agregar API Key */}
      <Modal
        isOpen={isApiKeyModalOpen}
        onClose={() => {
          setIsApiKeyModalOpen(false);
          setApiKey("");
          setApiKeyName("");
        }}
        title="Agregar API Key de Gemini"
        size="md"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              isAdmin
              onClick={() => {
                setIsApiKeyModalOpen(false);
                setApiKey("");
                setApiKeyName("");
              }}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              isAdmin
              onClick={handleSaveApiKey}
              variant="primary"
              disabled={!apiKey.trim()}
            >
              Guardar y Verificar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Text isAdmin={true} variant="label" color="#4B5563">
              Nombre de la key
            </Text>
            <Input
              type="text"
              value={apiKeyName}
              onChange={(e) => setApiKeyName(e.target.value)}
              placeholder="Ej: Cuenta principal, Free tier backup..."
              className="mt-2"
              classNames={{
                inputWrapper: "!border-[#D4DEED] !rounded-[12px]",
                input: "!text-[#265197]",
              }}
            />
          </div>

          <div>
            <Text isAdmin={true} variant="label" color="#4B5563">
              API Key de Google Gemini
            </Text>
            <Input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="mt-2"
              classNames={{
                inputWrapper: "!border-[#D4DEED] !rounded-[12px]",
                input: "!text-[#265197]",
              }}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} color="#2563eb" className="mt-0.5" />
              <div className="text-xs text-blue-800">
                <strong>¿Dónde obtener tu API Key?</strong>
                <ol className="mt-2 space-y-1 ml-4 list-decimal">
                  <li>Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                  <li>Inicia sesión con tu cuenta de Google</li>
                  <li>Haz click en "Get API Key"</li>
                  <li>Copia la clave y pégala aquí</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" size={16} color="#d97706" className="mt-0.5" />
              <div className="text-xs text-amber-800">
                Al guardar, el sistema verificará la API key y sincronizará automáticamente
                los modelos disponibles. Este proceso puede tardar unos segundos.
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Progreso de Sincronización */}
      {syncProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <Icon name="Loader2" size={48} color="#265197" className="animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#16305A] mb-2">
                {syncProgress.step}
              </h3>
              {syncProgress.total !== undefined && syncProgress.current !== undefined && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {syncProgress.current} de {syncProgress.total} modelos procesados
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-4">
                Este proceso puede tardar unos segundos...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para bloquear interfaz durante sincronización */}
      {isSyncing && !syncProgress && (
        <div className="fixed inset-0 bg-transparent z-40"></div>
      )}

      {/* Modal: Ver Todos los Modelos Disponibles */}
      <Modal
        isOpen={showAllModels}
        onClose={() => setShowAllModels(false)}
        title="Todos los Modelos Disponibles en tu API Key"
        size="lg"
      >
        <div className="max-h-96 overflow-y-auto">
          {allAvailableModels.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} color="#265197" className="animate-spin mx-auto mb-2" />
              <Text isAdmin={true} variant="body" color="#265197">Cargando modelos...</Text>
            </div>
          ) : (
            <div className="space-y-2">
              {allAvailableModels.map((model, index) => (
                <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="font-mono text-sm font-bold text-blue-600 mb-1">
                    {model.model_id}
                  </div>
                  <div className="text-xs text-gray-700 mb-1">
                    {model.display_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {model.description || "Sin descripción"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Input: {model.input_limit?.toLocaleString() || 'N/A'} | Output: {model.output_limit?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <Text isAdmin={true} variant="label" color="#2563eb">
            💡 Total de modelos generativos: {allAvailableModels.length}
          </Text>
          <p className="text-xs text-blue-700 mt-1">
            Estos son TODOS los modelos que devuelve Google con tu API Key. Si encuentras algún modelo que quieres usar y no aparece en la lista de sincronización, avísame para agregarlo.
          </p>
        </div>
      </Modal>
    </Container>
  );
}
