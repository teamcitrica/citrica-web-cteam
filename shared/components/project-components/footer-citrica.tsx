"use client"
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import React from 'react'
import { Text, Icon, Col, Container } from 'citrica-ui-toolkit'

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
            <div className="flex flex-col justify-center items-center gap-1">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" color="#FFFFFF" size={20} />
                <Link href="mailto:contacto@citrica.dev">
                  <Text variant="body" color="#FFFFFF" weight="bold">
                    contacto@citrica.dev
                  </Text>
                </Link>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Phone" color="#FFFFFF" size={20} />
                  <Link
                    href="tel:+51942627383"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Text variant="body" color="#FFFFFF" weight="bold">
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
                    <Text variant="body" color="#FFFFFF" weight="bold">
                      Uruguay: +598 92 041487
                    </Text>
                  </Link>
                </div>
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
