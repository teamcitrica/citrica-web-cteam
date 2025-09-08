"use client"
import React from 'react'
import { Container, Col } from '@citrica/objects'
import Text from '@ui/atoms/text'
import Icon from '@ui/atoms/icon'
import Button from '@ui/molecules/button'
import { addToast } from "@heroui/toast"

const CitricaLanding = () => {
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-white to-gray-50">
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
    </div>
        <Container>
          <Col cols={{ lg: 6, md: 6, sm: 4 }} className="flex flex-col justify-center min-h-[60vh]">
            <div className="space-y-6">
              <h1>
                <Text variant="display" weight="bold" textColor="color-primary">
                  Web Page Express
                </Text>
              </h1>
              <h2>
                <Text variant="headline" textColor="color-primary">
                  Tu sitio web profesional en una semana o menos
                </Text>
              </h2>
              <p>
                <Text variant="body" weight='bold' textColor="color-text-black">
                  Desarrollo web express en tiempo record. <br />
                  Solo USD $300 + hosting gratis por 3 meses. <br />
                  Tu presencia digital para un lanzamiento inmediato.
                </Text>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleContactClick}
                  label="Comenzar ahora"
                  variant="primary"
                  color="primary"
                  textVariant="body"
                />
                <Button 
                  onClick={handleScheduleMeeting}
                  label="Agendar reunión"
                  variant="secondary"
                  color="default"
                  textVariant="body"
                />
              </div>
            </div>
          </Col>
          <Col cols={{ lg: 6, md: 6, sm: 4 }} className="flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Icon name="Globe" size={24} color="#39aab4" />
                  <span className="text-lg font-medium">Sitio Web Profesional</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Zap" size={24} color="#39aab4" />
                  <span className="text-lg font-medium">Desarrollo Express</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="DollarSign" size={24} color="#39aab4" />
                  <span className="text-lg font-medium">Solo $300 USD</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" size={24} color="#39aab4" />
                  <span className="text-lg font-medium">100% Responsive</span>
                </div>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 bg-white">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12">
            <h2>
              <Text variant="headline" textColor="color-text-black">
                ¿Por qué elegir Web Page Express?
              </Text>
            </h2>
            <p className="mt-4">
              <Text variant="body" textColor="color-text-black">
                La solución perfecta para quienes necesitan una presencia digital profesional sin complicaciones
              </Text>
            </p>
          </Col>
          
          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="mb-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl h-full">
              <div className="flex justify-center mb-4">
                <Icon name="Clock" size={48} color="#39aab4" />
              </div>
              <h3>
                <Text variant="title" textColor="color-text-black">
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
            <div className="text-center p-6 bg-gray-50 rounded-xl h-full">
              <div className="flex justify-center mb-4">
                <Icon name="Palette" size={48} color="#39aab4" />
              </div>
              <h3>
                <Text variant="title" textColor="color-text-black">
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
            <div className="text-center p-6 bg-gray-50 rounded-xl h-full">
              <div className="flex justify-center mb-4">
                <Icon name="Shield" size={48} color="#39aab4" />
              </div>
              <h3>
                <Text variant="title" textColor="color-text-black">
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
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12">
            <h2>
              <Text variant="headline" textColor="color-text-black">
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
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3>
                <Text variant="subtitle" textColor="color-text-black">
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
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3>
                <Text variant="subtitle" textColor="color-text-black">
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
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
              <h3>
                <Text variant="subtitle" textColor="color-text-black">
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
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3>
                <Text variant="subtitle" textColor="color-text-black">
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
      <section className="py-16 bg-white">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12">
            <h2>
              <Text variant="headline" textColor="color-text-black">
                Perfecto Para
              </Text>
            </h2>
          </Col>

          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="mb-8">
            <div className="flex items-start space-x-4 p-6 border border-gray-200 rounded-xl">
              <Icon name="Rocket" size={32} color="#39aab4" />
              <div>
                <h3>
                  <Text variant="subtitle" textColor="color-text-black">
                    Emprendedores & Startups
                  </Text>
                </h3>
                <p className="mt-2">
                  <Text variant="body" textColor="color-text-black">
                    Lanza tu presencia digital rápidamente sin inversiones enormes
                  </Text>
                </p>
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="mb-8">
            <div className="flex items-start space-x-4 p-6 border border-gray-200 rounded-xl">
              <Icon name="User" size={32} color="#39aab4" />
              <div>
                <h3>
                  <Text variant="subtitle" textColor="color-text-black">
                    Profesionales Independientes
                  </Text>
                </h3>
                <p className="mt-2">
                  <Text variant="body" textColor="color-text-black">
                    Muestra tu portafolio y servicios de manera profesional
                  </Text>
                </p>
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 4, md: 2, sm: 4 }} className="mb-8">
            <div className="flex items-start space-x-4 p-6 border border-gray-200 rounded-xl">
              <Icon name="Building" size={32} color="#39aab4" />
              <div>
                <h3>
                  <Text variant="subtitle" textColor="color-text-black">
                    Pequeñas Empresas
                  </Text>
                </h3>
                <p className="mt-2">
                  <Text variant="body" textColor="color-text-black">
                    Establece tu presencia online y atrae más clientes locales
                  </Text>
                </p>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-12">
            <h2>
              <Text variant="headline" textColor="color-text-white">
                Precio Transparente
              </Text>
            </h2>
            <p className="mt-4">
              <Text variant="body" textColor="color-text-white">
                Sin sorpresas, sin costos ocultos
              </Text>
            </p>
          </Col>

          <Col cols={{ lg: 8, md: 4, sm: 4 }} className="lg:col-start-3 md:col-start-2">
            <div className="bg-white rounded-2xl p-8 text-center text-gray-900">
              <div className="mb-6">
                <span className="text-5xl font-bold text-blue-600">$300</span>
                <span className="text-xl text-gray-600 ml-2">USD</span>
              </div>
              
              <h3 className="mb-6">
                <Text variant="title" textColor="color-text-black">
                  Web Page Express
                </Text>
              </h3>

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
                color="primary"
                textVariant="body"
              />
            </div>
          </Col>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <Container>
          <Col cols={{ lg: 8, md: 4, sm: 4 }} className="lg:col-start-3 md:col-start-2 text-center">
            <h2>
              <Text variant="headline" textColor="color-text-white">
                ¿Listo para tener tu sitio web?
              </Text>
            </h2>
            <p className="mt-4 mb-8">
              <Text variant="body" textColor="color-text-white">
                Comienza hoy mismo y ten tu presencia digital lista en una semana
              </Text>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleScheduleMeeting}
                label="Agendar reunión gratuita"
                variant="secondary"
                color="default"
                textVariant="body"
              />
              <Button 
                onClick={handleContactClick}
                label="Solicitar información"
                variant="primary"
                color="success"
                textVariant="body"
              />
            </div>
          </Col>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <Container>
          <Col cols={{ lg: 6, md: 3, sm: 4 }}>
            <h3>
              <Text variant="title" textColor="color-text-white">
                Cítrica
              </Text>
            </h3>
            <p className="mt-4">
              <Text variant="body" textColor="color-text-white">
                Desarrollo web express para emprendedores y pequeñas empresas. 
                Tu presencia digital, nuestra especialidad.
              </Text>
            </p>
          </Col>
          
          <Col cols={{ lg: 6, md: 3, sm: 4 }} className="flex flex-col space-y-4">
            <h4>
              <Text variant="subtitle" textColor="color-text-white">
                Contacto
              </Text>
            </h4>
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={20} color="#ffffff" />
              <span>contacto@citrica.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Icon name="Phone" size={20} color="#ffffff" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex space-x-4 pt-4">
              <Icon name="Twitter" size={24} color="#ffffff" />
              <Icon name="Linkedin" size={24} color="#ffffff" />
              <Icon name="Instagram" size={24} color="#ffffff" />
            </div>
          </Col>
        </Container>
        
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="border-t border-gray-700 pt-8 mt-8 text-center">
            <p>
              <Text variant="label" textColor="color-text-white">
                © 2024 Cítrica. Todos los derechos reservados.
              </Text>
            </p>
          </Col>
        </Container>
      </footer>
    </div>
  )
}

export default CitricaLanding