import { image } from "@heroui/theme";

// PAGINA DE BGOOD
export const projectHero = {
  category: "E-Commerce",
  title: "BGood",
  subtitle: "Plataforma Inteligente para la Gestión Integral de Suministros en Edificios.",
  buttonLabel: "Ver Demo",
  image: "/img/bgood-hero-img.png"
};

export const projectDescription = {
  sectionTitle: "Sobre el Proyecto",
  mainTitle: "BGood es una plataforma web desarrollada para optimizar la gestión de suministros en edificios.",
  description: "A través de una tienda en línea, los administradores pueden facilitar a los conserjes la adquisición de productos esenciales, simplificando el proceso desde la solicitud hasta la entrega. La plataforma integra un sistema de control de inventario, gestión de presupuestos y herramientas de supervisión para garantizar un flujo de trabajo eficiente y transparente.",
  titleColor: "#006666",
  textColor: "#16141F",
  bgColor: "bg-color-ct-tertiary-container",
  borderColor: "border-[#00666633]"
};

    export const projectDesafio = {
    sectionTitle: "El Desafío",
    image:"/img/shopping-cart.jpg",
    description: "El principal desafío fue crear una solución que, además de simplificar la compra y aprobación de suministros, permitiera un control exhaustivo del inventario. Esto implicó la implementación de un sistema Kardex para el seguimiento de entradas y salidas de cada artículo, previniendo  desabastecimientos. Adicionalmente, se necesitaba un flujo de trabajo intuitivo para múltiples roles, una gestión presupuestaria descentralizada por edificio y herramientas de supervisión efectivas.",
    titleColor: "#006666",
    textColor: "#16141F",

  };

      export const projectSolucion = {
    sectionTitle: " La Solución",
    image:"/img/super-user-products.jpg",
    description: "Se desarrolló una web app modular y escalable con interfaces personalizadas para cada usuario. Los conserjes realizan pedidos a través de un catálogo, los cuales son aprobados por los administradores, quienes también gestionan sus presupuestos. El sistema Kardex permite al personal de almacén mantener un control preciso del stock. Los supervisores tienen una visión global del proceso y del cumplimiento presupuestario, mientras que las notificaciones mantienen a todos informados sobre el estado de los pedidos.",
    titleColor: "#006666",
    textColor: "#16141F",

  };

  export const services = [
    {
      title: "Gestión de pedidos",
      description:
        "Catálogo en línea, carrito de compras, historial y listas de pedidos recurrentes.",
      icon: "ListCheck",
      color: "#E1FF00",
    },
    {
      title: "Gestión administrativa",
      description:
        "Aprobación de pedidos, límites presupuestarios, administración de perfiles y generación de órdenes de compra.",
      icon: "FolderKanban",
      color: "#00FFFF",
    },
    {
      title: "Gestión de inventario",
      description:
        "Control de stock con sistema Kardex integrado, registro de entradas y salidas, y preparación de pedidos.",
      icon: "Blocks",
      color: "#FF5B00",
    },
    {
      title: "Monitoreo y reportes",
      description:
        "Panel de supervisión, seguimiento en tiempo real, reportes de gastos y visualización del cumplimiento presupuestario.",
      icon: "ScanSearch",
      color: "#E1FF00",
    },
    {
      title: "Usabilidad y seguridad",
      description:
        "Diseño intuitivo, arquitectura escalable y protección de datos.",
      icon: "Lock",
      color: "#E1FF00",
    },
  ];

  export const technologies = [
    { name: "HTML 5", icon: "Code", color: "#FF5B00" },
    { name: "TypeScript", icon: "Code", color: "#FF5B00" },
    { name: "React JS", icon: "Code", color: "#FF5B00" },
    { name: "Next JS", icon: "Code", color: "#FF5B00" },
    { name: "CSS 3", icon: "PaintBucket", color: "#FF5B00" },
    { name: "Sass", icon: "PaintBucket", color: "#FF5B00" },
    { name: "Node.js", icon: "Server", color: "#FF5B00" },
    { name: "AWS", icon: "Cloud", color: "#FF5B00" },
    { name: "MongoDB", icon: "Database", color: "#FF5B00" },
  ];

  export const features = [
    "Sistema de autenticación completo",
    "Dashboard interactivo con métricas en tiempo real",
    "API REST escalable y documentada",
    "Interfaz responsive y moderna",
    "Integración con servicios de terceros",
    "Sistema de notificaciones push",
  ];

  export const otherProjects = [
    {
      id: 1,
      title: "E-commerce Fashion",
      description:
        "Plataforma completa de comercio electrónico con gestión de inventario avanzada",
      tech: ["React", "Node.js", "PostgreSQL"],
      category: "E-commerce",
    },
    {
      id: 2,
      title: "FinTech Dashboard",
      description:
        "Dashboard de análisis financiero en tiempo real con visualizaciones interactivas",
      tech: ["Vue.js", "Python", "MongoDB"],
      category: "FinTech",
    },
    {
      id: 3,
      title: "HealthCare Platform",
      description: "Sistema integral de gestión médica con telemedicina",
      tech: ["Next.js", "Express", "MySQL"],
      category: "HealthTech",
    },
  ];