'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Container, Col } from '@citrica/objects';
import Text from '@ui/atoms/text';
import Button from '@ui/molecules/button';
import Icon from '@ui/atoms/icon';
import GooeyNav from '@/shared/components/citrica-ui/molecules/gooeynav';

// Componente Neural Plexus
interface NeuralPlexusProps {
  className?: string;
}

const NeuralPlexus: React.FC<NeuralPlexusProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<any[]>([]);
  const connectionsRef = useRef<any[]>([]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Configuración de nodos
    const nodeCount = 50;
    const maxDistance = 150;
    const colors = ['#E1FF00', '#FF5B00', '#00FFFF'];

    // Crear nodos
    const createNodes = () => {
      nodesRef.current = [];
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulse: Math.random() * Math.PI * 2,
          connections: []
        });
      }
    };

    createNodes();

    // Función de animación
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Actualizar nodos
      nodesRef.current.forEach(node => {
        // Movimiento
        node.x += node.vx;
        node.y += node.vy;

        // Rebote en bordes
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Mantener dentro del canvas
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Actualizar pulso
        node.pulse += 0.02;

        // Limpiar conexiones
        node.connections = [];
      });

      // Calcular conexiones
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeA = nodesRef.current[i];
          const nodeB = nodesRef.current[j];
          const distance = Math.sqrt(
            Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2)
          );

          if (distance < maxDistance) {
            const opacity = 1 - (distance / maxDistance);
            nodeA.connections.push({ node: nodeB, opacity });
          }
        }
      }

      // Dibujar conexiones
      nodesRef.current.forEach(node => {
        node.connections.forEach((connection: any) => {
          const gradient = ctx.createLinearGradient(
            node.x, node.y,
            connection.node.x, connection.node.y
          );

          gradient.addColorStop(0, `rgba(225, 255, 0, ${connection.opacity * 0.3})`);
          gradient.addColorStop(0.5, `rgba(255, 91, 0, ${connection.opacity * 0.5})`);
          gradient.addColorStop(1, `rgba(0, 255, 255, ${connection.opacity * 0.3})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = connection.opacity * 2;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connection.node.x, connection.node.y);
          ctx.stroke();

          // Pulso de datos
          const midX = (node.x + connection.node.x) / 2;
          const midY = (node.y + connection.node.y) / 2;
          const pulseSize = Math.sin(Date.now() * 0.005 + connection.opacity * 10) * 2 + 2;

          ctx.fillStyle = `rgba(225, 255, 0, ${connection.opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(midX, midY, pulseSize, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Dibujar nodos
      nodesRef.current.forEach(node => {
        const pulseSize = Math.sin(node.pulse) * 0.5 + 1;
        const glowSize = node.radius * pulseSize * 3;

        // Glow effect
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowSize
        );
        gradient.addColorStop(0, `${node.color}80`);
        gradient.addColorStop(1, `${node.color}00`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Nodo central
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Borde del nodo
        ctx.strokeStyle = `${node.color}AA`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{ zIndex: 1 }}
    />
  );
};

interface ShinyTextProps {
  text: string;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, className = "" }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10 bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
        {text}
      </span>
      <span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"
        style={{
          animation: 'shine 3s ease-in-out infinite',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        }}
      ></span>
    </span>
  );
};

// Componente Electric Border Effect
interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
}

const ElectricBorder: React.FC<ElectricBorderProps> = ({ children, className = "" }) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Electric border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E1FF00] via-[#FF5B00] to-[#00FFFF] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFFF] via-[#E1FF00] to-[#FF5B00] rounded-xl opacity-0 group-hover:opacity-75 transition-all duration-700 animate-spin-slow blur-sm"></div>

      {/* Content */}
      <div className="relative bg-[#1a1823] rounded-xl">
        {children}
      </div>
    </div>
  );
};

// Componente de animación Blur Text
interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
}

const BlurText: React.FC<BlurTextProps> = ({ text, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span
      className={`transition-all duration-1000 ${isVisible ? 'blur-none opacity-100' : 'blur-sm opacity-0'} ${className}`}
    >
      {text}
    </span>
  );
};

// Componente de animación Rotating Text
interface RotatingTextProps {
  words: string[];
  className?: string;
}

const RotatingText: React.FC<RotatingTextProps> = ({ words, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Cambia cada 2 segundos

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className={`inline-block transition-all duration-500 ${className}`}>
      {words.map((word, index) => (
        <span
          key={index}
          className={`absolute transition-all duration-500 ${index === currentIndex
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-2'
            }`}
        >
          {word}
        </span>
      ))}
      {/* Placeholder invisible para mantener el espacio */}
      <span className="opacity-0">{words[0]}</span>
    </span>
  );
};

// Componente de animación de texto typewriter
interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, delay = 0, speed = 100, className = "" }) => {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      let i = 0;
      const typeTimer = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typeTimer);
          setIsAnimating(false);
        }
      }, speed);

      return () => clearInterval(typeTimer);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, delay, speed]);

  return (
    <span className={className}>
      {displayText}
      {isAnimating && <span className="animate-pulse text-yellow-400">|</span>}
    </span>
  );
};

