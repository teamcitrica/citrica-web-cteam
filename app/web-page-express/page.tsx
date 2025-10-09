"use client"
import React from 'react'
import { Container, Col } from '@citrica/objects'
import Text from '@ui/atoms/text'
import Icon from '@ui/atoms/icon'
import Button from '@ui/molecules/button'
import { addToast } from "@heroui/toast"
import DotGrid from '../versions/yolanda/components/DotGrid'
import { Divider, Link } from '@heroui/react'
import { FooterCitrica } from "@/shared/components/project-components/footer-citrica";


const CitricaLanding = () => {
  const services = [
    {
      title: "Sitio Web Profesional",
      description: "",
      icon: "Globe",
      color: "#E1FF00",
    },
    {
      title: "Desarrollo Express",
      description: "",
      icon: "Zap",
      color: "#00FFFF",
    },
    {
      title: "Costo accesible",
      description: "",
      icon: "DollarSign",
      color: "#FF5B00",
    },
    {
      title: "100% Responsive",
      description: "",
      icon: "CheckCircle",
      color: "#E1FF00",
    }
  ]

  const handleContactClick = () => {
    addToast({
      title: "¡Gracias por tu interés!",
      description: "En breve nos pondremos en contacto contigo",
      color: "success",
      radius: "sm",
    });
  };

  const handleScheduleMeeting = () => {
    addToast({
      title: "Reunión programada",
      description: "Te enviaremos un enlace de calendario",
      color: "success",
      radius: "sm",
    });
  };

  const process = [
    { icon: "Rocket", title: "Emprendedores & Startups", description: "Lanza tu presencia digital rápidamente sin inversiones enormes.", color: "#e1ff00" },
    { icon: "User", title: "Profesionales Independientes", description: "Muestra tu portafolio y servicios de manera profesional.", color: "#ff5b00" },
    { icon: "Building", title: "Pequeñas Empresas", description: "Establece tu presencia online y atrae más clientes locales", color: "#00FFFF" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="inicio" className="min-h-screen pt-44 relative overflow-hidden bg-color-ct-black bg-cover bg-center" style={{ backgroundImage: "url('/img/light-speed.jpg')" }}>
        <div className="absolute inset-0 -z-80">
          <DotGrid
            dotSize={4}
            gap={16}
            baseColor="#006666"
            activeColor="#E1ff00"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
        <Container>
          <Col cols={{ lg: 10, md: 6, sm: 4 }} className="text-center mx-auto mb-12">
            <div className="text-dark-bkg mb-12 bg-opacity-10 backdrop-blur-sm p-8 rounded-3xl border border-white border-opacity-10">
              <h1 className='mb-2'>
                <Text variant="subtitle" weight="bold" color="#FF5B00">
                  PÁGINAS WEB EXPRESS
                </Text>
              </h1>
              <h2 className='mb-5 balance-text'>
                <Text variant="display" textColor="color-text-white">
                  Tu negocio en línea, listo para el despegue <span className='ct-color-primary'>en una semana.</span> 
                </Text>
              </h2>

              <p className='pb-8 text-ch-width balance-text center'>
                <Text variant='body' textColor='color-text-white'>
                  Una solución rápida para tener una presencia digital profesional mediante una página web de alto impacto.
                </Text>
              </p>
              
            <div className="flex justify-center space-x-4 mb-2">
              <Button
                onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                label="¡Quiero mi página!"
                variant="primary"
                className='px-8 bg-[#FF5B00] rounded-[80]'                
              />
              <Button
                onClick={() => document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth' })}
                label="Ver Proyectos"
                variant="secondary"
                className="hidden bg-[#E5FFFF] text-[#16141F] border border-[rgba(22,20,31,0.06)] px-8 rounded-[80]"
              />
            </div>
            </div>
          </Col>
        </Container>

        {/* Services Grid */}
        <Container className='bg-opacity-10 backdrop-blur-sm p-8 rounded-3xl border border-white border-opacity-10'>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {services.map((service, index) => (
              <div key={index} className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 hover:bg-opacity-10 transition-all duration-300 hover:transform hover:scale-105 flex flex-col items-center text-center">
                <div className="mb-4 flex items-center justify-center" style={{ backgroundColor: '#16141F', width: '48px', height: '48px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={service.icon as any} color={service.color} size={32} />
                </div>
                <h3 className="mb-4">
                  <Text variant="subtitle" color="#ffffff" weight="bold">
                    {service.title}
                  </Text>
                </h3>
                <Text variant="body" color="#ffffff" className="opacity-60">
                  {service.description}
                </Text>
                <div
                  className="mt-8 h-1 w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${service.color}00, ${service.color}, ${service.color}00)`,
                  }}
                />
              </div>
            ))}
          </Col>
        </Container>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 bg-color-ct-black ">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12">
            <h2>
              <Text variant="headline" weight='bold' textColor="color-primary">
                ¿Por qué elegir Web Page Express?
              </Text>
            </h2>
            <p className="mt-4">
              <Text variant="body" textColor="color-text-white">
                La solución perfecta para quienes necesitan una presencia digital profesional sin complicaciones
              </Text>
            </p>
          </Col>

          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="mb-8">
            <div className="text-center p-6 bg-white border-4 border-[#00FFFF] rounded-xl h-full">
              <div className="flex justify-center mb-4">
                <Icon name="Clock" size={48} color="#16141F" />
              </div>
              <h3>
                <Text variant="subtitle" weight='bold' textColor="color-primary">
                  Rapidez Express
                </Text>
              </h3>
              <p className="mt-3">
                <Text variant="body" textColor="color-text-black">
                  Tu sitio web estará listo en días, no meses. Proceso optimizado para máxima eficiencia.
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="mb-8">
            <div className="text-center p-6 bg-white border-4 border-[#00FFFF] rounded-xl h-full">
              <div className="flex justify-center mb-4">
                <Icon name="Palette" size={48} color="#16141F" />
              </div>
              <h3>
                <Text variant="subtitle" weight='bold' textColor="color-primary">
                  Diseño Profesional
                </Text>
              </h3>
              <p className="mt-3">
                <Text variant="body" textColor="color-text-black">
                  Diseños modernos y responsive que se adaptan perfectamente a todos los dispositivos.
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="mb-8">
            <div className="text-center p-6 bg-white border-4 border-[#00FFFF] rounded-xl h-full">
              <div className="flex justify-center mb-4">
                <Icon name="DollarSign" size={48} color="#16141F" />
              </div>
              <h3>
                <Text variant="subtitle" weight='bold' textColor="color-primary">
                  Precio Transparente
                </Text>
              </h3>
              <p className="mt-3">
                <Text variant="body" textColor="color-text-black">
                  Sin sorpresas. $300 USD + hosting. Todo incluido, sin costos ocultos.
                </Text>
              </p>
            </div>
          </Col>
        </Container>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-color-ct-white">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12">
            <h2>
              <Text variant="headline" weight='bold' textColor="color-primary">
                Proceso Simple en 4 Pasos
              </Text>
            </h2>
            <p className="mt-4">
              <Text variant="body" textColor="color-text-black">
                Desde la primera reunión hasta la publicación de tu sitio web
              </Text>
            </p>
          </Col>

          <Col cols={{ lg: 3, md: 3, sm: 4 }} className="mb-8">
            <div className="text-center">
              <div className="bg-color-ct-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-color-black">1</span>
              </div>
              <h3>
                <Text variant="subtitle" weight='bold' textColor="color-primary">
                  Reunión Inicial
                </Text>
              </h3>
              <p className="mt-2">
                <Text variant="body" textColor="color-text-black">
                  Conversamos sobre tus necesidades y despejamos todas las dudas
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 3, md: 3, sm: 4 }} className="mb-8">
            <div className="text-center">
              <div className="bg-color-ct-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-color-black">2</span>
              </div>
              <h3>
                <Text variant="subtitle" weight='bold' textColor="color-primary">
                  Formulario Detallado
                </Text>
              </h3>
              <p className="mt-2">
                <Text variant="body" textColor="color-text-black">
                  Completas un formulario con toda la información necesaria para tu web
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 3, md: 3, sm: 4 }} className="mb-8">
            <div className="text-center">
              <div className="bg-color-ct-tertiary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-color-black0">3</span>
              </div>
              <h3>
                <Text variant="subtitle" weight='bold' textColor="color-primary">
                  Propuesta y Ajustes
                </Text>
              </h3>
              <p className="mt-2">
                <Text variant="body" textColor="color-text-black">
                  Te presentamos la propuesta y realizamos una ronda de ajustes
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 3, md: 3, sm: 4 }} className="mb-8">
            <div className="text-center">
              <div className="bg-color-ct-cuaternary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-color-black">4</span>
              </div>
              <h3>
                <Text variant="subtitle" weight='bold' textColor="color-primary">
                  Publicación
                </Text>
              </h3>
              <p className="mt-2">
                <Text variant="body" textColor="color-text-black">
                  Aplicamos los ajustes finales y publicamos tu sitio web
                </Text>
              </p>
            </div>
          </Col>
        </Container>
      </section>

      {/* Target Audience Section */}
      <section id="process" className="py-20">
        <Container>

          <div className="space-y-12">
            <Col cols={{ lgPush: 2, lg: 8, md: 6, sm: 4 }} className="text-center mb-12">
              <div className="text-center space-y-4">
                <h2>
                  <Text variant="headline" color="#FF5B00" weight="bold">
                    Perfecto Para
                  </Text>
                </h2>
              </div>
            </Col>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
              {process.map((step, index) => (
                <div key={index} className="relative bg-color-ct-white">
                  <div className="relative p-8 h-full border-2 rounded-xl hover:shadow-xl transition-all duration-500 group-hover:scale-105 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm hover:from-white/20 hover:to-white/10">
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: '#16141F' }}>
                          <Icon name={step.icon as any} size={24} className="w-6 h-6"
                            style={{ color: step.color }}
                          />
                        </div>
                        <h3>
                          <Text variant="subtitle" color="#16141F">
                            {step.title}
                          </Text>
                        </h3>
                      </div>
                      <p>
                        <Text variant="body" color="#16141F" className="opacity-80 leading-relaxed">
                          {step.description}
                        </Text>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-color-ct-on-tertiary text-white">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12">
            <h2>
              <Text variant="headline" weight='bold' textColor="color-primary">
                Precio Transparente
              </Text>
            </h2>
            <p className="mt-4">
              <Text variant="body" textColor="color-text-white">
                Sin sorpresas, sin costos ocultos
              </Text>
            </p>
          </Col>

          <Col cols={{ lg: 6, md: 4, sm: 4, lgPush: 3 }} className="lg:col-start-3 md:col-start-2">
            <div className="bg-white rounded-2xl py-8 px-16 text-center text-gray-900">
              <h3 className="mb-2">
                <Text variant="subtitle" weight='bold' textColor="color-on-tertiary">
                  Web Page Express
                </Text>
              </h3>
              <div className="mb-8">
                <span className="text-3xl ct-color-primary ml-2">US</span>
                <span className="text-4xl font-bold ct-color-primary ml-2">$</span>
                <span className="text-5xl font-bold ct-color-primary">300</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Icon name="Check" size={20} color="#10B981" />
                  <span>Diseño responsive profesional</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Icon name="Check" size={20} color="#10B981" />
                  <span>Optimizado para SEO</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Icon name="Check" size={20} color="#10B981" />
                  <span>Formulario de contacto</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Icon name="Check" size={20} color="#10B981" />
                  <span>Integración con redes sociales</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Icon name="Check" size={20} color="#10B981" />
                  <span>Una ronda de ajustes incluida</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Icon name="Check" size={20} color="#10B981" />
                  <span>Entrega en máximo 7 días</span>
                </li>
              </ul>

              <p className="text-sm text-gray-600 mb-6">
                * Costo de hosting por separado (desde $5/mes)
              </p>

              <Button
                onClick={handleContactClick}
                label="Comenzar mi proyecto"
                variant="primary"
                textVariant="body"
                className='px-8 bg-[#FF5B00] rounded-[80]'                                
              />
            </div>
          </Col>
        </Container>
      </section>

      {/* CTA Final */}
      <section id="contacto" className="py-20" style={{ backgroundColor: '#E1FF00' }}>
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mx-auto">
            <h2 className="mb-6">
              <Text variant="headline" color="#16141F" weight="bold">
                ¿Listo para tener tu sitio web?
              </Text>
            </h2>
            <div className="mb-8">
              <Text variant="body" color="#16141F" className="opacity-80">
                Comienza hoy mismo y ten tu presencia digital lista en una semana.
              </Text>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <Button
                onClick={() => window.open('mailto:admin@citrica.dev', '_blank')}
                label="Escribir Email"
                variant="primary"
                className='bg-[#ffffff] text-sm rounded-[80] px-8'
              />
              <Button
                onClick={() => window.open('https://wa.me/51942627383', '_blank')}
                label="WhatsApp"
                variant="primary"
                className='bg-[#ffffff] text-sm rounded-[80] px-8'
              />
            </div>
            <div className="flex flex-col justify-center items-center space-x-8 gap-4">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" color="#16141F" size={20} />
                <Link
                  href="mailto:admin@citrica.dev"
                >
                  <Text variant="body" color="#16141F" weight="bold">
                    contacto@citrica.com
                  </Text>
                </Link>

              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Phone" color="#16141F" size={20} />
                <Link
                  href="tel:+51942627383"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Text variant="body" color="#16141F" weight="bold">
                    +51 942 627-383
                  </Text>
                </Link>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Footer */}
      {/* <footer className="pt-12" style={{ backgroundColor: '#16141F', borderTop: '1px solid rgba(225, 255, 0, 0.2)' }}>
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className='flex flex-col text-center justify-center gap-2'>
            <div className="flex items-center justify-center lg:justify-center space-x-2">
              <div className="w-24 h-16">
                <img
                  src="/img/citrica-logo.png"
                  alt="Logo Cítrica"
                />
              </div>
            </div>
            <h2 className="mb-8 lg:text-center md:text-center">
              <Text variant="label" color="#E5FFFF" className="opacity-70">
                Transformamos ideas en soluciones digitales que impulsan el crecimiento de tu negocio.
              </Text>
            </h2>
          </Col>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mt-8">
            <Divider className="mb-8 bg-gray-800" />
            <div className='flex justify-center'>
              <h2 className="mb-8">
                <Text variant="label" color="#E5FFFF" className="opacity-50">
                  © 2025 Cítrica.
                </Text>
              </h2>
              <div className="flex justify-center lg:justify-end space-x-6 mb-8">
                <Link
                  href="https://www.facebook.com/citrica"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Instagram" color="#E5FFFF" size={24} className="transition-all duration-300" />
                </Link>
                <Link
                  href="https://www.facebook.com/citrica"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Twitter" color="#E5FFFF" size={24} className="transition-all duration-300" />
                </Link>
                <Link
                  href="https://www.facebook.com/citrica"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Linkedin" color="#E5FFFF" size={24} className="transition-all duration-300" />
                </Link>
                <Link
                  href="https://www.facebook.com/citrica"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="Github" color="#E5FFFF" size={24} className="transition-all duration-300" />
                </Link>
              </div>
            </div>
          </Col>
        </Container>
      </footer> */}
      <FooterCitrica />
    </div>
  )
}

export default CitricaLanding