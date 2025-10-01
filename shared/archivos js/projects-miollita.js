export const projectHero = {
  category: "Mobile App",
  title: "MiOllita",
  subtitle: "App para ayudar a decidir qué cocinar y planificar las comidas.",
  buttonLabel: "Ver Demo",
  image: "/img/miollita-hero-img-lg.png"
};

export const projectDescription = {
  sectionTitle: "Sobre el Proyecto",
  mainTitle: "MiOllita es una aplicación de recetas diseñada para liberar a las personas del estrés diario de decidir qué cocinar.",
  description: "Nuestra app ofrece una solución simple y efectiva para encontrar inspiración al instante, ya sea para el desayuno, el almuerzo o la cena. Además, brinda herramientas para planificar tus comidas semanalmente, garantizando que tengas un menú organizado y listo para disfrutar.",
  titleColor: "#006666",
  textColor: "#16141F",
  bgColor: "bg-color-ct-tertiary-container",
  borderColor: "border-[#00666633]"
};

    export const projectDesafio = {
    sectionTitle: "El Desafío",
    image:"/img/mockup-comidas.jpg",
    description: "El principal desafío fue crear una herramienta que no solo ofreciera ideas de recetas, sino que realmente solucionara la indecisión y la falta de tiempo. La solución debía ser rápida, intuitiva y capaz de adaptarse a las necesidades de cada usuario, ya sea que busquen una sugerencia para hoy o quieran organizar toda la semana. Además, necesitábamos una función lúdica y útil, como la de seleccionar una opción al azar para aquellos momentos de verdadera duda.",
    titleColor: "#006666",
    textColor: "#16141F",

  };

      export const projectSolucion = {
    sectionTitle: " La Solución",
    image:"/img/mockup-program-week.jpg",
    description: "Desarrollamos una aplicación con una interfaz limpia y amigable, dividida en dos flujos principales: la planificación diaria y la semanal. Para la planificación diaria, el usuario simplemente selecciona la comida del día y recibe sugerencias instantáneas de recetas. La función Chocolatea fue integrada para permitir que la app escoja al azar entre las opciones favoritas del usuario, eliminando la indecisión. Para la planificación semanal, el usuario puede organizar cada comida utilizando tanto las sugerencias de la app como sus propias recetas, y guardar su menú para consultarlo fácilmente.",
    titleColor: "#006666",
    textColor: "#16141F",

  };

export  const services = [
    {
      title: "Planificación flexible",
      description:
        "Elige cómo quieres organizar tus comidas: por día, recibiendo sugerencias instantáneas, o por semana, creando un menú completo y guardándolo.",
      icon: "ListCheck",
      color: "#E1FF00",
    },
    {
      title: "Sugerencias instantáneas",
      description:
        "Solo selecciona la comida que quieres preparar, y MiOllita te ofrece ideas rápidas y deliciosas para el desayuno, el almuerzo y la cena.",
      icon: "FolderKanban",
      color: "#00FFFF",
    },
    {
      title: "Función Chocolatea",
      description:
        "¿No puedes decidirte? Selecciona tus opciones favoritas y Chocolatea elegirá una receta al azar para ti, resolviendo tu indecisión en segundos.",
      icon: "Blocks",
      color: "#FF5B00",
    },
    {
      title: "Menú semanal personalizado",
      description:
        "Planifica tu menú para toda la semana con facilidad. Usa las recetas de la app o agrega las tuyas, y guarda tu menú para no tener que preocuparte más.",
      icon: "ScanSearch",
      color: "#E1FF00",
    },
    {
      title: "Recetas simples y sabrosas",
      description:
        "La app se enfoca en recetas fáciles de seguir y pensadas para simplificar tu rutina diaria, haciéndote la vida más sencilla.",
      icon: "Lock",
      color: "#E1FF00",
    },
    {
      title: "Notificaciones inteligentes",
      description:
        "Recibe recordatorios para cada comida, enviados justo a la hora adecuada, para que siempre sepas qué vas a cocinar.",
      icon: "Lock",
      color: "#E1FF00",
    },
  ];

export  const technologies = [
    { name: "HTML 5", icon: "Code", color: "#FF5B00" },
    { name: "TypeScript", icon: "Code", color: "#FF5B00" },
    { name: "React Native", icon: "Code", color: "#FF5B00" },
    { name: "CSS 3", icon: "PaintBucket", color: "#FF5B00" },
    { name: "Node.js", icon: "Server", color: "#FF5B00" },
    { name: "AWS", icon: "Cloud", color: "#FF5B00" },
    { name: "MongoDB", icon: "Database", color: "#FF5B00" },
  ];

export  const features = [
    "Sistema de autenticación completo",
    "Dashboard interactivo con métricas en tiempo real",
    "API REST escalable y documentada",
    "Interfaz responsive y moderna",
    "Integración con servicios de terceros",
    "Sistema de notificaciones push",
  ];

export  const otherProjects = [
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