const CitricaLanding = () => {
  const [currentProject, setCurrentProject] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const projects = [
    {
      id: 1,
      title: "E-commerce Fashion Hub",
      description: "Plataforma completa de comercio electrónico con experiencia de usuario premium y gestión avanzada de inventario.",
      tech: ["React", "Node.js", "MongoDB", "Stripe"],
      image: "/api/placeholder/400/300",
      category: "E-commerce"
    },
    {
      id: 2,
      title: "FinTech Dashboard",
      description: "Dashboard de análisis financiero en tiempo real con visualizaciones interactivas y reporting automático.",
      tech: ["Vue.js", "Python", "PostgreSQL", "D3.js"],
      image: "/api/placeholder/400/300",
      category: "FinTech"
    },
    {
      id: 3,
      title: "HealthCare Platform",
      description: "Sistema integral de gestión médica con telemedicina y seguimiento de pacientes en tiempo real.",
      tech: ["Next.js", "Express", "MongoDB", "Socket.io"],
      image: "/api/placeholder/400/300",
      category: "HealthTech"
    },
    {
      id: 4,
      title: "EdTech Learning Suite",
      description: "Plataforma educativa interactiva con contenido adaptativo y sistema de evaluación inteligente.",
      tech: ["React Native", "Firebase", "AI/ML", "WebRTC"],
      image: "/api/placeholder/400/300",
      category: "Education"
    }
  ];

  const processSteps = [
    {
      number: "01",
      title: "Planificación",
      description: "Análisis de viabilidad",
      details: ["Definición de requisitos", "Estimación de costos y tiempos", "Estrategia de desarrollo"],
      icon: "Target"
    },
    {
      number: "02",
      title: "Diseño",
      description: "Arquitectura del software",
      details: ["Diseño de la interfaz de usuario", "Diseño de la base de datos", "Prototipado interactivo"],
      icon: "Palette"
    },
    {
      number: "03",
      title: "Desarrollo",
      description: "Codificación",
      details: ["Pruebas unitarias", "Integración continua", "Code review"],
      icon: "Code"
    },
    {
      number: "04",
      title: "Pruebas",
      description: "Pruebas de integración",
      details: ["Pruebas de sistema", "Pruebas de usuario", "Testing automatizado"],
      icon: "CheckCircle"
    },
    {
      number: "05",
      title: "Implementación",
      description: "Despliegue",
      details: ["Migración de datos", "Capacitación de usuarios", "Go-live support"],
      icon: "Rocket"
    },
    {
      number: "06",
      title: "Mantenimiento",
      description: "Corrección de errores",
      details: ["Mejoras continuas", "Soporte técnico", "Actualizaciones"],
      icon: "Settings"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProject((prev) => (prev + 1) % projects.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [projects.length]);

  // Cerrar menú móvil cuando se hace click en un enlace
  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#16141F]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#16141F]/95 backdrop-blur-md border-b border-[#E1FF00]/20">
        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="flex justify-between items-center py-4">
              {/* Logo y Marca */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] rounded-full flex items-center justify-center">
                  <Icon name="Zap" size={20} color="#16141F" />
                </div>
                <Text variant="title" color="#FFFFFF" className="font-bold bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] bg-clip-text text-transparent">
                  Cítrica
                </Text>
              </div>

              {/* Navegación Desktop */}
              <div className="hidden md:block">
                <GooeyNav
                  items={[
                    { label: "Inicio", href: "#inicio" },
                    { label: "Proyectos", href: "#proyectos" },
                    { label: "Contacto", href: "#contacto" },
                  ]}
                />
              </div>

              {/* CTA Button Desktop */}
              <div className="hidden md:block">
                <Button
                  onClick={() => { }}
                  label="Comenzar"
                  variant="primary"
                  className="bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] text-[#16141F] font-bold px-6 py-2 rounded-full hover:scale-105 transition-all"
                />
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-[#E1FF00]/10 rounded-full transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} color="#E1FF00" />
              </button>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
              <div className="pb-4 space-y-4">
                <div className="flex flex-col space-y-3">
                  <a
                    href="#inicio"
                    className="text-white hover:text-[#E1FF00] transition-colors py-2 px-4 rounded-lg hover:bg-[#E1FF00]/10"
                    onClick={handleMobileMenuClick}
                  >
                    <Text variant="body" color="#E1FF00">Inicio</Text>
                  </a>
                  <a
                    href="#proyectos"
                    className="text-white hover:text-[#E1FF00] transition-colors py-2 px-4 rounded-lg hover:bg-[#E1FF00]/10"
                    onClick={handleMobileMenuClick}
                  >
                    <Text variant="body" color="#E1FF00">Proyectos</Text>
                  </a>
                  <a
                    href="#contacto"
                    className="text-white hover:text-[#E1FF00] transition-colors py-2 px-4 rounded-lg hover:bg-[#E1FF00]/10"
                    onClick={handleMobileMenuClick}
                  >
                    <Text variant="body" color="#E1FF00">Contacto</Text>
                  </a>
                </div>
                <div className="pt-4 border-t border-[#E1FF00]/20">
                  <Button
                    onClick={() => { handleMobileMenuClick(); }}
                    label="Comenzar"
                    variant="primary"
                    className="w-full bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] text-[#16141F] font-bold px-6 py-2 rounded-full hover:scale-105 transition-all"
                  />
                </div>
              </div>
            </div>
          </Col>
        </Container>
      </nav>

      {/* Hero Section - 100vh */}
      <section
        id="inicio"
        className="relative h-screen flex items-center justify-center overflow-hidden pt-16"
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-[#16141F]/70"></div>

        {/* Aurora Borealis Effect */}
        <div className="absolute inset-0 aurora opacity-60"></div>


        <Container className="relative z-10">
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center space-y-8">
              {/* Main Title */}
              <div className="space-y-6">
                <h1 className="animate-fade-in">
                  <Text
                    variant="display"
                    color="#E1FF00"
                    className="block leading-tight bg-gradient-to-r from-[#E1FF00] via-[#FF5B00] to-[#00FFFF] bg-clip-text text-transparent"
                  >
                    <BlurText text="APLICACIONES Y SITIOS WEB" delay={500} />
                  </Text>
                </h1>
                <h1 className="animate-fade-in delay-200">
                  <Text
                    variant="display"
                    color="#E1FF00"
                    className="block leading-tight border-2 border-transparent"
                  >
                    <BlurText text="A MEDIDA PARA TU NEGOCIO" delay={1500} />
                  </Text>
                </h1>
              </div>

              {/* Subtitle */}
              <div className="max-w-4xl mx-auto animate-fade-in delay-400">
                <h2>
                  <Text variant="title" color="#FFFFFF" className="opacity-90">
                    Creamos experiencias digitales únicas, modernas y de alta calidad
                    que impulsen tu negocio.
                  </Text>
                </h2>
              </div>

              {/* Rotating Services */}
              <div className="animate-fade-in delay-600">
                <div className="flex justify-center items-center space-x-2">
                  <Text variant="body" color="#E1FF00" className="font-medium">
                    Especialistas en
                  </Text>
                  <div className="relative inline-block min-w-[120px]">
                    <Text variant="body" color="#FFFFFF" className="font-bold">
                      <RotatingText
                        words={["Landing Pages", "Mobile Apps", "Web Apps", "Websites"]}
                        className=""
                      />
                    </Text>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 animate-fade-in delay-800">
                <Button
                  onClick={() => { }}
                  label="Comenzar Proyecto"
                  variant="primary"
                  className="bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] text-[#16141F] font-bold px-8 py-4 rounded-full hover:scale-105 transition-all shadow-lg"
                />
                <Button
                  onClick={() => { }}
                  label="Ver Portafolio"
                  variant="secondary"
                  textClassName="!text-white hover:!text-[#000000]"
                  className="border-2 border-[#00FFFF] text-white px-8 py-4 rounded-full hover:bg-[#00FFFF] hover:text-[#16141F] transition-all"
                />
              </div>

              {/* Scroll Indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <Icon name="ChevronDown" size={32} color="#E1FF00" />
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* About Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF5B00]/5 to-[#E1FF00]/5"></div>

        {/* Animated geometric shapes movidas del hero */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] rounded-full opacity-10 animate-pulse blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-gradient-to-r from-[#00FFFF] to-[#E1FF00] rounded-full opacity-5 animate-pulse blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-[#FF5B00] rounded-full opacity-8 blur-2xl animate-bounce"></div>

        {/* Floating particles movidas del hero */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#E1FF00] rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-[#00FFFF] rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-[#FF5B00] rounded-full animate-ping"></div>

        <Container className="relative z-10">
          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="space-y-8">
              <header>
                <h2>
                  <Text variant="headline" color="#FFFFFF" className="">
                    <ShinyText text="Creamos Soluciones Digitales a Medida para Impulsar tu Negocio" />
                  </Text>
                </h2>
              </header>

              <div className="space-y-6">
                <p>
                  <Text variant="body" color="#FFFFFF" className="opacity-90">
                    En Cítrica, entendemos los desafíos de los negocios en el mundo digital. Somos un equipo de expertos en diseño UX/UI y desarrollo, dedicados a transformar tus ideas en productos digitales de alta calidad que realmente marcan la diferencia.
                  </Text>
                </p>

                <p>
                  <Text variant="body" color="#FFFFFF" className="opacity-90">
                    Nuestra pasión es optimizar los procesos de creación para ofrecerte soluciones eficientes, con un diseño atractivo y una funcionalidad robusta. Combinamos la experiencia de todo el equipo para crear plataformas personalizadas que se adaptan a tus necesidades y acompañan tu crecimiento.
                  </Text>
                </p>

                <p>
                  <Text variant="body" color="#FFFFFF" className="opacity-90">
                    Trabajamos como tus socios estratégicos, involucrándonos en tu negocio para ofrecerte soluciones que no solo sean visualmente impactantes, sino que también generen resultados tangibles.
                  </Text>
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                {[
                  { number: "100+", label: "Proyectos" },
                  { number: "5+", label: "Años" },
                  { number: "98%", label: "Satisfacción" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div>
                      <Text variant="headline" color="#E1FF00">
                        {stat.number}
                      </Text>
                    </div>
                    <p>
                      <Text variant="label" color="#FFFFFF" className="opacity-70">
                        {stat.label}
                      </Text>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          <Col cols={{ lg: 6, md: 6, sm: 4 }}>
            <div className="relative h-full flex items-center justify-center">
              {/* Animated Visual Element */}
              <div className="relative w-96 h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-8 bg-gradient-to-r from-[#00FFFF] to-[#E1FF00] rounded-full opacity-30 animate-pulse"></div>
                <div className="absolute inset-16 bg-[#16141F] rounded-full flex items-center justify-center">
                  <Icon name="Zap" size={80} color="#E1FF00" className="animate-bounce" />
                </div>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Projects Section */}
      <section id="proyectos" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E1FF00]/5 to-transparent"></div>

        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center mb-16 w-full flex flex-col items-center">
              <header>
                <h2>
                  <Text variant="headline" color="#FFFFFF" className="mb-6 bg-gradient-to-r from-[#00FFFF] to-[#E1FF00] bg-clip-text text-transparent">
                    Últimos Proyectos
                  </Text>
                </h2>
              </header>
              <p>
                <Text variant="body" color="#FFFFFF" className="opacity-80">
                  Descubre algunas de las soluciones innovadoras que hemos desarrollado
                </Text>
              </p>
            </div>
          </Col>

          {/* Project Cards Carousel */}
          <div className="relative max-w-6xl mx-auto flex justify-center">
            {/* Navigation Buttons - Hidden on mobile */}
            <button
              onClick={() => setCurrentProject(currentProject === 0 ? projects.length - 1 : currentProject - 1)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-[#E1FF00]/20 hover:bg-[#E1FF00]/30 rounded-full transition-all hidden sm:block"
            >
              <Icon name="ChevronLeft" size={24} color="#E1FF00" />
            </button>

            <button
              onClick={() => setCurrentProject((currentProject + 1) % projects.length)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-[#E1FF00]/20 hover:bg-[#E1FF00]/30 rounded-full transition-all hidden sm:block"
            >
              <Icon name="ChevronRight" size={24} color="#E1FF00" />
            </button>

            {/* Carousel Container */}
            {/* Carousel Container */}
            <div className="overflow-hidden w-full max-w-5xl">
              {/* Carrusel para móvil */}
              <div className="block sm:hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentProject * 100}%)` }}
                >
                  {projects.map((project, index) => (
                    <div key={project.id} className="w-full px-4 flex-shrink-0">
                      {/* Glow Effect */}
                      <div className="relative group cursor-pointer h-[500px]">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#E1FF00] via-[#FF5B00] to-[#00FFFF] rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-500"></div>

                        <article className="relative bg-[#1a1823] rounded-2xl p-6 border border-[#E1FF00]/20 hover:border-[#E1FF00]/50 transition-all h-full flex flex-col">
                          {/* Project Image Placeholder */}
                          <div className="h-48 bg-gradient-to-br from-[#E1FF00]/20 to-[#FF5B00]/20 rounded-lg mb-6 flex items-center justify-center flex-shrink-0">
                            <Icon name="Image" size={48} color="#E1FF00" />
                          </div>

                          {/* Category Badge */}
                          <div className="inline-block w-fit px-3 py-1 bg-[#FF5B00]/20 border border-[#FF5B00]/30 rounded-full mb-4 flex-shrink-0">
                            <Text variant="label" color="#FF5B00">
                              {project.category}
                            </Text>
                          </div>

                          <h3 className="mb-3 flex-shrink-0">
                            <Text variant="subtitle" color="#FFFFFF">
                              {project.title}
                            </Text>
                          </h3>

                          <p className="mb-4 flex-grow overflow-hidden">
                            <Text variant="body" color="#FFFFFF" className="opacity-70 line-clamp-3">
                              {project.description}
                            </Text>
                          </p>

                          {/* Tech Stack */}
                          <div className="flex flex-wrap gap-2 mt-auto flex-shrink-0">
                            {project.tech.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 bg-[#00FFFF]/10 border border-[#00FFFF]/20 rounded text-xs"
                              >
                                <Text variant="label" color="#00FFFF">
                                  {tech}
                                </Text>
                              </span>
                            ))}
                          </div>
                        </article>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrusel para desktop */}
              <div className="hidden sm:block">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentProject * (100 / 3)}%)` }}
                >
                  {projects.concat(projects).map((project, index) => (
                    <div key={`${project.id}-${index}`} className="w-1/3 px-4 flex-shrink-0">
                      {/* Glow Effect */}
                      <div className="relative group cursor-pointer h-[500px]">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#E1FF00] via-[#FF5B00] to-[#00FFFF] rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-500"></div>

                        <article className="relative bg-[#1a1823] rounded-2xl p-6 border border-[#E1FF00]/20 hover:border-[#E1FF00]/50 transition-all h-full flex flex-col">
                          {/* Project Image Placeholder */}
                          <div className="h-48 bg-gradient-to-br from-[#E1FF00]/20 to-[#FF5B00]/20 rounded-lg mb-6 flex items-center justify-center flex-shrink-0">
                            <Icon name="Image" size={48} color="#E1FF00" />
                          </div>

                          {/* Category Badge */}
                          <div className="inline-block w-fit px-3 py-1 bg-[#FF5B00]/20 border border-[#FF5B00]/30 rounded-full mb-4 flex-shrink-0">
                            <Text variant="label" color="#FF5B00">
                              {project.category}
                            </Text>
                          </div>

                          <h3 className="mb-3 flex-shrink-0">
                            <Text variant="subtitle" color="#FFFFFF">
                              {project.title}
                            </Text>
                          </h3>

                          <p className="mb-4 flex-grow overflow-hidden">
                            <Text variant="body" color="#FFFFFF" className="opacity-70 line-clamp-3">
                              {project.description}
                            </Text>
                          </p>

                          {/* Tech Stack */}
                          <div className="flex flex-wrap gap-2 mt-auto flex-shrink-0">
                            {project.tech.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 bg-[#00FFFF]/10 border border-[#00FFFF]/20 rounded text-xs"
                              >
                                <Text variant="label" color="#00FFFF">
                                  {tech}
                                </Text>
                              </span>
                            ))}
                          </div>
                        </article>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Navigation Buttons */}
            <div className="sm:hidden flex justify-between w-full absolute top-1/2 transform -translate-y-1/2 px-4 z-10">
              <button
                onClick={() => setCurrentProject(currentProject === 0 ? projects.length - 1 : currentProject - 1)}
                className="p-3 bg-[#E1FF00]/20 hover:bg-[#E1FF00]/30 rounded-full transition-all"
              >
                <Icon name="ChevronLeft" size={20} color="#E1FF00" />
              </button>

              <button
                onClick={() => setCurrentProject((currentProject + 1) % projects.length)}
                className="p-3 bg-[#E1FF00]/20 hover:bg-[#E1FF00]/30 rounded-full transition-all"
              >
                <Icon name="ChevronRight" size={20} color="#E1FF00" />
              </button>
            </div>

            {/* Indicators */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentProject(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentProject
                    ? 'bg-[#E1FF00]'
                    : 'bg-[#E1FF00]/30'
                    }`}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Process Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#16141F] via-[#1a1823] to-[#16141F]"></div>

        <Container>
          <Col cols={{ lg: 12, md: 6, sm: 4 }}>
            <div className="text-center mb-16 max-w-4xl mx-auto w-full flex flex-col items-center">
              <header>
                <h2 className="mb-6">
                  <Text variant="headline" color="#FFFFFF" className="bg-gradient-to-r from-[#FF5B00] to-[#E1FF00] bg-clip-text text-transparent">
                    Nuestro Proceso
                  </Text>
                </h2>
              </header>
              <p>
                <Text variant="body" color="#FFFFFF" className="opacity-80 text-center max-w-3xl">
                  Seguimos un proceso de desarrollo estructurado y eficiente, desde la planificación inicial hasta el mantenimiento continuo, para garantizar que tus productos digitales sean de la más alta calidad.
                </Text>
              </p>
            </div>
          </Col>

          {/* Process Steps - Centered */}
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl justify-items-center">
              {processSteps.map((step, index) => (
                <ElectricBorder key={index} className="w-full max-w-sm mx-auto">
                  <article className="relative group">
                    <div className="backdrop-blur-sm rounded-xl p-6 border border-[#E1FF00]/20 hover:border-[#E1FF00]/50 transition-all hover:transform hover:scale-105 h-full flex flex-col">
                      {/* Step Number */}
                      <div className="relative mb-6 flex justify-center flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] rounded-full flex items-center justify-center">
                          <Text variant="title" color="#16141F" weight="bold">
                            {step.number}
                          </Text>
                        </div>
                      </div>

                      <h3 className="text-center mb-3 flex-shrink-0">
                        <Text variant="subtitle" color="#FFFFFF">
                          {step.title}
                        </Text>
                      </h3>

                      <p className="text-center mb-4 flex-shrink-0">
                        <Text variant="body" color="#E1FF00">
                          {step.description}
                        </Text>
                      </p>

                      <ul className="space-y-2 flex-grow">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start justify-center">
                            <div className="flex items-start max-w-xs text-center">
                              <Icon name="CheckCircle" size={16} color="#00FFFF" className="mt-1 mr-2 flex-shrink-0" />
                              <Text variant="label" color="#FFFFFF" className="opacity-70">
                                {detail}
                              </Text>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </ElectricBorder>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E1FF00]/10 via-[#FF5B00]/10 to-[#00FFFF]/10"></div>

        <Container>
          <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto">
            <div className="text-center w-full flex flex-col items-center">
              <header>
                <h2>
                  <Text variant="headline" color="#FFFFFF" className="mb-6 bg-gradient-to-r from-[#E5FFFF] to-[#00FFFF] bg-clip-text text-transparent">
                    ¿Listo para transformar tu visión en realidad?
                  </Text>
                </h2>
              </header>

              <p className="mb-10">
                <Text variant="body" color="#FFFFFF" className="opacity-90">
                  Contáctanos hoy y descubre cómo podemos crear la solución digital perfecta para tu negocio.
                  Nuestro equipo está listo para hacer realidad tus ideas más ambiciosas.
                </Text>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <Button
                  onClick={() => { }}
                  label="Solicitar Cotización"
                  variant="primary"
                  className="bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] text-[#16141F] font-bold px-8 py-4 rounded-full hover:scale-105 transition-all shadow-lg"
                />
                <Button
                  onClick={() => { }}
                  label="Agendar Llamada"
                  variant="secondary"
                  textClassName="!text-white hover:!text-[#000000]"
                  className="border-2 border-[#00FFFF] px-8 py-4 rounded-full hover:bg-[#00FFFF] transition-all"
                />


              </div>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <div className="flex items-center space-x-3">
                  <Icon name="Mail" color="#E1FF00" size={20} />
                  <Text variant="body" color="#FFFFFF">
                    hello@citrica.dev
                  </Text>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Phone" color="#E1FF00" size={20} />
                  <Text variant="body" color="#FFFFFF">
                    +51 999 888 777
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#E1FF00]/20 flex flex-col  items-center">
        <Container>
          <Col cols={{ lg: 4, md: 2, sm: 4 }}>
            <div className='flex flex-col gap-[10px]'>
              <h4>
                <Text variant="title" color="#E1FF00" className="mb-4 bg-gradient-to-r from-[#E1FF00] to-[#FF5B00] bg-clip-text text-transparent">
                  Cítrica
                </Text>
              </h4>
              <p>
                <Text variant="body" color="#FFFFFF" className="opacity-70">
                  Aplicaciones y sitios web a medida para tu negocio.
                </Text>
              </p>
            </div>
          </Col>

          <Col cols={{ lgPush: 1, lg: 3, md: 2, sm: 4 }}>
            <nav className='flex flex-col gap-[10px]'>
              <h5>
                <Text variant="subtitle" color="#E1FF00" className="mb-4">
                  Servicios
                </Text>
              </h5>
              <ul className="space-y-2">
                {["Aplicaciones Web", "Sitios Corporativos", "E-commerce", "Apps Móviles"].map((service, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-[#E1FF00] transition-colors">
                      <Text variant="body" color="#FFFFFF" className="opacity-70">
                        {service}
                      </Text>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Col>

          <Col cols={{ lgPush: 1, lg: 3, md: 2, sm: 4 }}>
            <div className='flex flex-col  gap-[10px]'>
              <h5>
                <Text variant="subtitle" color="#E1FF00" className="mb-4">
                  Síguenos
                </Text>
              </h5>
              <div className="flex space-x-4">
                {["Linkedin", "Github", "Twitter", "Instagram"].map((social, index) => (
                  <a key={index} href="#" className="hover:scale-110 transition-transform">
                    <Icon name={social as any} size={20} color="#ffffff" />
                  </a>
                ))}
              </div>
            </div>
          </Col>
        </Container>

        <div className="border-t border-[#E1FF00]/20 mt-8 pt-8">
          <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center">
            <Text variant="label" color="#FFFFFF" className="opacity-50">
              © 2024 Cítrica. Todos los derechos reservados. Transformando ideas en soluciones digitales.
            </Text>
          </Col>

        </div>
      </footer>
    </div>
  );
};

export default CitricaLanding;