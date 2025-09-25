import React from "react";
import { Container, Col } from "@/styles/07-objects/objects";
import { Text, Button } from "@citrica-ui";
import { Link } from "@heroui/react";


const ProjectSection = () => {

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
}

export default ProjectSection