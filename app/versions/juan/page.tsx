import React from 'react';
import HeroSection from './components/hero-section';
import AboutSection from './components/about-section';
import TeamSection from './components/team-section';
import ProjectsSection from './components/projects-section';
import ProcessSection from './components/process-section';
import ContactSection from './components/contact-section'
import FooterSection from './components/footer-section';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Projects Section */}
      <ProjectsSection />
      
      {/* Process Section */}
      <ProcessSection />
      
      {/* Contact Section */}
      <ContactSection />
      
      {/* Footer Section */}
      <FooterSection />
    </div>
  );
};

export default LandingPage;