import { Container, Col } from "@citrica/objects";
import Link from "next/link";
import { Text, Button } from "citrica-ui-toolkit";
import Icon from "@ui/atoms/icon";
import { addToast } from "@heroui/toast";

const ProjectsGallery = () => {
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
    <>
      {/* Otros Proyectos */}
      <section id="otros-proyectos" className="py-20 bg-[#16141F]">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <header>
              <h2 className="mb-6">
                <Text variant="headline" color="#FF5B00" >
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
                    onPress={() => {
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
    </>
  );
};

export default ProjectsGallery;






