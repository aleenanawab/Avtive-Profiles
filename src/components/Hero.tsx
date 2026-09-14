'use client';

import React from 'react';
import { usePortfolioTheme } from '@/context/ThemeContext';
import { 
  ArrowRight, 
  Mail, 
  Terminal, 
  Sparkles, 
  BookOpen, 
  Download, 
  MapPin, 
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { GithubIcon, LinkedInIcon } from './BrandIcons';

export function Hero() {
  const { theme } = usePortfolioTheme();

  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      {/* Background ambient decorative shapes for Cyber / Luxe */}
      {theme === 'cyber' && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      )}
      {theme === 'luxe' && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-rose-500/15 blur-[140px] pointer-events-none -z-10" />
      )}

      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-14">
        
        {/* Left Column: Headline, Bio & Actions */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
            </span>
            {theme === 'cyber' ? (
              <span className="font-mono">● sys.status: AVAILABLE_FOR_HIRE</span>
            ) : theme === 'luxe' ? (
              <span className="font-sans">✦ Bespoke Strategy & Design Inquiries Open</span>
            ) : (
              <span className="font-sans tracking-wide uppercase text-[11px]">Vol. 24 • Open for Select Commissions</span>
            )}
          </div>

          {/* Main Title & Role */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-[var(--text-primary)] tracking-tight leading-[1.15]">
              {theme === 'editorial' ? (
                <>Architecting elegant, enduring digital craft.</>
              ) : theme === 'cyber' ? (
                <>Engineering resilient systems & full-stack software.</>
              ) : (
                <>Crafting luxury experiences & elevated identities.</>
              )}
            </h1>

            <p className="text-base sm:text-xl font-medium text-[var(--accent)] font-body">
              Aleena Nawab <span className="text-[var(--text-muted)] font-normal">• Senior Full-Stack Architect & Product Strategist</span>
            </p>
          </div>

          {/* Short Bio */}
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-body max-w-xl leading-relaxed mx-auto md:mx-0">
            Specializing in high-performance Next.js architectures, distributed backends, and multi-tenant platforms. I bridge the gap between rigorous systems engineering and refined user experience.
          </p>

          {/* Location & Metadata Pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[var(--text-muted)] font-mono">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Global / Remote</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>7+ Years Experience</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Creator</span>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <a
              href="#projects"
              style={{
                borderRadius: 'var(--radius-btn)'
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <span>View Selected Work</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#contact"
              style={{
                borderRadius: 'var(--radius-btn)'
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all duration-300 shadow-xs active:scale-95"
            >
              <Mail className="w-4 h-4 text-[var(--accent)]" />
              <span>Contact Me</span>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
            <span className="text-xs font-mono text-[var(--text-muted)]">Channels:</span>
            
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-colors"
              title="GitHub Profile"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-colors"
              title="LinkedIn Profile"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>

            <a
              href="mailto:contact@aleenanawab.com"
              className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-colors"
              title="Direct Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Right Column: Hero Profile Visual Card */}
        <div className="shrink-0 relative">
          <div
            style={{
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--card-shadow)'
            }}
            className="relative w-64 h-80 sm:w-72 sm:h-96 overflow-hidden bg-[var(--bg-card)] border-2 border-[var(--border-color)] p-2 transition-all duration-500 hover:scale-[1.01]"
          >
            {/* Avatar container */}
            <div 
              style={{
                borderRadius: 'calc(var(--radius-card) - 6px)'
              }}
              className="relative w-full h-full overflow-hidden bg-[var(--bg-elevated)]"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"
                alt="Aleena Nawab"
                className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
              />

              {/* Bottom Card Overlay Tag */}
              <div className="absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent backdrop-blur-xs text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold font-heading text-white">Aleena Nawab</p>
                    <p className="text-[10px] text-zinc-300 font-mono">Systems & Design Architect</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating theme badge pill */}
          <div
            style={{
              borderRadius: 'var(--radius-pill)'
            }}
            className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-6 px-3.5 py-1.5 bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-lg flex items-center gap-2 text-xs font-mono font-bold text-[var(--accent)]"
          >
            {theme === 'cyber' && <Terminal className="w-3.5 h-3.5" />}
            {theme === 'luxe' && <Sparkles className="w-3.5 h-3.5" />}
            {theme === 'editorial' && <BookOpen className="w-3.5 h-3.5" />}
            <span className="capitalize">{theme} Theme Active</span>
          </div>
        </div>

      </div>
    </section>
  );
}
