"use client";
import React, { useEffect, useState } from "react";
import { Header } from "@citrica-ui";
import { Text, Button, Container, Col, Icon } from "citrica-ui-toolkit";
import CurvedLoop from "./versions/yolanda/components/CurvedLoop";
import DotGrid from "./versions/yolanda/components/DotGrid";

import GradientText from "@/shared/components/project-components/gradient-text";
import "aos/dist/aos.css";
import AOS from "aos";
import {
  services,
  technologies,
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
      href: "/panel",
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
        className="min-h-screen relative overflow-hidden hero-background-image flex items-center"
      >
        <div className="absolute inset-0 -z-80">
          <DotGrid
            dotSize={4}
            gap={16}
            baseColor="#006666"
            activeColor="#E1ff00"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
        <Container>
          <Col
            cols={{ lg: 10, md: 6, sm: 4 }}
            className="text-center mx-auto"
          >
            <div className="bg-black/20 backdrop-blur-sm border-2 border-[#003333] rounded-2xl p-8">
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
            </div>
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

      {/* Equipo */}
      <section className="py-20" style={{ backgroundColor: '#0A0F0F' }}>
        <Container>
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
              <p className="mt-2" data-aos="fade-up" data-aos-duration="1500">
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

      {/* Services Grid */}
      <section id="servicios" className="hero-background-image-flip">
        <Container className="py-20">
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="mb-6 flex items-center justify-center text-center"
          >
            <h2 data-aos="fade-up" data-aos-duration="1500">
              <Text
                variant="headline"
                color="#FF5B00"
                weight="bold"
                data-aos="fade-up"
                data-aos-duration="1500"
              >
                Innovando en cada Solución
              </Text>
            </h2>
          </Col>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            noPadding
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
          >
            {services.map((service, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-duration="1500"
                className="bg-black/20 backdrop-blur-xl border-2 border-[#003333] rounded-2xl p-6 flex flex-col items-center text-center "
              >
                <div
                  className="mb-4 flex items-center justify-center"
                  style={{
                    backgroundColor: "#16141F",
                    width: "48px",
                    height: "48px",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    name={service.icon as any}
                    color={service.color}
                    size={32}
                  />
                </div>
                <h2 className="mb-4">
                  <GradientText
                    colors={service.gradientColors}
                    animationSpeed={3}
                    showBorder={false}
                  >
                    <Text variant="subtitle" weight="bold" className="">
                      {service.title}
                    </Text>
                  </GradientText>
                </h2>
                <Text variant="body" color="#ffffff" className="opacity-80">
                  {service.description}
                </Text>
                <div
                  className="mt-8 h-1 w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${service.color}00, ${service.color}, ${service.color}00)`,
                  }}
                />
              </div>
            ))}
          </Col>
        </Container>
      </section>

      {/* About Us */}
      <section className="py-20 hero-background-image">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2 className="mb-6" data-aos="fade-up" data-aos-duration="1500">
              <Text
                variant="headline"
                color="#FF5B00"
                weight="bold"
                className=""
              >
                ¿Quiénes somos?
              </Text>
            </h2>
            <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto">
              <p
                className="text-ch-width text-balance"
                data-aos="fade-up"
                data-aos-duration="1500"
              >
                <Text variant="body" color="#FFFFFF" className="opacity-90">
                  Somos un equipo de desarrolladores y diseñadores apasionados
                  por crear experiencias digitales excepcionales que transforman
                  negocios.
                </Text>
              </p>
            </Col>
          </Col>

          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div
              className="relative max-w-4xl mx-auto"
              data-aos="fade-up"
              data-aos-duration="1500"
            >
              {/* Línea central */}
              <div className="absolute left-1/2 h-full w-0.5 bg-white opacity-50 -translate-x-1/2"></div>

              <div className="relative mb-12 flex items-center w-full">
                <div className="w-1/2 pr-12 text-right">
                  <h3 className="mb-2">
                    <Text variant="subtitle" color="#FF5B00" weight="bold">
                      Equipo Experto
                    </Text>
                  </h3>
                  <Text variant="body" color="#FFFFFF" className="opacity-80">
                    Desarrolladores senior con amplia experiencia
                  </Text>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-[#16141F] p-3 rounded-full border-2 border-[#FF5B00]">
                  <Icon name="Users" color="#FF5B00" size={32} />
                </div>
                <div className="w-1/2"></div>
              </div>

              <div className="relative mb-12 flex items-center w-full">
                <div className="w-1/2"></div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-[#16141F] p-3 rounded-full border-2 border-[#00FFFF]">
                  <Icon name="Award" color="#00FFFF" size={32} />
                </div>
                <div className="w-1/2 pl-12 text-left">
                  <h3 className="mb-2">
                    <Text variant="subtitle" color="#00FFFF" weight="bold">
                      Calidad Garantizada
                    </Text>
                  </h3>
                  <Text variant="body" color="#FFFFFF" className="opacity-80">
                    Procesos de calidad certificados y mejores prácticas
                  </Text>
                </div>
              </div>

              <div className="relative mb-12 flex items-center w-full">
                <div className="w-1/2 pr-12 text-right">
                  <h3 className="mb-2">
                    <Text variant="subtitle" color="#E1FF00" weight="bold">
                      Innovación Constante
                    </Text>
                  </h3>
                  <Text variant="body" color="#FFFFFF" className="opacity-80">
                    Siempre a la vanguardia de las últimas tecnologías
                  </Text>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-[#16141F] p-3 rounded-full border-2 border-[#E1FF00]">
                  <Icon name="Zap" color="#E1FF00" size={24} />
                </div>
                <div className="w-1/2"></div>
              </div>
            </div>
          </Col>
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
          {/* Título principal */}
          <Col
            cols={{ lgPush: 2, lg: 8, md: 6, sm: 4 }}
            className="text-center mb-12"
          >
            <h2 className="mb-6" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="headline" color="#FF5B00" weight="bold">
                Tecnología de punta para resultados excepcionales
              </Text>
            </h2>
            <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto">
              <p data-aos="fade-up" data-aos-duration="1500">
                <Text variant="body" color="#FFFFFF" className="opacity-90">
                  En Cítrica, utilizamos un conjunto de tecnologías de
                  vanguardia para garantizar que tus productos digitales sean de
                  la más alta calidad:
                </Text>
              </p>
            </Col>
          </Col>

          {/* Grid de tecnologías */}
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            noPadding
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-md border-4 transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ borderColor: tech.color }}
                data-aos="fade-up"
                data-aos-duration="1500"
              >
                {/* Icono */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: tech.color }}
                >
                  <Icon name={tech.icon as any} color="#16141F" size={24} />
                </div>

                {/* Título */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  <Text variant="body" color="#16141F" weight="bold">
                    {tech.title}
                  </Text>
                </h3>

                {/* Descripción */}
                <p
                  className="text-description text-gray-600 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: tech.description }}
                ></p>
              </div>
            ))}
          </Col>

          {/* Texto final */}
          <div className="text-center mt-10 max-w-3xl mx-auto">
            <p
              className="text-white text-sm"
              data-aos="fade-up"
              data-aos-duration="1500"
            >
              <Text variant="body" color="#ffffff" weight="bold">
                Estas herramientas nos permiten crear productos digitales de
                alto rendimiento, escalables y fáciles de mantener, asegurando
                una experiencia excepcional para tus usuarios.
              </Text>
            </p>
          </div>
        </Container>
      </section>

      {/* Process */}
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
                    {/* Step Number */}
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

                    {/* Connection Line for larger screens - solo en desktop */}
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

                    {/* Connection Line vertical para el layout de 2 columnas */}
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

                    {/* Connection Line vertical para mobile */}
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

      {/* Contact Section */}
      <section id="contacto">
       <ContactSectionLanding variant="home"/>

      </section>
      <FooterCitrica />
    </div>
  );
};

export default CitricaWebsite;
