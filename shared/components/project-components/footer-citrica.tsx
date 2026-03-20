"use client"
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import React from 'react'
import { usePathname } from 'next/navigation'
import { Text, Icon, Col, Container } from 'citrica-ui-toolkit'
import { WhassapLogo } from "@/public/icon-svg/whassap-footer";

export const FooterCitrica = () => {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/logout')) {
    return null;
  }

  return (
    <>
      <footer
        className="pt-6 pb-4"
        style={{
          backgroundColor: "#16141F",
          borderTop: "1px solid rgba(0, 200, 200, 0.3)",
        }}
      >
        <Container>
          <Col
            cols={{ lg: 12, md: 6, sm: 4 }}
            className="flex flex-col text-center justify-center gap-1"
          >
            <div className="flex items-center justify-center space-x-2">
              <div className=" h-14">
                <img src="/img/citrica-logo.png" alt="Logo Cítrica" />
              </div>
            </div>
            <Text variant="body" color="#FF5B00">
              Soluciones Digitales de Alto Rendimiento
            </Text>
            {/* Redes sociales */}
            {/* <div className="flex items-center justify-center gap-3 mt-[28px]">
              <Link href="https://www.facebook.com/citrica.dev" target="_blank" rel="noopener noreferrer">
                <Icon name="Facebook" color="#FFFFFF" size={18} />
              </Link>
              <Link href="https://www.instagram.com/citrica.dev" target="_blank" rel="noopener noreferrer">
                <Icon name="Instagram" color="#FFFFFF" size={18} />
              </Link>
              <Link href="https://www.linkedin.com/company/citrica-dev" target="_blank" rel="noopener noreferrer">
                <Icon name="Linkedin" color="#FFFFFF" size={18} />
              </Link>
              <Link href="https://wa.me/51942627383" target="_blank" rel="noopener noreferrer">
                <Icon name="MessageCircle" color="#FFFFFF" size={18} />
              </Link>
            </div> */}
            {/* Contacto */}
            <div className="flex flex-col justify-center items-center gap-1 mt-[20px]">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" color="#FFFFFF" size={14} />
                <Link href="mailto:contacto@citrica.dev">
                  <Text variant="label" color="#FFFFFF">
                    contacto@citrica.dev
                  </Text>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                <div className="flex items-center space-x-1">
                  <WhassapLogo />
                  <Link href="https://wa.me/51942627383" target="_blank" rel="noopener noreferrer">
                    <Text variant="label" color="#FFFFFF">
                      Perú: +51 942 627383
                    </Text>
                  </Link>
                </div>
                <div className="flex items-center space-x-1">
                  <Link href="https://wa.me/59892041487" target="_blank" rel="noopener noreferrer">
                    <Text variant="label" color="#FFFFFF">
                      Uruguay: +598 92 041487
                    </Text>
                  </Link>
                </div>
                <div className="flex items-center space-x-1">
                  <Link href="https://wa.me/34919934651" target="_blank" rel="noopener noreferrer">
                    <Text variant="label" color="#FFFFFF">
                      España: +34 91 9934651
                    </Text>
                  </Link>
                </div>
              </div>
            </div>
          </Col>
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center my-[32px]">
            <Text variant="label" color="#FFFFFF" className="opacity-50">
              © 2026 Cítrica. Todos los derechos reservados.
            </Text>
          </Col>
        </Container>
      </footer>
    </>
  )
}
