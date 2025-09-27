import React from "react";
import { Container, Col } from "@citrica/objects";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Icon from "@ui/atoms/icon";
import Footer from "@ui/organism/footer";
import GradientText from "@/shared/components/project-components/gradient-text";

// export const dynamic = "force-dynamic";

// export default async function Home() {
const LandingRestaurantes = () => {
  const services = [
    {
      title: "Transforme Clicks en Comensales",
      description:
        "Landing pages diseñadas para convertir visitantes en reservas confirmadas y pedidos directos, con menús irresistibles y ofertas exclusivas.",
      icon: "Globe",
      color: "#E1FF00",
      gradientColors: ["#E1FF00 , #62FF00, #E1FF00 , #62FF00, #E1FF00"],
    },
    {
      title: "Su Restaurante, Abierto 24/7 en la Web",
      description:
        "Un sitio web elegante y funcional que muestra su carta, galería, sistema de reservas y atrae a nuevos clientes que buscan la mejor experiencia gastronómica.",
      icon: "Monitor",
      color: "#00FFFF",
      gradientColors: ["#00FFFF , #00FF88, #00FFFF , #00FF88, #00FFFF"],
    },
    {
      title: "Agilice su Operación, Reduzca Costos",
      description:
        "Desarrollamos aplicaciones web intuitivas para gestión de mesas, inventario, pedidos o personal, optimizando cada proceso de su negocio.",
      icon: "Code",
      color: "#FF5B00",
      gradientColors: [" #FF5B00 , #FF0400, #FF5B00 , #FF0400, #FF5B00"],
    },
    {
      title: "Su Restaurante, Directo al Bolsillo de sus Clientes",
      description:
        "Apps móviles personalizadas para pedidos a domicilio/recogida, programas de fidelidad y reservas instantáneas, creando una conexión directa y recurrente.",
      icon: "Smartphone",
      color: "#FF00D4",
      gradientColors: ["#FF00D4 , #C300FF, #FF00D4 , #C300FF, #FF00D4"],
    },
    {
      title: "Inteligencia Artificial para un Servicio Excepcional",
      description:
        "Implemente IA para chatbots de reserva y atención 24/7, recomendaciones personalizadas de platos y automatización que eleva la experiencia del cliente y la eficiencia.",
      icon: "Sparkles",
      color: "#E1FF00",
      gradientColors: ["#E1FF00 , #62FF00, #E1FF00 , #62FF00, #E1FF00"],
    },
    {
      title: "Llene sus Mesas con Estrategias que Convierten",
      description:
        "Campañas de marketing digital enfocadas en atraer comensales locales, aumentar su visibilidad online y generar reservas y pedidos constantes para su negocio.",
      icon: "Megaphone",
      color: "#00FFFF",
      gradientColors: ["#00FFFF , #00FF88, #00FFFF , #00FF88, #00FFFF"],
    },
  ];

  return (
    <>
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
              <Button label="Comenzar Ahora" variant="primary" />
              <Button label="Conocer Más" variant="secondary" />
            </div>
          </Col>
        </Container>
      </section>

      {/* Services Grid */}
      <section className="hero-background-image-flip">
        <Container className="py-20">
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="mb-10 text-center"
          >
            <h3 className="mb-4">
              <Text variant="headline" color="#FF5B00" weight="bold">
                Nuestros servicios
              </Text>
            </h3>
            <p>
              <Text variant="body" color="#ffffff">
                Soluciones integrales diseñadas específicamente para el sector
                gastronómico
              </Text>
            </p>
          </Col>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            noPadding
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
          >
            {services.map((service, index) => (
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

      {/* Why Choose Us Section */}
      <section className="py-[80px] bg-primary-container">
        <Container>
          <Col cols={{ lg: 6, md: 3, sm: 4 }} className="flex items-center">
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
          </Col>
          <Col
            cols={{ lg: 6, md: 3, sm: 4 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-6">
              <h2>
                <Text variant="headline" textColor="color-on-primary-container">
                  ¿Por Qué Elegir Cítrica?
                </Text>
              </h2>
            </div>
            <div className="mb-6">
              <p>
                <Text variant="body" textColor="color-on-primary-container">
                  Somos especialistas en soluciones digitales para el sector
                  gastronómico con tecnología de vanguardia y resultados
                  comprobados.
                </Text>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Check" size={16} className="text-on-success" />
                </div>
                <div>
                  <Text variant="body" textColor="color-on-primary-container">
                    <strong>Especialización Gastronómica:</strong> Desarrollamos
                    soluciones digitales específicamente diseñadas para
                    restaurantes, bares y cafés
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Check" size={16} className="text-on-success" />
                </div>
                <div>
                  <Text variant="body" textColor="color-on-primary-container">
                    <strong>Tecnología Avanzada:</strong> Integramos IA y las
                    últimas tecnologías web para maximizar la eficiencia de tu
                    negocio
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="Check" size={16} className="text-on-success" />
                </div>
                <div>
                  <Text variant="body" textColor="color-on-primary-container">
                    <strong>Soluciones Completas:</strong> Desde el diseño web
                    hasta apps móviles y marketing digital, cubrimos todas tus
                    necesidades digitales
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Client Types Section */}
      <section className="py-[80px] bg-surface">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
            <div className="mb-4">
              <h2>
                <Text variant="headline" textColor="color-on-surface">
                  Trabajamos Con Todo Tipo de Negocios
                </Text>
              </h2>
            </div>
            <div>
              <p>
                <Text variant="body" textColor="color-on-surface-var">
                  Desde pequeños cafés hasta grandes cadenas de restaurantes
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 3, md: 3, sm: 2 }} className="text-center mb-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <Icon name="Coffee" size={40} className="text-on-primary" />
              </div>
            </div>
            <div className="mb-4">
              <h3>
                <Text variant="title" textColor="color-on-surface">
                  Cafés y Salas de Té
                </Text>
              </h3>
            </div>
            <div>
              <p>
                <Text variant="body" textColor="color-on-surface-var">
                  Websites profesionales, apps de pedidos y chatbots con IA para
                  crear experiencias digitales únicas
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 3, md: 3, sm: 2 }} className="text-center mb-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto">
                <Icon
                  name="UtensilsCrossed"
                  size={40}
                  className="text-on-secondary"
                />
              </div>
            </div>
            <div className="mb-4">
              <h3>
                <Text variant="title" textColor="color-on-surface">
                  Restaurantes
                </Text>
              </h3>
            </div>
            <div>
              <p>
                <Text variant="body" textColor="color-on-surface-var">
                  Sistemas de reservas online, menús digitales, apps de delivery
                  y marketing digital para aumentar ventas
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 3, md: 3, sm: 2 }} className="text-center mb-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-tertiary rounded-2xl flex items-center justify-center mx-auto">
                <Icon name="Wine" size={40} className="text-on-tertiary" />
              </div>
            </div>
            <div className="mb-4">
              <h3>
                <Text variant="title" textColor="color-on-surface">
                  Bares y Pubs
                </Text>
              </h3>
            </div>
            <div>
              <p>
                <Text variant="body" textColor="color-on-surface-var">
                  Landing pages atractivas, sistemas de eventos online y
                  marketing en redes sociales para aumentar el tráfico
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lg: 3, md: 3, sm: 2 }} className="text-center mb-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-cuaternary rounded-2xl flex items-center justify-center mx-auto">
                <Icon name="Store" size={40} className="text-on-cuaternary" />
              </div>
            </div>
            <div className="mb-4">
              <h3>
                <Text variant="title" textColor="color-on-surface">
                  Cadenas y Franquicias
                </Text>
              </h3>
            </div>
            <div>
              <p>
                <Text variant="body" textColor="color-on-surface-var">
                  Plataformas escalables, apps corporativas y sistemas de
                  gestión digital para múltiples ubicaciones
                </Text>
              </p>
            </div>
          </Col>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-[80px] bg-gradient-to-r from-primary to-secondary">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center">
            <div className="mb-6">
              <h2>
                <Text variant="headline" textColor="color-on-primary">
                  ¿Listo para Digitalizar tu Negocio Gastronómico?
                </Text>
              </h2>
            </div>
            <div className="mb-8">
              <p>
                <Text variant="body" textColor="color-on-primary">
                  Contáctanos hoy y descubre cómo nuestras soluciones web, apps
                  móviles e IA pueden transformar tu restaurante
                </Text>
              </p>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button label="Solicitar Demo Gratuita" variant="primary" />
              <Button label="Ver Nuestro Portfolio" variant="secondary" />
            </div>
          </Col>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-[80px] bg-surface-container">
        <Container>
          <Col cols={{ lg: 6, md: 3, sm: 4 }}>
            <div className="mb-6">
              <h2>
                <Text variant="headline" textColor="color-on-surface">
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
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Icon name="Mail" size={24} className="text-on-primary" />
                </div>
                <div>
                  <Text variant="body" textColor="color-on-surface">
                    contacto@citrica.com
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Icon name="Phone" size={24} className="text-on-primary" />
                </div>
                <div>
                  <Text variant="body" textColor="color-on-surface">
                    +1 (555) 123-4567
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Icon name="MapPin" size={24} className="text-on-primary" />
                </div>
                <div>
                  <Text variant="body" textColor="color-on-surface">
                    123 Calle Principal, Ciudad, País
                  </Text>
                </div>
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 3, sm: 4 }}>
            <div className="bg-surface rounded-2xl p-8">
              <div className="mb-6">
                <h3>
                  <Text variant="title" textColor="color-on-surface">
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

      <Footer />
    </>
  );
};

export default LandingRestaurantes;
