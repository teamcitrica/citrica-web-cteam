"use client";
import React, { useState } from "react";
import { Container, Col } from "@/styles/07-objects/objects";
import { Text, Icon, Button } from "@citrica-ui";
import CurvedLoop from "./versions/yolanda/components/CurvedLoop";
import { Divider, Link } from "@heroui/react";
import DotGrid from "./versions/yolanda/components/DotGrid";
import AnimatedHeadlines from "./home/components/animatedheadlines";

const CitricaWebsite = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const services = [
    {
      title: "Landing Pages",
      description:
        "Convierte visitantes en clientes con páginas de aterrizaje de alto impacto.",
      icon: "Globe",
      color: "#E1FF00",
    },
    {
      title: "Websites",
      description:
        "Posiciona tu marca y atrae nuevos clientes con un sitio web profesional.",
      icon: "Monitor",
      color: "#00FFFF",
    },
    {
      title: "Web Apps",
      description:
        "Optimiza tus procesos con aplicaciones web intuitivas y funcionales.",
      icon: "Code",
      color: "#FF5B00",
    },
    {
      title: "Mobile Apps",
      description:
        "Apps móviles para conectar tu negocio con tus clientes, al instante.",
      icon: "Smartphone",
      color: "#FF00D4",
    },
    {
      title: "Integración de IA",
      description:
        "Automatiza procesos y toma decisiones más inteligentes.",
      icon: "Sparkles",
      color: "#E1FF00",
    },
  ];

  const projects = [
    {
      title: "BGood",
      description:
        "Plataforma Inteligente para la Gestión Integral de Suministros en Edificios.",
      tech: "React • Node.js • MongoDB",
      image: "/e-commerce.png",
    },
    {
      title: "Sistema ERP",
      description:
        "Sistema integral de gestión empresarial para medianas empresas",
      tech: "Vue.js • Laravel • MySQL",
      image: "/dashboard.png",
    },
    {
      title: "App de Delivery",
      description: "Aplicación móvil para delivery con tracking en tiempo real",
      tech: "React Native • Firebase • Google Maps",
      image: "/delivery.png",
    },
  ];

  const otherProjects = [
    {
      id: 1,
      image: "/img/bgood-hero-img.png",
      title: "BGood",
      description:
        "Plataforma Inteligente para la Gestión Integral de Suministros en Edificios.",
      tech: ["React", "Node.js", "PostgreSQL"],
      category: "E-commerce",
      link: "/project-bgood",
    },
    {
      id: 2,
      image: "/img/miollita-hero-img-lg.png",
      title: "MiOllita Mobile App",
      description:
        "App para ayudar a decidir qué cocinar y planificar las comidas.",
      tech: ["Vue.js", "Python", "MongoDB"],
      category: "Mobile App",
      link: "/project-miollita",
    },
    {
      id: 3,
      image: "/img/cojones-hero-img.png",
      title: "Co.Jones",
      description: "Web Estratégico para Captación de Clientes",
      tech: ["Next.js", "Express", "MySQL"],
      category: "Website",
      link: "/project-cojones",
    },
  ];

  const technologies = [
    {
      title: "Presentaciones que inspiran",
      description:
        "<strong>Figma</strong> permite la colaboración en tiempo real, <strong>prototipos interactivos</strong>, diseños visualmente atractivos y <strong>acceso desde cualquier lugar</strong>, asegurando que tus presentaciones sean tan profesionales y convincentes como tus productos digitales.",
      icon: "Presentation",
      color: "#E1FF00",
    },
    {
      title: "Front-end robusto",
      description:
        "<strong>HTML5, CSS3 y SASS</strong> para <strong>interfaces modernas y responsivas</strong>. <strong>TypeScript</strong> para un código <strong>más seguro y mantenible</strong>. <strong>ReactJS y Next.js</strong> para aplicaciones <strong>web rápidas y dinámicas.</strong>",
      icon: "Layers",
      color: "#00FFFF",
    },
    {
      title: "Desarrollo móvil eficiente",
      description:
        "<strong>React Native</strong> para crear aplicaciones nativas para <strong>iOS</strong> y <strong>Android</strong> con un solo código base.",
      icon: "Smartphone",
      color: "#FF5B00",
    },
    {
      title: "Back-end potente",
      description:
        "<strong>Strapi</strong> para una <strong>gestión de contenido</strong> flexible y escalable. <strong>PostgreSQL</strong> para <strong>bases de datos seguras y confiables.</strong> <strong>AWS S3</strong> para un <strong>almacenamiento</strong> en la nube <strong>seguro.</strong>",
      icon: "Server",
      color: "#E1FF00",
    },
  ];

  const process = [
    {
      step: "01",
      icon: "ClipboardList",
      title: "Planificación",
      description: "Definimos objetivos y estrategia del proyecto",
      color: "#e1ff00",
    },
    {
      step: "02",
      icon: "Palette",
      title: "Diseño",
      description: "Creamos prototipos y experiencias de usuario",
      color: "#ff5b00",
    },
    {
      step: "03",
      icon: "Code",
      title: "Desarrollo",
      description: "Construimos tu solución con las mejores tecnologías",
      color: "#00FFFF",
    },
    {
      step: "04",
      icon: "TestTube",
      title: "Pruebas",
      description: "Validamos calidad y rendimiento exhaustivamente",
      color: "#FF00D4",
    },
    {
      step: "05",
      icon: "Rocket",
      title: "Implementación",
      description: "Desplegamos tu proyecto de forma segura",
      color: "#E1FF00",
    },
    {
      step: "06",
      icon: "Headphones",
      title: "Soporte",
      description: "Mantenimiento continuo y evolución constante",
      color: "#FF5B00",
    },
  ];

  const stats = [
    // { icon: "CheckCircle", number: 150, suffix: "+", label: "Proyectos Entregados" },
    {
      icon: "CheckCircle",
      number: 98,
      suffix: "%",
      label: "Clientes Satisfechos",
    },
    { icon: "CheckCircle", number: 24, suffix: "/7", label: "Soporte activo" },
    {
      icon: "CheckCircle",
      number: 10,
      suffix: "x",
      label: "Velocidad de entrega",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#16141F" }}>
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
      <section
        id="inicio"
        className="min-h-screen pt-44 relative overflow-hidden"
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
            className="text-center mx-auto mb-12"
          >
            <div className="mb-14 bg-opacity-10 backdrop-blur-sm p-8 rounded-3xl border border-white border-opacity-10">
              <AnimatedHeadlines />
              
              <Button
                onClick={() =>
                  document
                    .getElementById("contacto")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                label="CONÓCENOS AHORA"
                variant="primary"
                textVariant="body"
                className="mt-9"
              />
            </div>
          </Col>
        </Container>

        {/* Services Grid */}
        <Container className="bg-opacity-10 backdrop-blur-sm p-8 rounded-3xl border border-white border-opacity-10">
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="mb-6 flex items-center justify-center text-center"
          >
            <Text variant="headline" color="#FF5B00" weight="bold">
              Nuestros servicios
            </Text>
          </Col>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
          >
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300 hover:transform hover:scale-105 flex flex-col items-center text-center"
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
                <h3 className="mb-4">
                  <Text variant="subtitle" color="#ffffff" weight="bold">
                    {service.title}
                  </Text>
                </h3>
                <Text variant="body" color="#ffffff" className="opacity-60">
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
        <Container noPadding>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="flex justify-center p-0"
          >
            <CurvedLoop
              marqueeText="Tiendas en línea • Mercados • Aplicaciones de streaming • Sitios web a medida • Landing pages • Implementación de IA • CRM • ERP • Herramientas de gestión de proyectos •"
              speed={1}
              curveAmount={0}
              direction="right"
              interactive={true}
              className="custom-text-style opacity-60"
            />
          </Col>
        </Container>
      </section>

      {/* Value Proposition */}
      <section id="valores" className="bg-color-ct-white py-12">
        <Container>
          {/* Íconos animados con contadores e información */}
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
              <div className="text-center mb-10">
                <div className="w-32 h-32 mx-auto mb-6 bg-color-ct-primary rounded-full flex items-center justify-center animate-spin-slow">
                  <Icon name="Rocket" color="#FFFFFF" size={48} />
                </div>
                <Text variant="title" color="#16141F" weight="bold">
                  Impulsamos tu crecimiento digital
                </Text>
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
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-color-ct-secondary flex items-center justify-center">
                      <Icon
                        name={stat.icon as any}
                        className="text-[#16141F]"
                        size={24}
                      />
                    </div>
                    <div className="text-2xl font-bold text-[#16141F] mb-1">
                      {stat.number}
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-[#16141F]/80 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </Col>
          </Col>
        </Container>
      </section>

      {/* About Us */}
      <section className="py-20">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2 className="mb-6">
              <Text variant="headline" color="#FF5B00" weight="bold">
                ¿Quiénes somos?
              </Text>
            </h2>
            <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto">
              <p className="text-ch-width text-balance">
                <Text variant="body" color="#FFFFFF" className="opacity-90">
                  Somos un equipo de desarrolladores y diseñadores apasionados por
                  crear experiencias digitales excepcionales que transforman
                  negocios.
                </Text>
              </p>
            </Col>
          </Col>

          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="relative max-w-4xl mx-auto">
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
            <h2 className="mb-6">
              <Text variant="headline" color="#FFFFFF" weight="bold">
                Últimos proyectos
              </Text>
            </h2>
            <p>
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

                  {/* Tecnologías */}
                  {/* <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-1 bg-[#00FFFF]/10 border border-[#00FFFF]/20 rounded text-xs"
                      >
                        <Text variant="label" color="#00FFFF">
                          {tech}
                        </Text>
                      </span>
                    ))}
                  </div> */}

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

          {/* ESTAS SON LAS CARDS ANTIGUAS , COMENTADAS POR SI SE NECESITAN LUEGO  */}
          {/* <Col cols={{ lg: 12, md: 6, sm: 4 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={index} className="bg-[#12111180] backdrop-blur-3xl border border-[#292929e6] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-105 hover:-rotate-1 animate-fade-in-up group" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="h-80 w-full overflow-hidden">
                  <img src={project.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="image-projects" />
                </div>
                <div className="p-6">
                  <h3 className="mb-2">
                    <Text variant="body" color="#FF00D4" weight="bold">
                      {project.title}
                    </Text>
                  </h3>
                  <div className="mb-3">
                    <Text variant="label" color="#FFFFFF" className="opacity-70">
                      {project.description}
                    </Text>
                  </div>
                  <div className="bg-[#16141F] px-3 py-2 rounded-lg">
                    <Text variant="label" color="#bbba9b" weight="bold">
                      {project.tech}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </Col> */}
        </Container>
      </section>

      {/* Technologies Section */}
      <section id="technologies" className="pb-20 pt-20">
        <Container>
          {/* Título principal */}
          <Col
            cols={{ lgPush: 2, lg: 8, md: 6, sm: 4 }}
            className="text-center mb-12"
          >
            <h2 className="mb-6">
              <Text variant="headline" color="#FF5B00" weight="bold">
                Tecnología de punta para resultados excepcionales
              </Text>
            </h2>
            <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto">
              <Text variant="body" color="#FFFFFF" className="opacity-90">
                En Cítrica, utilizamos un conjunto de tecnologías de vanguardia
                para garantizar que tus productos digitales sean de la más alta
                calidad:
              </Text>
            </Col>
          </Col>

          {/* Grid de tecnologías */}
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-md border-4 transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ borderColor: tech.color }}
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
            <p className="text-white text-sm">
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
                <h2>
                  <Text variant="headline" color="#FF5B00" weight="bold">
                    Nuestro Proceso de Trabajo
                  </Text>
                </h2>
                <p>
                  <Text variant="body" color="#16141F" className="opacity-90">
                    Seguimos una metodología probada que garantiza la entrega
                    exitosa de tu proyecto, desde la conceptualización hasta el
                    soporte post-lanzamiento
                  </Text>
                </p>
              </div>
            </Col>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
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
                    {index < process.length - 1 && index % 3 !== 3 && (
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
                    {index < process.length - 1 && index % 2 !== 2 && (
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
            <h2 className="mb-6">
              <Text variant="headline" color="#16141F" weight="bold">
                ¿Listo para transformar tu negocio?
              </Text>
            </h2>
            <div className="mb-8">
              <Text variant="body" color="#16141F" className="opacity-80">
                Contáctanos hoy y descubre cómo podemos impulsar tu crecimiento
                digital
              </Text>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
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
            <div className="flex flex-col justify-center items-center gap-1">
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
              {/* <div className="flex justify-center lg:justify-end space-x-6 mb-8">
                <Link
                  href="https://www.facebook.com/citrica"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Instagram" color="#E5FFFF" size={24} className="transition-all duration-300" />
                </Link>
                <Link
                  href="https://www.facebook.com/citrica"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Twitter" color="#E5FFFF" size={24} className="transition-all duration-300" />
                </Link>
                <Link
                  href="https://www.facebook.com/citrica"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Linkedin" color="#E5FFFF" size={24} className="transition-all duration-300" />
                </Link>
                <Link
                  href="https://www.facebook.com/citrica"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Github" color="#E5FFFF" size={24} className="transition-all duration-300" />
                </Link>
              </div> */}
            </div>
          </Col>
        </Container>
      </footer>
    </div>
  );
};

export default CitricaWebsite;
