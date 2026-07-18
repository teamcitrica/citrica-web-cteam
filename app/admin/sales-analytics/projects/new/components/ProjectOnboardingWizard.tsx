"use client";

// =============================================
// Component: ProjectOnboardingWizard
// Wizard de 5 pasos: Info → Conexión → Setup SQL (condicional) →
// Horario + Modelo → Resumen. Al crear: verifica la conexión.
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { addToast } from '@heroui/toast';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useSalesProjects } from '@/hooks/sales-analytics/use-sales-projects';
import type {
  CreateProjectRequest,
  DetectSchemaResponse,
  ReportFrequency,
} from '@/types/sales-analytics';

interface ProjectOnboardingWizardProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  totalSteps: number;
}

interface AiModelOption {
  id: string;
  model_id: string;
  display_name: string;
  is_default: boolean;
}

export function ProjectOnboardingWizard({
  currentStep,
  onStepChange,
  totalSteps,
}: ProjectOnboardingWizardProps) {
  const router = useRouter();
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
    timezone: 'America/Lima',
    ai_model: '',
  });

  const [detectionResult, setDetectionResult] = useState<DetectSchemaResponse | null>(null);
  const [setupScript, setSetupScript] = useState<string>('');
  const [setupInstructions, setSetupInstructions] = useState<string[]>([]);

  // Loading states
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Modelos del sistema principal (ai_model_config, probados y usables)
  const [aiModels, setAiModels] = useState<AiModelOption[]>([]);

  useEffect(() => {
    const loadAiModels = async () => {
      try {
        const response = await fetch('/api/ai/models?active_only=true');
        const data = await response.json();
        if (data.models) {
          setAiModels(data.models);
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

  const runDetection = async (): Promise<DetectSchemaResponse | null> => {
    setIsDetecting(true);
    try {
      const result = await detectSchema(
        formData.supabase_url!,
        formData.supabase_anon_key!
      );
      setDetectionResult(result);
      return result;
    } catch (error: any) {
      addToast({
        title: 'Error detectando la base',
        description: error.message,
        color: 'danger',
      });
      return null;
    } finally {
      setIsDetecting(false);
    }
  };

  const loadSetupScript = async () => {
    setIsLoadingScript(true);
    try {
      const result = await generateSetupScript();
      setSetupScript(result.script);
      setSetupInstructions(result.instructions);
    } catch (error: any) {
      addToast({
        title: 'Error generando script',
        description: error.message,
        color: 'danger',
      });
    } finally {
      setIsLoadingScript(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.name?.trim()) {
        addToast({ title: 'El nombre del proyecto es requerido', color: 'warning' });
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.supabase_url?.trim() || !formData.supabase_anon_key?.trim()) {
        addToast({ title: 'URL y Anon Key de Supabase son requeridos', color: 'warning' });
        return;
      }

      const result = await runDetection();
      if (!result) return;

      if (result.ready) {
        // Sistema ya instalado en la base externa: saltar el paso de setup
        onStepChange(4);
      } else {
        // Requiere ejecutar el script: cargarlo y mostrar paso 3
        await loadSetupScript();
        onStepChange(3);
      }
      return;
    }

    if (currentStep === 3) {
      // Re-verificar que el script ya fue ejecutado en la base externa
      const result = await runDetection();
      if (!result) return;

      if (!result.ready) {
        addToast({
          title: 'La base aún no está lista',
          description: 'Ejecuta el script SQL en el Supabase del proyecto y vuelve a intentar',
          color: 'warning',
        });
        return;
      }
      onStepChange(4);
      return;
    }

    onStepChange(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(setupScript);
      addToast({ title: 'Script copiado al portapapeles', color: 'success' });
    } catch {
      addToast({ title: 'No se pudo copiar', color: 'danger' });
    }
  };

  const handleSubmit = async () => {
    setIsFinishing(true);
    try {
      const result = await createProject(formData as CreateProjectRequest);

      // Verificar conexión de inmediato: esto marca connected y habilita reportes
      try {
        const verification = await verifySetup(result.projectId);
        addToast({
          title: verification.success ? '✅ Proyecto creado y conectado' : 'Proyecto creado',
          description: verification.success
            ? verification.message
            : `La verificación falló: ${verification.error}. Usa "Verificar conexión" en el proyecto.`,
          color: verification.success ? 'success' : 'warning',
        });
      } catch (verifyError: any) {
        addToast({
          title: 'Proyecto creado',
          description: `No se pudo verificar la conexión: ${verifyError.message}`,
          color: 'warning',
        });
      }

      router.push(`/admin/sales-analytics/projects/${result.projectId}`);
    } catch (error: any) {
      addToast({
        title: 'Error creando proyecto',
        description: error.message,
        color: 'danger',
      });
    } finally {
      setIsFinishing(false);
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
            <h2 className="text-xl font-semibold mb-4">Instalar Sistema de Analytics</h2>

            {detectionResult && (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm font-medium text-yellow-800">
                    {detectionResult.message}
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600">
              Ejecuta este script en el <strong>SQL Editor del Supabase del proyecto</strong>.
              Crea la tabla <code>sales_analytics</code>, los RPCs de extracción, un trigger
              para ventas nuevas y el backfill del histórico.
            </p>

            {isLoadingScript ? (
              <div className="flex items-center gap-2 text-gray-600 text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Generando script...
              </div>
            ) : setupScript ? (
              <>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-auto max-h-64">
                    {setupScript}
                  </pre>
                  <Button
                    size="sm"
                    className="absolute top-2 right-2"
                    startContent={<Copy className="w-3 h-3" />}
                    onPress={handleCopyScript}
                  >
                    Copiar
                  </Button>
                </div>

                {setupInstructions.length > 0 && (
                  <ol className="text-sm text-gray-700 list-decimal ml-5 space-y-1">
                    {setupInstructions.map((inst, i) => (
                      <li key={i}>{inst.replace(/^\d+\.\s*/, '')}</li>
                    ))}
                  </ol>
                )}
              </>
            ) : (
              <Button
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={loadSetupScript}
              >
                Generar Script SQL
              </Button>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Cuando lo hayas ejecutado, presiona <strong>Siguiente</strong> — el sistema
                volverá a verificar la base antes de continuar.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Configuración de Reportes
            </h2>

            {detectionResult?.ready && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">Base de datos verificada y lista</p>
              </div>
            )}

            <Select
              label="Modelo de IA"
              selectedKeys={formData.ai_model ? [formData.ai_model] : []}
              onChange={(e) =>
                setFormData({ ...formData, ai_model: e.target.value })
              }
              variant="faded"
              description="Vacío = usa el modelo default del sistema (Admin > IA > Configuración)"
            >
              {aiModels.map((model) => (
                <SelectItem key={model.model_id} textValue={model.display_name}>
                  {model.display_name} {model.is_default ? '(default)' : ''}
                </SelectItem>
              ))}
            </Select>

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
              <SelectItem key="weekly" textValue="Semanal">
                Semanal (recomendado)
              </SelectItem>
              <SelectItem key="daily" textValue="Diario">
                Diario
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
                <SelectItem key="monday" textValue="Lunes">Lunes</SelectItem>
                <SelectItem key="tuesday" textValue="Martes">Martes</SelectItem>
                <SelectItem key="wednesday" textValue="Miércoles">Miércoles</SelectItem>
                <SelectItem key="thursday" textValue="Jueves">Jueves</SelectItem>
                <SelectItem key="friday" textValue="Viernes">Viernes</SelectItem>
                <SelectItem key="saturday" textValue="Sábado">Sábado</SelectItem>
                <SelectItem key="sunday" textValue="Domingo">Domingo</SelectItem>
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
              <SelectItem key="America/Lima" textValue="America/Lima (PET)">
                America/Lima (PET)
              </SelectItem>
              <SelectItem key="America/Caracas" textValue="America/Caracas (VET)">
                America/Caracas (VET)
              </SelectItem>
              <SelectItem key="America/New_York" textValue="America/New_York (EST)">
                America/New_York (EST)
              </SelectItem>
              <SelectItem key="UTC" textValue="UTC">
                UTC
              </SelectItem>
            </Select>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Proyecto:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base externa:</span>
                <span className="font-medium">{formData.supabase_url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado de la base:</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color={detectionResult?.ready ? 'success' : 'warning'}
                >
                  {detectionResult?.ready ? 'Verificada' : 'Pendiente de verificar'}
                </Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frecuencia:</span>
                <span className="font-medium">
                  {formData.report_frequency}
                  {formData.report_frequency === 'weekly' ? ` (${formData.report_day})` : ''}
                  {' a las '}{formData.report_time} ({formData.timezone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modelo IA:</span>
                <span className="font-medium">{formData.ai_model || 'Default del sistema'}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Al crear el proyecto se verificará la conexión con la base externa y quedará
                programado el reporte automático. También podrás generar reportes manuales
                cuando quieras.
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

  const busy = isDetecting || isCreating || isFinishing || isLoadingScript;

  return (
    <div>
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button
          variant="flat"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onPress={handleBack}
          isDisabled={currentStep === 1 || busy}
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
            isDisabled={busy}
          >
            {isDetecting ? 'Verificando base...' : 'Siguiente'}
          </Button>
        ) : (
          <Button
            color="success"
            endContent={
              isFinishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )
            }
            onPress={handleSubmit}
            isDisabled={busy}
          >
            {isFinishing ? 'Creando y verificando...' : 'Crear Proyecto'}
          </Button>
        )}
      </div>
    </div>
  );
}
