"use client";
import React, { useState } from "react";
import { Container, Col } from "@citrica/objects";
import { Text, Icon, Button } from "@citrica-ui";
import { addToast } from "@heroui/toast";
import { CompletedProjects } from "@/shared/components/project-components/other-projects";
import { CtaSection } from "@/shared/components/project-components/cta-section";
import { FooterCitrica } from "@/shared/components/project-components/footer-citrica";

interface ProjectData {
  projectHero: any;
  projectDescription: any;
  projectDesafio: any;
  projectSolucion: any;
  services: any[];
  technologies: any[];
  slug?: string;
}

interface ProjectTemplateProps {
  project: ProjectData;
  slug?: string;
}

const ProjectTemplate = ({ project, slug }: ProjectTemplateProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    projectHero,
    projectDescription,
    projectDesafio,
    projectSolucion,
    services,
    technologies,
  } = project;

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
            className={`text-center ${projectDescription.bgColor} border-[2px] ${projectDescription.borderColor} rounded-xl p-8`}
          >
            <div>
              <h2 className="mb-4">
                <Text variant="display" weight="bold" color={projectDescription.titleColor}>
                  {projectDescription.sectionTitle}
                </Text>
              </h2>
            </div>
            <div className="flex justify-center">
              <h2 className="text-ch-width">
                <Text variant="subtitle" weight="bold" color={projectDescription.textColor}>
                  {projectDescription.mainTitle}
                </Text>
              </h2>
            </div>
            <div className="flex justify-center backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-ch-width mt-2">
                <Text
                  variant="body"
                  color={projectDescription.textColor}
                  className="leading-relaxed"
                >
                  {projectDescription.description}
                </Text>
              </p>
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
                    {projectDesafio.sectionTitle}
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
                    {projectSolucion.sectionTitle}

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
              </div>
            ))}
          </Col>
        </Container>
      </section>

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
        <CtaSection />
      </section>

      {/* Otros Proyectos */}
      <section id="otros-proyectos" className="py-20 gradient-project-hero">
        <CompletedProjects currentProjectSlug={slug} />
      </section>
      <FooterCitrica />
    </div>
  );
};

export default ProjectTemplate;
