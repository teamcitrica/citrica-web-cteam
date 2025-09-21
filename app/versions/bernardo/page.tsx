"use client"
import React from 'react';
import { Container, Col } from '@/styles/07-objects/objects';
import Text from "@/shared/components/citrica-ui/atoms/text";
import Button from "@/shared/components/citrica-ui/molecules/button";
import Icon from "@/shared/components/citrica-ui/atoms/icon";
import Card from '@/shared/components/citrica-ui/atoms/card';

export default function CitricaLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50" role="navigation" aria-label="Navegación principal">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-yellow-400">
                Cítrica
              </h1>
              <div className="hidden md:flex space-x-8">
                {['Servicios', 'Proyectos', 'Proceso', 'Contacto'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    className="text-slate-300 hover:text-yellow-400 transition-colors duration-300 font-medium"
                  >
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
      <header className="pt-32 pb-20 relative overflow-hidden">
        {/* Gradient Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl"></div>
        </div>

        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center relative z-10 max-w-5xl mx-auto">
              <div className="mb-12">
                <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                  <span className="block text-slate-100">APLICACIONES Y</span>
                  <span className="block text-slate-100">SITIOS WEB</span>
                  <span className="block text-yellow-400 mt-2">A MEDIDA</span>
                </h2>
                <p className="text-xl md:text-2xl text-slate-400 font-light">
                  Para impulsar tu negocio al siguiente nivel
                </p>
              </div>

              {/* Servicios destacados */}
              <section className="mb-12" aria-labelledby="servicios-destacados">
                <h3 id="servicios-destacados" className="sr-only">Servicios destacados</h3>
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                  {[
                    { name: 'Landing Pages', color: 'yellow', icon: 'Rocket' },
                    { name: 'Websites', color: 'cyan', icon: 'Globe' },
                    { name: 'Web Apps', color: 'orange', icon: 'Code' },
                    { name: 'Mobile Apps', color: 'slate', icon: 'Smartphone' }
                  ].map((service, index) => (
                    <div key={index} className="group">
                      <div className={`px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105 cursor-pointer
                        ${service.color === 'yellow' ? 'border-yellow-400/40 bg-yellow-400/10 hover:bg-yellow-400/20' :
                          service.color === 'cyan' ? 'border-cyan-400/40 bg-cyan-400/10 hover:bg-cyan-400/20' :
                          service.color === 'orange' ? 'border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20' :
                          'border-slate-400/40 bg-slate-400/10 hover:bg-slate-400/20'}`}>
                        <span className={`font-semibold flex items-center gap-2
                          ${service.color === 'yellow' ? 'text-yellow-400' :
                            service.color === 'cyan' ? 'text-cyan-400' :
                            service.color === 'orange' ? 'text-orange-500' :
                            'text-slate-400'}`}>
                          <Icon name={service.icon === 'Rocket' ? 'Rocket' : service.icon === 'Globe' ? 'Globe' : service.icon === 'Code' ? 'Code' : 'Smartphone'} size={16} />
                          {service.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  onClick={() => { }}
                  label="Comenzar Proyecto"
                  variant="primary"
                />
                <Button
                  onClick={() => { }}
                  label="Ver Portafolio"
                  variant="secondary"
                />
              </div>
            </div>
          </Col>
        </Container>
      </header>

      {/* Propuesta de Valor */}
      <section className="py-20 relative" aria-labelledby="propuesta-valor">
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="pr-0 lg:pr-12">
              <h2 id="propuesta-valor" className="text-4xl font-bold text-yellow-400 mb-6">
                ¿Por qué Cítrica?
              </h2>
              <p className="text-lg text-slate-300 mb-4 leading-relaxed">
                Somos especialistas en desarrollo de software B2B, enfocados en crear
                soluciones digitales que impulsen el crecimiento de tu negocio.
              </p>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Combinamos experiencia técnica con creatividad para entregar productos
                que no solo funcionan perfectamente, sino que destacan en el mercado.
              </p>

              <ul className="space-y-4">
                {[
                  'Desarrollo ágil y entregas rápidas',
                  'Tecnologías de vanguardia',
                  'Soporte continuo post-lanzamiento'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <Icon name="CheckCircle" size={20} color="#facc15" />
                    <span className="ml-3 text-slate-300 font-medium">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="flex items-center justify-center h-full mt-12 lg:mt-0">
              <figure className="relative">
                <div className="w-80 h-80 relative">
                  {/* Círculos concéntricos animados */}
                  <div className="absolute inset-0 border-2 border-yellow-400/30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 border-2 border-cyan-400/30 rounded-full animate-pulse delay-700"></div>
                  <div className="absolute inset-8 border-2 border-orange-500/30 rounded-full animate-pulse delay-1000"></div>

                  {/* Centro */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💻</div>
                      <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                        Innovación
                      </h3>
                      <p className="text-cyan-400 text-lg">
                        Tecnológica
                      </p>
                    </div>
                  </div>
                </div>
              </figure>
            </div>
          </Col>
        </Container>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 bg-slate-800/50" aria-labelledby="servicios-titulo">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <header className="text-center mb-16">
              <h2 id="servicios-titulo" className="text-4xl font-bold text-yellow-400 mb-4">
                Nuestros Servicios
              </h2>
              <p className="text-xl text-slate-400">
                Soluciones digitales completas para tu empresa
              </p>
            </header>
          </Col>

          {[
            {
              title: 'Landing Pages',
              description: 'Páginas optimizadas para conversión que captan leads efectivamente',
              color: 'yellow',
              icon: 'Rocket'
            },
            {
              title: 'Websites Corporativos',
              description: 'Sitios web responsivos que reflejan la identidad de tu marca',
              color: 'cyan',
              icon: 'Globe'
            },
            {
              title: 'Aplicaciones Web',
              description: 'Sistemas robustos que automatizan procesos de negocio',
              color: 'orange',
              icon: 'Code'
            },
            {
              title: 'Apps Móviles',
              description: 'Aplicaciones nativas que conectan tu negocio con clientes',
              color: 'slate',
              icon: 'Smartphone'
            }
          ].map((service, index) => (
            <Col key={index} cols={{ lg: 3, md: 6, sm: 4 }}>
              <article className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-8 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 h-full">
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center
                    ${service.color === 'yellow' ? 'bg-yellow-400/20 border border-yellow-400/30' :
                      service.color === 'cyan' ? 'bg-cyan-400/20 border border-cyan-400/30' :
                      service.color === 'orange' ? 'bg-orange-500/20 border border-orange-500/30' :
                      'bg-slate-400/20 border border-slate-400/30'}`}>
                    <Icon
                      name={service.icon === 'Rocket' ? 'Rocket' : service.icon === 'Globe' ? 'Globe' : service.icon === 'Code' ? 'Code' : 'Smartphone'}
                      size={32}
                      color={service.color === 'yellow' ? '#facc15' : service.color === 'cyan' ? '#22d3ee' : service.color === 'orange' ? '#f97316' : '#94a3b8'}
                    />
                  </div>
                  <h3 className={`text-xl font-bold mb-3
                    ${service.color === 'yellow' ? 'text-yellow-400' :
                      service.color === 'cyan' ? 'text-cyan-400' :
                      service.color === 'orange' ? 'text-orange-500' :
                      'text-slate-400'}`}>
                    {service.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </article>
            </Col>
          ))}
        </Container>
      </section>

      {/* Tecnologías */}
      <section id="tecnologias" className="py-20" aria-labelledby="fortalezas-titulo">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <header className="text-center mb-16">
              <h2 id="fortalezas-titulo" className="text-4xl font-bold text-yellow-400 mb-4">
                Nuestras Fortalezas
              </h2>
              <p className="text-xl text-slate-400">
                Lo que nos hace únicos en el desarrollo de software
              </p>
            </header>
          </Col>

          {[
            {
              title: 'Diseño que Inspira',
              description: 'Interfaces modernas que cautivan usuarios y mejoran la experiencia',
              color: 'yellow',
              emoji: '✨'
            },
            {
              title: 'Frontend Robusto',
              description: 'React, Vue.js y tecnologías modernas para experiencias fluidas',
              color: 'cyan',
              emoji: '⚛️'
            },
            {
              title: 'Desarrollo Móvil',
              description: 'Apps nativas y PWAs optimizadas para máximo rendimiento',
              color: 'orange',
              emoji: '📱'
            },
            {
              title: 'Backend Escalable',
              description: 'Arquitectura sólida, segura y preparada para el crecimiento',
              color: 'slate',
              emoji: '⚡'
            }
          ].map((tech, index) => (
            <Col key={index} cols={{ lg: 3, md: 6, sm: 4 }}>
              <article className="text-center mb-8 group">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110
                  ${tech.color === 'yellow' ? 'bg-yellow-400/20 border-2 border-yellow-400/40' :
                    tech.color === 'cyan' ? 'bg-cyan-400/20 border-2 border-cyan-400/40' :
                    tech.color === 'orange' ? 'bg-orange-500/20 border-2 border-orange-500/40' :
                    'bg-slate-400/20 border-2 border-slate-400/40'}`}>
                  <span>{tech.emoji}</span>
                </div>
                <h3 className={`text-xl font-bold mb-3
                  ${tech.color === 'yellow' ? 'text-yellow-400' :
                    tech.color === 'cyan' ? 'text-cyan-400' :
                    tech.color === 'orange' ? 'text-orange-500' :
                    'text-slate-400'}`}>
                  {tech.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {tech.description}
                </p>
              </article>
            </Col>
          ))}
        </Container>
      </section>

      {/* Proceso */}
      <section id="proceso" className="py-20 bg-slate-800/50" aria-labelledby="proceso-titulo">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <header className="text-center mb-16">
              <h2 id="proceso-titulo" className="text-4xl font-bold text-yellow-400 mb-4">
                Nuestro Proceso
              </h2>
              <p className="text-xl text-slate-400">
                Metodología probada para el éxito de tu proyecto
              </p>
            </header>
          </Col>

          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Planificación', desc: 'Análisis detallado de requisitos y definición de objetivos claros', color: 'yellow' },
                { step: '2', title: 'Diseño UX/UI', desc: 'Wireframes, prototipos y diseño centrado en el usuario', color: 'cyan' },
                { step: '3', title: 'Desarrollo', desc: 'Implementación ágil con entregas incrementales', color: 'orange' },
                { step: '4', title: 'Testing', desc: 'Pruebas exhaustivas de funcionalidad y rendimiento', color: 'slate' },
                { step: '5', title: 'Despliegue', desc: 'Implementación optimizada y puesta en producción', color: 'yellow' },
                { step: '6', title: 'Soporte', desc: 'Mantenimiento continuo y actualizaciones regulares', color: 'cyan' }
              ].map((process, index) => (
                <article key={index} className="bg-slate-700/60 rounded-xl p-6 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center font-bold text-lg text-slate-900
                    ${process.color === 'yellow' ? 'bg-yellow-400' :
                      process.color === 'cyan' ? 'bg-cyan-400' :
                      process.color === 'orange' ? 'bg-orange-500' :
                      'bg-slate-400'}`}>
                    {process.step}
                  </div>
                  <h3 className={`text-lg font-bold text-center mb-2
                    ${process.color === 'yellow' ? 'text-yellow-400' :
                      process.color === 'cyan' ? 'text-cyan-400' :
                      process.color === 'orange' ? 'text-orange-500' :
                      'text-slate-400'}`}>
                    {process.title}
                  </h3>
                  <p className="text-slate-300 text-center leading-relaxed">
                    {process.desc}
                  </p>
                </article>
              ))}
            </div>
          </Col>
        </Container>
      </section>

      {/* CTA Final */}
      <section className="py-20 text-center relative" aria-labelledby="cta-titulo">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-cyan-400/5"></div>
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 id="cta-titulo" className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
                ¿Listo para transformar tu idea en realidad?
              </h2>
              <p className="text-xl text-slate-400 mb-10">
                Conversemos sobre tu próximo proyecto y descubre cómo podemos ayudarte a alcanzar tus objetivos digitales
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  onClick={() => { }}
                  label="Comenzar Ahora"
                  variant="primary"
                />
                <Button
                  onClick={() => { }}
                  label="Agendar Consulta Gratuita"
                  variant="secondary"
                />
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Footer básico */}
      <footer className="py-12 border-t border-slate-700/50 bg-slate-900" role="contentinfo">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center">
              <p className="text-slate-400">
                © 2024 Cítrica. Transformando ideas en soluciones digitales exitosas.
              </p>
            </div>
          </Col>
        </Container>
      </footer>
    </div>
  );
}