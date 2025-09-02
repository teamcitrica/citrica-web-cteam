'use client'
import React, { useState, useEffect } from 'react';
import Text from '@ui/atoms/text';
import Icon from '@ui/atoms/icon';

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  image: string;
  category: string;
}

interface ResponsiveCarouselProps {
  projects: Project[];
  className?: string;
}

const ResponsiveCarousel: React.FC<ResponsiveCarouselProps> = ({
  projects,
  className = ""
}) => {
  const [currentProject, setCurrentProject] = useState(0);
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('lg');

  // Detectar cambios de tamaño
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('sm');
      } else if (width < 1024) {
        setScreenSize('md');
      } else {
        setScreenSize('lg');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Porcentaje de transformación
  const getTransformPercentage = () => {
    switch (screenSize) {
      case 'sm': return currentProject * 100;      // 1 card
      case 'md': return currentProject * 50;       // 2 cards
      case 'lg': return currentProject * (100 / 3);  // 3 cards
      default: return currentProject * (100 / 3);
    }
  };

  // Navegación
  const getMaxIndex = () => {
    switch (screenSize) {
      case 'sm': return projects.length - 1;
      case 'md': return projects.length - 2;
      case 'lg': return projects.length - 3;
      default: return projects.length - 3;
    }
  };

  const nextProject = () => {
    const maxIndex = getMaxIndex();
    setCurrentProject(prev => prev >= maxIndex ? 0 : prev + 1);
  };

  const prevProject = () => {
    const maxIndex = getMaxIndex();
    setCurrentProject(prev => prev <= 0 ? maxIndex : prev - 1);
  };

  // Indicadores
  const getIndicatorCount = () => {
    switch (screenSize) {
      case 'sm': return projects.length;
      case 'md': return Math.max(1, projects.length - 1);
      case 'lg': return Math.max(1, projects.length - 2);
      default: return Math.max(1, projects.length - 2);
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto relative px-4 sm:px-6 ${className}`}>
      
      {/* Flecha izquierda */}
      <button
        onClick={prevProject}
        className="absolute left-0 sm:-left-8 top-1/2 -translate-y-1/2 z-10
                   p-2 sm:p-3 bg-[#E1FF00]/20 hover:bg-[#E1FF00]/30 
                   rounded-full transition-all"
      >
        <Icon name="ChevronLeft" size={20} color="#E1FF00" />
      </button>

      {/* Flecha derecha */}
      <button
        onClick={nextProject}
        className="absolute right-0 sm:-right-8 top-1/2 -translate-y-1/2 z-10
                   p-2 sm:p-3 bg-[#E1FF00]/20 hover:bg-[#E1FF00]/30 
                   rounded-full transition-all"
      >
        <Icon name="ChevronRight" size={20} color="#E1FF00" />
      </button>

      {/* Contenedor del carrusel */}
      <div className="overflow-hidden w-full max-w-5xl mx-auto">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${getTransformPercentage()}%)` }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className="w-[90%] max-w-[320px] md:w-1/2 lg:w-1/3 
                         px-2 sm:px-4 flex-shrink-0 mx-auto"
            >
              <div className="relative group cursor-pointer h-auto sm:h-auto lg:h-auto">
                {/* Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#E1FF00] via-[#FF5B00] to-[#00FFFF]
                                rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-500"></div>

                <article className="relative bg-[#1a1823] rounded-2xl p-4 sm:p-6 
                                    border border-[#E1FF00]/20 hover:border-[#E1FF00]/50 
                                    transition-all h-full flex flex-col">

                  {/* Imagen */}
<div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-[#E1FF00]/20 to-[#FF5B00]/20
                rounded-lg mb-4 sm:mb-6 flex items-center justify-center flex-shrink-0 overflow-hidden">
  <img 
    src={project.image} 
    alt={project.title} 
    className="w-full h-full object-cover rounded-lg" 
  />
</div>

                  {/* Categoría */}
                  <div className="inline-block w-fit px-3 py-1 bg-[#FF5B00]/20 
                                  border border-[#FF5B00]/30 rounded-full mb-4 flex-shrink-0">
                    <Text variant="label" color="#FF5B00">
                      {project.category}
                    </Text>
                  </div>

                  {/* Título */}
                  <h3 className="mb-3 flex-shrink-0">
                    <Text variant="subtitle" color="#FFFFFF">
                      {project.title}
                    </Text>
                  </h3>

                  {/* Descripción */}
                  <p className="mb-4 flex-grow ">
                    <Text variant="body" color="#FFFFFF" className="opacity-70 line-clamp-3">
                      {project.description}
                    </Text>
                  </p>

                  {/* Tech */}
                  <div className="flex flex-wrap gap-2 mt-auto flex-shrink-0">
                    {project.tech.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-1 bg-[#00FFFF]/10 border border-[#00FFFF]/20 
                                   rounded text-xs"
                      >
                        <Text variant="label" color="#00FFFF">
                          {tech}
                        </Text>
                      </span>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        {Array.from({ length: getIndicatorCount() }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentProject(index)}
            className={`w-3 h-3 rounded-full transition-all 
                       ${index === currentProject ? 'bg-[#E1FF00]' : 'bg-[#E1FF00]/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ResponsiveCarousel;
