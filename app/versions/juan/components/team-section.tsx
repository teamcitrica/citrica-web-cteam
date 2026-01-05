import React from 'react';
import { Container, Col } from '@citrica/objects';
import { Text } from 'citrica-ui-toolkit';

const TeamSection = () => {
  const expertiseAreas = [
    {
      phase: "Investigación & Estrategia",
      description: "Análisis de mercado, definición de objetivos y estrategia digital",
      skills: ["Research UX", "Análisis Competitivo", "Estrategia Digital"],
      color: "#E1FF00"
    },
    {
      phase: "Diseño & Experiencia",
      description: "Creación de interfaces intuitivas y experiencias memorables",
      skills: ["UI/UX Design", "Prototipado", "Design System"],
      color: "#00FFFF"
    },
    {
      phase: "Desarrollo & Tecnología",
      description: "Implementación robusta con las últimas tecnologías",
      skills: ["Frontend", "Backend", "DevOps"],
      color: "#FF5B00"
    },
    {
      phase: "Optimización & Crecimiento",
      description: "Mejora continua y escalabilidad de productos digitales",
      skills: ["Performance", "SEO", "Analytics"],
      color: "#E1FF00"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden"
             style={{ backgroundColor: '#16141F' }}>
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-20 w-40 h-40 rounded-full" 
             style={{ backgroundColor: '#E1FF00', filter: 'blur(60px)' }}></div>
        <div className="absolute bottom-20 right-10 w-52 h-52 rounded-full" 
             style={{ backgroundColor: '#00FFFF', filter: 'blur(70px)' }}></div>
      </div>

      <Container className="relative z-10">
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
          <Text variant="headline" textColor="color-text-white" className="mb-6 leading-tight">
            <span style={{ color: '#FF5B00' }}>Expertos</span> en cada fase del desarrollo digital
          </Text>
          <div className="max-w-4xl mx-auto">
            <Text variant="body" textColor="color-text-white" className="opacity-90 leading-relaxed">
              Contamos con un equipo de profesionales altamente capacitados que dominan cada etapa del proceso de creación de productos digitales. Desde el diseño hasta el despliegue, nuestros expertos combinan habilidades técnicas y creatividad para transformar tus ideas en realidades digitales excepcionales.
            </Text>
          </div>
        </Col>

        <Container>
          {expertiseAreas.map((area, index) => (
            <Col key={index} cols={{ lg: 6, md: 3, sm: 4 }} className="mb-8">
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105 group">
                {/* Indicador de color */}
                <div className="w-12 h-1 rounded-full mb-6 group-hover:w-16 transition-all duration-300"
                     style={{ backgroundColor: area.color }}></div>
                
                <Text variant="title" textColor="color-text-white" className="mb-4">
                  {area.phase}
                </Text>
                
                <Text variant="body" textColor="color-text-white" className="mb-6 opacity-80 leading-relaxed">
                  {area.description}
                </Text>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-2">
                  {area.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} 
                          className="px-3 py-1 rounded-full text-sm font-medium border transition-all duration-300 hover:scale-105"
                          style={{ 
                            borderColor: area.color,
                            color: area.color,
                            backgroundColor: `${area.color}10`
                          }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Col>
          ))}
        </Container>

        {/* Stats section */}
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className="mt-20">
          <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent p-8 rounded-2xl">
            <Container>
              <Col cols={{ lg: 3, md: 3, sm: 2 }} className="text-center mb-8">
                <Text variant="display" color='#E1FF00' className="mb-2">
                  50+
                </Text>
                <Text variant="body" textColor="color-text-white" className="opacity-80">
                  Proyectos Completados
                </Text>
              </Col>
              <Col cols={{ lg: 3, md: 3, sm: 2 }} className="text-center mb-8">
                <Text variant="display" color='#00FFFF' className="mb-2">
                  5+
                </Text>
                <Text variant="body" textColor="color-text-white" className="opacity-80">
                  Años de Experiencia
                </Text>
              </Col>
              <Col cols={{ lg: 3, md: 3, sm: 2 }} className="text-center mb-8">
                <Text variant="display" color='#FF5B00' className="mb-2">
                  98%
                </Text>
                <Text variant="body" textColor="color-text-white" className="opacity-80">
                  Satisfacción del Cliente
                </Text>
              </Col>
              <Col cols={{ lg: 3, md: 3, sm: 2 }} className="text-center mb-8">
                <Text variant="display" color='#E1FF00' className="mb-2">
                  24/7
                </Text>
                <Text variant="body" textColor="color-text-white" className="opacity-80">
                  Soporte Técnico
                </Text>
              </Col>
            </Container>
          </div>
        </Col>
      </Container>
    </section>
  );
};

export default TeamSection;