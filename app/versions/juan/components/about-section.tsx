// import React from 'react';
// import { Container, Col } from '@citrica/objects';
// import Text from '@ui/atoms/text';
// import BlurText from '@/shared/components/citrica-ui/organism/bluertext';

// const AboutSection = () => {
//   const features = [
//     {
//       title: "Diseño UX/UI",
//       description: "Interfaces modernas y funcionales",
//       icon: "🎨"
//     },
//     {
//       title: "Desarrollo Robusto",
//       description: "Código limpio y escalable",
//       icon: "💻"
//     },
//     {
//       title: "Optimización",
//       description: "Rendimiento y velocidad",
//       icon: "⚡"
//     },
//     {
//       title: "Soporte Continuo",
//       description: "Acompañamiento a largo plazo",
//       icon: "🤝"
//     }
//   ];

//   return (
//     <section className="py-24 relative"
//       style={{ backgroundColor: '#E5FFFF' }}>
//       {/* Elementos decorativos */}
//       <div className="absolute inset-0 z-20">
//         <div className="absolute top-10 right-20 w-40 h-40 rounded-full opacity-60"
//           style={{
//             background: 'radial-gradient(circle, #FF5B00 0%, #FF5B0040 70%, transparent 100%)',
//             filter: 'blur(20px)'
//           }}></div>
//         <div className="absolute bottom-32 left-16 w-32 h-32 rounded-full opacity-40"
//           style={{
//             background: 'radial-gradient(circle, #E1FF00 0%, #E1FF0030 70%, transparent 100%)',
//             filter: 'blur(15px)'
//           }}></div>

//       </div>

//       <Container className="relative z-10">
//         <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
//           <div className="max-w-4xl mx-auto">
//             <h2>
//               <Text variant="headline" color="#16141F" className="mb-8 leading-tight">
//                 Creamos <span style={{ color: '#FF5B00' }}>Soluciones Digitales</span> a Medida para Impulsar tu Negocio
//               </Text>
//             </h2>
//           </div>
//         </Col>

//        <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mx-auto mb-16">
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
//             <BlurText
//               animateBy="words"
//               delay={0}
//               direction="top"
//               animationSpeed={200}
//               className="mb-4"
//             >
//               <Text variant="body" color="#16141F" className="leading-relaxed text-justify">
//                 En Cítrica transformamos tus ideas en productos digitales de alta calidad. Somos expertos en diseño UX/UI y desarrollo, especializados en crear soluciones eficientes y funcionales.
//               </Text>
//             </BlurText>
            
//             <BlurText
//               animateBy="words"
//               delay={5000}
//               direction="top"
//               animationSpeed={200}
//               className="mb-4"
//             >
//               <Text variant="body" color="#16141F" className="leading-relaxed text-justify">
//                 Trabajamos como socios estratégicos, combinando metodologías ágiles y tecnologías de vanguardia para crear plataformas personalizadas que generen resultados tangibles.
//               </Text>
//             </BlurText>
            
//             <BlurText
//               animateBy="words"
//               delay={8000}
//               direction="top"
//               animationSpeed={200}
//             >
//               <Text variant="body" color="#16141F" className="leading-relaxed text-justify font-semibold">
//                 Nuestro objetivo es ser tu aliado tecnológico a largo plazo, construyendo juntos el camino hacia tu éxito digital.
//               </Text>
//             </BlurText>
//           </div>
//         </Col>

//         {/* Features grid */}
//         <Container>
//           {features.map((feature, index) => (
//             <Col key={index} cols={{ lg: 3, md: 3, sm: 2 }} className="mb-8">
//               <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/30">
//                 <div className="text-4xl mb-4 text-center">{feature.icon}</div>
//                 <Text variant="title" color="#16141F" className="mb-3 text-center">
//                   {feature.title}
//                 </Text>
//                 <Text variant="body" color="#16141F" className="text-center opacity-80">
//                   {feature.description}
//                 </Text>
//               </div>
//             </Col>
//           ))}
//         </Container>
//       </Container>
//     </section>
//   );
// };

// export default AboutSection;