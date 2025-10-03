import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjectSlugs } from "@/shared/archivos js/projects-data";
import ProjectTemplate from "./ProjectTemplate";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  // Await params as required by Next.js 15
  const { slug } = await params;

  // Obtener la data del proyecto según el slug
  const project = getProjectBySlug(slug);

  // Si no existe el proyecto, mostrar página 404
  if (!project) {
    notFound();
  }

  return <ProjectTemplate project={project} slug={slug} />;
}

// Función para generar los paths estáticos en build time
export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();

  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Evitar loops infinitos en rutas no válidas
export const dynamicParams = false;
