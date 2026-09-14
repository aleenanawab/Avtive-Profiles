'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowRight, Sparkles, Terminal, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileTheme } from '@/types/profile';

interface ThemeCardData {
  id: ProfileTheme;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  previewBg: string;
  previewBorder: string;
  accentColor: string;
  cardBg: string;
  description: string;
}

const THEME_OPTIONS: ThemeCardData[] = [
  {
    id: 'editorial',
    title: 'Editorial Minimal',
    subtitle: 'Clean, Classy, Professional',
    icon: Sparkles,
    previewBg: 'bg-[#FAFAF9]',
    previewBorder: 'border-stone-200',
    accentColor: '#C2410C',
    cardBg: 'bg-white text-stone-900',
    description: 'High-contrast typography, crisp borders, and timeless serif accents.'
  },
  {
    id: 'cyber',
    title: 'Developer Terminal',
    subtitle: 'Dark, Techy, Modern',
    icon: Terminal,
    previewBg: 'bg-[#09090B]',
    previewBorder: 'border-emerald-500/30',
    accentColor: '#10B981',
    cardBg: 'bg-[#121215] text-white',
    description: 'Monospace code highlights, neon emerald badges, and dark developer aesthetic.'
  },
  {
    id: 'luxe',
    title: 'Luxe Velvet',
    subtitle: 'Rich, Bold, Premium',
    icon: Gem,
    previewBg: 'bg-[#0D0509]',
    previewBorder: 'border-rose-500/30',
    accentColor: '#FB7185',
    cardBg: 'bg-[#180D15] text-white',
    description: 'Deep royal plum tones, glowing velvet accents, and premium luxury finishes.'
  }
];

function ThemeStepContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTheme = (searchParams.get('theme') as ProfileTheme) || 'editorial';

  const [selectedTheme, setSelectedTheme] = useState<ProfileTheme>(initialTheme);

  const handleNext = () => {
    router.push(`/onboarding/role?theme=${selectedTheme}`);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center">
            1
          </span>
          <span className="text-xs font-semibold text-white/80">Step 1 of 3</span>
        </div>
        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
          Visual Identity
        </span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Choose Your Theme
        </h1>
        <p className="text-xs sm:text-sm text-white/60">
          Select a signature aesthetic for your Avtive digital profile card.
        </p>
      </div>

      {/* Theme Cards Grid */}
      <div className="space-y-3 pt-2">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          const Icon = theme.icon;

          return (
            <motion.div
              key={theme.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedTheme(theme.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-white/10 border-white shadow-xl ring-1 ring-white/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                    style={{ backgroundColor: `${theme.accentColor}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: theme.accentColor }} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {theme.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                        {theme.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {theme.description}
                    </p>
                  </div>
                </div>

                {/* Radio indicator */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected
                      ? 'bg-white border-white text-black'
                      : 'border-white/30 bg-black/20'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="pt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl bg-white text-zinc-900 font-bold text-xs hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-lg cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function OnboardingThemePage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-sm">Loading themes...</div>}>
      <ThemeStepContent />
    </Suspense>
  );
}
