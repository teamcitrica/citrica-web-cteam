"use client";
import React, { useEffect, useState } from "react";
import { Header } from "@citrica-ui";
import { Text, Button, Container, Col, Icon } from "citrica-ui-toolkit";
import CurvedLoop from "./versions/yolanda/components/CurvedLoop";


import "aos/dist/aos.css";
import AOS from "aos";
import {
  process,
  stats,
} from "@/shared/archivos js/citrica-data";
import { CompletedProjects } from "@/shared/components/project-components/other-projects";
import { FooterCitrica } from "@/shared/components/project-components/footer-citrica";
import {ContactSectionLanding } from "@/shared/components/project-components/contact-section";

const CitricaWebsite = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);

  const logo = (
    <div className="flex items-center space-x-2">
      <img src="/img/citrica-logo.png" alt="Cítrica Logo" className="h-10" />
    </div>
  );

  const navLinksHome = [
    {
      title: "Inicio",
      href: "#inicio",
    },
        {
      title: "Servicios",
      href: "#servicios",
    },
    {
      title: "Proyectos",
      href: "#proyectos",
    },
        {
      title: "Contacto",
      href: "#contacto",
    },
    {
      title: "Área clientes",
      href: "/login",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0F0F" }}>
      <Header
        logo={logo}
        variant="standard"
        className="bg-color-ct-black"
        showButton={true}
        buttonText="Contáctanos"
        navLinks={navLinksHome}
      />

      {/* Hero Section */}
      <section
        id="inicio"
        className="min-h-screen relative overflow-hidden hero-landing-background flex items-center"
      >
        <Container>
          <Col
            cols={{ lg: 10, md: 6, sm: 4 }}
            className="text-center mx-auto"
          >
            <h1 className="text-balance mb-2">
              <Text variant="display" color="#FF5B00" weight="bold">
                Soluciones Digitales
              </Text>
            </h1>
            <h2 className="text-balance mb-4">
              <Text variant="display" color="#FFFFFF" weight="bold">
                de Alto Rendimiento
              </Text>
            </h2>
            <p className="text-balance mb-8">
              <Text variant="subtitle" color="#FFFFFF" className="opacity-90">
                La infraestructura de tu negocio, construida para el futuro.
              </Text>
            </p>
            <a href="#contacto">
              <Button
                label="CONTÁCTANOS"
                variant="primary"
                textVariant="body"
                className="img-boton-hero"
              />
            </a>
          </Col>
        </Container>
        <div className="hero-marquee-wrapper">
          <CurvedLoop
            marqueeText={`Websites\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Landing Pages\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Web Apps\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Mobile Apps (IOS y Android)\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0SAAS\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Integraciones de IA\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0E-Commerce\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Plataformas web a Medida`}
            speed={1}
            curveAmount={0}
            direction="right"
            interactive={true}
            className="custom-text-style"
          />
        </div>
      </section>

      {/* Value Proposition */}
      <section id="valores" className="py-20" style={{ background: 'linear-gradient(90deg, #003333 0%, #008282 100%)' }}>
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-10">
            <h2 data-aos="fade-up" data-aos-duration="1500">
              <Text variant="subtitle" color="#FF5B00" weight="bold">
                La Promesa y el Valor
              </Text>
            </h2>
            <h3 className="mt-2" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="title" color="#FFFFFF" weight="bold">
                SU ACTIVO DIGITAL ASEGURADO
              </Text>
            </h3>
            <Col cols={{ lgPush: 2, lg: 8, md: 6, sm: 4 }} className="mx-auto mt-4">
              <p data-aos="fade-up" data-aos-duration="1500">
                <Text variant="body" color="#FFFFFF" className="opacity-80">
                  Su inversión digital es un activo estratégico que creamos para crecer sin límites. Esto lo garantizamos con la combinación perfecta de Ingeniería de Alto Rendimiento y Diseño UX/UI de Excelencia, un compromiso que se aplica rigurosamente a cada producto, ya sea una web, una app móvil o una plataforma SaaS.
                </Text>
              </p>
            </Col>
          </Col>

          {/* Cards de valor */}
          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="text-center" data-aos="fade-up" data-aos-duration="1500">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-color-ct-secondary flex items-center justify-center">
              <Icon name="Handshake" className="text-[#16141F]" size={24} />
            </div>
            <h4 className="mb-2">
              <Text variant="subtitle" color="#FFFFFF" weight="bold">
                Somos tu socio estratégico
              </Text>
            </h4>
            <Text variant="body" color="#FFFFFF" className="opacity-80">
              Ingeniería, Diseño y Velocidad para la infraestructura de tu negocio.
            </Text>
          </Col>
          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="text-center" data-aos="fade-up" data-aos-duration="1500">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-color-ct-secondary flex items-center justify-center">
              <Icon name="Target" className="text-[#16141F]" size={24} />
            </div>
            <h4 className="mb-2">
              <Text variant="subtitle" color="#FFFFFF" weight="bold">
                Misión
              </Text>
            </h4>
            <Text variant="body" color="#FFFFFF" className="opacity-80">
              Transformar tu inversión digital en un activo estratégico que crece sin límites.
            </Text>
          </Col>
          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="text-center" data-aos="fade-up" data-aos-duration="1500">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-color-ct-secondary flex items-center justify-center">
              <Icon name="TrendingUp" className="text-[#16141F]" size={24} />
            </div>
            <h4 className="mb-2">
              <Text variant="subtitle" color="#FFFFFF" weight="bold">
                Resultado
              </Text>
            </h4>
            <Text variant="body" color="#FFFFFF" className="opacity-80">
              Soluciones robustas, escalables y orientadas 100% al negocio.
            </Text>
          </Col>
        </Container>
      </section>

      {/* Equipo + Services */}
      <section className="hero-background-image-flip">
        <Container className="py-20">
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-10">
            <h2 data-aos="fade-up" data-aos-duration="1500">
              <Text variant="subtitle" color="#FF5B00" weight="bold">
                El Equipo Integral de Alto Rendimiento
              </Text>
            </h2>
            <h3 className="mt-2" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="title" color="#FFFFFF" weight="bold">
                EXPERTOS DE PRIMERA LÍNEA DEDICADOS A TU PROYECTO
              </Text>
            </h3>
            <Col cols={{ lgPush: 2, lg: 8, md: 6, sm: 4 }} className="mx-auto mt-4">
              <p data-aos="fade-up" data-aos-duration="1500">
                <Text variant="body" color="#FF5B00">
                  Un Equipo 360: Ingenieros, Diseñadores, Desarrolladores y Arte.
                </Text>
              </p>
              <p className="" data-aos="fade-up" data-aos-duration="1500">
                <Text variant="body" color="#FFFFFF" className="opacity-80">
                  La calidad superior de Cítrica se debe a nuestra estructura interna. Usted no contrata solo un desarrollador, sino un equipo completo de expertos enfocados en la calidad y la conversión.
                </Text>
              </p>
              <p className="mt-4" data-aos="fade-up" data-aos-duration="1500">
                <Text variant="body" color="#FFFFFF" className="opacity-80">
                  Este enfoque multidisciplinar garantiza que el producto sea técnicamente superior y visualmente impecable.
                </Text>
              </p>
            </Col>
          </Col>

          {/* Team Cards */}
          <Col cols={{ lg: 12, md: 6, sm: 4 }} noPadding className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {[
              { name: 'FERNANDO MORALEZ', role: 'Ingeniero de Software', desc: 'Garantiza la robustez, seguridad y escalabilidad.' },
              { name: 'BERNARDO BORRAT', role: 'UX/UI Designer', desc: 'Asegura una experiencia de usuario excelente y conversión.' },
              { name: 'JUAN CARLOS VIGAR', role: 'Back End Developer', desc: 'Construye la funcionalidad robusta y los servicios del servidor.' },
              { name: 'JOHAN FERNÁNDEZ', role: 'Front End Developer', desc: 'Ejecuta la interfaz dinámica y la velocidad de carga.' },
              { name: 'YOLANDA CASTRO', role: 'QA Tester', desc: 'Certifica la calidad, usabilidad y ausencia de errores.' },
            ].map((member, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-duration="1500"
                className="border border-[#003333] rounded-2xl p-6 flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 mb-4 rounded-full bg-color-ct-secondary flex items-center justify-center">
                  <Icon name="User" className="text-[#16141F]" size={24} />
                </div>
                <Text variant="label" color="#FF5B00" weight="bold">
                  {member.name}
                </Text>
                <div className="mt-1">
                  <Text variant="label" color="#FFFFFF" weight="bold">
                    {member.role}
                  </Text>
                </div>
                <div className="mt-2">
                  <Text variant="label" color="#FFFFFF" className="opacity-70">
                    {member.desc}
                  </Text>
                </div>
              </div>
            ))}
          </Col>
        </Container>
      </section>

      <section className="hero-background-image">
        <Container className="py-20">
          {/* Services Header */}
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-6">
            <h2 data-aos="fade-up" data-aos-duration="1500">
              <Text variant="subtitle" color="#FF5B00" weight="bold">
                Soluciones
              </Text>
            </h2>
            <h3 className="mt-2" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="title" color="#FFFFFF" weight="bold">
                INFRAESTRUCTURA DIGITAL 360
              </Text>
            </h3>
            <p className="mt-4" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="body" color="#FFFFFF" className="opacity-80">
                Somos su único socio para toda su infraestructura digital.
              </Text>
            </p>
          </Col>

          {/* SERVICIOS A MEDIDA */}
          <div id="servicios" />
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mt-8 mb-6">
            <h4 data-aos="fade-up" data-aos-duration="1500">
              <Text variant="subtitle" color="#FF5B00" weight="bold">
                SERVICIOS A MEDIDA
              </Text>
            </h4>
          </Col>
          {[
            { icon: 'Globe', color: '#E1FF00', title: 'Desarrollo Base', desc: 'Websites | Landing Pages\nWeb Apps | Mobile Apps' },
            { icon: 'Monitor', color: '#00E5FF', title: 'Plataformas SaaS & AI', desc: 'Desarrollo de software como servicio a la medida y la integración de IA en sus flujos de trabajo.' },
            { icon: 'Code', color: '#FF5B00', title: 'Servicios Secundarios', desc: 'Diseño de Identidad de Marca.\nMarketing Digital.' },
          ].map((service, index) => (
            <Col key={index} cols={{ lg: 4, md: 2, sm: 4 }} data-aos="fade-up" data-aos-duration="1500">
              <div className="rounded-2xl px-5 pt-4 pb-6 flex flex-col items-center text-center h-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '2px solid #003333' }}>
                <div className="w-10 h-10 mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: '#16141F' }}>
                  <Icon name={service.icon as any} color={service.color} size={20} />
                </div>
                <h4 className="mb-1">
                  <Text variant="subtitle" color={service.color} weight="bold">
                    {service.title}
                  </Text>
                </h4>
                <Text variant="body" color="#FFFFFF" className="opacity-80 whitespace-pre-line">
                  {service.desc}
                </Text>
                <div className="mt-auto pt-4 w-full">
                  <div
                    className="w-[95%] mx-auto"
                    style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${service.color}, transparent)` }}
                  />
                </div>
              </div>
            </Col>
          ))}

          {/* PRODUCTOS ESPECIALIZADOS POR NICHO */}
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mt-12 mb-6">
            <h4 data-aos="fade-up" data-aos-duration="1500">
              <Text variant="subtitle" color="#FF5B00" weight="bold">
                PRODUCTOS ESPECIALIZADOS POR NICHO
              </Text>
            </h4>
          </Col>
          {[
            { icon: 'Globe', color: '#E1FF00', title: 'Plataformas Web B2B y B2C', desc: 'Elimina la \'Inversión Múltiple\'. Agenda, CRM, Sistema de Notificaciones, IA y CMS integrados en tu Website.' },
            { icon: 'Monitor', color: '#00E5FF', title: 'Plataforma Web Restaurantes', desc: 'Gestión integral que cubre desde pedidos online y comandero hasta sistemas de caja y fidelización de clientes.' },
            { icon: 'Code', color: '#FF5B00', title: 'Tienda en Línea', desc: 'Control total de inventario, pasarelas de pago y logística en una plataforma escalable. Convierte tu catálogo en un motor de ventas eficiente y automático.' },
          ].map((service, index) => (
            <Col key={`nicho-${index}`} cols={{ lg: 4, md: 2, sm: 4 }} data-aos="fade-up" data-aos-duration="1500">
              <div className="rounded-2xl px-5 pt-4 pb-6 flex flex-col items-center text-center h-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '2px solid #003333' }}>
                <div className="w-10 h-10 mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: '#16141F' }}>
                  <Icon name={service.icon as any} color={service.color} size={20} />
                </div>
                <h4 className="mb-1">
                  <Text variant="subtitle" color={service.color} weight="bold">
                    {service.title}
                  </Text>
                </h4>
                <Text variant="body" color="#FFFFFF" className="opacity-80">
                  {service.desc}
                </Text>
                <div className="mt-auto pt-4 w-full">
                  <div
                    className="w-[95%] mx-auto"
                    style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${service.color}, transparent)` }}
                  />
                </div>
              </div>
            </Col>
          ))}
        </Container>
      </section>

      {/* Latest Projects */}
      <section id="proyectos" className="py-20 gradient-project-hero">
        <CompletedProjects />
      </section>

      {/* Technologies Section */}
      <section
        id="technologies"
        className="pb-20 pt-20 hero-background-image-flip"
      >
        <Container>
          {/* Header */}
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-10">
            <h2 data-aos="fade-up" data-aos-duration="1500">
              <Text variant="subtitle" color="#FF5B00" weight="bold">
                Tecnologías y Beneficios
              </Text>
            </h2>
            <h3 className="mt-2" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="title" color="#FFFFFF" weight="bold">
                EL STACK QUE GARANTIZA EL RENDIMIENTO
              </Text>
            </h3>
            <Col cols={{ lgPush: 1, lg: 10, md: 6, sm: 4 }} className="mx-auto mt-4">
              <p data-aos="fade-up" data-aos-duration="1500">
                <Text variant="body" color="#FFFFFF" className="opacity-80">
                  Nuestra arquitectura de desarrollo es de clase mundial. Combinamos las tecnologías más rápidas, y escalables del mercado con herramientas de Inteligencia Artificial de vanguardia para garantizar la máxima calidad, eficiencia y seguridad en cada línea de código.
                </Text>
              </p>
            </Col>
          </Col>

          {/* Row 1: 3 cards */}
          {[
            { icon: 'Code', color: '#E1FF00', title: 'Stack Principal', desc: 'Next JS | React Native | Vercel\nSupabase | AWS S3' },
            { icon: 'Sparkles', color: '#FF5B00', title: 'Herramientas AI', desc: 'Stitch | Gemini | NotebookLM\nClaude Code | Nano Banana' },
            { icon: 'Gauge', color: '#00E5FF', title: 'Velocidad Ultra-Rápida', desc: 'Fundamental para SEO y UX.' },
          ].map((tech, index) => (
            <Col key={index} cols={{ lg: 4, md: 2, sm: 4 }} data-aos="fade-up" data-aos-duration="1500">
              <div className="border border-[#003333] rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#16141F', border: `1px solid ${tech.color}` }}>
                    <Icon name={tech.icon as any} color={tech.color} size={20} />
                  </div>
                  <Text variant="subtitle" color={tech.color} weight="bold">
                    {tech.title}
                  </Text>
                </div>
                <Text variant="body" color="#FFFFFF" className="opacity-80 whitespace-pre-line">
                  {tech.desc}
                </Text>
              </div>
            </Col>
          ))}

          {/* Row 2: 2 cards */}
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="mt-8" />
          {[
            { icon: 'Sprout', color: '#FF00FF', title: 'Escalabilidad Total', desc: 'Su plataforma evoluciona con su crecimiento.' },
            { icon: 'ShieldCheck', color: '#E1FF00', title: 'Seguridad Máxima', desc: 'Infraestructura estable y blindada.' },
          ].map((tech, index) => (
            <Col key={`row2-${index}`} cols={{ lg: 4, md: 3, sm: 4 }} data-aos="fade-up" data-aos-duration="1500">
              <div className="border border-[#003333] rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#16141F', border: `1px solid ${tech.color}` }}>
                    <Icon name={tech.icon as any} color={tech.color} size={20} />
                  </div>
                  <Text variant="subtitle" color={tech.color} weight="bold">
                    {tech.title}
                  </Text>
                </div>
                <Text variant="body" color="#FFFFFF" className="opacity-80">
                  {tech.desc}
                </Text>
              </div>
            </Col>
          ))}
        </Container>
      </section>

      {/* El Sistema Cítrica */}
      <section className="py-20 hero-background-image">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2 data-aos="fade-up" data-aos-duration="1500">
              <Text variant="subtitle" color="#FF5B00" >
                La Diferenciación y Agilidad
              </Text>
            </h2>
            <h3 className="" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="title" color="#FFFFFF" weight="bold">
                EL SISTEMA CÍTRICA
              </Text>
            </h3>
            <Col cols={{ lgPush: 2, lg: 8, md: 6, sm: 4 }} className="mx-auto mt-4">
              <p data-aos="fade-up" data-aos-duration="1500">
                <Text variant="body" color="#FFFFFF" className="opacity-80">
                  Nuestra agilidad es un diferenciador clave, pero nunca sacrificamos la calidad.
                </Text>
              </p>
            </Col>
          </Col>

          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="relative max-w-3xl mx-auto">
              {/* Línea central */}
              <div className="absolute left-1/2 h-full w-0.5 bg-white opacity-30 -translate-x-1/2"></div>

              {/* Item 1: Design System Propio - texto a la izquierda */}
              <div className="relative mb-16 flex items-center w-full" data-aos="fade-up" data-aos-duration="1500">
                <div className="w-1/2 pr-12 text-right">
                  <h4 className="mb-2">
                    <Text variant="subtitle" color="#FF5B00" weight="bold">
                      Design System Propio
                    </Text>
                  </h4>
                  <Text variant="body" color="#FFFFFF" className="opacity-80">
                    Hemos creado una librería de componentes y un Design System multipropósito que acelera el desarrollo y asegura la coherencia.
                  </Text>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-[#16141F] p-3 rounded-full border-2 border-[#FF5B00] z-10">
                  <Icon name="PenLine" color="#FF5B00" size={24} />
                </div>
                <div className="w-1/2"></div>
              </div>

              {/* Item 2: Tokens de Diseño - texto a la derecha */}
              <div className="relative mb-16 flex items-center w-full" data-aos="fade-up" data-aos-duration="1500">
                <div className="w-1/2"></div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-[#16141F] p-3 rounded-full border-2 border-[#00E5FF] z-10">
                  <Icon name="Braces" color="#00E5FF" size={24} />
                </div>
                <div className="w-1/2 pl-12 text-left">
                  <h4 className="mb-2">
                    <Text variant="subtitle" color="#00E5FF" weight="bold">
                      Tokens de Diseño
                    </Text>
                  </h4>
                  <Text variant="body" color="#FFFFFF" className="opacity-80">
                    Nos permiten una customización total e ilimitada en cada proyecto, sin necesidad de reescribir código base.
                  </Text>
                </div>
              </div>

              {/* Item 3: AI + Criterio Humano - texto a la izquierda */}
              <div className="relative flex items-center w-full" data-aos="fade-up" data-aos-duration="1500">
                <div className="w-1/2 pr-12 text-right">
                  <h4 className="mb-2">
                    <Text variant="subtitle" color="#E1FF00" weight="bold">
                      AI + Criterio Humano
                    </Text>
                  </h4>
                  <Text variant="body" color="#FFFFFF" className="opacity-80">
                    La Inteligencia Artificial nos asiste en el prototipado, generando textos e imágenes preliminares para que usted defina contenidos rápidamente y aseguremos una entrega ágil. Su calidad siempre está supervisada por nuestro equipo experto.
                  </Text>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-[#16141F] p-3 rounded-full border-2 border-[#E1FF00] z-10">
                  <Icon name="Sparkles" color="#E1FF00" size={24} />
                </div>
                <div className="w-1/2"></div>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Process - comentado temporalmente
      <section id="process" className="py-20 bg-white">
        <Container>
          <div className="space-y-12">
            <Col
              cols={{ lgPush: 2, lg: 8, md: 6, sm: 4 }}
              className="text-center mb-12"
            >
              <div className="text-center space-y-4">
                <h2 data-aos="fade-up" data-aos-duration="1500">
                  <Text variant="headline" color="#FF5B00" weight="bold">
                    Nuestro Proceso de Trabajo
                  </Text>
                </h2>
                <p data-aos="fade-up" data-aos-duration="1500">
                  <Text variant="body" color="#16141F" className="opacity-90">
                    Seguimos una metodología probada que garantiza la entrega
                    exitosa de tu proyecto, desde la conceptualización hasta el
                    soporte post-lanzamiento
                  </Text>
                </p>
              </div>
            </Col>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative"
              data-aos="fade-up"
              data-aos-duration="1500"
            >
              {process.map((step, index) => (
                <div key={index} className="relative">
                  <div className="relative p-8 h-full border-2 rounded-xl hover:shadow-xl transition-all duration-500 group-hover:scale-105 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm hover:from-white/20 hover:to-white/10">
                    <div
                      className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-10"
                      style={{ backgroundColor: step.color }}
                    >
                      <Text
                        variant="body"
                        color="#16141F"
                        className="font-bold"
                      >
                        {step.step}
                      </Text>
                    </div>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="p-3 rounded-lg shadow-sm"
                          style={{ backgroundColor: "#16141F" }}
                        >
                          <Icon
                            name={step.icon as any}
                            size={24}
                            className="w-6 h-6"
                            style={{ color: step.color }}
                          />
                        </div>
                        <h3>
                          <Text variant="subtitle" color="#16141F">
                            {step.title}
                          </Text>
                        </h3>
                      </div>
                      <p>
                        <Text
                          variant="body"
                          color="#16141F"
                          className="opacity-80 leading-relaxed"
                        >
                          {step.description}
                        </Text>
                      </p>
                    </div>
                    {index < process.length - 1 && index % 3 !== 2 && (
                      <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-0">
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <div
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                          style={{
                            backgroundColor: process[index + 1]?.color,
                          }}
                        ></div>
                      </div>
                    )}
                    {index < process.length - 1 && index % 2 !== 1 && (
                      <div className="hidden md:block lg:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-0">
                        <div className="h-8 w-0.5 bg-gray-300"></div>
                        <div
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                          style={{
                            backgroundColor: process[index + 1]?.color,
                          }}
                        ></div>
                      </div>
                    )}
                    {index < process.length - 1 && (
                      <div className="block md:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-0">
                        <div className="h-8 w-0.5 bg-gray-300"></div>
                        <div
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                          style={{
                            backgroundColor: process[index + 1]?.color,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
      */}

      {/* Contact Section */}
      <section id="contacto">
       <ContactSectionLanding variant="home" layout="landing"/>

      </section>
      <FooterCitrica />
    </div>
  );
};

export default CitricaWebsite;
