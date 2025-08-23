'use client'
import React from 'react'
import { Container, Col } from '@/styles/07-objects/objects'
import Text from '@/shared/components/citrica-ui/atoms/text'
import Icon from '@/shared/components/citrica-ui/atoms/icon'
import Button from '@/shared/components/citrica-ui/molecules/button'

const CitricaWebsite = () => {
  const services = [
    {
      title: "Landing Pages",
      description: "Páginas de aterrizaje optimizadas para conversión",
      icon: "Globe"
    },
    {
      title: "Websites",
      description: "Sitios web corporativos profesionales",
      icon: "Monitor"
    },
    {
      title: "Web Apps",
      description: "Aplicaciones web robustas y escalables",
      icon: "Code"
    },
    {
      title: "Mobile Apps",
      description: "Aplicaciones móviles nativas e híbridas",
      icon: "Smartphone"
    }
  ]

  const projects = [
    {
      title: "E-commerce Fashion",
      description: "Plataforma completa de comercio electrónico con gestión de inventario",
      tech: "React • Node.js • MongoDB",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Sistema ERP",
      description: "Sistema integral de gestión empresarial para medianas empresas",
      tech: "Vue.js • Laravel • MySQL",
      image: "/api/placeholder/400/250"
    },
    {
      title: "App de Delivery",
      description: "Aplicación móvil para delivery con tracking en tiempo real",
      tech: "React Native • Firebase • Google Maps",
      image: "/api/placeholder/400/250"
    }
  ]

  const technologies = [
    {
      title: "Presentaciones que inspiran",
      description: "Diseños únicos que comunican efectivamente tu propuesta de valor",
      icon: "Presentation",
      color: "#E1FF00"
    },
    {
      title: "Front-end robusto",
      description: "Interfaces modernas, rápidas y optimizadas para todos los dispositivos",
      icon: "Layers",
      color: "#00FFFF"
    },
    {
      title: "Desarrollo móvil eficiente",
      description: "Apps nativas e híbridas con la mejor experiencia de usuario",
      icon: "Smartphone",
      color: "#FF5B00"
    },
    {
      title: "Back-end potente",
      description: "Arquitecturas escalables y seguras que crecen con tu negocio",
      icon: "Server",
      color: "#E5FFFF"
    }
  ]

  const process = [
    { step: "01", title: "Planificación", description: "Definimos objetivos y estrategia del proyecto" },
    { step: "02", title: "Diseño", description: "Creamos prototipos y experiencias de usuario" },
    { step: "03", title: "Desarrollo", description: "Construimos tu solución con las mejores tecnologías" },
    { step: "04", title: "Pruebas", description: "Validamos calidad y rendimiento exhaustivamente" },
    { step: "05", title: "Implementación", description: "Desplegamos tu proyecto de forma segura" },
    { step: "06", title: "Soporte", description: "Mantenimiento continuo y evolución constante" }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#16141F' }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-opacity-95 backdrop-blur-sm" style={{ backgroundColor: '#16141F' }}>
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#E1FF00' }}></div>
              <Text variant="title" color="#E5FFFF" weight="bold">Cítrica</Text>
            </div>
            <div className="hidden lg:flex space-x-8">
              <a href="#inicio" className="hover:opacity-80 transition-opacity">
                <Text variant="body" color="#E5FFFF">Inicio</Text>
              </a>
              <a href="#servicios" className="hover:opacity-80 transition-opacity">
                <Text variant="body" color="#E5FFFF">Servicios</Text>
              </a>
              <a href="#proyectos" className="hover:opacity-80 transition-opacity">
                <Text variant="body" color="#E5FFFF">Proyectos</Text>
              </a>
              <a href="#contacto" className="hover:opacity-80 transition-opacity">
                <Text variant="body" color="#E5FFFF">Contacto</Text>
              </a>
            </div>
            <div className="lg:hidden">
              <Icon name="Menu" color="#E5FFFF" size={24} />
            </div>
          </Col>
        </Container>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full" style={{ backgroundColor: '#E1FF00' }}></div>
          <div className="absolute bottom-40 right-32 w-24 h-24 rounded-full" style={{ backgroundColor: '#00FFFF' }}></div>
          <div className="absolute top-60 right-20 w-16 h-16 rounded-full" style={{ backgroundColor: '#FF5B00' }}></div>
        </div>
        
        <Container>
          <Col cols={{ lg: 8, md: 6, sm: 4 }} className="text-center mx-auto mb-16">
            <h1 className="mb-6">
              <Text variant="display" color="#E5FFFF" className="leading-tight">
                APLICACIONES Y SITIOS WEB A MEDIDA PARA TU NEGOCIO
              </Text>
            </h1>
            <div className="mb-8">
              <Text variant="title" color="#00FFFF">
                Transformamos ideas en soluciones digitales que impulsan el crecimiento
              </Text>
            </div>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                label="Iniciar Proyecto"
                color="primary"
                variant="primary"
              />
              <Button 
                onClick={() => document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth' })}
                label="Ver Proyectos"
                color="secondary"
                variant="secondary"
              />
            </div>
          </Col>
        </Container>

        {/* Services Grid */}
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {services.map((service, index) => (
              <div key={index} className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300 hover:transform hover:scale-105">
                <div className="mb-4">
                  <Icon name={service.icon as any} color="#E1FF00" size={32} />
                </div>
                <h3 className="mb-2">
                  <Text variant="subtitle" color="#E5FFFF" weight="bold">
                    {service.title}
                  </Text>
                </h3>
                <Text variant="body" color="#E5FFFF" className="opacity-80">
                  {service.description}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Value Proposition */}
      <section className="py-20" style={{ backgroundColor: '#E1FF00' }}>
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <h2 className="mb-6">
              <Text variant="headline" color="#16141F" weight="bold">
                ¿Por qué elegir Cítrica?
              </Text>
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <Icon name="CheckCircle" color="#16141F" size={24} />
                <Text variant="body" color="#16141F" weight="bold">
                  +50 proyectos exitosos entregados
                </Text>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="CheckCircle" color="#16141F" size={24} />
                <Text variant="body" color="#16141F" weight="bold">
                  Tecnologías de vanguardia
                </Text>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="CheckCircle" color="#16141F" size={24} />
                <Text variant="body" color="#16141F" weight="bold">
                  Soporte 24/7 post-lanzamiento
                </Text>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="CheckCircle" color="#16141F" size={24} />
                <Text variant="body" color="#16141F" weight="bold">
                  Entrega en tiempo récord
                </Text>
              </div>
            </div>
          </Col>
          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl p-8 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Icon name="Rocket" color="#E5FFFF" size={48} />
                </div>
                <Text variant="title" color="#16141F" weight="bold">
                  Impulsamos tu crecimiento digital
                </Text>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* About Us */}
      <section className="py-20">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2 className="mb-6">
              <Text variant="headline" color="#E1FF00" weight="bold">
                Quiénes somos
              </Text>
            </h2>
            <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto">
              <Text variant="title" color="#E5FFFF" className="opacity-90">
                Somos un equipo de desarrolladores y diseñadores apasionados por crear 
                experiencias digitales excepcionales que transforman negocios.
              </Text>
            </Col>
          </Col>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00FFFF' }}>
                <Icon name="Users" color="#16141F" size={32} />
              </div>
              <h3 className="mb-2">
                <Text variant="subtitle" color="#E5FFFF" weight="bold">
                  Equipo Experto
                </Text>
              </h3>
              <Text variant="body" color="#E5FFFF" className="opacity-80">
                Desarrolladores senior con más de 5 años de experiencia
              </Text>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF5B00' }}>
                <Icon name="Award" color="#16141F" size={32} />
              </div>
              <h3 className="mb-2">
                <Text variant="subtitle" color="#E5FFFF" weight="bold">
                  Calidad Garantizada
                </Text>
              </h3>
              <Text variant="body" color="#E5FFFF" className="opacity-80">
                Procesos de calidad certificados y mejores prácticas
              </Text>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E1FF00' }}>
                <Icon name="Zap" color="#16141F" size={32} />
              </div>
              <h3 className="mb-2">
                <Text variant="subtitle" color="#E5FFFF" weight="bold">
                  Innovación Constante
                </Text>
              </h3>
              <Text variant="body" color="#E5FFFF" className="opacity-80">
                Siempre a la vanguardia de las últimas tecnologías
              </Text>
            </div>
          </div>
        </Container>
      </section>

      {/* Latest Projects */}
      <section id="proyectos" className="py-20" style={{ backgroundColor: '#E5FFFF' }}>
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2 className="mb-6">
              <Text variant="headline" color="#16141F" weight="bold">
                Últimos proyectos
              </Text>
            </h2>
            <Text variant="title" color="#16141F" className="opacity-80">
              Conoce algunos de nuestros trabajos más recientes
            </Text>
          </Col>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Icon name="Image" color="#E5FFFF" size={48} />
                </div>
                <div className="p-6">
                  <h3 className="mb-2">
                    <Text variant="subtitle" color="#16141F" weight="bold">
                      {project.title}
                    </Text>
                  </h3>
                  <div className="mb-3">
                    <Text variant="body" color="#16141F" className="opacity-70">
                      {project.description}
                    </Text>
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <Text variant="label" color="#16141F" weight="bold">
                      {project.tech}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Technologies */}
      <section className="py-20">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2 className="mb-6">
              <Text variant="headline" color="#00FFFF" weight="bold">
                Tecnologías que usamos
              </Text>
            </h2>
            <Text variant="title" color="#E5FFFF" className="opacity-90">
              Las mejores herramientas para crear soluciones excepcionales
            </Text>
          </Col>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-8 hover:bg-opacity-10 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: tech.color }}
                  >
                    <Icon name={tech.icon as any} color="#16141F" size={24} />
                  </div>
                  <h3>
                    <Text variant="subtitle" color="#E5FFFF" weight="bold">
                      {tech.title}
                    </Text>
                  </h3>
                </div>
                <Text variant="body" color="#E5FFFF" className="opacity-80">
                  {tech.description}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Process */}
      <section className="py-20" style={{ backgroundColor: 'rgba(255, 91, 0, 0.1)' }}>
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2 className="mb-6">
              <Text variant="headline" color="#FF5B00" weight="bold">
                Nuestro proceso de trabajo
              </Text>
            </h2>
            <Text variant="title" color="#E5FFFF" className="opacity-90">
              Una metodología probada para el éxito de tu proyecto
            </Text>
          </Col>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: '#FF5B00', color: '#16141F' }}
                >
                  {step.step}
                </div>
                <h3 className="mb-2">
                  <Text variant="subtitle" color="#E5FFFF" weight="bold">
                    {step.title}
                  </Text>
                </h3>
                <Text variant="body" color="#E5FFFF" className="opacity-80">
                  {step.description}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section id="contacto" className="py-20" style={{ backgroundColor: '#E1FF00' }}>
        <Container>
          <Col cols={{ lg: 8, md: 6, sm: 4 }} className="text-center mx-auto">
            <h2 className="mb-6">
              <Text variant="headline" color="#16141F" weight="bold">
                ¿Listo para transformar tu negocio?
              </Text>
            </h2>
            <div className="mb-8">
              <Text variant="title" color="#16141F" className="opacity-80">
                Contactanos hoy y descubre cómo podemos impulsar tu crecimiento digital
              </Text>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <Button 
                onClick={() => window.open('mailto:contacto@citrica.com', '_blank')}
                label="Escribir Email"
                color="primary"
                variant="primary"
              />
              <Button 
                onClick={() => window.open('https://wa.me/1234567890', '_blank')}
                label="WhatsApp"
                color="success"
                variant="primary"
              />
            </div>
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" color="#16141F" size={20} />
                <Text variant="body" color="#16141F" weight="bold">
                  contacto@citrica.com
                </Text>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Phone" color="#16141F" size={20} />
                <Text variant="body" color="#16141F" weight="bold">
                  +1 (555) 123-4567
                </Text>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#16141F', borderTop: '1px solid rgba(225, 255, 0, 0.2)' }}>
        <Container>
          <Col cols={{ lg: 6, md: 3, sm: 2 }}>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#E1FF00' }}></div>
              <Text variant="title" color="#E5FFFF" weight="bold">Cítrica</Text>
            </div>
            <Text variant="body" color="#E5FFFF" className="opacity-70">
              Transformamos ideas en soluciones digitales que impulsan el crecimiento de tu negocio.
            </Text>
          </Col>
          <Col cols={{ lg: 6, md: 3, sm: 2 }} className="text-right">
            <div className="flex justify-end space-x-6 mb-4">
              <Icon name="Twitter" color="#E5FFFF" size={24} className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
              <Icon name="Linkedin" color="#E5FFFF" size={24} className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
              <Icon name="Github" color="#E5FFFF" size={24} className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
            </div>
            <Text variant="body" color="#E5FFFF" className="opacity-50">
              © 2024 Cítrica. Todos los derechos reservados.
            </Text>
          </Col>
        </Container>
      </footer>
    </div>
  )
}

export default CitricaWebsite