"use client"
import React from 'react';
import { Container, Col } from '@/styles/07-objects/objects';
import Text from "@/shared/components/citrica-ui/atoms/text";
import Button from "@/shared/components/citrica-ui/molecules/button";
import Icon from "@/shared/components/citrica-ui/atoms/icon";
import Card from '@/shared/components/citrica-ui/atoms/card';


export default function CitricaLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16141F] via-[#1a1825] to-[#16141F]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#16141F]/90 backdrop-blur-sm border-b border-[#E5FFFF]/10">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="flex justify-between items-center py-4">
              <Text variant="title" textColor="color-primary" weight="bold" color="#E1FF00">
                Cítrica
              </Text>
              <div className="hidden md:flex space-x-8">
                {['Servicios', 'Proyectos', 'Proceso', 'Contacto'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="text-[#E5FFFF] hover:text-[#E1FF00] transition-colors duration-300">
                    {item}
                  </a>
                ))}
              </div>
              <div className="hidden md:block">
                <Button
                  onClick={() => { }}
                  label="Comenzar"
                  variant="primary"
                />
              </div>
            </div>
          </Col>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Gradient Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#E1FF00]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#00FFFF]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF5B00]/3 rounded-full blur-3xl"></div>
        </div>

        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center relative z-10">
              <div className="mb-8">
                <h1>
                  <Text variant="display" weight="bold" color="#E5FFFF">
                    APLICACIONES Y SITIOS WEB
                  </Text>
                </h1>
                <br />
                <Text variant="display" weight="bold" color="#E1FF00">
                  A MEDIDA
                </Text>
                <br />
                <Text variant="subtitle" color="#E5FFFF">
                  Para tu negocio
                </Text>
              </div>

              {/* Servicios destacados */}
              <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-4xl mx-auto">
                {[
                  { name: 'Landing Pages', color: '#E1FF00', icon: 'Rocket' },
                  { name: 'Websites', color: '#00FFFF', icon: 'Globe' },
                  { name: 'Web Apps', color: '#FF5B00', icon: 'Code' },
                  { name: 'Mobile Apps', color: '#E5FFFF', icon: 'Smartphone' }
                ].map((service, index) => (
                  <div key={index} className="group">
                    <div
                      className="px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105"
                      style={{
                        borderColor: service.color + '40',
                        backgroundColor: service.color + '10'
                      }}
                    >
                      <Text variant="label" weight="bold" color={service.color}>
                        <Icon name={service.icon === 'Rocket' ? 'Rocket' : service.icon === 'Globe' ? 'Globe' : service.icon === 'Code' ? 'Code' : 'Smartphone'} size={16} />
                        {service.name}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => { }}
                  label="Comenzar Proyecto"
                  variant="primary"
                />
                <Button
                  onClick={() => { }}
                  label="Ver Portafolio"
                  variant="secondary"
                  color='secondary'
                />
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Propuesta de Valor */}
      <section className="py-20 relative">
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="pr-0 lg:pr-12">
              <h2>
                <Text variant="headline" weight="bold" color="#E1FF00">
                  ¿Por qué Cítrica?
                </Text>
              </h2>
              <Text variant="body" color="#E5FFFF">
                Somos especialistas en desarrollo de software B2B, enfocados en crear
                soluciones digitales que impulsen el crecimiento de tu negocio.
              </Text>
              <Text variant="body" color="#E5FFFF">
                Combinamos experiencia técnica con creatividad para entregar productos
                que no solo funcionan perfectamente, sino que destacan en el mercado.
              </Text>

              <div className="space-y-4">
                {[
                  'Desarrollo ágil y entregas rápidas',
                  'Tecnologías de vanguardia',
                  'Soporte continuo post-lanzamiento'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <Icon name="CheckCircle" size={20} color="#E1FF00" />
                    <span className="ml-3">
                      <Text variant="body" color="#E5FFFF">
                        {benefit}
                      </Text>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="flex items-center justify-center h-full mt-12 lg:mt-0">
              <div className="relative">
                <div className="w-80 h-80 relative">
                  {/* Círculos concéntricos animados */}
                  <div className="absolute inset-0 border-2 border-[#E1FF00]/30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 border-2 border-[#00FFFF]/30 rounded-full animate-pulse delay-700"></div>
                  <div className="absolute inset-8 border-2 border-[#FF5B00]/30 rounded-full animate-pulse delay-1000"></div>

                  {/* Centro */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💻</div>
                      <Text variant="title" weight="bold" color="#E1FF00">
                        Innovación
                      </Text>
                      <Text variant="subtitle" color="#00FFFF">
                        Tecnológica
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 bg-gradient-to-r from-[#16141F]/50 to-[#1a1825]/50">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center mb-16">
              <Text variant="headline" weight="bold" color="#E1FF00">
                Nuestros Servicios
              </Text>
              <Text variant="subtitle" color="#E5FFFF">
                Soluciones digitales completas para tu empresa
              </Text>
            </div>
          </Col>

          {[
            {
              title: 'Landing Pages',
              description: 'Páginas optimizadas para conversión que captan leads efectivamente',
              color: '#E1FF00',
              icon: 'Rocket'
            },
            {
              title: 'Websites Corporativos',
              description: 'Sitios web responsivos que reflejan la identidad de tu marca',
              color: '#00FFFF',
              icon: 'Globe'
            },
            {
              title: 'Aplicaciones Web',
              description: 'Sistemas robustos que automatizan procesos de negocio',
              color: '#FF5B00',
              icon: 'Code'
            },
            {
              title: 'Apps Móviles',
              description: 'Aplicaciones nativas que conectan tu negocio con clientes',
              color: '#E5FFFF',
              icon: 'Smartphone'
            }
          ].map((service, index) => (
            <Col key={index} cols={{ lg: 3, md: 6, sm: 4 }}>
              <Card >
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon
                      name={service.icon === 'Rocket' ? 'Rocket' : service.icon === 'Globe' ? 'Globe' : service.icon === 'Code' ? 'Code' : 'Smartphone'}
                      size={48}
                      color={service.color}
                    />
                  </div>
                  <h3 className='mb-1'>
                    <Text variant="subtitle" weight="bold" color={service.color}>
                      {service.title}
                    </Text>
                  </h3>
                  <Text variant="body" color="#181e1eff">
                    {service.description}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Container>
      </section>

      {/* Tecnologías */}
      <section id="tecnologias" className="py-20">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center mb-16">
              <Text variant="headline" weight="bold" color="#E1FF00">
                Nuestras Fortalezas
              </Text>
              <Text variant="subtitle" color="#E5FFFF">
                Lo que nos hace únicos en el desarrollo de software
              </Text>
            </div>
          </Col>

          {[
            {
              title: 'Presentaciones que Inspiran',
              description: 'Interfaces modernas que cautivan usuarios',
              color: '#E1FF00'
            },
            {
              title: 'Front-end Robusto',
              description: 'React, Vue.js para experiencias fluidas',
              color: '#00FFFF'
            },
            {
              title: 'Desarrollo Móvil Eficiente',
              description: 'Apps optimizadas para máximo rendimiento',
              color: '#FF5B00'
            },
            {
              title: 'Back-end Potente',
              description: 'Arquitectura escalable y segura',
              color: '#E5FFFF'
            }
          ].map((tech, index) => (
            <Col key={index} cols={{ lg: 3, md: 6, sm: 4 }}>
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: tech.color + '20', border: `2px solid ${tech.color}40` }}
                >
                  <span style={{ color: tech.color }}>
                    {index === 0 ? '✨' : index === 1 ? '⚛️' : index === 2 ? '📱' : '⚡'}
                  </span>
                </div>
                <Text variant="title" weight="bold" color={tech.color}>
                  {tech.title}
                </Text>
                <Text variant="body" color="#E5FFFF">
                  {tech.description}
                </Text>
              </div>
            </Col>
          ))}
        </Container>
      </section>

      {/* Proceso */}
      <section id="proceso" className="py-20 bg-gradient-to-l from-[#16141F]/50 to-[#1a1825]/50">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center mb-16">
              <h2>
                <Text variant="headline" weight="bold" color="#E1FF00">
                  Nuestro Proceso
                </Text>
              </h2>
              <Text variant="subtitle" color="#E5FFFF">
                Metodología probada para el éxito de tu proyecto
              </Text>
            </div>
          </Col>

          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Planificación', desc: 'Análisis de requisitos y objetivos', color: '#E1FF00' },
                { step: '2', title: 'Diseño', desc: 'Wireframes y prototipos', color: '#00FFFF' },
                { step: '3', title: 'Desarrollo', desc: 'Implementación ágil', color: '#FF5B00' },
                { step: '4', title: 'Pruebas', desc: 'Testing exhaustivo', color: '#E5FFFF' },
                { step: '5', title: 'Implementación', desc: 'Despliegue optimizado', color: '#E1FF00' },
                { step: '6', title: 'Mantenimiento', desc: 'Soporte continuo', color: '#00FFFF' }
              ].map((process, index) => (
                <div className='rounded-lg bg-[#494340ff] p-6' key={index}>
                  <div
                    className=" w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: process.color, color: '#494340ff' }}
                  >
                    {process.step}
                  </div>
                  <h3 className='text-center'>
                    <Text variant="title" weight="bold" color={process.color}>
                      {process.title}
                    </Text>

                  </h3>
                  <Text variant="body" color="#151717ff">
                    {process.desc}
                  </Text>
                </div>
              ))}
            </div>
          </Col>
        </Container>
      </section>

      {/* CTA Final */}
      <section className="py-20 text-center">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
          <h3>
<Text variant="headline" weight="bold" color="#E5FFFF">
              ¿Listo para transformar tu idea?
            </Text>
          </h3>
            <Text variant="subtitle" color="#E5FFFF">
              Conversemos sobre tu próximo proyecto
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => { }}
                label="Comenzar Ahora"
                variant="primary"
              />
              <Button
                onClick={() => { }}
                label="Agendar Consulta"
                variant="secondary"
              />
            </div>
          </Col>
        </Container>
      </section>
    </div>
  );
}