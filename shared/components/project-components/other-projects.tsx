import { Col, Container } from '@/styles/07-objects/objects'
import React from 'react'
import { Button, Text } from '../citrica-ui'
import { otherProjects } from "@/shared/archivos js/citrica-data";
import { Link } from '@heroui/react';

export const CompletedProjects = () => {
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
        </Container>
</>
  )
}
