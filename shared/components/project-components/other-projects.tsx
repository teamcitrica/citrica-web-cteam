"use client";
import { useEffect, useState } from "react";
import { Link } from "@heroui/link";
import { Col, Container } from "@/styles/07-objects/objects";
import { Button, Text } from "citrica-ui-toolkit";
import { useLandingProjects, LandingProject } from "@/hooks/landing-projects/use-landing-projects";

interface CompletedProjectsProps {
  currentProjectSlug?: string;
}

export const CompletedProjects = ({ currentProjectSlug }: CompletedProjectsProps) => {
  const { fetchActiveProjects } = useLandingProjects();
  const [projects, setProjects] = useState<LandingProject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      const data = await fetchActiveProjects();
      setProjects(data);
      setIsLoaded(true);
    };
    loadProjects();
  }, [fetchActiveProjects]);

  const filteredProjects = currentProjectSlug
    ? projects.filter((project) => project.slug !== currentProjectSlug)
    : projects;

  if (!isLoaded) {
    return (
      <Container>
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 bg-white/20 rounded w-48 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-64"></div>
          </div>
        </Col>
      </Container>
    );
  }

  return (
    <>
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
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border-[2px] border-[#E1FF0022]"
            >
              <div className="h-48 gradient-project-hero flex items-center justify-center">
                <img
                  src={project.hero_image || "/img/placeholder.png"}
                  alt={project.hero_title}
                  className="object-contain h-full"
                />
              </div>

              <div className="p-6">
                <div className="inline-block px-3 py-1 bg-[#E1FF00]/20 border border-[#E1FF00]/30 rounded-full mb-4">
                  <Text variant="label" color="#E1FF00">
                    {project.hero_category}
                  </Text>
                </div>

                <h3 className="mb-3">
                  <Text variant="subtitle" color="#FFFFFF">
                    {project.hero_title}
                  </Text>
                </h3>

                <p className="mb-4">
                  <Text
                    variant="body"
                    color="#FFFFFFBB"
                    className="leading-relaxed"
                  >
                    {project.hero_subtitle}
                  </Text>
                </p>

                <Link href={`/projects/${project.slug}`} className="w-full">
                  <Button
                    onPress={() => {}}
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
    </>
  );
}
