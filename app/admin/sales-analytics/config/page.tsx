"use client";

// =============================================
// Page: /admin/sales-analytics/config
// La configuración de API keys y modelos vive en el sistema principal
// (/admin/ia/config). Esta página solo orienta hacia allá.
// =============================================

import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { ArrowLeft, Key, Sparkles, ArrowRight } from 'lucide-react';

export default function SalesAnalyticsConfigPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="light"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onPress={() => router.push('/admin/sales-analytics/projects')}
          className="mb-4"
        >
          Volver a Proyectos
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración de Sales Analytics
        </h1>
        <p className="text-gray-600 mb-6">
          Las API keys de Gemini y los modelos de IA se administran en un solo
          lugar para todo el sistema (RAG y Sales Analytics).
        </p>

        <Card
          isPressable
          onPress={() => router.push('/admin/ia/config')}
          className="hover:shadow-lg transition-shadow"
        >
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    API Keys y Modelos de IA
                  </h3>
                  <p className="text-sm text-gray-600">
                    Agregar keys de Gemini, verificarlas, elegir cuál está en uso
                    y sincronizar los modelos disponibles
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="mt-4">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Modelo por proyecto
                </h3>
                <p className="text-sm text-gray-600">
                  Cada proyecto de ventas puede elegir su modelo en el wizard de
                  creación. Si no se elige, usa el modelo default del sistema.
                  Los prompts de análisis se editan en la configuración de cada
                  proyecto.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
