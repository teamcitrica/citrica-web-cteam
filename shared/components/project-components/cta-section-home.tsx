import { Col, Container } from '@/styles/07-objects/objects'
import React from 'react'
import { Button, Text } from 'citrica-ui-toolkit'



export const CtaSectionHome = () => {
  return (
    <>
    <Container>
  <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mx-auto">
    <h2 className="mb-6">
      <Text variant="headline" color="#16141F" weight="bold">
        ¿Listo para transformar tu negocio?
      </Text>
    </h2>
    <div className="mb-8">
      <Text variant="body" color="#16141F" className="opacity-80">
        Contáctanos hoy y descubre cómo podemos impulsar tu crecimiento
        digital
      </Text>
    </div>
    
    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
      <Button
        onPress={() =>
          window.open("mailto:admin@citrica.dev", "_blank")
        }
        label="Escribir Email"
        variant="primary"
      />
        {/* <Button
          onClick={() =>
            window.open("https://wa.me/51942627383", "_blank")
          }
          label="WhatsApp"
          variant="primary"
        /> */}
    </div>
  </Col>
</Container>
    </>
  )
}



