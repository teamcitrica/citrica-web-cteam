"use client";
import React from 'react';
import { Container, Col } from '@citrica/objects';
import Text from '@ui/atoms/text';
import Button from '@ui/molecules/button';
import Icon from '@ui/atoms/icon';
import Card from '@ui/atoms/card';

const CitricaLanding = () => {
  const services = [
    {
      title: "Landing Pages",
      description: "Páginas optimizadas para conversión que captan la atención de tus clientes",
      icon: "Layout"
    },
    {
      title: "Websites",
      description: "Sitios web corporativos que reflejan la profesionalidad de tu marca",
      icon: "Globe"
    },
    {
      title: "Web Apps",
      description: "Aplicaciones web robustas que potencian tu negocio",
      icon: "Monitor"
    },
    {
      title: "Mobile Apps",
      description: "Apps móviles nativas e híbridas para iOS y Android",
      icon: "Smartphone"
    }
  ];

  const technologies = [
    {
      title: "Presentaciones que inspiran",
      description: "Diseños únicos que conectan con tu audiencia",
      icon: "Presentation"
    },
    {
      title: "Front-end robusto",
      description: "Interfaces modernas, rápidas y responsivas",
      icon: "Code"
    },
    {
      title: "Desarrollo móvil eficiente",
      description: "Apps optimizadas para el mejor rendimiento",
      icon: "Zap"
    },
    {
      title: "Back-end potente",
      description: "Arquitectura escalable y segura para tus datos",
      icon: "Server"
    }
  ];

  const process = [
    { step: 1, title: "Planificación", description: "Analizamos tus necesidades y objetivos", icon: "Target" },
    { step: 2, title: "Diseño", description: "Creamos prototipos y wireframes personalizados", icon: "Palette" },
    { step: 3, title: "Desarrollo", description: "Construimos tu solución con las mejores tecnologías", icon: "Code2" },
    { step: 4, title: "Pruebas", description: "Testing exhaustivo para garantizar calidad", icon: "TestTube" },
    { step: 5, title: "Implementación", description: "Lanzamos tu proyecto al mundo", icon: "Rocket" },
    { step: 6, title: "Mantenimiento", description: "Soporte continuo y actualizaciones", icon: "Wrench" }
  ];

  const projects = [
    {
      title: "E-commerce Innovador",
      description: "Plataforma de ventas online con gestión completa de inventario",
      image: "/img/project1.jpg",
      tech: ["React", "Node.js", "MongoDB"]
    },
    {
      title: "App de Gestión Empresarial",
      description: "Sistema completo para administración de recursos humanos",
      image: "/img/project2.jpg",
      tech: ["React Native", "Firebase", "TypeScript"]
    },
    {
      title: "Portal Educativo",
      description: "Plataforma LMS con sistema de evaluaciones y certificaciones",
      image: "/img/project3.jpg",
      tech: ["Next.js", "PostgreSQL", "AWS"]
    }
  ];

  return (
    <div className="bg-[#16141F] text-white min-h-screen">
      {/* Hero Section */}
      <main>
        <section className="min-h-screen flex items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#16141F] via-[#16141F] to-[#1a1826]" />
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#E1FF00] opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#00FFFF] opacity-10 rounded-full blur-3xl" />
          
          <Container className="relative z-10">
            <Col cols={{ lg: 6, md: 6, sm: 4 }}>
              <div className="space-y-8">
                <div className="inline-block px-4 py-2 bg-[#E1FF00] bg-opacity-20 rounded-full border border-[#E1FF00] border-opacity-30">
                  <span>
                    <Text variant="label" color="#E1FF00">💡 Innovación Digital</Text>
                  </span>
                </div>
                
                <h1>
                  <Text variant="display" color="#E5FFFF" className="leading-tight">
                    APLICACIONES Y SITIOS WEB A MEDIDA PARA TU NEGOCIO
                  </Text>
                </h1>
                
                <p>
                  <Text variant="body" color="#E5FFFF" className="opacity-80 max-w-lg">
                    Transformamos tus ideas en soluciones digitales potentes. 
                    Desarrollamos aplicaciones web y móviles que impulsan el crecimiento de tu empresa.
                  </Text>
                </p>
                
                <div className="flex gap-4 flex-wrap">
                  <Button 
                    label="Comenzar Proyecto"
                    variant="primary"
                    onClick={() => {}}
                    className="bg-[#E1FF00] text-[#16141F] hover:bg-[#E1FF00]/90"
                  />
                  <Button 
                    label="Ver Proyectos"
                    variant="secondary"
                    onClick={() => {}}
                    className="border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF]/10"
                  />
                </div>
              </div>
            </Col>
            
            <Col cols={{ lg: 6, md: 6, sm: 4 }}>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {services.map((service, index) => (
                    <article 
                      key={index}
                      className="p-6 bg-white bg-opacity-5 backdrop-blur-sm rounded-xl border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-300 hover:scale-105"
                    >
                      <div className="mb-4">
                        <Icon name={service.icon as any} size={32} color="#E1FF00" />
                      </div>
                      <h3>
                        <Text variant="subtitle" color="#E5FFFF" className="mb-2">
                          {service.title}
                        </Text>
                      </h3>
                      <p>
                        <Text variant="label" color="#E5FFFF" className="opacity-70">
                          {service.description}
                        </Text>
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </Col>
          </Container>
        </section>

        {/* Value Proposition Section */}
        <section className="py-20 bg-gradient-to-r from-[#16141F] to-[#1f1d2a]">
          <Container>
            <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
              <header>
                <h2>
                  <Text variant="headline" color="#E1FF00" className="mb-6">
                    ¿Por qué elegir Cítrica?
                  </Text>
                </h2>
                <p>
                  <Text variant="body" color="#E5FFFF" className="opacity-80 max-w-3xl mx-auto">
                    Somos expertos en desarrollo de software B2B con años de experiencia 
                    creando soluciones que transforman negocios.
                  </Text>
                </p>
              </header>
            </Col>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {technologies.map((tech, index) => (
                <article key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E1FF00] to-[#FF5B00] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon name={tech.icon as any} size={24} color="#16141F" />
                  </div>
                  <h3>
                    <Text variant="title" color="#E5FFFF" className="mb-4">
                      {tech.title}
                    </Text>
                  </h3>
                  <p>
                    <Text variant="body" color="#E5FFFF" className="opacity-70">
                      {tech.description}
                    </Text>
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* About Section */}
        <section className="py-20 bg-[#16141F]">
          <Container>
            <Col cols={{ lg: 6, md: 6, sm: 4 }}>
              <article className="space-y-6">
                <header>
                  <h2>
                    <Text variant="headline" color="#00FFFF">
                      Quiénes Somos
                    </Text>
                  </h2>
                </header>
                <p>
                  <Text variant="body" color="#E5FFFF" className="opacity-80">
                    Cítrica es una marca especializada en desarrollo de software B2B. 
                    Nos dedicamos a crear aplicaciones web y móviles que potencian el 
                    crecimiento de empresas en toda Latinoamérica.
                  </Text>
                </p>
                <p>
                  <Text variant="body" color="#E5FFFF" className="opacity-80">
                    Nuestro equipo combina experiencia técnica con visión de negocio 
                    para entregar soluciones que realmente marcan la diferencia.
                  </Text>
                </p>
                <div className="grid grid-cols-3 gap-8 mt-8">
                  <div className="text-center">
                    <div>
                      <Text variant="headline" color="#E1FF00">50+</Text>
                    </div>
                    <p>
                      <Text variant="label" color="#E5FFFF" className="opacity-70">Proyectos</Text>
                    </p>
                  </div>
                  <div className="text-center">
                    <div>
                      <Text variant="headline" color="#E1FF00">5+</Text>
                    </div>
                    <p>
                      <Text variant="label" color="#E5FFFF" className="opacity-70">Años</Text>
                    </p>
                  </div>
                  <div className="text-center">
                    <div>
                      <Text variant="headline" color="#E1FF00">100%</Text>
                    </div>
                    <p>
                      <Text variant="label" color="#E5FFFF" className="opacity-70">Satisfacción</Text>
                    </p>
                  </div>
                </div>
              </article>
            </Col>
            
            <Col cols={{ lg: 6, md: 6, sm: 4 }}>
              <figure className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-[#E1FF00] to-[#FF5B00] rounded-2xl flex items-center justify-center">
                  <Icon name="Users" size={120} color="#16141F" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#00FFFF] rounded-full flex items-center justify-center">
                  <Icon name="Zap" size={32} color="#16141F" />
                </div>
              </figure>
            </Col>
          </Container>
        </section>

        {/* Projects Section */}
        <section className="py-20 bg-gradient-to-r from-[#1f1d2a] to-[#16141F]">
          <Container>
            <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
              <header>
                <h2>
                  <Text variant="headline" color="#FF5B00" className="mb-6">
                    Últimos Proyectos
                  </Text>
                </h2>
                <p>
                  <Text variant="body" color="#E5FFFF" className="opacity-80 max-w-2xl mx-auto">
                    Descubre algunas de las soluciones innovadoras que hemos desarrollado 
                    para nuestros clientes.
                  </Text>
                </p>
              </header>
            </Col>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card key={index}>
                  <article className="p-6 bg-white bg-opacity-5 backdrop-blur-sm rounded-xl border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-300">
                    <figure className="w-full h-48 bg-gradient-to-br from-[#E1FF00] to-[#00FFFF] rounded-lg mb-6 flex items-center justify-center">
                      <Icon name="Image" size={48} color="#16141F" />
                    </figure>
                    <h3>
                      <Text variant="title" color="#E5FFFF" className="mb-3">
                        {project.title}
                      </Text>
                    </h3>
                    <p>
                      <Text variant="body" color="#E5FFFF" className="opacity-70 mb-4">
                        {project.description}
                      </Text>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, techIndex) => (
                        <span 
                          key={techIndex}
                          className="px-3 py-1 bg-[#E1FF00] bg-opacity-20 text-[#E1FF00] rounded-full text-sm"
                        >
                          <Text variant="label" color="#E1FF00">
                            {tech}
                          </Text>
                        </span>
                      ))}
                    </div>
                  </article>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-[#16141F]">
          <Container>
            <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
              <header>
                <h2>
                  <Text variant="headline" color="#00FFFF" className="mb-6">
                    Nuestro Proceso
                  </Text>
                </h2>
                <p>
                  <Text variant="body" color="#E5FFFF" className="opacity-80 max-w-2xl mx-auto">
                    Seguimos una metodología probada que garantiza resultados excepcionales 
                    en cada proyecto.
                  </Text>
                </p>
              </header>
            </Col>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {process.map((step, index) => (
                <article key={index} className="relative">
                  <div className="text-center group">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#E1FF00] to-[#FF5B00] rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Icon name={step.icon as any} size={28} color="#16141F" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#00FFFF] rounded-full flex items-center justify-center">
                        <span>
                          <Text variant="label" color="#16141F" weight="bold">
                            {step.step}
                          </Text>
                        </span>
                      </div>
                    </div>
                    <h3>
                      <Text variant="title" color="#E5FFFF" className="mb-4">
                        {step.title}
                      </Text>
                    </h3>
                    <p>
                      <Text variant="body" color="#E5FFFF" className="opacity-70">
                        {step.description}
                      </Text>
                    </p>
                  </div>
                  
                  {index < process.length - 1 && index % 3 !== 2 && (
                    <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#E1FF00] to-[#00FFFF]" />
                  )}
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#E1FF00] to-[#FF5B00]">
          <Container>
            <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center">
              <header>
                <h2>
                  <Text variant="headline" color="#16141F" className="mb-6">
                    ¿Listo para transformar tu negocio?
                  </Text>
                </h2>
                <p>
                  <Text variant="body" color="#16141F" className="opacity-80 max-w-2xl mx-auto mb-8">
                    Contáctanos hoy y descubre cómo podemos ayudarte a crear la solución 
                    digital perfecta para tu empresa.
                  </Text>
                </p>
              </header>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button 
                  label="Solicitar Cotización"
                  variant="primary"
                  onClick={() => {}}
                  className="bg-[#16141F] text-[#E1FF00] hover:bg-[#16141F]/90"
                />
                <Button 
                  label="Agendar Llamada"
                  variant="secondary"
                  onClick={() => {}}
                  className="border-[#16141F] text-[#16141F] hover:bg-[#16141F]/10"
                />
              </div>
            </Col>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-[#0f0d16] border-t border-white border-opacity-10">
        <Container>
          <Col cols={{ lg: 4, md: 2, sm: 4 }}>
            <div className="mb-6">
              <h4>
                <Text variant="title" color="#E1FF00" className="mb-4">
                  Cítrica
                </Text>
              </h4>
              <p>
                <Text variant="body" color="#E5FFFF" className="opacity-70">
                  Aplicaciones y sitios web a medida para tu negocio.
                </Text>
              </p>
            </div>
          </Col>
          
          <Col cols={{ lg: 4, md: 2, sm: 4 }}>
            <nav>
              <h5>
                <Text variant="subtitle" color="#E5FFFF" className="mb-4">
                  Servicios
                </Text>
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="#landing-pages">
                    <Text variant="body" color="#E5FFFF" className="opacity-70 hover:opacity-100 cursor-pointer">
                      Landing Pages
                    </Text>
                  </a>
                </li>
                <li>
                  <a href="#websites">
                    <Text variant="body" color="#E5FFFF" className="opacity-70 hover:opacity-100 cursor-pointer">
                      Websites
                    </Text>
                  </a>
                </li>
                <li>
                  <a href="#web-apps">
                    <Text variant="body" color="#E5FFFF" className="opacity-70 hover:opacity-100 cursor-pointer">
                      Web Apps
                    </Text>
                  </a>
                </li>
                <li>
                  <a href="#mobile-apps">
                    <Text variant="body" color="#E5FFFF" className="opacity-70 hover:opacity-100 cursor-pointer">
                      Mobile Apps
                    </Text>
                  </a>
                </li>
              </ul>
            </nav>
          </Col>
          
          <Col cols={{ lg: 4, md: 2, sm: 4 }}>
            <div>
              <h5>
                <Text variant="subtitle" color="#E5FFFF" className="mb-4">
                  Contacto
                </Text>
              </h5>
              <address className="space-y-2 not-italic">
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={16} color="#00FFFF" />
                  <a href="mailto:hello@citrica.dev">
                    <Text variant="body" color="#E5FFFF" className="opacity-70">
                      hello@citrica.dev
                    </Text>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Phone" size={16} color="#00FFFF" />
                  <a href="tel:+51999888777">
                    <Text variant="body" color="#E5FFFF" className="opacity-70">
                      +51 999 888 777
                    </Text>
                  </a>
                </div>
                <div className="flex gap-4 mt-4">
                  <a href="#linkedin" aria-label="LinkedIn de Cítrica">
                    <Icon name="Linkedin" size={20} color="#E1FF00" className="cursor-pointer hover:opacity-80" />
                  </a>
                  <a href="#github" aria-label="GitHub de Cítrica">
                    <Icon name="Github" size={20} color="#E1FF00" className="cursor-pointer hover:opacity-80" />
                  </a>
                  <a href="#twitter" aria-label="Twitter de Cítrica">
                    <Icon name="Twitter" size={20} color="#E1FF00" className="cursor-pointer hover:opacity-80" />
                  </a>
                </div>
              </address>
            </div>
          </Col>
        </Container>
        
        <div className="border-t border-white border-opacity-10 mt-8 pt-8">
          <Container>
            <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center">
              <small>
                <Text variant="label" color="#E5FFFF" className="opacity-50">
                  © 2024 Cítrica. Todos los derechos reservados.
                </Text>
              </small>
            </Col>
          </Container>
        </div>
      </footer>
    </div>
  );
};

export default CitricaLanding;