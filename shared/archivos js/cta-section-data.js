// Variantes de CTA para diferentes contextos
export const ctaSectionVariants = {
  // Homepage principal
  home: {
    title: "Agenda una Asesoría Sin Compromiso.",
    subtitle: "QUEREMOS ENTENDER SU DESAFÍO DIGITAL A FONDO",
    description: "Hablemos con Transparencia. Agenda tu Asesoría. Nuestro compromiso es ser amistosos, claros y transparentes. Antes de cualquier inversión, te ofrecemos una asesoría sin compromiso. Queremos entender a fondo su desafío digital para asegurarnos de que la solución que le entregamos sea exactamente lo que necesita.",
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

