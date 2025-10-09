"use client";
import React from "react";
import { Container, Col } from "@citrica/objects";
import { Text, Icon, Button, Header, Input } from "@citrica-ui";
import Footer from "@ui/organism/footer";
import GradientText from "@/shared/components/project-components/gradient-text";
import {
  restaurantServices,
  solucionesNegocios,
} from "@/shared/archivos js/landing-restaurant-data";
import { FooterCitrica } from "@/shared/components/project-components/footer-citrica";

// export const dynamic = "force-dynamic";

// export default async function Home() {
const LandingRestaurantes = () => {

  const logo = (
    <div className="flex items-center space-x-2">
      <img src="/img/citrica-logo.png" alt="Cítrica Logo" className="h-10" />
    </div>
  );
  
  return (
    <>
     <Header
            logo={logo}
            variant="standard"
            className="bg-color-ct-black"
            showButton={true}
            buttonText="Contáctanos"
          />
      {/* Hero Section */}
      <section className="pt-[80px] pb-[80px] h-[700px]">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-[700px] object-cover"
          >
            <source
              src="/video/3135924-hd_1920_1080_30fps.mp4"
              type="video/mp4"
            />
            Tu navegador no soporta la etiqueta de video.
          </video>
        </div>
        <div className="absolute inset-0 bg-color-ct-black opacity-70 h-[700px]"></div>

        <Container className="relative z-10">
          <Col
            cols={{ lg: 6, md: 3, sm: 4 }}
            className="flex flex-col justify-center min-h-[500px]"
          >
            <div className="mb-6">
              <h1 className="text-balance pb-2">
                <Text
                  variant="display"
                  weight="bold"
                  textColor="color-text-white"
                >
                  ¡Su Restaurante al Nivel de la Era Digital!
                </Text>
              </h1>
              <h2>
                <Text variant="subtitle" textColor="color-text-white">
                  Aumente Reservas y Pedidos con Tecnología Especializada.
                </Text>
              </h2>
            </div>

            <div className="mb-8">
              <p>
                <Text variant="body" textColor="color-text-white">
                  En Cítrica, creamos soluciones digitales que transforman
                  negocios gastronómicos. Desde landing pages que convierten
                  hasta apps móviles innovadoras con IA, digitalizamos tu
                  negocio para el éxito.
                </Text>
              </p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <a href="mailto:contacto@citrica.dev">
                <Button label="Comenzar Ahora" variant="primary" />
              </a>

              <Button label="Conocer Más" variant="secondary" />
            </div>
          </Col>
        </Container>
      </section>

      {/* Services Grid */}
      <section className="rest-solucions-background-image">
        <Container className="py-20">
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="mb-10 text-center">
            <h3 className="mb-4">
              <Text variant="headline" color="#FF5B00" weight="bold">
                Soluciones integrales
              </Text>
            </h3>
            <p>
              <Text variant="body" color="#ffffff">
                Diseñadas específicamente para el sector gastronómico
              </Text>
            </p>
          </Col>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            noPadding
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
          >
            {restaurantServices.map((service, index) => (
              <div
                key={index}
                className="bg-black/20 backdrop-blur-xl border-2 border-[#003333] rounded-2xl p-6 flex flex-col items-center text-center"
              >
                <div
                  className="mb-4 flex items-center justify-center"
                  style={{
                    backgroundColor: "#16141F",
                    width: "48px",
                    height: "48px",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    name={service.icon as any}
                    color={service.color}
                    size={32}
                  />
                </div>
                <h2 className="mb-4 text-balance">
                  <GradientText
                    colors={service.gradientColors}
                    animationSpeed={3}
                    showBorder={false}
                  >
                    <Text variant="subtitle" weight="bold">
                      {service.title}
                    </Text>
                  </GradientText>
                </h2>
                <p>
                  <Text variant="body" color="#ffffff" className="opacity-80">
                    {service.description}
                  </Text>
                </p>
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

      {/* Why Choose Us Section */}
      <section className="py-[80px] relative bg-white">
        <Container>
          {/* <Col cols={{ lg: 6, md: 3, sm: 4 }} className="flex items-center">
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="bg-surface rounded-xl p-6 text-center">
                <div className="mb-4">
                  <Text variant="display" textColor="color-primary">
                    200+
                  </Text>
                </div>
                <div>
                  <Text variant="label" textColor="color-on-surface">
                    Clientes Satisfechos
                  </Text>
                </div>
              </div>
              <div className="bg-surface rounded-xl p-6 text-center">
                <div className="mb-4">
                  <Text variant="display" textColor="color-primary">
                    95%
                  </Text>
                </div>
                <div>
                  <Text variant="label" textColor="color-on-surface">
                    Tasa de Éxito
                  </Text>
                </div>
              </div>
              <div className="bg-surface rounded-xl p-6 text-center">
                <div className="mb-4">
                  <Text variant="display" textColor="color-primary">
                    5+
                  </Text>
                </div>
                <div>
                  <Text variant="label" textColor="color-on-surface">
                    Años de Experiencia
                  </Text>
                </div>
              </div>
              <div className="bg-surface rounded-xl p-6 text-center">
                <div className="mb-4">
                  <Text variant="display" textColor="color-primary">
                    24/7
                  </Text>
                </div>
                <div>
                  <Text variant="label" textColor="color-on-surface">
                    Soporte Disponible
                  </Text>
                </div>
              </div>
            </div>
          </Col> */}
          <Col
            cols={{ lg: 6, md: 3, sm: 4 }}
            className="flex flex-col justify-center"
          >
            {/* <div className="mb-2">
              <h2>
                <Text
                  variant="headline"
                  weight="bold"
                  textColor="color-primary"
                >
                  ¿Por Qué Elegir Cítrica?
                </Text>
              </h2>
            </div> */}
            <div className="mb-6">
              <h3>
                <Text
                  variant="headline"
                  weight="bold"
                  textColor="color-primary"
                >
                  Especialización y Tecnología para su Rentabilidad.
                </Text>
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Check" size={16} className="text-on-success" />
                </div>
                <div>
                  <Text variant="body" textColor="color-text-black">
                    <strong>Enfoque 100% Gastronómico:</strong> No somos
                    generalistas. Cada solución está diseñada para resolver los
                    desafíos únicos de restaurantes, bares y cafés, no de
                    cualquier negocio.
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Check" size={16} className="text-on-success" />
                </div>
                <p>
                  <Text variant="body" textColor="color-text-black">
                    <strong>Tecnología que Vende:</strong> Integramos IA y las
                    últimas tendencias web para maximizar su eficiencia,
                    minimizar errores y{" "}
                    <strong>aumentar su ticket promedio.</strong>
                  </Text>
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Check" size={16} className="text-on-success" />
                </div>
                <div>
                  <Text variant="body" textColor="color-text-black">
                    <strong>Servicio Integral 360°:</strong> Cubrimos todas sus
                    necesidades digitales, desde el diseño de su web o app de
                    pedidos hasta la estrategia de marketing que lo posiciona
                    como líder.
                  </Text>
                </div>
              </div>
            </div>
          </Col>
          <div className="rest-technology-img-container">
            <img src="/img/technology-img.jpg" alt="Imagen tecnologeia" className="rest-technology-img"/>
          </div>
        </Container>
      </section>

      {/* Client Types Section */}
      <section className="py-[80px] bg-surface rest-solucions-background-image">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <h2>
              <Text variant="headline" weight="bold" textColor="color-primary">
                Soluciones Digitales a la Medida de Cada Negocio
              </Text>
            </h2>
          </Col>

          {/* Grid de Soluciones Negocios */}
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            noPadding
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {solucionesNegocios.map((tech, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-md border-4 transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ borderColor: tech.color }}
                data-aos="fade-up"
                data-aos-duration="1500"
              >
                {/* Icono */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: tech.color }}
                >
                  <Icon name={tech.icon as any} color="#16141F" size={24} />
                </div>

                {/* Título */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  <Text variant="body" color="#16141F" weight="bold">
                    {tech.title}
                  </Text>
                </h3>

                {/* Descripción */}
                <p
                  className="text-description text-gray-600 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: tech.description }}
                ></p>
              </div>
            ))}
          </Col>
        </Container>
      </section>

      {/* CTA Section */}
      <section
        id="contacto"
        className="py-20"
        style={{ backgroundColor: "#E1FF00" }}
      >
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mx-auto">
            <h2 className="mb-2">
              <Text variant="headline" color="#16141F" weight="bold">
                ¿Listo para transformar tu negocio gastronómico?
              </Text>
            </h2>
            <p className="text-ch-width center text-balance">
              <Text variant="subtitle" color="#16141F" className="opacity-80">
                Contáctanos hoy y descubre cómo nuestras soluciones pueden
                transformar tu restaurante.
              </Text>
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() =>
                  window.open("mailto:contacto@citrica.dev", "_blank")
                }
                label="Escribir Email"
                variant="primary"
                textVariant="body"
              />
              {/* <Button
                onClick={() =>
                  window.open("https://wa.me/51942627383", "_blank")
                }
                label="WhatsApp"
                variant="primary"
              /> */}
            </div>
            {/* <div className="flex flex-col justify-center items-center gap-1">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" color="#16141F" size={20} />
                <Link href="mailto:contacto@citrica.dev">
                  <Text variant="body" color="#16141F" weight="bold">
                    contacto@citrica.dev
                  </Text>
                </Link>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Phone" color="#16141F" size={20} />
                  <Link
                    href="tel:+51942627383"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Text variant="body" color="#16141F" weight="bold">
                      Perú: +51 942 627 383
                    </Text>
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href="tel:+59892041487"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Text variant="body" color="#16141F" weight="bold">
                      Uruguay: +598 92 041487
                    </Text>
                  </Link>
                </div>
              </div>
            </div> */}
          </Col>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-[80px] bg-surface-container">
        <Container>
          <Col cols={{ lg: 6, md: 3, sm: 4 }}>
            <div className="mb-6">
              <h2>
                <Text
                  variant="headline"
                  weight="bold"
                  textColor="color-primary"
                >
                  Ponte en Contacto
                </Text>
              </h2>
            </div>
            <div className="mb-8">
              <p>
                <Text variant="body" textColor="color-on-surface-var">
                  Estamos aquí para responder tus preguntas y ayudarte a
                  comenzar tu transformación digital con soluciones web
                  innovadoras
                </Text>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-color-ct-primary rounded-xl flex items-center justify-center">
                  <Icon name="Mail" size={24} className="bg-color-ct-primary ct-color-white" />
                </div>
                <div>
                  <Text variant="body" textColor="color-on-surface">
                    contacto@citrica.dev
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-color-ct-primary rounded-xl flex items-center justify-center">
                  <Icon name="Phone" size={24} className="bg-color-ct-primary ct-color-white" />
                </div>
                <p>
                  <Text variant="body" textColor="color-on-surface">
                    Perú +51 942 627 383

                  </Text>
                </p>
                 <p>
                  <Text variant="body" textColor="color-on-surface">
                    Uruguay +598 92 041 487
                  </Text>
                </p>
                
              </div>

              
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 3, sm: 4 }}>
            <div className="bg-color-ct-white rounded-2xl p-8">
              <div className="mb-6">
                <h3>
                  <Text variant="title" textColor="color-primary">
                    Envíanos un Mensaje
                  </Text>
                </h3>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block mb-2">
                    <Text variant="label" textColor="color-on-surface">
                      Nombre *
                    </Text>
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-outline rounded-lg bg-surface-container text-on-surface"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    <Text variant="label" textColor="color-on-surface">
                      Email *
                    </Text>
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 border border-outline rounded-lg bg-surface-container text-on-surface"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    <Text variant="label" textColor="color-on-surface">
                      Servicio de Interés
                    </Text>
                  </label>
                  <select className="w-full p-3 border border-outline rounded-lg bg-surface-container text-on-surface">
                    <option>Selecciona el servicio que te interesa</option>
                    <option>Landing Page / Website</option>
                    <option>Aplicación Web</option>
                    <option>Aplicación Móvil</option>
                    <option>Marketing Digital</option>
                    <option>Integración de IA</option>
                    <option>Paquete Completo</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">
                    <Text variant="label" textColor="color-on-surface">
                      Mensaje
                    </Text>
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-3 border border-outline rounded-lg bg-surface-container text-on-surface"
                    placeholder="Cuéntanos sobre tu negocio y qué solución digital necesitas (website, app, marketing, IA, etc.)"
                  ></textarea>
                </div>

                <Button label="Enviar Mensaje" variant="primary" />
              </form>
            </div>
          </Col>
        </Container>
      </section>
      <FooterCitrica />
    </>
  );
};

export default LandingRestaurantes;
