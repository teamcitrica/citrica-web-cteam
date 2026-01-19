"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useLandingProjects, LandingProject } from "@/hooks/landing-projects/use-landing-projects";
import ProjectTemplate from "./ProjectTemplate";

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { fetchProjectBySlug, isLoading } = useLandingProjects();
  const [project, setProject] = useState<LandingProject | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      const data = await fetchProjectBySlug(slug);
      if (!data) {
        setNotFoundState(true);
      } else {
        setProject(data);
      }
    };

    if (slug) {
      loadProject();
    }
  }, [slug, fetchProjectBySlug]);

  if (notFoundState) {
    notFound();
  }

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-[#16141F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
      </div>
    );
  }

  const transformedProject = {
    slug: project.slug,
    projectHero: {
      category: project.hero_category,
      title: project.hero_title,
      subtitle: project.hero_subtitle,
      buttonLabel: project.hero_button_label || "Ver Demo",
      image: project.hero_image,
    },
    projectDescription: {
      sectionTitle: project.description_section_title || "Sobre el Proyecto",
      mainTitle: project.description_main_title,
      description: project.description_text,
      titleColor: project.description_title_color || "#006666",
      textColor: project.description_text_color || "#16141F",
      bgColor: project.description_bg_color || "bg-color-ct-tertiary-container",
      borderColor: project.description_border_color || "border-[#00666633]",
    },
    projectDesafio: {
      sectionTitle: project.challenge_section_title || "El Desafío",
      image: project.challenge_image,
      description: project.challenge_description,
      titleColor: project.challenge_title_color || "#006666",
      textColor: project.challenge_text_color || "#16141F",
    },
    projectSolucion: {
      sectionTitle: project.solution_section_title || "La Solución",
      image: project.solution_image,
      description: project.solution_description,
      titleColor: project.solution_title_color || "#006666",
      textColor: project.solution_text_color || "#16141F",
    },
    services: project.services || [],
    technologies: project.technologies || [],
  };

  return <ProjectTemplate project={transformedProject} slug={slug} />;
}
