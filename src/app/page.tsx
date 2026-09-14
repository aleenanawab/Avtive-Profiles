'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Projects } from '@/components/Projects';
import { Skills } from '@/components/Skills';
import { Experience } from '@/components/Experience';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function Home() {
  return (
    <ThemeProvider>
      <div className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col font-body selection:bg-[var(--accent)] selection:text-white">
        {/* Navigation Bar with Theme Switcher & Dashboard Access */}
        <Navbar />

        {/* Main Content Sections */}
        <main className="flex-1 w-full">
          <Hero />
          <Projects />
          <Skills />
          <Experience />
          <ContactSection />
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating Theme Switcher Widget (Bottom Right) */}
        <ThemeSwitcher variant="floating" />
      </div>
    </ThemeProvider>
  );
}
