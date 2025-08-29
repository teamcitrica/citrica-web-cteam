'use client'
import React, { useState } from 'react';
import { Container, Col } from '@/styles/07-objects/objects';
import Text from '@/shared/components/citrica-ui/atoms/text';
import Button from '@/shared/components/citrica-ui/molecules/button';
import Icon from '@/shared/components/citrica-ui/atoms/icon';
import Card from '@/shared/components/citrica-ui/atoms/card';

const CitricaWireframe = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const [activeService, setActiveService] = useState(0);

  const services = [
    {
      title: "Landing Pages",
      description: "Páginas optimizadas para conversión y captación de leads efectiva",
      features: ["Diseño responsive", "SEO optimizado", "Alta conversión"]
    },
    {
      title: "Websites",
      description: "Sitios web corporativos que reflejan la identidad de tu marca",
      features: ["CMS integrado", "Panel administrativo", "Optimización mobile"]
    },
    {
      title: "Web Apps",
      description: "Aplicaciones web robustas que automatizan procesos de negocio",
      features: ["Escalabilidad", "Integración APIs", "Dashboard analytics"]
    },
    {
      title: "Mobile Apps",
      description: "Aplicaciones móviles nativas que conectan con tus clientes",
      features: ["iOS y Android", "Push notifications", "Analytics integrado"]
    }
  ];

  const processSteps = [
    { step: "01", title: "Planificación", desc: "Análisis de requisitos y definición de objetivos" },
    { step: "02", title: "Diseño", desc: "Wireframes, prototipos y diseño de interfaz" },
    { step: "03", title: "Desarrollo", desc: "Implementación con tecnologías de vanguardia" },
    { step: "04", title: "Pruebas", desc: "Testing exhaustivo de funcionalidad y rendimiento" },
    { step: "05", title: "Implementación", desc: "Despliegue optimizado y puesta en producción" },
    { step: "06", title: "Mantenimiento", desc: "Soporte continuo y actualizaciones regulares" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    // Aquí iría la lógica para enviar el formulario
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b-2 border-gray-300">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="flex justify-between items-center py-4">
              {/* Logo Placeholder */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center border-2 border-black">
                  <Icon name="Code" size={20} color="#000" />
                </div>
                <h1>
                  <Text variant="title" color="#000000">Cítrica dev</Text>
                </h1>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex space-x-8">
                <a href="#inicio" className="hover:underline">
                  <Text variant="body" color="#000000">Inicio</Text>
                </a>
                <a href="#servicios" className="hover:underline">
                  <Text variant="body" color="#000000">Servicios</Text>
                </a>
                <a href="#proceso" className="hover:underline">
                  <Text variant="body" color="#000000">Proceso</Text>
                </a>
                <a href="#contacto" className="hover:underline">
                  <Text variant="body" color="#000000">Contacto</Text>
                </a>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Icon name="Menu" size={24} color="#000" />
              </div>

              {/* CTA Button */}
              <div className="hidden md:block">
                <Button
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                  label="Contáctanos"
                  variant="primary"
                  className="border-2 border-black bg-black text-white px-6 py-2 hover:bg-white hover:text-black transition-all"
                />
              </div>
            </div>
          </Col>
        </Container>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-20 pb-16 bg-gray-100 border-b-2 border-gray-300">
        <Container>
          <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto text-center">
            <div className="space-y-8">
              {/* Main Headline */}
              <header>
                <h1 className="mb-6">
                  <Text variant="display" color="#000000" className="leading-tight font-bold">
                    APLICACIONES Y SITIOS WEB A MEDIDA PARA TU NEGOCIO
                  </Text>
                </h1>
              </header>

              {/* Subheadline */}
              <div>
                <h2>
                  <Text variant="title" color="#666666">
                    Desarrollamos soluciones web y móviles adaptadas a las necesidades de tu empresa
                  </Text>
                </h2>
              </div>

              {/* Service Tags */}
              <div className="flex justify-center flex-wrap gap-4 my-8">
                {services.map((service, index) => (
                  <div key={index} className="px-4 py-2 border-2 border-gray-400 bg-white">
                    <Text variant="body" color="#000000">{service.title}</Text>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                  label="Comenzar Proyecto"
                  variant="primary"
                  className="border-2 border-black bg-black text-white px-8 py-3 hover:bg-white hover:text-black transition-all"
                />
                <Button
                  onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                  label="Ver Servicios"
                  variant="secondary"
                  className="border-2 border-black bg-white text-black px-8 py-3 hover:bg-black hover:text-white transition-all"
                />
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* About Section */}
      <section className="py-16 border-b-2 border-gray-300">
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="space-y-6">
              <header>
                <h2>
                  <Text variant="headline" color="#000000">¿Quiénes somos?</Text>
                </h2>
              </header>
              
              <div className="space-y-4">
                <p>
                  <Text variant="body" color="#666666">
                    Cítrica dev es un equipo de expertos en desarrollo de software B2B especializado en crear 
                    soluciones digitales personalizadas que impulsan el crecimiento de tu negocio.
                  </Text>
                </p>
                
                <p>
                  <Text variant="body" color="#666666">
                    Combinamos experiencia técnica con creatividad para entregar productos que no solo 
                    funcionan perfectamente, sino que destacan en el mercado.
                  </Text>
                </p>
              </div>

              {/* Key Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {[
                  "50+ Proyectos exitosos",
                  "5+ Años de experiencia",
                  "100% Satisfacción del cliente",
                  "Soporte 24/7"
                ].map((point, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-300">
                    <Icon name="CheckCircle" size={20} color="#000" />
                    <Text variant="body" color="#000000">{point}</Text>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            {/* Image Placeholder */}
            <div className="w-full h-80 bg-gray-300 border-2 border-black flex items-center justify-center">
              <div className="text-center">
                <Icon name="Users" size={64} color="#666" />
                <div className="mt-4">
                  <Text variant="body" color="#666666">[IMAGEN DEL EQUIPO]</Text>
                </div>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-16 bg-gray-100 border-b-2 border-gray-300">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center mb-12">
              <header>
                <h2>
                  <Text variant="headline" color="#000000">Nuestros servicios</Text>
                </h2>
              </header>
              <div className="mt-4">
                <Text variant="title" color="#666666">
                  Soluciones digitales completas para tu empresa
                </Text>
              </div>
            </div>
          </Col>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`p-6 border-2 border-gray-400 cursor-pointer transition-all ${
                  activeService === index ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'
                }`}
                onClick={() => setActiveService(index)}
              >
                <article>
                  {/* Service Icon Placeholder */}
                  <div className={`w-16 h-16 mb-4 border-2 flex items-center justify-center ${
                    activeService === index ? 'border-white bg-white' : 'border-black bg-gray-300'
                  }`}>
                    <Icon 
                      name={index === 0 ? "Globe" : index === 1 ? "Monitor" : index === 2 ? "Code" : "Smartphone"} 
                      size={32} 
                      color={activeService === index ? "#000" : "#666"} 
                    />
                  </div>

                  <h3>
                    <Text 
                      variant="subtitle" 
                      color={activeService === index ? "#FFFFFF" : "#000000"}
                      weight="bold"
                    >
                      {service.title}
                    </Text>
                  </h3>

                  <p className="mt-3 mb-4">
                    <Text 
                      variant="body" 
                      color={activeService === index ? "#CCCCCC" : "#666666"}
                    >
                      {service.description}
                    </Text>
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <Icon 
                          name="Check" 
                          size={16} 
                          color={activeService === index ? "#FFFFFF" : "#000000"} 
                        />
                        <Text 
                          variant="label" 
                          color={activeService === index ? "#FFFFFF" : "#000000"}
                        >
                          {feature}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Process Section */}
      <section id="proceso" className="py-16 border-b-2 border-gray-300">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center mb-12">
              <header>
                <h2>
                  <Text variant="headline" color="#000000">Nuestro proceso</Text>
                </h2>
              </header>
              <div className="mt-4">
                <Text variant="title" color="#666666">
                  Metodología probada para el éxito de tu proyecto
                </Text>
              </div>
            </div>
          </Col>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <article key={index} className="text-center">
                {/* Step Number */}
                <div className="w-20 h-20 mx-auto mb-6 bg-black border-2 border-black flex items-center justify-center">
                  <Text variant="title" color="#FFFFFF" weight="bold">
                    {step.step}
                  </Text>
                </div>

                <h3>
                  <Text variant="subtitle" color="#000000" weight="bold">
                    {step.title}
                  </Text>
                </h3>

                <p className="mt-3">
                  <Text variant="body" color="#666666">
                    {step.desc}
                  </Text>
                </p>

                {/* Connector Line (except for last item) */}
                {index < processSteps.length - 1 && index % 3 !== 2 && (
                  <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-gray-400" />
                )}
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-16 bg-gray-100">
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="space-y-6">
              <header>
                <h2>
                  <Text variant="headline" color="#000000">Contáctanos</Text>
                </h2>
              </header>

              <div>
                <Text variant="title" color="#666666">
                  ¿Listo para transformar tu idea en realidad? Conversemos sobre tu próximo proyecto.
                </Text>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border-2 border-gray-300 bg-white">
                  <Icon name="Mail" size={24} color="#000" />
                  <div>
                    <Text variant="body" color="#000000" weight="bold">Email</Text>
                    <Text variant="body" color="#666666">hello@citrica.dev</Text>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border-2 border-gray-300 bg-white">
                  <Icon name="Phone" size={24} color="#000" />
                  <div>
                    <Text variant="body" color="#000000" weight="bold">Teléfono</Text>
                    <Text variant="body" color="#666666">+51 999 888 777</Text>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border-2 border-gray-300 bg-white">
                  <Icon name="MapPin" size={24} color="#000" />
                  <div>
                    <Text variant="body" color="#000000" weight="bold">Ubicación</Text>
                    <Text variant="body" color="#666666">Lima, Perú</Text>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            {/* Contact Form */}
            <div className="bg-white p-8 border-2 border-black">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label>
                    <Text variant="body" color="#000000" weight="bold">Nombre *</Text>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full mt-2 p-3 border-2 border-gray-400 focus:border-black outline-none"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label>
                    <Text variant="body" color="#000000" weight="bold">Email *</Text>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full mt-2 p-3 border-2 border-gray-400 focus:border-black outline-none"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label>
                    <Text variant="body" color="#000000" weight="bold">Mensaje *</Text>
                  </label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full mt-2 p-3 border-2 border-gray-400 focus:border-black outline-none resize-vertical"
                    placeholder="Cuéntanos sobre tu proyecto..."
                  />
                </div>

                <Button
                  onClick={() => {}}
                  label="Enviar Mensaje"
                  variant="primary"
                  className="w-full border-2 border-black bg-black text-white py-4 hover:bg-white hover:text-black transition-all"
                />
              </form>
            </div>
          </Col>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t-2 border-gray-800">
        <Container>
          <Col cols={{ lg: 4, md: 2, sm: 4 }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white border-2 border-white rounded flex items-center justify-center">
                <Icon name="Code" size={20} color="#000" />
              </div>
              <Text variant="title" color="#FFFFFF">Cítrica dev</Text>
            </div>
            <Text variant="body" color="#CCCCCC">
              Aplicaciones y sitios web a medida para tu negocio.
            </Text>
          </Col>

          <Col cols={{ lg: 4, md: 2, sm: 4 }}>
            <nav>
              <h3>
                <Text variant="subtitle" color="#FFFFFF" className="mb-4">Servicios</Text>
              </h3>
              <ul className="space-y-2">
                {["Landing Pages", "Websites", "Web Apps", "Mobile Apps"].map((service, index) => (
                  <li key={index}>
                    <a href="#servicios" className="hover:underline">
                      <Text variant="body" color="#CCCCCC">{service}</Text>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Col>

          <Col cols={{ lg: 4, md: 2, sm: 4 }}>
            <div>
              <h3>
                <Text variant="subtitle" color="#FFFFFF" className="mb-4">Síguenos</Text>
              </h3>
              <div className="flex space-x-4">
                {["Linkedin", "Github", "Twitter", "Instagram"].map((social, index) => (
                  <a key={index} href="#" className="hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                      <Icon 
                        name={social as any} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Col>
        </Container>

        <div className="border-t-2 border-gray-800 mt-8 pt-8">
          <Container>
            <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center">
              <Text variant="body" color="#CCCCCC">
                © 2024 Cítrica dev. Todos los derechos reservados.
              </Text>
            </Col>
          </Container>
        </div>
      </footer>
    </div>
  );
};

export default CitricaWireframe;