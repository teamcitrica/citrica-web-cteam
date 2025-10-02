// DATA CENTRALIZADA DE TODOS LOS PROYECTOS

export const projectsData = {
  bgood: {
    slug: "bgood",
    projectHero: {
      category: "E-Commerce",
      title: "BGood",
      subtitle: "Plataforma Inteligente para la Gestión Integral de Suministros en Edificios.",
      buttonLabel: "Ver Demo",
      image: "/img/bgood-hero-img.png"
    },
    projectDescription: {
      sectionTitle: "Sobre el Proyecto",
      mainTitle: "BGood es una plataforma web desarrollada para optimizar la gestión de suministros en edificios.",
      description: "A través de una tienda en línea, los administradores pueden facilitar a los conserjes la adquisición de productos esenciales, simplificando el proceso desde la solicitud hasta la entrega. La plataforma integra un sistema de control de inventario, gestión de presupuestos y herramientas de supervisión para garantizar un flujo de trabajo eficiente y transparente.",
      titleColor: "#006666",
      textColor: "#16141F",
      bgColor: "bg-color-ct-tertiary-container",
      borderColor: "border-[#00666633]"
    },
    projectDesafio: {
      sectionTitle: "El Desafío",
      image:"/img/shopping-cart.jpg",
      description: "El principal desafío fue crear una solución que, además de simplificar la compra y aprobación de suministros, permitiera un control exhaustivo del inventario. Esto implicó la implementación de un sistema Kardex para el seguimiento de entradas y salidas de cada artículo, previniendo  desabastecimientos. Adicionalmente, se necesitaba un flujo de trabajo intuitivo para múltiples roles, una gestión presupuestaria descentralizada por edificio y herramientas de supervisión efectivas.",
      titleColor: "#006666",
      textColor: "#16141F",
    },
    projectSolucion: {
      sectionTitle: " La Solución",
      image:"/img/super-user-products.jpg",
      description: "Se desarrolló una web app modular y escalable con interfaces personalizadas para cada usuario. Los conserjes realizan pedidos a través de un catálogo, los cuales son aprobados por los administradores, quienes también gestionan sus presupuestos. El sistema Kardex permite al personal de almacén mantener un control preciso del stock. Los supervisores tienen una visión global del proceso y del cumplimiento presupuestario, mientras que las notificaciones mantienen a todos informados sobre el estado de los pedidos.",
      titleColor: "#006666",
      textColor: "#16141F",
    },
    services: [
      {
        title: "Gestión de pedidos",
        description: "Catálogo en línea, carrito de compras, historial y listas de pedidos recurrentes.",
        icon: "ListCheck",
        color: "#E1FF00",
      },
      {
        title: "Gestión administrativa",
        description: "Aprobación de pedidos, límites presupuestarios, administración de perfiles y generación de órdenes de compra.",
        icon: "FolderKanban",
        color: "#00FFFF",
      },
      {
        title: "Gestión de inventario",
        description: "Control de stock con sistema Kardex integrado, registro de entradas y salidas, y preparación de pedidos.",
        icon: "Blocks",
        color: "#FF5B00",
      },
      {
        title: "Monitoreo y reportes",
        description: "Panel de supervisión, seguimiento en tiempo real, reportes de gastos y visualización del cumplimiento presupuestario.",
        icon: "ScanSearch",
        color: "#E1FF00",
      },
      {
        title: "Usabilidad y seguridad",
        description: "Diseño intuitivo, arquitectura escalable y protección de datos.",
        icon: "Lock",
        color: "#E1FF00",
      },
    ],
    technologies: [
      { name: "HTML 5", icon: "Code", color: "#FF5B00" },
      { name: "TypeScript", icon: "Code", color: "#FF5B00" },
      { name: "React JS", icon: "Code", color: "#FF5B00" },
      { name: "Next JS", icon: "Code", color: "#FF5B00" },
      { name: "CSS 3", icon: "PaintBucket", color: "#FF5B00" },
      { name: "Sass", icon: "PaintBucket", color: "#FF5B00" },
      { name: "Node.js", icon: "Server", color: "#FF5B00" },
      { name: "AWS", icon: "Cloud", color: "#FF5B00" },
      { name: "MongoDB", icon: "Database", color: "#FF5B00" },
    ]
  },

  cojones: {
    slug: "cojones",
    projectHero: {
      category: "Website",
      title: "Co.Jones",
      subtitle: "Webpage Estratégico para Captación de Clientes.",
      buttonLabel: "Ver Demo",
      image: "/img/cojones-hero-img.png"
    },
    projectDescription: {
      sectionTitle: "Sobre el Proyecto",
      mainTitle: "Sitio web informativo de CoJones, una agencia de publicidad creativa y dinámica con sede en Dallas.",
      description: "El objetivo central del sitio es la captación de nuevos clientes, presentando de forma directa la experiencia, los servicios y el portafolio de CoJones. La interfaz intuitiva y el diseño visual impactante reflejan la identidad de marca de CoJones, facilitando a los potenciales clientes la comprensión de su propuesta de valor y el contacto para futuras colaboraciones.",
      titleColor: "#006666",
      textColor: "#16141F",
      bgColor: "bg-color-ct-tertiary-container",
      borderColor: "border-[#00666633]"
    },
    projectDesafio: {
      sectionTitle: "El Desafío",
      description: "Nuestro principal reto fue crear un sitio web que comunicara eficazmente la creatividad y el profesionalismo de la agencia CoJones, atrayendo así a clientes potenciales en Dallas y más allá. Esto implicó una estructura de navegación simple y clara, un énfasis visual en sus proyectos y los servicios ofrecidos, y la integración de un llamado a la acción prominente. Priorizamos la optimización para diversos dispositivos y la velocidad de carga para una experiencia de usuario fluida.",
      image: "/img/cojones-pitches-culturally.png",
      titleColor: "#006666",
      textColor: "#16141F",
    },
    projectSolucion: {
      sectionTitle: "La Solución",
      description: "Ofrecimos un diseño web a medida, centrado en la usabilidad y la estética moderna, que resalta la identidad de marca de CoJones. Implementamos una arquitectura de información clara y una navegación simple e intuitiva para que los visitantes encuentren fácilmente los servicios y el portafolio. Integramos un formulario de contacto estratégico y visible, junto con información de contacto detallada, facilitando la conversión de visitantes en leads. Además, optimizamos el sitio para un rendimiento rápido y una visualización perfecta en todos los dispositivos, asegurando una experiencia positiva para los potenciales clientes.",
      image: "/img/cojones-projects-grid.png",
      titleColor: "#006666",
      textColor: "#16141F",
    },
    services: [
      {
        title: "Diseño y Estética",
        description: "Diseño web atractivo y moderno, con un portafolio visualmente impactante que muestra los proyectos y resultados de la agencia.",
        icon: "Palette",
        color: "#E1FF00",
      },
      {
        title: "Servicios y Credenciales",
        description: "Información concisa sobre los servicios de publicidad, una sección Sobre Nosotros que presenta la filosofía y el equipo, y testimonios de clientes para generar confianza.",
        icon: "Info",
        color: "#00FFFF",
      },
      {
        title: "Comunicación y Contacto",
        description: "Formulario de contacto directo y fácil de usar, información de contacto clara y un acceso a la cuenta de Instagram para compartir contenidos e historias relevantes.",
        icon: "RadioTower",
        color: "#FF5B00",
      },
      {
        title: "Rendimiento y Optimización",
        description: "Diseño responsivo y optimización SEO para asegurar una visualización óptima en cualquier dispositivo y mejorar la visibilidad de la agencia.",
        icon: "Eye",
        color: "#E1FF00",
      },
    ],
    technologies: [
      { name: "HTML 5", icon: "Code", color: "#FF5B00" },
      { name: "Javascript", icon: "Code", color: "#FF5B00" },
      { name: "React JS", icon: "Code", color: "#FF5B00" },
      { name: "Next JS", icon: "Code", color: "#FF5B00" },
      { name: "CSS 3", icon: "PaintBucket", color: "#FF5B00" },
      { name: "Sass", icon: "PaintBucket", color: "#FF5B00" },
      { name: "Node.js", icon: "Server", color: "#FF5B00" },
      { name: "AWS", icon: "Cloud", color: "#FF5B00" },
    ]
  },

  miollita: {
    slug: "miollita",
    projectHero: {
      category: "Mobile App",
      title: "MiOllita",
      subtitle: "App para ayudar a decidir qué cocinar y planificar las comidas.",
      buttonLabel: "Ver Demo",
      image: "/img/miollita-hero-img-lg.png"
    },
    projectDescription: {
      sectionTitle: "Sobre el Proyecto",
      mainTitle: "MiOllita es una aplicación de recetas diseñada para liberar a las personas del estrés diario de decidir qué cocinar.",
      description: "Nuestra app ofrece una solución simple y efectiva para encontrar inspiración al instante, ya sea para el desayuno, el almuerzo o la cena. Además, brinda herramientas para planificar tus comidas semanalmente, garantizando que tengas un menú organizado y listo para disfrutar.",
      titleColor: "#006666",
      textColor: "#16141F",
      bgColor: "bg-color-ct-tertiary-container",
      borderColor: "border-[#00666633]"
    },
    projectDesafio: {
      sectionTitle: "El Desafío",
      image:"/img/mockup-comidas.jpg",
      description: "El principal desafío fue crear una herramienta que no solo ofreciera ideas de recetas, sino que realmente solucionara la indecisión y la falta de tiempo. La solución debía ser rápida, intuitiva y capaz de adaptarse a las necesidades de cada usuario, ya sea que busquen una sugerencia para hoy o quieran organizar toda la semana. Además, necesitábamos una función lúdica y útil, como la de seleccionar una opción al azar para aquellos momentos de verdadera duda.",
      titleColor: "#006666",
      textColor: "#16141F",
    },
    projectSolucion: {
      sectionTitle: " La Solución",
      image:"/img/mockup-program-week.jpg",
      description: "Desarrollamos una aplicación con una interfaz limpia y amigable, dividida en dos flujos principales: la planificación diaria y la semanal. Para la planificación diaria, el usuario simplemente selecciona la comida del día y recibe sugerencias instantáneas de recetas. La función Chocolatea fue integrada para permitir que la app escoja al azar entre las opciones favoritas del usuario, eliminando la indecisión. Para la planificación semanal, el usuario puede organizar cada comida utilizando tanto las sugerencias de la app como sus propias recetas, y guardar su menú para consultarlo fácilmente.",
      titleColor: "#006666",
      textColor: "#16141F",
    },
    services: [
      {
        title: "Planificación flexible",
        description: "Elige cómo quieres organizar tus comidas: por día, recibiendo sugerencias instantáneas, o por semana, creando un menú completo y guardándolo.",
        icon: "ListCheck",
        color: "#E1FF00",
      },
      {
        title: "Sugerencias instantáneas",
        description: "Solo selecciona la comida que quieres preparar, y MiOllita te ofrece ideas rápidas y deliciosas para el desayuno, el almuerzo y la cena.",
        icon: "FolderKanban",
        color: "#00FFFF",
      },
      {
        title: "Función Chocolatea",
        description: "¿No puedes decidirte? Selecciona tus opciones favoritas y Chocolatea elegirá una receta al azar para ti, resolviendo tu indecisión en segundos.",
        icon: "Blocks",
        color: "#FF5B00",
      },
      {
        title: "Menú semanal personalizado",
        description: "Planifica tu menú para toda la semana con facilidad. Usa las recetas de la app o agrega las tuyas, y guarda tu menú para no tener que preocuparte más.",
        icon: "ScanSearch",
        color: "#E1FF00",
      },
      {
        title: "Recetas simples y sabrosas",
        description: "La app se enfoca en recetas fáciles de seguir y pensadas para simplificar tu rutina diaria, haciéndote la vida más sencilla.",
        icon: "Lock",
        color: "#E1FF00",
      },
      {
        title: "Notificaciones inteligentes",
        description: "Recibe recordatorios para cada comida, enviados justo a la hora adecuada, para que siempre sepas qué vas a cocinar.",
        icon: "Bell",
        color: "#00FFFF",
      },
    ],
    technologies: [
      { name: "HTML 5", icon: "Code", color: "#FF5B00" },
      { name: "TypeScript", icon: "Code", color: "#FF5B00" },
      { name: "React Native", icon: "Code", color: "#FF5B00" },
      { name: "CSS 3", icon: "PaintBucket", color: "#FF5B00" },
      { name: "Node.js", icon: "Server", color: "#FF5B00" },
      { name: "AWS", icon: "Cloud", color: "#FF5B00" },
      { name: "MongoDB", icon: "Database", color: "#FF5B00" },
    ]
  }
};

// Helper function para obtener un proyecto por slug
export const getProjectBySlug = (slug) => {
  return projectsData[slug] || null;
};

// Helper function para obtener todos los slugs
export const getAllProjectSlugs = () => {
  return Object.keys(projectsData);
};

// Helper function para obtener todos los proyectos
export const getAllProjects = () => {
  return Object.values(projectsData);
};
