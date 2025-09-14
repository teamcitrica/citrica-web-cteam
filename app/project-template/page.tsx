"use client";
import React, { useState } from "react";
import { Container, Col } from "@citrica/objects";
import Text from "@ui/atoms/text";
import Icon from "@ui/atoms/icon";
import Button from "@ui/molecules/button";
import { addToast } from "@heroui/toast";
import { Divider, Link } from "@heroui/react";


const ProjectTemplate = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleContactClick = () => {
    addToast({
      title: "¡Gracias por tu interés!",
      description: "En breve nos pondremos en contacto contigo",
      color: "success",
      radius: "sm",
    });
  };

  const technologies = [
    { name: "React", icon: "Code", color: "#E1FF00" },
    { name: "Node.js", icon: "Server", color: "#00FFFF" },
    { name: "MongoDB", icon: "Database", color: "#FF5B00" },
    { name: "TypeScript", icon: "FileCode", color: "#E1FF00" },
    { name: "AWS", icon: "Cloud", color: "#00FFFF" },
  ];

  const features = [
    "Sistema de autenticación completo",
    "Dashboard interactivo con métricas en tiempo real",
    "API REST escalable y documentada",
    "Interfaz responsive y moderna",
    "Integración con servicios de terceros",
    "Sistema de notificaciones push",
  ];

  const otherProjects = [
    {
      id: 1,
      title: "E-commerce Fashion",
      description:
        "Plataforma completa de comercio electrónico con gestión de inventario avanzada",
      tech: ["React", "Node.js", "PostgreSQL"],
      category: "E-commerce",
    },
    {
      id: 2,
      title: "FinTech Dashboard",
      description:
        "Dashboard de análisis financiero en tiempo real con visualizaciones interactivas",
      tech: ["Vue.js", "Python", "MongoDB"],
      category: "FinTech",
    },
    {
      id: 3,
      title: "HealthCare Platform",
      description: "Sistema integral de gestión médica con telemedicina",
      tech: ["Next.js", "Express", "MySQL"],
      category: "HealthTech",
    },
  ];



  return (

    <div className="min-h-screen bg-[#16141F]">

      {/* Header/Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/80 bg-opacity-80 backdrop-blur-sm ">

        <Container>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="flex justify-between items-center pt-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-24 h-16">
                <img src="/img/citrica-logo.png" alt="Logo Cítrica" />
              </div>
            </div>
            <div className="hidden lg:flex space-x-8">
              <a href="#inicio" className="hover:opacity-80 transition-opacity">
                <Text variant="body" color="#E5FFFF">
                  Inicio
                </Text>
              </a>
              <a
                href="#descripcion"
                className="hover:opacity-80 transition-opacity"
              >
                <Text variant="body" color="#E5FFFF">
                  Sobre el Proyecto
                </Text>
              </a>
              <a
                href="#solucion"
                className="hover:opacity-80 transition-opacity"
              >
                <Text variant="body" color="#E5FFFF">
                  La Solución
                </Text>
              </a>
              <a
                href="#otros-proyectos"
                className="hover:opacity-80 transition-opacity"
              >
                <Text variant="body" color="#E5FFFF">
                  Otros proyectos
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
                  label="Regresar"
                  color="primary"
                  variant="primary"
                  className="px-8 bg-[#E1FF00] rounded-[80]"
                />
              </div>
              <div className="md:hidden ml-4">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <Icon
                    name={isMenuOpen ? "X" : "Menu"}
                    color="#E5FFFF"
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
                <Icon name="X" color="#E5FFFF" size={28} />
              </button>

              <a
                href="#inicio"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#E5FFFF">
                  Inicio
                </Text>
              </a>
              <a
                href="#servicios"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#E5FFFF">
                  Servicios
                </Text>
              </a>
              <a
                href="#proyectos"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#E5FFFF">
                  Proyectos
                </Text>
              </a>
              <a
                href="#contacto"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#E5FFFF">
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
                color="primary"
                variant="primary"
                className="w-full bg-[#E1FF00] text-black rounded-[80]"
              />
            </div>
          </Col>
        </Container>
      </nav>

      {/* Hero Banner */}
      <section id="inicio" className="pt-[100] relative overflow-hidden gradient-project-hero">

        <Container className="relative z-10">
          <Col cols={{ lg: 5, md: 6, sm: 4 }}>
            <div className="h-full flex flex-col justify-center">
              {/* Categoría */}
              <div className="block w-fit px-5 py-1 bg-[#00FFFF]/20 border border-[#00FFFF]/30 rounded-full mb-5">
                <Text variant="label" color="#00FFFF">
                  E-Commerce
                </Text>
              </div>
              <header>
                <h1 className="mb-1">
                  <Text
                    variant="display"
                    weight="bold"
                    color="#FFFFFF"
                    className="leading-tight"
                  >
                    BGood
                  </Text>
                </h1>
              </header>

              <h2 className="mb-9">
                <Text variant="title" color="#00FFFF">
                  Plataforma Inteligente para la Gestión Integral de Suministros
                  en Edificios.
                </Text>
              </h2>

              <div className="flex gap-4 flex-wrap">
                <Button
                  label="Ver Demo"
                  variant="primary"
                  color="default"
                  onClick={handleContactClick}
                  className="bg-[#00FFFF] text-[#003333] hover:bg-[#E1FF00]/90 rounded-full px-5"
                />
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 7, md: 6, sm: 4 }}>
            <div className="relative">
              {/* Placeholder para imagen del proyecto */}
              <div className="w-full flex items-center justify-center">
                <img src="/img/bgood-hero-img.png" alt="Project image" className="proyect-page-hero-img-shadow" />
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Descripción del Proyecto */}
      <section id="descripcion" className="py-20 bg-white">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center bg-color-ct-tertiary-container rounded-xl p-8">
            <header>
              <h2>
                <Text variant="headline" weight="bold" color="#003333" className="mb-6">
                  Sobre el Proyecto
                </Text>
              </h2>              
            </header>
            <div className="flex justify-center bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-ch-width mt-4">
                <Text
                  variant="body"
                  color="#16141F"
                  className="leading-relaxed"
                >
                  Desarrollar e implementar una plataforma web integral que
                  permita a los administradores de edificios ofrecer a sus
                  conserjes una tienda en línea personalizada para la
                  adquisición eficiente de suministros esenciales (uniformes,
                  limpieza, oficina y ferretería). El objetivo principal es
                  optimizar todo el proceso de suministro, desde la solicitud
                  del conserje hasta la recepción conforme del pedido,
                  integrando un sistema de control de stock robusto y
                  funcionalidades avanzadas de gestión presupuestaria y
                  supervisión.
                </Text>
              </p>

              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4 bg-[#E1FF00]/10 rounded-xl border border-[#E1FF00]/20">
                  <Icon name="Users" size={32} color="#E1FF00" className="mx-auto mb-2" />
                  <Text variant="title" color="#E1FF00" className="mb-2">150+</Text>
                  <Text variant="label" color="#E5FFFF">Usuarios Activos</Text>
                </div>
                <div className="text-center p-4 bg-[#00FFFF]/10 rounded-xl border border-[#00FFFF]/20">
                  <Icon name="TrendingUp" size={32} color="#00FFFF" className="mx-auto mb-2" />
                  <Text variant="title" color="#00FFFF" className="mb-2">40%</Text>
                  <Text variant="label" color="#E5FFFF">Mejora en Eficiencia</Text>
                </div>
                <div className="text-center p-4 bg-[#FF5B00]/10 rounded-xl border border-[#FF5B00]/20">
                  <Icon name="Clock" size={32} color="#FF5B00" className="mx-auto mb-2" />
                  <Text variant="title" color="#FF5B00" className="mb-2">6</Text>
                  <Text variant="label" color="#E5FFFF">Meses de Desarrollo</Text>
                </div>
              </div> */}
            </div>
            
          </Col>          
        </Container>
      </section>

      {/* Desafío */}
      <section className="py-20 bg-[#FFFFFF]">
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="space-y-6">
              <header>
                <h2>
                  <Text variant="headline" weight="bold" color="#FF5B00">
                    El Desafío
                  </Text>
                </h2>
              </header>

              <p>
                <Text
                  variant="body"
                  color="#16141F"
                  className="leading-relaxed"
                >
                  El desafío central consistió en diseñar una solución que no
                  solo facilitara la compra y aprobación de suministros, sino
                  que también ofreciera un control exhaustivo del inventario en
                  el almacén. Esto implicó la implementación de un sistema
                  Kardex integrado para el seguimiento detallado del stock, las
                  entradas y salidas de cada artículo, evitando así
                  desabastecimientos y pérdidas. Adicionalmente, se requería la
                  creación de un flujo de trabajo intuitivo para múltiples roles
                  de usuario, la gestión de presupuestos descentralizados por
                  edificio y la provisión de herramientas de supervisión
                  efectivas para los administradores.
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="w-full h-80 bg-gradient-to-br from-[#FF5B00]/20 to-[#E1FF00]/20 rounded-2xl flex items-center justify-center border border-[#FF5B00]/30">
              <div className="text-center">
                <Icon name="Target" size={80} color="#FF5B00" />
                <div className="mt-4">
                  <Text variant="body" color="#E5FFFF" className="opacity-70">
                    [Diagrama del Problema]
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Solución */}
      <section id="solucion" className="py-20 bg-[#FFFFFF]">
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="w-full h-80 bg-gradient-to-br from-[#00FFFF]/20 to-[#E1FF00]/20 rounded-2xl flex items-center justify-center border border-[#00FFFF]/30">
              <div className="text-center">
                <Icon name="CheckCircle" size={80} color="#00FFFF" />
                <div className="mt-4">
                  <Text variant="body" color="#E5FFFF" className="opacity-70">
                    [Arquitectura de la Solución]
                  </Text>
                </div>
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="space-y-6">
              <header>
                <h2>
                  <Text variant="headline" weight="bold" color="#FF5B00">
                    La Solución
                  </Text>
                </h2>
              </header>

              <p>
                <Text
                  variant="body"
                  color="#16141F"
                  className="leading-relaxed"
                >
                  Se desarrolló una web app modular y escalable, con interfaces
                  de usuario personalizadas para conserjes, administradores,
                  supervisores y personal de almacén. Los conserjes pueden
                  realizar pedidos fácilmente a través de un catálogo intuitivo,
                  los cuales son revisados y aprobados por los administradores,
                  quienes también gestionan los presupuestos de sus edificios.
                  La implementación de un sistema Kardex permite al personal de
                  almacén mantener un control preciso del stock, registrar
                  entradas y salidas, y asegurar la disponibilidad de los
                  productos solicitados. Los supervisores tienen una visión
                  global del proceso y del cumplimiento presupuestario. El
                  sistema de notificaciones mantiene a todos los usuarios
                  informados sobre el estado de los pedidos, y la confirmación
                  de recepción cierra el ciclo de compra. La plataforma se
                  construyó con tecnologías web modernas, priorizando la
                  seguridad, la eficiencia y la mejora continua en la gestión de
                  suministros para edificios.
                </Text>
              </p>
            </div>
          </Col>
        </Container>
      </section>

      {/* Características */}
      <section className="py-20 bg-[#FFFFFF]">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12">
            <header>
              <h2>
                <Text
                  variant="headline"
                  color="#FF5B00"
                  weight="bold"
                  className="mb-6"
                >
                  Características Principales
                </Text>
              </h2>
            </header>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <ul className="list-disc">
              <li>
                Catálogo en línea de uniformes, artículos de limpieza,
                suministros de oficina y ferretería.
              </li>
              <li>Carrito de compras para seleccionar productos.</li>
              <li>Funcionalidad para generar solicitudes de pedido.</li>
              <li>Historial de pedidos realizados.</li>
              <li>Opción para crear listas de compras recurrentes.</li>
              <li>Recomendaciones personalizadas de productos (potencial).</li>
              <li>Panel de control para la gestión de la plataforma.</li>
              <li>Gestión de perfiles de edificios suscritos.</li>
              <li>
                Revisión y aprobación de pedidos por parte de los
                administradores.
              </li>
              <li>Generación automática de órdenes de compra.</li>
              <li>
                Establecimiento y gestión de límites presupuestarios anuales y
                mensuales por edificio.
              </li>
              <li>Visualización del consumo de suministros por edificio.</li>
              <li>
                Administración de cuentas de usuarios (conserjes,
                administradores, supervisores, etc.).
              </li>
              <li>Recepción y gestión de órdenes de compra en el almacén.</li>
            </ul>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <ul className="list-disc">
              <li>Interfaz para la preparación y el embalaje de pedidos.</li>
              <li>Registro y seguimiento de los despachos.</li>
              <li>Panel de supervisión con vista general de la actividad.</li>
              <li>
                Monitoreo del estado de los pedidos en los diferentes edificios.
              </li>
              <li>
                Visualización del cumplimiento presupuestario por edificio.
              </li>
              <li>Posibilidad de generar reportes sobre pedidos y gastos.</li>
              <li>
                Sistema Kardex integrado para el control y seguimiento del stock
                en el almacén.
              </li>
              <li>Sistema de notificaciones sobre el estado de los pedidos.</li>
              <li>Seguimiento en tiempo real del estado de cada pedido.</li>
              <li>
                Opción para confirmar la recepción del pedido (conforme o no
                conforme).
              </li>
              <li>Infraestructura potencial para programas de fidelización.</li>
              <li>Diseño centrado en la usabilidad.</li>
              <li>Arquitectura escalable.</li>
              <li>Medidas de seguridad para la protección de datos.</li>
            </ul>
          </Col>
        </Container>
      </section>

      {/* Tecnologías */}
      <section
        id="tecnologias"
        className="py-20 bg-[#FFFFFF]"
      >
        <Container className="justify-center">
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12 ">
            <header>
              <h2 className="mb-6">
                <Text variant="headline" weight="bold" color="#FF5B00">
                  Tecnologías Utilizadas
                </Text>
              </h2>
            </header>
            <p>
              <Text variant="body" color="#16141F" className="opacity-80">
                Stack tecnológico moderno para máximo rendimiento y
                escalabilidad
              </Text>
            </p>
          </Col>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {technologies.map((tech, index) => (
              <div key={index} className="text-center group">
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 border-2"
                  style={{
                    backgroundColor: `${tech.color}20`,
                    borderColor: `${tech.color}40`,
                  }}
                >
                  <Icon name={tech.icon as any} size={32} color={tech.color} />
                </div>
                <Text variant="body" color="#16141F" className="font-medium">
                  {tech.name}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20" style={{ backgroundColor: "#E1FF00" }}>
        <Container>
          <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto text-center">
            <header>
              <h2 className="mb-6">
                <Text variant="headline" weight="bold" color="#16141F" className="mb-6">
                  ¿Te Interesa un Proyecto Similar?
                </Text>
              </h2>
            </header>

            <p className="mb-8">
              <Text variant="body" color="#16141F" className="opacity-80">
                Podemos ayudarte a transformar tu negocio con soluciones
                digitales personalizadas. Conversemos sobre tu próximo proyecto.
              </Text>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() =>
                  window.open("mailto:admin@citrica.dev", "_blank")
                }
                label="Solicitar Cotización"
                color="primary"
                variant="primary"
                className="bg-[#FFFFFF] text-[#16141F] rounded-full px-8"
              />
              <Button
                onClick={() =>
                  window.open("https://wa.me/51942627383", "_blank")
                }
                label="Contactar por WhatsApp"
                color="success"
                variant="primary"
                className="bg-[#FFFFFF] text-[#16141F] rounded-full px-8"
              />
            </div>
          </Col>
        </Container>
      </section>

      {/* Otros Proyectos */}
      <section id="otros-proyectos" className="py-20 bg-[#16141F]">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <header>
              <h2 className="mb-6">
                <Text variant="headline" weight="bold" color="#FF5B00" >
                  Otros Proyectos
                </Text>
              </h2>
            </header>
            <p>
              <Text variant="body" color="#FFFFFF" className="opacity-80">
                Explora más de nuestros trabajos y casos de éxito
              </Text>
            </p>
          </Col>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherProjects.map((project, index) => (
              <article
                key={project.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#E1FF00]/30 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Imagen placeholder */}
                <div className="h-48 bg-gradient-to-br from-[#E1FF00]/20 to-[#FF5B00]/20 flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="Image" size={48} color="#E1FF00" />
                    <div className="mt-2">
                      <Text
                        variant="label"
                        color="#E5FFFF"
                        className="opacity-50"
                      >
                        [{project.category}]
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Categoría */}
                  <div className="inline-block px-3 py-1 bg-[#FF5B00]/20 border border-[#FF5B00]/30 rounded-full mb-4">
                    <Text variant="label" color="#FF5B00">
                      {project.category}
                    </Text>
                  </div>

                  {/* Título */}
                  <h3 className="mb-3">
                    <Text variant="subtitle" color="#FFFFFF">
                      {project.title}
                    </Text>
                  </h3>

                  {/* Descripción */}
                  <p className="mb-4">
                    <Text
                      variant="body"
                      color="#FFFFFF"
                      className="opacity-70 leading-relaxed"
                    >
                      {project.description}
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
                  <Button
                    onClick={() => {
                      addToast({
                        title: "Proyecto seleccionado",
                        description: `Viendo detalles de ${project.title}`,
                        color: "success",
                      });
                    }}
                    label="Ver Detalles"
                    variant="secondary"
                    className="w-full bg-[#E1FF00] text-[#E1FF00] hover:bg-[#E1FF00]/10 rounded-full"
                  />
                </div>
              </article>
            ))}
          </div>
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
              <Text variant="label" color="#E5FFFF" className="opacity-70">
                Transformamos ideas en soluciones digitales que impulsan el
                crecimiento de tu negocio.
              </Text>
            </h2>
          </Col>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mt-8">
            <Divider className="mb-8 bg-gray-800" />
            <div className="flex justify-center">
              <h2 className="mb-8">
                <Text variant="label" color="#E5FFFF" className="opacity-50">
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

export default ProjectTemplate;
