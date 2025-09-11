import React from 'react';
import { Container, Col } from '@citrica/objects';
import Text from '@ui/atoms/text';
import Button from '@ui/molecules/button';

const HeroSection = () => {
    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #16141F 0%, #1a1829 50%, #16141F 100%)' }}>
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-32 h-32 rounded-full"
                    style={{ backgroundColor: '#E1FF00', filter: 'blur(40px)' }}></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full"
                    style={{ backgroundColor: '#00FFFF', filter: 'blur(50px)' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full"
                    style={{ backgroundColor: '#FF5B00', filter: 'blur(80px)' }}></div>
            </div>

            <Container className="relative z-10">
                <Col cols={{ lg: 8, md: 6, sm: 4 }} className="text-center mx-auto">
                    {/* Logo placeholder */}
                    <div className="mb-12 h-16 flex items-center justify-center">
                        <div className="w-48 h-12 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center">
                            <Text variant="label" color="#666">Logo aquí</Text>
                        </div>
                    </div>

                    {/* Título principal */}
                    <div className="mb-8">
                        <h1>
                            <Text variant="display" textColor="color-text-white"
                                className="leading-tight tracking-tight">
                                <span className="block mb-2">APLICACIONES Y SITIOS WEB</span>
                                <span className="block" style={{ color: '#E1FF00' }}>A MEDIDA</span>
                                <span className="block mt-2">PARA TU NEGOCIO</span>
                            </Text>
                        </h1>
                    </div>

                    {/* Subtítulo */}
                    <div className="mb-12 max-w-3xl mx-auto">
                        <h2>
                            <Text variant="body" textColor="color-text-white"
                                className="opacity-90 leading-relaxed">
                                Creamos experiencias digitales únicas, modernas y de alta calidad que impulsen tu negocio.
                            </Text>
                        </h2>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-6 justify-center">
                        <button className="px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                            style={{
                                backgroundColor: '#FF5B00',
                                color: '#16141F',
                                boxShadow: '0 10px 30px rgba(255, 91, 0, 0.3)'
                            }}>
                            <Text variant="body" color="#16141F" weight="bold">
                                Comenzar Proyecto
                            </Text>
                        </button>

                        <button className="px-8 py-4 rounded-full border-2 font-semibold transition-all duration-300 transform hover:scale-105"
                            style={{
                                borderColor: '#E1FF00',
                                color: '#E1FF00',
                                backgroundColor: 'transparent'
                            }}>
                            <Text variant="body" color="#E1FF00" weight="bold">
                                Ver Proyectos
                            </Text>
                        </button>
                    </div>
                </Col>
            </Container>

            {/* Indicador de scroll */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 rounded-full border-2 border-white opacity-50 relative">
                    <div className="w-1 h-3 bg-white rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-pulse"></div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;