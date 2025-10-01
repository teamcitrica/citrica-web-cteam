"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Container, Col } from "@/styles/07-objects/objects";
import { Text, Icon, Button } from "@citrica-ui";
import { Link } from "@heroui/react";

export const DynamicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // aqui se detecta si estamos en una pagina de proyectos(bgood, o algosi) asi que pendiente aqui johan
  const isProjectPage = pathname?.startsWith("/projects/");

  // estos son los links para el navbar del homepage johan ojito
  const homeLinks = [
    { href: "#inicio", label: "Inicio" },
    { href: "#servicios", label: "Servicios" },
    { href: "#proyectos", label: "Proyectos" },
    { href: "#contacto", label: "Contacto" },
  ];

  // y estos para el de projectos, ojito aqui tambien 
  const projectLinks = [
    { href: "#inicio", label: "Inicio" },
    { href: "#descripcion", label: "Sobre el Proyecto" },
    { href: "#solucion", label: "La Solución" },
    { href: "#otros-proyectos", label: "Otros Proyectos" },
  ];

  const links = isProjectPage ? projectLinks : homeLinks;
  const textColor = isProjectPage ? "#E5FFFF" : "#FFFFFF";

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/80 bg-opacity-80 backdrop-blur-sm">
      <Container className="py-2">
        <Col
          cols={{ lg: 12, md: 6, sm: 4 }}
          noPadding
          className="flex justify-between items-center pt-4"
        >
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="w-24 h-17">
                <img
                  src="/img/citrica-logo.png"
                  alt="Logo Cítrica"
                  className="h-12"
                />
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex space-x-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:opacity-80 transition-opacity"
              >
                <Text variant="body" color={textColor}>
                  {link.label}
                </Text>
              </a>
            ))}
          </div>

          {/* Right side - action button + hamburger on small screens only */}
          <div className="flex items-center md:justify-end">
            <div className="hidden md:block">
              {isProjectPage ? (
                <Link href="/">
                  <Button
                    label="Regresar"
                    variant="primary"
                    className="px-8 bg-[#E1FF00] rounded-[80]"
                  />
                </Link>
              ) : (
                <Button
                  onClick={() =>
                    document
                      .getElementById("contacto")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  label="Hablemos"
                  variant="primary"
                />
              )}
            </div>
            <div className="md:hidden ml-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Icon
                  name={isMenuOpen ? "X" : "Menu"}
                  color={textColor}
                  size={24}
                />
              </button>
            </div>
          </div>

          {/* Mobile Menu - visible on small screens */}
          <div
            className={`fixed top-0 right-0 h-screen w-64 bg-black/90 backdrop-blur-lg p-6 flex flex-col items-start gap-6 transform transition-transform duration-500 ease-in-out z-50 ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6"
              aria-label="Cerrar menú"
            >
              <Icon name="X" color={textColor} size={28} />
            </button>

            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text variant="body" color={textColor}>
                  {link.label}
                </Text>
              </a>
            ))}

            {/* Botón CTA */}
            {isProjectPage ? (
              <Link href="/">
                <Button
                  onClick={() => setIsMenuOpen(false)}
                  label="Regresar"
                  variant="primary"
                  className="px-8 mt-[10px] bg-[#E1FF00] text-black rounded-[80]"
                />
              </Link>
            ) : (
              <Button
                onClick={() => {
                  setIsMenuOpen(false);
                  document
                    .getElementById("contacto")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                label="Hablemos"
                variant="primary"
              />
            )}
          </div>
        </Col>
      </Container>
    </nav>
  );
};
