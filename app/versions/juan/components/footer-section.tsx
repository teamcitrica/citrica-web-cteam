'use client'
import React from 'react';
import { Container, Col } from '@citrica/objects';
import Text from '@ui/atoms/text';

const FooterSection = () => {
  const services = [
    'Desarrollo Web',
    'Aplicaciones Móviles',
    'E-commerce',
    'Sistemas Empresariales',
    'Consultoría Digital'
  ];

  const company = [
    'Sobre Nosotros',
    'Nuestro Equipo',
    'Metodología',
    'Casos de Éxito',
    'Blog'
  ];

  const support = [
    'Centro de Ayuda',
    'Documentación',
    'Soporte Técnico',
    'Términos de Servicio',
    'Política de Privacidad'
  ];

  return (
    <footer className="relative overflow-hidden"
            style={{ backgroundColor: '#16141F' }}>
      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full" 
             style={{ backgroundColor: '#E1FF00', filter: 'blur(60px)' }}></div>
        <div className="absolute bottom-10 right-32 w-48 h-48 rounded-full" 
             style={{ backgroundColor: '#FF5B00', filter: 'blur(70px)' }}></div>
        <div className="absolute top-40 right-20 w-32 h-32 rounded-full" 
             style={{ backgroundColor: '#00FFFF', filter: 'blur(50px)' }}></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="pt-20 pb-12">
          <Container>
            {/* Logo and Main Description */}
            <Col cols={{ lg: 4, md: 6, sm: 4 }} className="mb-12">
              <div className="mb-8">
                {/* Logo placeholder */}
                <div className="w-32 h-8 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center mb-6">
                  <Text variant="label" color="#666">Logo</Text>
                </div>
                <Text variant="body" textColor="color-text-white" className="opacity-80 leading-relaxed mb-6">
                  Transformamos ideas en productos digitales excepcionales. Somos tu aliado estratégico en el mundo digital.
                </Text>
              </div>

              {/* Social Media */}
              <div>
                <Text variant="subtitle" textColor="color-text-white" className="mb-4">
                  Síguenos
                </Text>
                <div className="flex gap-3">
                  {[
                    { name: 'LinkedIn', icon: '💼', color: '#E1FF00' },
                    { name: 'Instagram', icon: '📸', color: '#FF5B00' },
                    { name: 'Twitter', icon: '🐦', color: '#00FFFF' },
                    { name: 'GitHub', icon: '👨‍💻', color: '#E1FF00' }
                  ].map((social, index) => (
                    <button key={index}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg border border-white/20 hover:border-white/40"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = social.color + '20';
                              e.currentTarget.style.borderColor = social.color;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            }}>
                      <span className="text-sm">{social.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Col>

            {/* Services */}
            <Col cols={{ lg: 2, md: 3, sm: 4 }} className="mb-12">
              <Text variant="subtitle" textColor="color-text-white" className="mb-6">
                Servicios
              </Text>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <button className="text-left transition-colors duration-200 hover:text-orange-400 group">
                      <Text variant="body" textColor="color-text-white" className="opacity-70 group-hover:opacity-100">
                        {service}
                      </Text>
                    </button>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Company */}
            <Col cols={{ lg: 2, md: 3, sm: 4 }} className="mb-12">
              <Text variant="subtitle" textColor="color-text-white" className="mb-6">
                Empresa
              </Text>
              <ul className="space-y-3">
                {company.map((item, index) => (
                  <li key={index}>
                    <button className="text-left transition-colors duration-200 hover:text-cyan-400 group">
                      <Text variant="body" textColor="color-text-white" className="opacity-70 group-hover:opacity-100">
                        {item}
                      </Text>
                    </button>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Support */}
            <Col cols={{ lg: 2, md: 3, sm: 4 }} className="mb-12">
              <Text variant="subtitle" textColor="color-text-white" className="mb-6">
                Soporte
              </Text>
              <ul className="space-y-3">
                {support.map((item, index) => (
                  <li key={index}>
                    <button className="text-left transition-colors duration-200 hover:text-lime-400 group">
                      <Text variant="body" textColor="color-text-white" className="opacity-70 group-hover:opacity-100">
                        {item}
                      </Text>
                    </button>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Contact Info */}
            <Col cols={{ lg: 2, md: 3, sm: 4 }} className="mb-12">
              <Text variant="subtitle" textColor="color-text-white" className="mb-6">
                Contacto
              </Text>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-1">📧</span>
                  <div>
                    <Text variant="label" textColor="color-text-white" className="opacity-60 mb-1">
                      Email
                    </Text>
                    <Text variant="body" color='#E1FF00'>
                      hello@citrica.com
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-1">📱</span>
                  <div>
                    <Text variant="label" textColor="color-text-white" className="opacity-60 mb-1">
                      Teléfono
                    </Text>
                    <Text variant="body" color='#00FFFF'>
                      +51 999 123 456
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-1">📍</span>
                  <div>
                    <Text variant="label" textColor="color-text-white" className="opacity-60 mb-1">
                      Ubicación
                    </Text>
                    <Text variant="body" color='#FF5B00' >
                      Lima, Perú
                    </Text>
                  </div>
                </div>
              </div>
            </Col>
          </Container>
        </div>

        {/* Newsletter Section */}
        <div className="py-12 border-t border-white/10">
          <Container>
            <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto text-center">
              <Text variant="title" textColor="color-text-white" className="mb-4">
                Mantente al día con las últimas tendencias
              </Text>
              <Text variant="body" textColor="color-text-white" className="opacity-70 mb-8">
                Suscríbete a nuestro newsletter y recibe contenido exclusivo sobre desarrollo y diseño digital.
              </Text>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Tu email aquí"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                />
                <button className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                        style={{ 
                          backgroundColor: '#E1FF00',
                          color: '#16141F'
                        }}>
                  Suscribirse
                </button>
              </div>
            </Col>
          </Container>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10">
          <Container>
            <Col cols={{ lg: 6, md: 3, sm: 4 }}>
              <Text variant="label" textColor="color-text-white" className="opacity-60">
                © 2024 Cítrica. Todos los derechos reservados.
              </Text>
            </Col>
            <Col cols={{ lg: 6, md: 3, sm: 4 }} className="text-right">
              <div className="flex justify-end gap-6 flex-wrap">
                <button className="transition-colors duration-200 hover:text-orange-400">
                  <Text variant="label" textColor="color-text-white" className="opacity-60 hover:opacity-100">
                    Términos
                  </Text>
                </button>
                <button className="transition-colors duration-200 hover:text-cyan-400">
                  <Text variant="label" textColor="color-text-white" className="opacity-60 hover:opacity-100">
                    Privacidad
                  </Text>
                </button>
                <button className="transition-colors duration-200 hover:text-lime-400">
                  <Text variant="label" textColor="color-text-white" className="opacity-60 hover:opacity-100">
                    Cookies
                  </Text>
                </button>
              </div>
            </Col>
          </Container>
        </div>

        {/* Scroll to top button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-xl z-50"
          style={{ 
            backgroundColor: '#FF5B00',
            color: '#16141F',
            boxShadow: '0 4px 20px rgba(255, 91, 0, 0.3)'
          }}>
          <span className="text-lg">⬆️</span>
        </button>
      </div>
    </footer>
  );
};

export default FooterSection;