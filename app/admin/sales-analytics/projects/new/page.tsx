"use client";

// =============================================
// Page: /sales-analytics/projects/new
// Wizard de onboarding de proyectos
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { ArrowLeft } from 'lucide-react';
import { ProjectOnboardingWizard } from './components/ProjectOnboardingWizard';

export default function NewSalesAnalyticsProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 6;

  const steps = [
    'Información Básica',
    'Conexión Supabase',
    'Auto-Detección',
    'Configuración',
    'Reportes',
    'Destinatarios',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={() => router.back()}
            className="mb-4"
          >
            Volver
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">
            Nuevo Proyecto de Sales Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Conecta un restaurante para generar análisis automáticos de ventas con IA
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Paso {currentStep} de {totalSteps}: {steps[currentStep - 1]}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps indicator */}
            <div className="flex justify-between mt-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center ${
                    index + 1 <= currentStep
                      ? 'text-primary'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                      index + 1 < currentStep
                        ? 'bg-primary text-white'
                        : index + 1 === currentStep
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1 < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="text-xs text-center max-w-[80px] hidden md:block">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Wizard */}
        <Card>
          <CardBody className="p-6">
            <ProjectOnboardingWizard
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              totalSteps={totalSteps}
            />
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
