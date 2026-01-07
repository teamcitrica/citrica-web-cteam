import { Col, Container } from '@/styles/07-objects/objects'
import React from 'react'
import { Button, Text } from 'citrica-ui-toolkit'

export const CtaSection = () => {
  return (
    <>
            <Container>
          <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto text-center">
            <header>
              <h2 className="mb-6">
                <Text
                  variant="headline"
                  weight="bold"
                  color="#16141F"
                  className="mb-6"
                >
                  ¿Te Interesa un Proyecto Similar?
                </Text>
              </h2>
            </header>

            <p className="mb-8">
              <Text variant="body" color="#16141F" className="opacity-80">
                Podemos ayudarte a transformar tu negocio con soluciones
                digitales personalizadas. Conversemos sobre tu próximo proyecto.
              </Text>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onPress={() =>
                  window.open("mailto:contacto@citrica.dev", "_blank")
                }
                label="Solicitar Cotización"
                variant="primary"
                className="bg-[#FFFFFF] text-[#16141F] rounded-full px-8"
              />
              {/* <Button
                onClick={() =>
                  window.open("https://wa.me/51942627383", "_blank")
                }
                label="Contactar por WhatsApp"
                variant="primary"
                className="bg-[#FFFFFF] text-[#16141F] rounded-full px-8"
              /> */}
            </div>
          </Col>
        </Container>
    </>
  )
}
