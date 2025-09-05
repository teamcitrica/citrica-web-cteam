'use client'
import React, { useState } from 'react';
import { Container, Col } from '@citrica/objects';
import Text from '@ui/atoms/text';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    projectType: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Aquí iría la lógica de envío del formulario
    setTimeout(() => {
      setIsSubmitting(false);
      // Reset form or show success message
    }, 2000);
  };

  const contactMethods = [
    {
      title: "Email",
      value: "hello@citrica.com",
      icon: "📧",
      color: "#E1FF00"
    },
    {
      title: "Teléfono",
      value: "+51 999 123 456",
      icon: "📱",
      color: "#00FFFF"
    },
    {
      title: "Ubicación",
      value: "Lima, Perú",
      icon: "📍",
      color: "#FF5B00"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden"
             style={{ backgroundColor: '#E5FFFF' }}>
      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-72 h-72 rounded-full" 
             style={{ backgroundColor: '#16141F', filter: 'blur(100px)' }}></div>
        <div className="absolute bottom-20 left-10 w-56 h-56 rounded-full" 
             style={{ backgroundColor: '#FF5B00', filter: 'blur(80px)' }}></div>
      </div>

      <Container className="relative z-10">
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className="text-center mb-16">
          <Text variant="headline" color="#16141F" className="mb-6 leading-tight">
            ¡Hablemos de tu <span style={{ color: '#FF5B00' }}>Próximo Proyecto</span>!
          </Text>
          <div className="max-w-3xl mx-auto">
            <Text variant="body" color="#16141F" className="opacity-80 leading-relaxed">
              Estamos aquí para convertir tus ideas en realidades digitales extraordinarias. Cuéntanos sobre tu proyecto y descubre cómo podemos ayudarte a alcanzar tus objetivos.
            </Text>
          </div>
        </Col>

        <Container>
          {/* Contact Form */}
          <Col cols={{ lg: 8, md: 6, sm: 4 }} className="mb-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
              <Text variant="title" color="#16141F" className="mb-6 text-center">
                Cuéntanos sobre tu proyecto
              </Text>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="label" color="#16141F" weight="bold">
                        Nombre completo *
                      </Text>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="label" color="#16141F" weight="bold">
                        Email *
                      </Text>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Empresa */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="label" color="#16141F" weight="bold">
                        Empresa
                      </Text>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  {/* Tipo de proyecto */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="label" color="#16141F" weight="bold">
                        Tipo de proyecto
                      </Text>
                    </label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="web-app">Aplicación Web</option>
                      <option value="mobile-app">Aplicación Móvil</option>
                      <option value="e-commerce">E-commerce</option>
                      <option value="landing-page">Landing Page</option>
                      <option value="system">Sistema Empresarial</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block mb-2">
                    <Text variant="label" color="#16141F" weight="bold">
                      Cuéntanos sobre tu proyecto *
                    </Text>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors duration-200 resize-vertical"
                    placeholder="Describe tu proyecto, objetivos, funcionalidades que necesitas, presupuesto aproximado, etc."
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#FF5B00',
                      color: '#16141F',
                      boxShadow: '0 10px 30px rgba(255, 91, 0, 0.3)'
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Mensaje'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Col>

          {/* Contact Methods */}
          <Col cols={{ lg: 4, md: 6, sm: 4 }}>
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <div key={index} 
                     className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{method.icon}</div>
                    <div>
                      <Text variant="subtitle" color="#16141F" className="mb-1">
                        {method.title}
                      </Text>
                      <Text variant="body" color={method.color} weight="bold">
                        {method.value}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}

              {/* Social Media */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30">
                <Text variant="subtitle" color="#16141F" className="mb-4 text-center">
                  Síguenos en redes
                </Text>
                <div className="flex justify-center gap-4">
                  {[
                    { name: 'LinkedIn', color: '#0077B5', icon: '💼' },
                    { name: 'Instagram', color: '#E4405F', icon: '📸' },
                    { name: 'Twitter', color: '#1DA1F2', icon: '🐦' }
                  ].map((social, index) => (
                    <button key={index}
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                            style={{ backgroundColor: `${social.color}20`, color: social.color }}>
                      <span className="text-lg">{social.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <Text variant="label" color="#16141F" weight="bold" className="mb-1">
                    Respuesta Rápida
                  </Text>
                  <Text variant="label" color="#16141F" className="opacity-70">
                    Te contactamos en menos de 24 horas
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Container>
      </Container>
    </section>
  );
};

export default ContactSection;