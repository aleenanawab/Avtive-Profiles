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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="figma-phone-frame w-full max-w-[390px] p-6 sm:p-7 flex flex-col justify-between relative"
    >
      {/* Mobile Top Status Bar (9:41, Wifi, Battery) */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-4 px-1 font-mono">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
          </svg>
          <div className="w-5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
            <div className="w-full h-full bg-current rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Screen 3 Header: Back Arrow, Step 2/3, Title & Subtitle */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 -ml-1 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs font-mono font-medium tracking-wider">
            2/3
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Choose Theme
            <span className="sr-only"> - Choose Your Theme</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-normal">
            Pick a style that matches your vibe. You can change it first.
          </p>
        </div>
      </div>

      {/* Theme Cards List matching Figma Screen 3 */}
      <div className="space-y-3 mb-6">
        {THEME_OPTIONS.map((item) => {
          const isSelected = selectedTheme === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedTheme(item.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-50 dark:bg-[#1B1E28] border-slate-900 dark:border-rose-500/80 shadow-xs ring-1 ring-slate-900/10 dark:ring-rose-500/30'
                  : 'bg-white dark:bg-[#151821] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Visual Thumbnail Preview matching Figma */}
                <div 
                  className={`w-14 h-12 rounded-xl p-1.5 flex flex-col justify-between shrink-0 border ${
                    item.id === 'editorial'
                      ? 'bg-[#FAFAF9] border-stone-200 text-stone-900'
                      : item.id === 'cyber'
                      ? 'bg-[#09090B] border-emerald-500/40 text-emerald-400'
                      : 'bg-[#180D15] border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="w-full h-2 rounded-xs bg-current opacity-30" />
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-current opacity-60 shrink-0" />
                    <div className="w-6 h-1 rounded-2xs bg-current opacity-40" />
                  </div>
                </div>

                {/* Details */}
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-slate-300 dark:border-zinc-700 bg-transparent'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Button: White Pill Button */}
      <div>
        <button
          type="button"
          onClick={handleNext}
          className="figma-pill-primary w-full py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <span>Next</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function OnboardingThemePage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-sm">Loading themes...</div>}>
      <ThemeStepContent />
    </Suspense>
  );
}
