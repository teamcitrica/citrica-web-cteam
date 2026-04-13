"use client";

// =============================================
// Component: ProjectOnboardingWizard
// Wizard completo de 6 pasos
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSalesProjects } from '@/hooks/sales-analytics/use-sales-projects';
import { useSupabase } from '@/shared/context/supabase-context';
import type {
  CreateProjectRequest,
  DetectSchemaResponse,
  ReportFrequency,
  WhatsAppRole,
  ColumnMapping,
} from '@/types/sales-analytics';

interface ProjectOnboardingWizardProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  totalSteps: number;
}

export function ProjectOnboardingWizard({
  currentStep,
  onStepChange,
  totalSteps,
}: ProjectOnboardingWizardProps) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const {
    createProject,
    detectSchema,
    generateSetupScript,
    verifySetup,
    isCreating,
  } = useSalesProjects();

  // =============================================
  // Form State
  // =============================================

  const [formData, setFormData] = useState<Partial<CreateProjectRequest>>({
    name: '',
    description: '',
    supabase_url: '',
    supabase_anon_key: '',
    report_frequency: 'weekly',
    report_day: 'monday',
    report_time: '09:00',
    timezone: 'UTC',
    ai_model_id: '',
    use_custom_api_key: false,
    custom_api_key: '',
    whatsapp_recipients: [],
  });

  const [detectionResult, setDetectionResult] = useState<DetectSchemaResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    created_at: 'created_at',
    total: 'total',
    customer_name: 'customer_name',
    order_type: 'order_type',
    payment_status: 'payment_status_id',
  });
  const [setupScript, setSetupScript] = useState<string>('');
  const [setupInstructions, setSetupInstructions] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string>('');

  // Loading states
  const [isDetecting, setIsDetecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [setupVerified, setSetupVerified] = useState(false);

  // AI Models
  const [aiModels, setAiModels] = useState<Array<{ id: string; model_name: string; is_active: boolean }>>([]);

  // =============================================
  // Load AI Models
  // =============================================

  useEffect(() => {
    const loadAiModels = async () => {
      try {
        const { data, error } = await supabase
          .from('sales_model_config')
          .select('id, model_name, is_active')
          .eq('is_active', true)
          .order('model_name');

        if (!error && data) {
          setAiModels(data);
          // Si hay modelos, seleccionar el primero por defecto
          if (data.length > 0 && !formData.ai_model_id) {
            setFormData({ ...formData, ai_model_id: data[0].id });
          }
        }
      } catch (error) {
        console.error('Error cargando modelos de IA:', error);
      }
    };

    loadAiModels();
  }, []);

  // =============================================
  // Handlers
  // =============================================

  const handleNext = async () => {
    // Validaciones por paso
    if (currentStep === 1) {
      if (!formData.name?.trim()) {
        alert('El nombre del proyecto es requerido');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.supabase_url?.trim() || !formData.supabase_anon_key?.trim()) {
        alert('URL y Anon Key de Supabase son requeridos');
        return;
      }

      // Auto-detección
      setIsDetecting(true);
      try {
        const result = await detectSchema(
          formData.supabase_url,
          formData.supabase_anon_key
        );
        setDetectionResult(result);

        if (result.strategy === 'rpc' && result.ready) {
          // Sistema compatible, saltar al paso 4
          onStepChange(4);
        } else if (result.strategy === 'direct_query') {
          // Requiere mapeo
          onStepChange(3);
        } else {
          // Requiere script
          onStepChange(3);
        }
      } catch (error: any) {
        alert(`Error detectando schema: ${error.message}`);
      } finally {
        setIsDetecting(false);
      }
      return;
    }

    if (currentStep === 3) {
      // Generar script o validar mapeo
      if (detectionResult?.strategy === 'custom_query') {
        // Generar script (requiere crear proyecto primero)
        console.log('Generando script de setup...');
        // Por ahora, avanzar al siguiente paso
      }
    }

    if (currentStep === 4) {
      if (!formData.ai_model_id) {
        alert('Selecciona un modelo de IA');
        return;
      }
    }

    if (currentStep === 5) {
      // Validar al menos un destinatario
      if (!formData.whatsapp_recipients || formData.whatsapp_recipients.length === 0) {
        alert('Agrega al menos un destinatario de WhatsApp');
        return;
      }
    }

    onStepChange(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await createProject(formData as CreateProjectRequest);
      alert('Proyecto creado exitosamente');

      // Redirigir al dashboard del proyecto
      router.push(`/admin/sales-analytics/projects/${result.projectId}`);
    } catch (error: any) {
      alert(`Error creando proyecto: ${error.message}`);
    }
  };

  // =============================================
  // Render Steps
  // =============================================

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>

            <Input
              label="Nombre del Proyecto"
              placeholder="Ej: Delix Cafe"
              value={formData.name}
              onValueChange={(value) =>
                setFormData({ ...formData, name: value })
              }
              isRequired
              variant="faded"
            />

            <Textarea
              label="Descripción (Opcional)"
              placeholder="Describe el restaurante..."
              value={formData.description}
              onValueChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              variant="faded"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Conexión a Supabase</h2>

            <Input
              label="URL de Supabase"
              placeholder="https://abc123.supabase.co"
              value={formData.supabase_url}
              onValueChange={(value) =>
                setFormData({ ...formData, supabase_url: value })
              }
              isRequired
              variant="faded"
            />

            <Input
              label="Anon Key"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={formData.supabase_anon_key}
              onValueChange={(value) =>
                setFormData({ ...formData, supabase_anon_key: value })
              }
              isRequired
              variant="faded"
              type="password"
            />

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Dónde encontrar estas credenciales:</strong>
                <br />
                1. Ve al dashboard de Supabase del restaurante
                <br />
                2. Settings → API
                <br />
                3. Copia "Project URL" y "anon public"
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Resultado de Detección</h2>

            {detectionResult && (
              <>
                <div
                  className={`p-4 rounded-lg ${
                    detectionResult.ready
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {detectionResult.ready ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          detectionResult.ready
                            ? 'text-green-800'
                            : 'text-yellow-800'
                        }`}
                      >
                        {detectionResult.message}
                      </p>
                      <div className="mt-2 space-y-1">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={detectionResult.ready ? 'success' : 'warning'}
                        >
                          Estrategia: {detectionResult.strategy}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </div>

                {detectionResult.strategy === 'direct_query' &&
                  detectionResult.available_columns && (
                    <div className="space-y-3">
                      <h3 className="font-medium">Mapeo de Columnas</h3>
                      <p className="text-sm text-gray-600">
                        Relaciona las columnas detectadas con los campos requeridos:
                      </p>

                      {Object.keys(columnMapping).map((field) => (
                        <Select
                          key={field}
                          label={field}
                          selectedKeys={[columnMapping[field as keyof ColumnMapping]]}
                          onChange={(e) =>
                            setColumnMapping({
                              ...columnMapping,
                              [field]: e.target.value,
                            })
                          }
                          variant="faded"
                        >
                          {detectionResult.available_columns!.map((col) => (
                            <SelectItem key={col} textValue={col}>
                              {col}
                            </SelectItem>
                          ))}
                        </Select>
                      ))}
                    </div>
                  )}

                {detectionResult.strategy === 'custom_query' &&
                  detectionResult.requires_script && (
                    <div className="space-y-3">
                      <h3 className="font-medium">Script SQL Requerido</h3>
                      <p className="text-sm text-gray-600">
                        Se generará un script SQL que debes ejecutar en el Supabase
                        del restaurante.
                      </p>
                      <Button
                        color="primary"
                        onPress={() => {
                          // Lógica para generar script
                          alert('Funcionalidad en desarrollo');
                        }}
                      >
                        Generar Script SQL
                      </Button>
                    </div>
                  )}
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Configuración de Reportes
            </h2>

            <Select
              label="Modelo de IA"
              selectedKeys={formData.ai_model_id ? [formData.ai_model_id] : []}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ai_model_id: e.target.value,
                })
              }
              variant="faded"
              isRequired
              description="Modelo que se usará para generar los análisis de ventas"
            >
              {aiModels.length === 0 ? (
                <SelectItem key="none" textValue="No hay modelos disponibles">
                  No hay modelos disponibles
                </SelectItem>
              ) : (
                aiModels.map((model) => (
                  <SelectItem key={model.id} textValue={model.model_name}>
                    {model.model_name}
                  </SelectItem>
                ))
              )}
            </Select>

            {aiModels.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ No hay modelos de IA activos. Ve a{' '}
                  <a
                    href="/admin/sales-analytics/config"
                    target="_blank"
                    className="underline font-medium"
                  >
                    Configuración
                  </a>{' '}
                  para activar modelos.
                </p>
              </div>
            )}

            <Select
              label="Frecuencia de Reportes"
              selectedKeys={formData.report_frequency ? [formData.report_frequency] : []}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  report_frequency: e.target.value as ReportFrequency,
                })
              }
              variant="faded"
            >
              <SelectItem key="daily" textValue="Diario">
                Diario
              </SelectItem>
              <SelectItem key="weekly" textValue="Semanal">
                Semanal
              </SelectItem>
              <SelectItem key="biweekly" textValue="Quincenal">
                Quincenal
              </SelectItem>
              <SelectItem key="monthly" textValue="Mensual">
                Mensual
              </SelectItem>
            </Select>

            {formData.report_frequency === 'weekly' && (
              <Select
                label="Día de la Semana"
                selectedKeys={formData.report_day ? [formData.report_day] : []}
                onChange={(e) =>
                  setFormData({ ...formData, report_day: e.target.value })
                }
                variant="faded"
              >
                <SelectItem key="monday" textValue="Lunes">
                  Lunes
                </SelectItem>
                <SelectItem key="tuesday" textValue="Martes">
                  Martes
                </SelectItem>
                <SelectItem key="wednesday" textValue="Miércoles">
                  Miércoles
                </SelectItem>
                <SelectItem key="thursday" textValue="Jueves">
                  Jueves
                </SelectItem>
                <SelectItem key="friday" textValue="Viernes">
                  Viernes
                </SelectItem>
                <SelectItem key="saturday" textValue="Sábado">
                  Sábado
                </SelectItem>
                <SelectItem key="sunday" textValue="Domingo">
                  Domingo
                </SelectItem>
              </Select>
            )}

            <Input
              label="Hora de Ejecución"
              type="time"
              value={formData.report_time}
              onValueChange={(value) =>
                setFormData({ ...formData, report_time: value })
              }
              variant="faded"
            />

            <Select
              label="Zona Horaria"
              selectedKeys={formData.timezone ? [formData.timezone] : []}
              onChange={(e) =>
                setFormData({ ...formData, timezone: e.target.value })
              }
              variant="faded"
            >
              <SelectItem key="UTC" textValue="UTC">
                UTC
              </SelectItem>
              <SelectItem
                key="America/Caracas"
                textValue="America/Caracas (VET)"
              >
                America/Caracas (VET)
              </SelectItem>
              <SelectItem
                key="America/New_York"
                textValue="America/New_York (EST)"
              >
                America/New_York (EST)
              </SelectItem>
            </Select>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Destinatarios de WhatsApp
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Los reportes se enviarán automáticamente a estos contactos
            </p>

            {/* Por simplicidad, mostrar UI básica */}
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600">
                Funcionalidad de gestión de destinatarios en desarrollo
              </p>
              <Button
                className="mt-4"
                onPress={() => {
                  // Agregar destinatario dummy para testing
                  setFormData({
                    ...formData,
                    whatsapp_recipients: [
                      {
                        name: 'Admin',
                        phone: '+58123456789',
                        role: 'owner' as WhatsAppRole,
                      },
                    ],
                  });
                  alert('Destinatario agregado (demo)');
                }}
              >
                Agregar Destinatario (Demo)
              </Button>
            </div>

            {formData.whatsapp_recipients &&
              formData.whatsapp_recipients.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-green-600">
                    ✓ {formData.whatsapp_recipients.length} destinatario(s)
                    configurado(s)
                  </p>
                </div>
              )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Proyecto:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estrategia:</span>
                <span className="font-medium">
                  {detectionResult?.strategy || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frecuencia:</span>
                <span className="font-medium">{formData.report_frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destinatarios:</span>
                <span className="font-medium">
                  {formData.whatsapp_recipients?.length || 0}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Al hacer clic en "Crear Proyecto", se configurará el sistema para
                generar reportes automáticos.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // =============================================
  // Render
  // =============================================

  return (
    <div>
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button
          variant="flat"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onPress={handleBack}
          isDisabled={currentStep === 1 || isDetecting || isCreating}
        >
          Atrás
        </Button>

        {currentStep < totalSteps ? (
          <Button
            color="primary"
            endContent={
              isDetecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )
            }
            onPress={handleNext}
            isDisabled={isDetecting || isCreating}
          >
            {isDetecting ? 'Detectando...' : 'Siguiente'}
          </Button>
        ) : (
          <Button
            color="success"
            endContent={
              isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )
            }
            onPress={handleSubmit}
            isDisabled={isCreating}
          >
            {isCreating ? 'Creando...' : 'Crear Proyecto'}
          </Button>
        )}
      </div>
    </div>
  );
}
