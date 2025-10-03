"use client"
import { Col, Container } from '@/styles/07-objects/objects'
import React from 'react'
import { Icon, Text } from '../citrica-ui'
import { Divider, Link } from '@heroui/react'

export const FooterCitrica = () => {
  return (
    <>
      <footer
        className="pt-12"
        style={{
          backgroundColor: "#16141F",
          borderTop: "1px solid rgba(225, 255, 0, 0.2)",
        }}
      >
        <Container>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="flex flex-col text-center justify-center gap-2"
          >
            <div className="flex items-center justify-center lg:justify-center space-x-2">
              <div className="w-24 h-16">
                <img src="/img/citrica-logo.png" alt="Logo Cítrica" />
              </div>
            </div>
            <h2 className="mb-8 lg:text-center md:text-center">
              <Text variant="label" color="#FFFFFF" className="opacity-70">
                Transformamos ideas en soluciones digitales que impulsan el
                crecimiento de tu negocio.
              </Text>
            </h2>
            <div className="flex  justify-center items-center gap-1">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" color="#16141F" size={20} />
                <Link href="mailto:admin@citrica.dev">
                  <Text variant="label" color="#FFFFFF" className="opacity-70">
                    contacto@citrica.com
                  </Text>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Phone" color="#16141F" size={20} />
                <Link href="tel:+51942627383"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className='flex flex-col'>
                  <Text variant="label" color="#FFFFFF" className="opacity-70">
                    Peru:+51 942 627-383

                  </Text>
                  <Text variant="label" color="#FFFFFF" className="opacity-70">
                    Uruguay:+59 92 041 487
                  </Text>
                </div>

                </Link>
              </div>
            </div>
          </Col>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mt-8">
            <Divider className="mb-8 bg-gray-800" />
            <div className="w-full flex justify-center">
              <h2 className="mb-8">
                <Text variant="label" color="#FFFFFF" className="opacity-50">
                  © 2025 Cítrica.
                </Text>
              </h2>
            </div>
          </Col>
        </Container>
      </footer>
    </>
  )
}
