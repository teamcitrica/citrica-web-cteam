"use client";
import React, { useEffect, useState } from "react";
import { Container, Col } from "@/styles/07-objects/objects";
import { Text, Icon, Button } from "@citrica-ui";
import CurvedLoop from "./versions/yolanda/components/CurvedLoop";
import { Divider, Link } from "@heroui/react";
import DotGrid from "./versions/yolanda/components/DotGrid";
import AnimatedHeadlines from "./home/components/animatedheadlines";
import GradientText from "@/shared/components/project-components/gradient-text";
import "aos/dist/aos.css";
import AOS from "aos";
import { services, projects, otherProjects, technologies, process, stats } from "@/shared/archivos js/citrica-data";

const CitricaWebsite = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);



  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0F0F" }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/80 bg-opacity-80 backdrop-blur-sm ">
        <Container className="py-2">
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            noPadding
            className="flex justify-between items-center pt-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-24 h-17">
                <img
                  src="/img/citrica-logo.png"
                  alt="Logo Cítrica"
                  className="h-12"
                />
              </div>
            </div>

            <div className="hidden lg:flex space-x-8">
              <a href="#inicio" className="hover:opacity-80 transition-opacity">
                <Text variant="body" color="#FFFFFF">
                  Inicio
                </Text>
              </a>
              <a
                href="#servicios"
                className="hover:opacity-80 transition-opacity"
              >
                <Text variant="body" color="#FFFFFF">
                  Servicios
                </Text>
              </a>
              <a
                href="#proyectos"
                className="hover:opacity-80 transition-opacity"
              >
                <Text variant="body" color="#FFFFFF">
                  Proyectos
                </Text>
              </a>
              <a
                href="#contacto"
                className="hover:opacity-80 transition-opacity"
              >
                <Text variant="body" color="#FFFFFF">
                  Contacto
                </Text>
              </a>
            </div>
            {/* Right side - action button + hamburger on small screens only */}
            <div className="flex items-center md:justify-end">
              <div className="hidden md:block">
                <Button
                  onClick={() =>
                    document
                      .getElementById("contacto")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  label="Hablemos"
                  variant="primary"
                />
              </div>
              <div className="md:hidden ml-4">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <Icon
                    name={isMenuOpen ? "X" : "Menu"}
                    color="#FFFFFF"
                    size={24}
                  />
                </button>
              </div>
            </div>
            {/* Mobile Menu - visible on small screens */}
            <div
              className={`fixed top-0 right-0 h-screen w-64 bg-black/90 backdrop-blur-lg p-6 flex flex-col items-start gap-6 transform transition-transform duration-500 ease-in-out z-50 ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-6 right-6"
                aria-label="Cerrar menú"
              >
                <Icon name="X" color="#FFFFFF" size={28} />
              </button>

              <a
                href="#inicio"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#FFFFFF">
                  Inicio
                </Text>
              </a>
              <a
                href="#servicios"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#FFFFFF">
                  Servicios
                </Text>
              </a>
              <a
                href="#proyectos"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#FFFFFF">
                  Proyectos
                </Text>
              </a>
              <a
                href="#contacto"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#FFFFFF">
                  Contacto
                </Text>
              </a>

              {/* Botón CTA */}
              <Button
                onClick={() => {
                  setIsMenuOpen(false);
                  document
                    .getElementById("contacto")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                label="Hablemos"
                variant="primary"
              />
            </div>
          </Col>
        </Container>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="min-h-screen relative overflow-hidden hero-background-image">
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
            className="text-center mx-auto mt-[25vh]"
          >
            <div className="bg-black/20 backdrop-blur-sm border-2 border-[#003333] rounded-2xl mb-14 p-8">
              <h1 className="text-balance">
                <Text variant="display" color="#FF5B00" weight="bold">
                  APLICACIONES WEB Y MÓVILES A MEDIDA
                </Text>
              </h1>
              <h3 className="text-balance mb-8">
                <Text variant="headline" color="#FFFFFF" weight="bold">
                  para impulsar tu negocio
                </Text>
              </h3>
              <AnimatedHeadlines />
            </div>
          </Col>
        </Container>
        <Button
          onClick={() =>
            document
              .getElementById("contacto")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          label="CONÓCENOS AHORA"
          variant="primary"
          textVariant="body"
          className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 img-boton-hero "
        />
      </section>

      {/* Services Grid */}
      <section className="hero-background-image-flip">
        <Container className="py-20">
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="mb-6 flex items-center justify-center text-center"
          >
            <h2
              data-aos="fade-up"
              data-aos-duration="1500">
              <Text
                variant="headline"
                color="#FF5B00"
                weight="bold"
                data-aos="fade-up"
                data-aos-duration="1500"
              >
                Nuestros servicios
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

      <section id="servicios">
        <Container noPadding noLimit>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            noPadding
            className="flex justify-center p-0"
          >
            <CurvedLoop
              marqueeText="Tiendas en línea • Mercados • Aplicaciones de streaming • Sitios web a medida • Landing pages • Implementación de IA • CRM • ERP • Herramientas de gestión de proyectos •"
              speed={1}
              curveAmount={0}
              direction="right"
              interactive={true}
              className="custom-text-style"
            />
          </Col>
        </Container>
      </section>

      {/* Value Proposition */}
      <section id="valores" className="bg-color-ct-white py-20">
        <Container>
          {/* Íconos animados con contadores e información */}
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center mb-10">
              <div
                className="w-32 h-32 mx-auto mb-6 bg-color-ct-primary rounded-full flex items-center justify-center animate-spin-slow"
                data-aos="fade-up"
                data-aos-duration="1500"
              >
                <Icon name="Rocket" color="#FFFFFF" size={48} />
              </div>
              <h2 data-aos="fade-up" data-aos-duration="1500">
                <Text variant="title" color="#16141F" weight="bold" >
                  Impulsamos tu crecimiento digital
                </Text>
              </h2>
            </div>

            {/* Stats Icons */}
            <Col
              cols={{ lg: 12, md: 4, sm: 4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center hover:scale-105 transition-transform duration-300"
                >
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-full bg-color-ct-secondary flex items-center justify-center"
                    data-aos="fade-up"
                    data-aos-duration="1500"
                  >
                    <Icon
                      name={stat.icon as any}
                      className="text-[#16141F]"
                      size={24}
                    />
                  </div>
                  <div
                    className="text-2xl font-bold text-[#16141F] mb-1"
                    data-aos="fade-up"
                    data-aos-duration="1500"
                  >
                    {stat.number}
                    {stat.suffix}
                  </div>
                  <div
                    className="text-sm text-[#16141F]/80 font-medium"
                    data-aos="fade-up"
                    data-aos-duration="1500"
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </Col>
          </Col>
        </Container>
      </section>

      {/* About Us */}
      <section className="py-20 hero-background-image">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2 className="mb-6" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="headline" color="#FF5B00" weight="bold" className="">
                ¿Quiénes somos?
              </Text>
            </h2>
            <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto">
              <p className="text-ch-width text-balance" data-aos="fade-up" data-aos-duration="1500">
                <Text variant="body" color="#FFFFFF" className="opacity-90">
                  Somos un equipo de desarrolladores y diseñadores apasionados
                  por crear experiencias digitales excepcionales que transforman
                  negocios.
                </Text>
              </p>
            </Col>
          </Col>

          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="relative max-w-4xl mx-auto" data-aos="fade-up" data-aos-duration="1500">
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
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2 className="mb-6" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="headline" color="#FFFFFF" weight="bold">
                Últimos proyectos
              </Text>
            </h2>
            <p data-aos="fade-up" data-aos-duration="1500">
              <Text variant="body" color="#E5FFFF">
                Conoce algunos de nuestros trabajos más recientes
              </Text>
            </p>
          </Col>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherProjects.map((otherProjects, index) => (
              <article
                key={otherProjects.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border-[2px] border-[#E1FF0022]"
              >
                {/* Imagen placeholder */}
                <div className="h-48 gradient-project-hero flex items-center justify-center">
                  <img
                    src={otherProjects.image}
                    alt={otherProjects.title}
                    className="object-contain h-full"
                  />
                </div>

                <div className="p-6">
                  {/* Categoría */}
                  <div className="inline-block px-3 py-1 bg-[#E1FF00]/20 border border-[#E1FF00]/30 rounded-full mb-4">
                    <Text variant="label" color="#E1FF00">
                      {otherProjects.category}
                    </Text>
                  </div>

                  {/* Título */}
                  <h3 className="mb-3">
                    <Text variant="subtitle" color="#FFFFFF">
                      {otherProjects.title}
                    </Text>
                  </h3>

                  {/* Descripción */}
                  <p className="mb-4">
                    <Text
                      variant="body"
                      color="#FFFFFFBB"
                      className="leading-relaxed"
                    >
                      {otherProjects.description}
                    </Text>
                  </p>

                  {/* Botón */}
                  <Link href={otherProjects.link} className="w-full">
                    <Button
                      onClick={() => { }}
                      label="Ver Detalles"
                      variant="secondary"
                      fullWidth
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Technologies Section */}
      <section id="technologies" className="pb-20 pt-20 hero-background-image-flip">
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
                  En Cítrica, utilizamos un conjunto de tecnologías de vanguardia
                  para garantizar que tus productos digitales sean de la más alta
                  calidad:
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
            <p className="text-white text-sm" data-aos="fade-up" data-aos-duration="1500">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative" data-aos="fade-up" data-aos-duration="1500">
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

      {/* CTA Section */}
      <section
        id="contacto"
        className="py-20"
        style={{ backgroundColor: "#E1FF00" }}
      >
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mx-auto">
            <h2 className="mb-6" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="headline" color="#16141F" weight="bold">
                ¿Listo para transformar tu negocio?
              </Text>
            </h2>
            <div className="mb-8" data-aos="fade-up" data-aos-duration="1500">
              <Text variant="body" color="#16141F" className="opacity-80">
                Contáctanos hoy y descubre cómo podemos impulsar tu crecimiento
                digital
              </Text>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8" data-aos="fade-up" data-aos-duration="1500">
              <Button
                onClick={() =>
                  window.open("mailto:admin@citrica.dev", "_blank")
                }
                label="Escribir Email"
                variant="primary"
              />
              <Button
                onClick={() =>
                  window.open("https://wa.me/51942627383", "_blank")
                }
                label="WhatsApp"
                variant="primary"
              />
            </div>
            <div className="flex flex-col justify-center items-center gap-1" data-aos="fade-up" data-aos-duration="1500">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" color="#16141F" size={20} />
                <Link href="mailto:admin@citrica.dev">
                  <Text variant="body" color="#16141F" weight="bold">
                    contacto@citrica.com
                  </Text>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Phone" color="#16141F" size={20} />
                <Link
                  href="tel:+51942627383"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Text variant="body" color="#16141F" weight="bold">
                    +51 942 627-383
                  </Text>
                </Link>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Footer */}
      <footer
        className="pt-12"
        style={{
          backgroundColor: "#16141F",
          borderTop: "1px solid rgba(225, 255, 0, 0.2)",
        }}
      >
        <Container>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="flex flex-col text-center justify-center gap-2"
          >
            <div className="flex items-center justify-center lg:justify-center space-x-2">
              <div className="w-24 h-16">
                <img src="/img/citrica-logo.png" alt="Logo Cítrica" />
              </div>
            </div>
            <h2 className="mb-8 lg:text-center md:text-center">
              <Text variant="label" color="#FFFFFF" className="opacity-70">
                Transformamos ideas en soluciones digitales que impulsan el
                crecimiento de tu negocio.
              </Text>
            </h2>
          </Col>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mt-8">
            <Divider className="mb-8 bg-gray-800" />
            <div className="flex justify-center">
              <h2 className="mb-8">
                <Text variant="label" color="#FFFFFF" className="opacity-50">
                  © 2025 Cítrica.
                </Text>
              </h2>
            </div>
          </Col>
        </Container>
      </footer>
    </div>
  );
};

export default CitricaWebsite;