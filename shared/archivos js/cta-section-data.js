// Variantes de CTA para diferentes contextos
export const ctaSectionVariants = {
  // Homepage principal
  home: {
    title: "¿Listo para Innovar y llevar tu negocio al siguiente nivel?",
    subtitle: "Agenda tu cita estratégica hoy.",
    description: "Elige una fecha y hora para conversar sobre tu proyecto de crecimiento digital.",
  },

  // Página de Proyectos
  projects: {
    title: "¿Te Interesa un Proyecto Similar?",
    subtitle: "Agenda tu cita estratégica hoy.",
    description: "Elige una fecha y hora para conversar sobre tu proyecto y te ayudaremos a transformar tu negocio con soluciones digitales personalizadas.",
  },

  // Landing de Restaurantes
  landingrestaurante: {
    title: "¿Listo para transformar tu negocio gastronómico?",
    subtitle: "Agenda tu cita estratégica hoy.",
    description: "Elige una fecha y hora y descubre cómo nuestras soluciones pueden transformar tu restaurante.",
  },
    webpage: {
    title: "¿Listo para tener tu sitio web?",
    subtitle: "Agenda tu cita hoy.",
    description: "Elige una fecha y hora para conversar y ten tu presencia digital lista en una semana.",
  },
};

// Mantener retrocompatibilidad con el código existente
export const ctaHomepage = [
  {
    title: ctaSectionVariants.home.title,
    subtitle: ctaSectionVariants.home.subtitle,
    description: ctaSectionVariants.home.description,
  },
];

