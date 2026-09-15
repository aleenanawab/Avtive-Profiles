'use client';

import React from 'react';
import { Check, Sparkles, Palette, Square, Circle, RectangleHorizontal } from 'lucide-react';
import { ProfileTheme } from '@/types/profile';
import { PROFILE_THEMES, ThemeConfig } from '@/components/themeStyles';

interface ThemeManagerProps {
  activeTheme: ProfileTheme;
  buttonRadius?: 'square' | 'rounded' | 'pill';
  buttonStyle?: 'solid' | 'outline' | 'soft';
  onChange: (settings: {
    theme?: ProfileTheme;
    buttonRadius?: 'square' | 'rounded' | 'pill';
    buttonStyle?: 'solid' | 'outline' | 'soft';
  }) => void;
}

const THEME_PRESETS: {
  id: ProfileTheme;
  name: string;
  category: string;
  swatchBg: string;
  cardPreview: string;
  badgeBg: string;
  accent: string;
}[] = [
  {
    id: 'editorial',
    name: 'Editorial Minimal',
    category: 'Minimal',
    swatchBg: 'bg-[#FAFAF9]',
    cardPreview: 'bg-white border-stone-200 text-stone-900',
    badgeBg: 'bg-[#C2410C]/10 text-[#C2410C]',
    accent: '#C2410C'
  },
  {
    id: 'minimal',
    name: 'Clean Stark',
    category: 'Minimal',
    swatchBg: 'bg-[#F4F4F5]',
    cardPreview: 'bg-white border-neutral-300 text-neutral-900',
    badgeBg: 'bg-neutral-200 text-neutral-800',
    accent: '#171717'
  },
  {
    id: 'dark',
    name: 'Dark Executive',
    category: 'Dark',
    swatchBg: 'bg-[#09090B]',
    cardPreview: 'bg-[#121216] border-white/10 text-white',
    badgeBg: 'bg-white/10 text-white',
    accent: '#ffffff'
  },
  {
    id: 'gradient',
    name: 'Vibrant Gradient',
    category: 'Gradient',
    swatchBg: 'bg-gradient-to-br from-violet-900 via-indigo-950 to-slate-900',
    cardPreview: 'bg-slate-900/90 border-violet-500/40 text-white',
    badgeBg: 'bg-violet-500/20 text-violet-300',
    accent: '#8b5cf6'
  },
  {
    id: 'soft',
    name: 'Soft Pastel',
    category: 'Soft',
    swatchBg: 'bg-[#F0F4F8]',
    cardPreview: 'bg-white border-sky-200 text-slate-800',
    badgeBg: 'bg-sky-100 text-sky-800',
    accent: '#0284c7'
  },
  {
    id: 'cyber',
    name: 'Terminal Cyber',
    category: 'Creative',
    swatchBg: 'bg-[#09090B]',
    cardPreview: 'bg-[#18181B] border-emerald-500/30 text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400',
    accent: '#10B981'
  },
  {
    id: 'luxe',
    name: 'Luxe Velvet',
    category: 'Creative',
    swatchBg: 'bg-[#0D0509]',
    cardPreview: 'bg-[#1A0C14] border-rose-900/40 text-rose-100',
    badgeBg: 'bg-rose-500/10 text-rose-300',
    accent: '#FB7185'
  },
  {
    id: 'professional',
    name: 'Slate Corporate',
    category: 'Professional',
    swatchBg: 'bg-[#F1F5F9]',
    cardPreview: 'bg-white border-slate-300 text-slate-900',
    badgeBg: 'bg-slate-200 text-slate-800',
    accent: '#0f172a'
  },
  {
    id: 'modern',
    name: 'Modern Emerald',
    category: 'Creative',
    swatchBg: 'bg-[#F0FDF4]',
    cardPreview: 'bg-white border-emerald-500/30 text-emerald-950',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    accent: '#059669'
  }
];

export function ThemeManager({
  activeTheme,
  buttonRadius = 'rounded',
  buttonStyle = 'solid',
  onChange
}: ThemeManagerProps) {
  return (
    <div className="w-full space-y-7">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-zinc-800">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-500" />
          Appearance & Themes
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Select a designer theme and customize button geometry. Updates appear immediately.
        </p>
      </div>

      {/* Theme Selection Grid */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Theme Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEME_PRESETS.map((t) => {
            const isSelected = activeTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange({ theme: t.id })}
                className={`group relative rounded-2xl p-3 text-left transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/10 dark:ring-white/20 shadow-md scale-[1.02]'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 bg-white dark:bg-[#18181B]'
                }`}
              >
                {/* Visual Swatch Mock */}
                <div className={`w-full h-18 rounded-xl p-2 flex flex-col justify-between mb-2.5 overflow-hidden shadow-inner ${t.swatchBg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${t.badgeBg}`}>
                      {t.category}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className={`w-full py-1 px-2 rounded-md text-[10px] font-semibold border ${t.cardPreview}`}>
                    Preview Card
                  </div>
                </div>

                {/* Theme Title */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {t.name}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0 ml-1"
                    style={{ backgroundColor: t.accent }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Button Corner Radius Picker */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Button Shape
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'square' as const, label: 'Square', radiusClass: 'rounded-none', icon: Square },
            { id: 'rounded' as const, label: 'Rounded', radiusClass: 'rounded-xl', icon: RectangleHorizontal },
            { id: 'pill' as const, label: 'Pill', radiusClass: 'rounded-full', icon: Circle }
          ].map((item) => {
            const isSelected = buttonRadius === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ buttonRadius: item.id })}
                className={`py-3 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-4 border-2 border-current ${item.radiusClass}`} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Button Fill Style Picker */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Button Style
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'solid' as const, label: 'Solid Fill', desc: 'Bold & High Contrast' },
            { id: 'outline' as const, label: 'Outline', desc: 'Clean Border' },
            { id: 'soft' as const, label: 'Soft Glass', desc: 'Translucent Fill' }
          ].map((item) => {
            const isSelected = buttonStyle === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ buttonStyle: item.id })}
                className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                }`}
              >
                <span className="block text-xs font-semibold">{item.label}</span>
                <span className={`block text-[10px] mt-0.5 ${isSelected ? 'opacity-80' : 'text-slate-400 dark:text-zinc-500'}`}>
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
