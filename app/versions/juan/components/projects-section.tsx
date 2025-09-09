'use client'
import React from 'react';
import { Container, Col } from '@citrica/objects';
import Text from '@ui/atoms/text';

const ProjectsSection = () => {
  const projects = [
    {
      title: "E-commerce Premium",
      description: "Plataforma de comercio electrónico con diseño moderno y funcionalidades avanzadas",
      category: "E-commerce",
      tech: ["React", "Node.js", "MongoDB"],
      color: "#E1FF00"
    },
    {
      title: "App de Gestión Empresarial",
      description: "Sistema integral para la administración y seguimiento de procesos empresariales",
      category: "Web App",
      tech: ["Vue.js", "Laravel", "MySQL"],
      color: "#00FFFF"
    },
    {
      title: "Portal Educativo",
      description: "Plataforma educativa interactiva con sistema de cursos y evaluaciones en línea",
      category: "Educación",
      tech: ["Next.js", "Python", "PostgreSQL"],
      color: "#FF5B00"
    },
    {
      title: "Fintech Dashboard",
      description: "Panel de control para gestión financiera con análisis de datos en tiempo real",
      category: "Fintech",
      tech: ["Angular", ".NET", "Azure"],
      color: "#E1FF00"
    },
    {
      title: "Marketplace Digital",
      description: "Mercado digital multivendendor con sistema de pagos y logística integrada",
      category: "Marketplace",
      tech: ["React", "Django", "Redis"],
      color: "#00FFFF"
    },
    {
      title: "App de Salud",
      description: "Aplicación móvil para seguimiento de salud y telemedicina",
      category: "Healthcare",
      tech: ["React Native", "Firebase", "ML"],
      color: "#FF5B00"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden"
             style={{ backgroundColor: '#E5FFFF' }}>
      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-60 h-60 rounded-full" 
             style={{ backgroundColor: '#16141F', filter: 'blur(80px)' }}></div>
        <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full" 
             style={{ backgroundColor: '#FF5B00', filter: 'blur(60px)' }}></div>
      </div>

      <Container className="relative z-10">
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
          <Text variant="headline" color="#16141F" className="mb-6 leading-tight">
            Nuestros <span style={{ color: '#FF5B00' }}>Últimos Proyectos</span>
          </Text>
          <div className="max-w-3xl mx-auto">
            <Text variant="body" color="#16141F" className="opacity-80 leading-relaxed">
              Cada proyecto es único y refleja nuestro compromiso con la excelencia. Descubre cómo hemos ayudado a diferentes empresas a alcanzar sus objetivos digitales.
            </Text>
          </div>
        </Col>

        <Container>
          {projects.map((project, index) => (
            <Col key={index} cols={{ lg: 4, md: 3, sm: 4 }} className="mb-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group border border-white/30">
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-90 transition-opacity duration-300"
                       style={{ 
                         backgroundImage: `linear-gradient(135deg, ${project.color}20, ${project.color}40)` 
                       }}>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                      💼
                    </div>
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold"
                       style={{ 
                         backgroundColor: project.color,
                         color: '#16141F'
                       }}>
                    {project.category}
                  </div>
                </div>

                <div className="p-6">
                  <Text variant="title" color="#16141F" className="mb-3 group-hover:color-primary transition-colors duration-300">
                    {project.title}
                  </Text>
                  
                  <Text variant="body" color="#16141F" className="mb-4 opacity-80 leading-relaxed">
                    {project.description}
                  </Text>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, techIndex) => (
                      <span key={techIndex} 
                            className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action button */}
                  <button className="w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border-2 hover:shadow-lg"
                          style={{
                            borderColor: project.color,
                            color: project.color,
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = project.color;
                            e.currentTarget.style.color = '#16141F';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = project.color;
                          }}>
                    Ver Detalles
                  </button>
                </div>
              </div>
            </Col>
          ))}
        </Container>

        {/* CTA Section */}
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <Text variant="title" color="#16141F" className="mb-4">
              ¿Tienes un proyecto en mente?
            </Text>
            <Text variant="body" color="#16141F" className="mb-6 opacity-80">
              Conversemos sobre cómo podemos hacer realidad tu visión digital
            </Text>
            <button className="px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    style={{ 
                      backgroundColor: '#FF5B00',
                      color: '#16141F',
                      boxShadow: '0 10px 30px rgba(255, 91, 0, 0.3)'
                    }}>
              Iniciar Conversación
            </button>
          </div>
        </Col>
      </Container>
    </section>
  );
};

export default ProjectsSection;