"use client";
import React, { useState } from "react";
import { Container, Col } from "@citrica/objects";
import { Text, Icon, Button} from "@citrica-ui";
import { addToast } from "@heroui/toast";
import { Divider, Link } from "@heroui/react";
import { projectHero, projectDesafio, projectDescription, projectSolucion, services, technologies, otherProjects } from "@/shared/archivos js/project-cojones"
import { CompletedProjects } from "@/shared/components/project-components/other-projects";
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



  return (
    <div className="min-h-screen bg-[#16141F]">
      {/* Header/Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/80 bg-opacity-80 backdrop-blur-sm ">
        <Container className="py-2">
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            noPadding
            className="flex justify-between items-center pt-4"
          >
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-24 h-17">
                  <img
                    src="/img/citrica-logo.png"
                    alt="Logo Cítrica"
                    className="h-12"
                  />
                </div>
              </div>
            </Link>
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
                  Otros Proyectos
                </Text>
              </a>
            </div>
            {/* Right side - action button + hamburger on small screens only */}
            <div className="flex items-center md:justify-end">
              <div className="hidden md:block">
                <Link href="/">
                  <Button
                    onClick={() =>
                      document
                        .getElementById("contacto")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    label="Regresar"
                    variant="primary"
                    className="px-8 bg-[#E1FF00] rounded-[80]"
                  />
                </Link>
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
              className={`fixed top-0 right-0 h-screen w-64 bg-black/90 backdrop-blur-lg p-6 flex flex-col items-start gap-6 transform transition-transform duration-500 ease-in-out z-50 ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
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
                href="#descripcion"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#E5FFFF">
                  Sobre el Proyecto
                </Text>
              </a>
              <a
                href="#solucion"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#E5FFFF">
                  La Solución
                </Text>
              </a>
              <a
                href="#otros-proyectos"
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color="#E5FFFF">
                  Otros Proyectos
                </Text>
              </a>

              {/* Botón CTA */}
              <Link href="/">
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    document
                      .getElementById("contacto")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  label="Hablemos"
                  variant="primary"
                  className="px-8 mt-[10px] bg-[#E1FF00] text-black rounded-[80]"
                />
              </Link>
            </div>
          </Col>
        </Container>
      </nav>

      {/* Hero Banner */}
      <section
        id="inicio"
        className="pt-[100] relative overflow-hidden gradient-project-hero"
      >
        <Container className="relative z-10">
          <Col cols={{ lg: 5, md: 6, sm: 4 }} noPadding>
            <div className="h-full flex flex-col justify-center">
              {/* Categoría */}
              <div className="block w-fit px-5 py-1 bg-[#00FFFF]/20 border border-[#00FFFF]/30 rounded-full mb-5">
                <Text variant="label" color="#00FFFF">
                  {projectHero.category}
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
                    {projectHero.title}
                  </Text>
                </h1>
              </header>

              <h2 className="mb-9">
                <Text variant="title" color="#00FFFF">
                  {projectHero.subtitle}
                </Text>
              </h2>

              <div className="flex gap-4 flex-wrap">
                <Button
                  label={projectHero.buttonLabel}
                  variant="primary"
                  onClick={handleContactClick}
                  className="bg-[#00FFFF] text-[#003333] rounded-full px-5"
                />
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 7, md: 6, sm: 4 }}>
            <div className="relative">
              {/* Placeholder para imagen del proyecto */}
              <div className="w-full flex items-center justify-center">
                <img
                  src={projectHero.image}
                  alt="Project image"
                  className="proyect-page-hero-img-shadow"
                />
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Descripción del Proyecto */}
      <section id="descripcion" className="pt-20 bg-white">
        <Container>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="text-center bg-color-ct-tertiary-container border-[2px] border-[#00666633] rounded-xl p-8"
          >
            <div>
              <h2 className="mb-4">
                <Text variant="display" weight="bold" color="#006666">
                  {projectDescription.title}
                </Text>
              </h2>
            </div>
            <div className="flex justify-center">
              <h2 className="text-ch-width">
                <Text variant="subtitle" weight="bold" color="#16141F">
                  {projectDescription.subtitle}
                </Text>
              </h2>
            </div>
            <div className="flex justify-center backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-ch-width mt-2">
                <Text
                  variant="body"
                  color="#16141F"
                  className="leading-relaxed"
                >
                  {projectDescription.description}
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
      <section className="pt-20 bg-[#FFFFFF]">
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }} noPadding>
            <div className="space-y-6 pr-[56px]">
              <header>
                <h2>
                  <Text variant="headline" weight="bold" color="#006666">
                    {projectDesafio.title}
                  </Text>
                </h2>
              </header>

              <p>
                <Text
                  variant="body"
                  color="#16141F"
                  className="leading-relaxed-[28px]"
                >
                  {projectDesafio.description}
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }} noPadding>
            <div className="w-full h-[475px] rounded-2xl overflow-hidden project-img-shadow">
              <img
                src={projectDesafio.image}
                alt=""
                className="object-center"
              />
            </div>
          </Col>
        </Container>
      </section>

      {/* Solución */}
      <section id="solucion" className="pt-20 bg-[#FFFFFF]">
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }} noPadding>
            <div className="w-full h-full rounded-2xl overflow-hidden project-img-shadow bg-[#F2F2F2]">
              <img
                src={projectSolucion.image}
                alt="Imagen de detalle de la tabla de productos"
                className="object-cover"
              />
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }} noPadding>
            <div className="space-y-6 pl-[56px]">
              <header>
                <h2>
                  <Text variant="headline" weight="bold" color="#006666">
                    {projectSolucion.title}
                  </Text>
                </h2>
              </header>

              <p>
                <Text
                  variant="body"
                  color="#16141F"
                  className="leading-relaxed"
                >
                  {projectSolucion.description}
                </Text>
              </p>
            </div>
          </Col>
        </Container>
      </section>

      {/* Características */}
      <section className="pt-20 bg-[#FFFFFF]">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="">
            <header>
              <h2 className="text-center">
                <Text variant="headline" color="#006666" weight="bold">
                  Características Principales
                </Text>
              </h2>
            </header>
          </Col>
        </Container>
        <Container className="bg-opacity-10 backdrop-blur-sm p-8 rounded-3xl border border-white border-opacity-10">
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            noPadding
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
          >
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-color-ct-tertiary-container border-[2px] border-[#00666633] rounded-2xl p-6 flex flex-col items-center text-center"
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
                  <Text variant="subtitle" color="#006666" weight="bold">
                    {service.title}
                  </Text>
                </h3>
                <Text variant="body" color="#003333" className="opacity-60">
                  {service.description}
                </Text>
                {/* <div
                  className="mt-8 h-1 w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, #00666600, #006666, #00666600)`,
                  }}
                /> */}
              </div>
            ))}
          </Col>
        </Container>
      </section>

      {/* Características */}
      {/* <section className="pt-20 bg-[#FFFFFF]">
        <Container>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="mb-12 space-y-6 bg-color-ct-tertiary-container rounded-xl py-8"
          >
            <header>
              <h2 className="text-center">
                <Text variant="headline" color="#006666" weight="bold">
                  Características Principales
                </Text>
              </h2>
            </header>

            <div className="flex justify-center gap-10 px-10">              
              <ul className="list-disc text-ch-width-md">
                <li>
                  <span className="font-bold">Gestión de pedidos:</span>{" "}
                  Catálogo en línea, carrito de compras, historial y listas de
                  pedidos recurrentes.
                </li>
                <li>
                  <span className="font-bold">Gestión administrativa:</span>{" "}
                  Aprobación de pedidos, límites presupuestarios, administración
                  de perfiles y generación de órdenes de compra.
                </li>
                <li>
                  <span className="font-bold">Gestión de inventario:</span>{" "}
                  Control de stock con sistema Kardex integrado, registro de
                  entradas y salidas, y preparación de pedidos.
                </li>
                <li>
                  <span className="font-bold">Monitoreo y reportes:</span> Panel
                  de supervisión, seguimiento en tiempo real, reportes de gastos
                  y visualización del cumplimiento presupuestario.
                </li>
                <li>
                  <span className="font-bold">Usabilidad y seguridad:</span>{" "}
                  Diseño intuitivo, arquitectura escalable y protección de
                  datos.
                </li>
              </ul>
            </div>
          </Col>
        </Container>
      </section> */}

      {/* Tecnologías */}
      <section id="tecnologias" className="pt-10 pb-20 bg-[#FFFFFF]">
        <Container className="justify-center">
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12 ">
            <header>
              <h2 className="mb-6">
                <Text variant="headline" weight="bold" color="#006666">
                  Tecnologías Utilizadas
                </Text>
              </h2>
            </header>
            <p className="text-ch-width center">
              <Text variant="subtitle" color="#16141F" className="opacity-80">
                La plataforma fue construida con un stack tecnológico moderno
                para garantizar el máximo rendimiento y escalabilidad.
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
      <section
        id="cta"
        className="py-20"
        style={{ backgroundColor: "#E1FF00" }}
      >
        <Container>
          <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto text-center">
            <header>
              <h2 className="mb-6">
                <Text
                  variant="headline"
                  weight="bold"
                  color="#16141F"
                  className="mb-6"
                >
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
                variant="primary"
                className="bg-[#FFFFFF] text-[#16141F] rounded-full px-8"
              />
              <Button
                onClick={() =>
                  window.open("https://wa.me/51942627383", "_blank")
                }
                label="Contactar por WhatsApp"
                variant="primary"
                className="bg-[#FFFFFF] text-[#16141F] rounded-full px-8"
              />
            </div>
          </Col>
        </Container>
      </section>

      {/* Otros Proyectos */}
      <section id="otros-proyectos" className="py-20 gradient-project-hero">
        <CompletedProjects/>
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
