// citrica-data.js

export const services = [
  {
    title: "Landing Pages",
    description:
      "Convierte visitantes en clientes con páginas de aterrizaje de alto impacto.",
    icon: "Globe",
    color: "#E1FF00",
    gradientColors: ["#E1FF00 , #62FF00, #E1FF00 , #62FF00, #E1FF00"],
  },
  {
    title: "Websites",
    description:
      "Posiciona tu marca y atrae nuevos clientes con un sitio web profesional.",
    icon: "Monitor",
    color: "#00FFFF",
    gradientColors: ["#00FFFF , #00FF88, #00FFFF , #00FF88, #00FFFF"],
  },
  {
    title: "Web Apps",
    description:
      "Optimiza tus procesos con aplicaciones web intuitivas y funcionales.",
    icon: "Code",
    color: "#FF5B00",
    gradientColors: [" #FF5B00 , #FF0400, #FF5B00 , #FF0400, #FF5B00"],
  },
  {
    title: "Mobile Apps",
    description:
      "Apps móviles para conectar tu negocio con tus clientes, al instante.",
    icon: "Smartphone",
    color: "#FF00D4",
    gradientColors: ["#FF00D4 , #C300FF, #FF00D4 , #C300FF, #FF00D4"],
  },
  {
    title: "Plataformas SAAS",
    description:
      "Construcción de software como servicio escalable y seguro.",
    icon: "CloudCog",
    color: "#E1FF00",
    gradientColors: ["#E1FF00 , #62FF00, #E1FF00 , #62FF00, #E1FF00"],
  },
  {
    title: "Integración de IA",
    description: "Automatiza procesos y toma decisiones más inteligentes.",
    icon: "Sparkles",
    color: "#00FFFF",
    gradientColors: ["#00FFFF , #00FF88, #00FFFF , #00FF88, #00FFFF"],
  },
  
  {
    title: "Marketing Digital",
    description:
      "Aumenta tu visibilidad y genera más leads con estrategias de marketing digital efectivas.",
    icon: "Megaphone",
    color: "#FF5B00",
    gradientColors: [" #FF5B00 , #FF0400, #FF5B00 , #FF0400, #FF5B00"],
  },
];

export const projects = [
  {
    title: "BGood",
    description:
      "Plataforma Inteligente para la Gestión Integral de Suministros en Edificios.",
    tech: "React • Node.js • MongoDB",
    image: "/e-commerce.png",
  },
  {
    title: "Sistema ERP",
    description:
      "Sistema integral de gestión empresarial para medianas empresas",
    tech: "Vue.js • Laravel • MySQL",
    image: "/dashboard.png",
  },
  {
    title: "App de Delivery",
    description: "Aplicación móvil para delivery con tracking en tiempo real",
    tech: "React Native • Firebase • Google Maps",
    image: "/delivery.png",
  },
];

export const otherProjects = [
  {
    id: 1,
    image: "/img/bgood-hero-img.png",
    title: "BGood",
    description:
      "Plataforma Inteligente para la Gestión Integral de Suministros en Edificios.",
    tech: ["React", "Node.js", "PostgreSQL"],
    category: "E-commerce",
    link: "/projects/bgood",
  },
  {
    id: 2,
    image: "/img/miollita-hero-img-lg.png",
    title: "MiOllita Mobile App",
    description:
      "App para ayudar a decidir qué cocinar y planificar las comidas.",
    tech: ["Vue.js", "Python", "MongoDB"],
    category: "Mobile App",
    link: "/projects/miollita",
  },
  {
    id: 3,
    image: "/img/cojones-hero-img.png",
    title: "Co.Jones",
    description: "Web Estratégico para Captación de Clientes",
    tech: ["Next.js", "Express", "MySQL"],
    category: "Website",
    link: "/projects/cojones",
  },
];

export const technologies = [
  {
    title: "Presentaciones que inspiran",
    description:
      "<strong>Figma</strong> permite la colaboración en tiempo real, <strong>prototipos interactivos</strong>, diseños visualmente atractivos y <strong>acceso desde cualquier lugar</strong>, asegurando que tus presentaciones sean tan profesionales y convincentes como tus productos digitales.",
    icon: "Presentation",
    color: "#E1FF00",
  },
  {
    title: "Front-end robusto",
    description:
      "<strong>HTML5, CSS3 y SASS</strong> para <strong>interfaces modernas y responsivas</strong>. <strong>TypeScript</strong> para un código <strong>más seguro y mantenible</strong>. <strong>ReactJS y Next.js</strong> para aplicaciones <strong>web rápidas y dinámicas.</strong>",
    icon: "Layers",
    color: "#00FFFF",
  },
  {
    title: "Desarrollo móvil eficiente",
    description:
      "<strong>React Native</strong> para crear aplicaciones nativas para <strong>iOS</strong> y <strong>Android</strong> con un solo código base.",
    icon: "Smartphone",
    color: "#FF5B00",
  },
  {
    title: "Back-end potente",
    description:
      "<strong>Strapi</strong> para una <strong>gestión de contenido</strong> flexible y escalable. <strong>PostgreSQL</strong> para <strong>bases de datos seguras y confiables.</strong> <strong>AWS S3</strong> para un <strong>almacenamiento</strong> en la nube <strong>seguro.</strong>",
    icon: "Server",
    color: "#E1FF00",
  },
];

export const process = [
  {
    step: "01",
    icon: "ClipboardList",
    title: "Planificación",
    description: "Definimos objetivos y estrategia del proyecto",
    color: "#e1ff00",
  },
  {
    step: "02",
    icon: "Palette",
    title: "Diseño",
    description: "Creamos prototipos y experiencias de usuario",
    color: "#ff5b00",
  },
  {
    step: "03",
    icon: "Code",
    title: "Desarrollo",
    description: "Construimos tu solución con las mejores tecnologías",
    color: "#00FFFF",
  },
  {
    step: "04",
    icon: "TestTube",
    title: "Pruebas",
    description: "Validamos calidad y rendimiento exhaustivamente",
    color: "#FF00D4",
  },
  {
    step: "05",
    icon: "Rocket",
    title: "Implementación",
    description: "Desplegamos tu proyecto de forma segura",
    color: "#E1FF00",
  },
  {
    step: "06",
    icon: "Headphones",
    title: "Soporte",
    description: "Mantenimiento continuo y evolución constante",
    color: "#FF5B00",
  },
];

export const stats = [
  {
    icon: "CheckCircle",
    number: 98,
    suffix: "%",
    label: "Clientes Satisfechos",
  },
  { icon: "CheckCircle", number: 24, suffix: "/7", label: "Soporte activo" },
  {
    icon: "CheckCircle",
    number: 10,
    suffix: "x",
    label: "Velocidad de entrega",
  },
];
