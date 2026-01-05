import React from 'react';
import { Container, Col } from '@citrica/objects';
import { Text } from 'citrica-ui-toolkit';

const ProcessSection = () => {
  const processSteps = [
    {
      step: "01",
      title: "Planificación",
      description: "Análisis de viabilidad, definición de requisitos, estimación de costos y tiempos",
      tasks: ["Análisis de viabilidad", "Definición de requisitos", "Estimación de costos y tiempos"],
      color: "#E1FF00",
      icon: "📋"
    },
    {
      step: "02",
      title: "Diseño",
      description: "Arquitectura del software, diseño de la interfaz de usuario y diseño de la base de datos",
      tasks: ["Arquitectura del software", "Diseño de la interfaz de usuario", "Diseño de la base de datos"],
      color: "#00FFFF",
      icon: "🎨"
    },
    {
      step: "03",
      title: "Desarrollo",
      description: "Codificación limpia y eficiente con pruebas unitarias continuas",
      tasks: ["Codificación", "Pruebas unitarias"],
      color: "#FF5B00",
      icon: "💻"
    },
    {
      step: "04",
      title: "Pruebas",
      description: "Pruebas exhaustivas de integración, sistema y experiencia de usuario",
      tasks: ["Pruebas de integración", "Pruebas de sistema", "Pruebas de usuario"],
      color: "#E1FF00",
      icon: "🔍"
    },
    {
      step: "05",
      title: "Implementación",
      description: "Despliegue profesional, migración de datos y capacitación de usuarios",
      tasks: ["Despliegue", "Migración de datos", "Capacitación de usuarios"],
      color: "#00FFFF",
      icon: "🚀"
    },
    {
      step: "06",
      title: "Mantenimiento",
      description: "Corrección de errores y mejoras continuas para optimizar el rendimiento",
      tasks: ["Corrección de errores", "Mejoras"],
      color: "#FF5B00",
      icon: "🛠️"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden"
             style={{ backgroundColor: '#16141F' }}>
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-32 right-20 w-80 h-80 rounded-full" 
             style={{ backgroundColor: '#E1FF00', filter: 'blur(120px)' }}></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full" 
             style={{ backgroundColor: '#00FFFF', filter: 'blur(100px)' }}></div>
      </div>

      <Container className="relative z-10">
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-20">
          <Text variant="headline" textColor="color-text-white" className="mb-6 leading-tight">
            Nuestro <span style={{ color: '#FF5B00' }}>Proceso</span> de Desarrollo
          </Text>
          <div className="max-w-4xl mx-auto">
            <Text variant="body" textColor="color-text-white" className="opacity-90 leading-relaxed">
              Seguimos un proceso de desarrollo estructurado y eficiente, desde la planificación inicial hasta el mantenimiento continuo, para garantizar que tus productos digitales sean de la más alta calidad.
            </Text>
          </div>
        </Col>

        {/* Process Steps */}
        <div className="relative">
          {/* Línea conectora vertical para móvil y tablet */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent only-sm only-md"></div>
          
          {/* Línea conectora horizontal para desktop */}
          <div className="absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent only-lg"></div>

          <Container>
            {processSteps.map((process, index) => (
              <Col key={index} cols={{ lg: 2, md: 3, sm: 4 }} className="mb-16 relative">
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 h-full border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 group relative">
                  
                  {/* Step number circle */}
                  <div className="absolute -top-4 left-6 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg z-10 border-4 border-white/20 group-hover:border-white/40 transition-all duration-300"
                       style={{ 
                         backgroundColor: process.color,
                         color: '#16141F'
                       }}>
                    {process.step}
                  </div>

                  {/* Icon */}
                  <div className="text-4xl mb-4 mt-8 text-center">{process.icon}</div>
                  
                  {/* Title */}
                  <Text variant="title" textColor="color-text-white" className="mb-4 text-center">
                    {process.title}
                  </Text>
                  
                  {/* Description */}
                  <Text variant="body" textColor="color-text-white" className="mb-6 opacity-80 leading-relaxed text-center">
                    {process.description}
                  </Text>

                  {/* Tasks list */}
                  <div className="space-y-3">
                    {process.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                             style={{ backgroundColor: process.color }}></div>
                        <Text variant="label" textColor="color-text-white" className="opacity-70 leading-relaxed">
                          {task}
                        </Text>
                      </div>
                    ))}
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                       style={{ 
                         background: `linear-gradient(135deg, ${process.color}05, ${process.color}10)` 
                       }}></div>
                </div>

                {/* Connection dots for desktop */}
                {index < processSteps.length - 1 && (
                  <div className="absolute top-16 -right-4 w-8 h-8 rounded-full border-4 border-white/20 bg-white/5 only-lg z-20"></div>
                )}
              </Col>
            ))}
          </Container>
        </div>

        {/* Bottom CTA */}
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mt-20">
          <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <Text variant="title" textColor="color-text-white" className="mb-4">
              ¿Listo para comenzar tu proyecto?
            </Text>
            <Text variant="body" textColor="color-text-white" className="mb-8 opacity-80">
              Nuestro proceso garantiza resultados excepcionales en cada etapa
            </Text>
            <div className="flex flex-wrap gap-6 justify-center">
              <button className="px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                      style={{ 
                        backgroundColor: '#E1FF00',
                        color: '#16141F',
                        boxShadow: '0 10px 30px rgba(225, 255, 0, 0.3)'
                      }}>
                Solicitar Cotización
              </button>
              
              <button className="px-8 py-4 rounded-full border-2 font-semibold transition-all duration-300 transform hover:scale-105"
                      style={{ 
                        borderColor: '#00FFFF',
                        color: '#00FFFF',
                        backgroundColor: 'transparent'
                      }}>
                Agendar Consulta
              </button>
            </div>
          </div>
        </Col>
      </Container>
    </section>
  );
};

export default ProcessSection;