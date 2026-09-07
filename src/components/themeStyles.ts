import { ProfileTheme } from '@/types/profile';

export interface ThemeConfig {
  id: ProfileTheme;
  name: string;
  tag: string;
  description: string;
  previewClass: string;
  pageBg: string;
  headerBg: string;
  container: string;
  cardBg: string;
  cardBorder: string;
  subCardBg: string;
  subCardBorder: string;
  hoverBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  btnPrimary: string;
  btnSecondary: string;
  divider: string;
  fontFamily: string;
  pillTheme: string;
  coverFallback: string;
  accentRim: string;
}

export const PROFILE_THEMES: Record<ProfileTheme, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Clean Neutral',
    tag: 'Clean',
    description: 'Crisp neutral layout, sleek balanced monochrome, professional typography in one solid color with zero blue',
    previewClass: 'bg-white border-slate-700 text-slate-900',
    pageBg: 'bg-[#F8FAFC] dark:bg-[#09090B]',
    headerBg: 'bg-white/95 dark:bg-[#121216]/95 border-slate-200 dark:border-white/10',
    container: 'bg-white dark:bg-[#121216] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-xl',
    cardBg: 'bg-white dark:bg-[#121216]',
    cardBorder: 'border-slate-200 dark:border-white/10',
    subCardBg: 'bg-white dark:bg-[#121216]',
    subCardBorder: 'border-slate-200 dark:border-white/10',
    hoverBorder: 'hover:border-slate-400 dark:hover:border-slate-500',
    textPrimary: 'text-slate-900 dark:text-white',
    textSecondary: 'text-[#475569] dark:text-[#94A3B8]',
    textMuted: 'text-[#64748B] dark:text-[#64748B]',
    accentText: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-slate-100 dark:bg-white/10',
    badgeText: 'text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/15',
    btnPrimary: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold rounded-xl',
    btnSecondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 rounded-xl',
    divider: 'border-slate-200 dark:border-white/10',
    fontFamily: 'font-sans',
    pillTheme: 'bg-slate-100 text-slate-700',
    coverFallback: 'bg-white dark:bg-[#121216]',
    accentRim: 'bg-gradient-to-r from-transparent via-slate-400 to-transparent'
  },
  dark: {
    id: 'dark',
    name: 'Dark Executive',
    tag: 'Dark',
    description: 'Deep obsidian contrast, crisp silver accents, sleek executive monochrome in one solid color',
    previewClass: 'bg-[#0F0F12] border-neutral-600 text-white',
    pageBg: 'bg-[#09090B] dark:bg-[#09090B]',
    headerBg: 'bg-[#0F0F12]/95 dark:bg-[#0F0F12]/95 border-white/10',
    container: 'bg-[#121216] dark:bg-[#121216] text-white border-white/10 shadow-2xl',
    cardBg: 'bg-[#121216] dark:bg-[#121216]',
    cardBorder: 'border-white/10',
    subCardBg: 'bg-[#121216] dark:bg-[#121216]',
    subCardBorder: 'border-white/10',
    hoverBorder: 'hover:border-white/30',
    textPrimary: 'text-white',
    textSecondary: 'text-neutral-300',
    textMuted: 'text-neutral-400',
    accentText: 'text-white dark:text-white',
    badgeBg: 'bg-white/10',
    badgeText: 'text-neutral-200 border border-white/20',
    btnPrimary: 'bg-white hover:bg-neutral-200 text-black font-bold shadow-md',
    btnSecondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/20',
    divider: 'border-white/10',
    fontFamily: 'font-sans',
    pillTheme: 'bg-neutral-800 text-neutral-200',
    coverFallback: 'bg-[#121216] dark:bg-[#121216]',
    accentRim: 'bg-gradient-to-r from-transparent via-white/50 to-transparent'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    tag: 'Minimal',
    description: 'Generous whitespace, stark monochrome typography, ultra-subtle borders in one solid color',
    previewClass: 'bg-neutral-50 border-neutral-800 text-neutral-900',
    pageBg: 'bg-[#F4F4F5] dark:bg-[#09090B]',
    headerBg: 'bg-white/95 dark:bg-[#09090B]/95 border-neutral-200 dark:border-neutral-800',
    container: 'bg-white dark:bg-[#111111] text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-800 shadow-sm',
    cardBg: 'bg-white dark:bg-[#111111]',
    cardBorder: 'border-neutral-200 dark:border-neutral-800',
    subCardBg: 'bg-white dark:bg-[#111111]',
    subCardBorder: 'border-neutral-200 dark:border-neutral-800',
    hoverBorder: 'hover:border-neutral-400 dark:hover:border-neutral-600',
    textPrimary: 'text-neutral-950 dark:text-neutral-50 font-normal tracking-tight',
    textSecondary: 'text-neutral-600 dark:text-neutral-400',
    textMuted: 'text-neutral-400 dark:text-neutral-500',
    accentText: 'text-neutral-950 dark:text-white',
    badgeBg: 'bg-neutral-100 dark:bg-neutral-800',
    badgeText: 'text-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700',
    btnPrimary: 'bg-neutral-950 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black rounded-lg',
    btnSecondary: 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg',
    divider: 'border-neutral-200 dark:border-neutral-800',
    fontFamily: 'font-sans',
    pillTheme: 'bg-neutral-200 text-neutral-800',
    coverFallback: 'bg-white dark:bg-[#111111]',
    accentRim: 'bg-gradient-to-r from-transparent via-neutral-400 dark:via-neutral-600 to-transparent'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    tag: 'Corporate',
    description: 'Structured corporate cards, cool slate hierarchy, deep business styling in one solid color with zero blue',
    previewClass: 'bg-slate-100 border-slate-700 text-slate-900',
    pageBg: 'bg-[#F1F5F9] dark:bg-[#0F1216]',
    headerBg: 'bg-white/95 dark:bg-[#0F1216]/95 border-slate-200 dark:border-slate-800',
    container: 'bg-white dark:bg-[#14171D] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl',
    cardBg: 'bg-white dark:bg-[#14171D]',
    cardBorder: 'border-slate-200 dark:border-slate-800',
    subCardBg: 'bg-white dark:bg-[#14171D]',
    subCardBorder: 'border-slate-200 dark:border-slate-800',
    hoverBorder: 'hover:border-slate-400 dark:hover:border-slate-600',
    textPrimary: 'text-slate-900 dark:text-white font-bold',
    textSecondary: 'text-slate-700 dark:text-slate-300',
    textMuted: 'text-slate-500 dark:text-slate-400',
    accentText: 'text-slate-900 dark:text-slate-100',
    badgeBg: 'bg-slate-200/80 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold',
    btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 font-bold rounded-xl',
    btnSecondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl',
    divider: 'border-slate-200 dark:border-slate-800',
    fontFamily: 'font-sans',
    pillTheme: 'bg-slate-200 text-slate-800',
    coverFallback: 'bg-white dark:bg-[#14171D]',
    accentRim: 'bg-gradient-to-r from-transparent via-slate-400 dark:via-slate-500 to-transparent'
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    tag: 'Luxury',
    description: 'Warm champagne & amber tones, refined typography, luxury feel in single unified palette with zero blue',
    previewClass: 'bg-[#FAF7F2] border-[#B88746] text-[#2C221E]',
    pageBg: 'bg-[#F7F2EB] dark:bg-[#120F0C]',
    headerBg: 'bg-[#FAF7F2]/95 dark:bg-[#181411]/95 border-[#E5DAC8] dark:border-[#2D231B]',
    container: 'bg-[#FAF7F2] dark:bg-[#181411] text-[#2B231D] dark:text-[#F5EFE6] border border-[#E8DFD3] dark:border-[#382E25] shadow-xl',
    cardBg: 'bg-[#FAF7F2] dark:bg-[#181411]',
    cardBorder: 'border-[#E5DAC8] dark:border-[#2D231B]',
    subCardBg: 'bg-[#FAF7F2] dark:bg-[#181411]',
    subCardBorder: 'border-[#E5DAC8] dark:border-[#2D231B]',
    hoverBorder: 'hover:border-[#B88746] dark:hover:border-[#E5B869]/60',
    textPrimary: 'text-[#2B231D] dark:text-[#F5EFE6] font-serif',
    textSecondary: 'text-[#6B5D52] dark:text-[#C5B7AB]',
    textMuted: 'text-[#8E7E72] dark:text-[#9A8B7F]',
    accentText: 'text-[#B88746] dark:text-[#E5B869]',
    badgeBg: 'bg-[#B88746]/10 dark:bg-[#E5B869]/15',
    badgeText: 'text-[#9A6A2C] dark:text-[#E5B869] border border-[#B88746]/30',
    btnPrimary: 'bg-[#B88746] hover:bg-[#A37336] dark:bg-[#C59A52] dark:hover:bg-[#B88746] text-white dark:text-[#18130E] shadow-md shadow-[#B88746]/25 rounded-xl',
    btnSecondary: 'bg-[#B88746]/10 hover:bg-[#B88746]/20 dark:bg-[#E5B869]/10 dark:hover:bg-[#E5B869]/20 text-[#9A6A2C] dark:text-[#E5B869] border border-[#B88746]/30 rounded-xl',
    divider: 'border-[#E5DAC8] dark:border-[#2D231B]',
    fontFamily: 'font-serif',
    pillTheme: 'bg-[#F4ECE1] text-[#9A6A2C]',
    coverFallback: 'bg-[#FAF7F2] dark:bg-[#181411]',
    accentRim: 'bg-gradient-to-r from-transparent via-[#B88746] to-transparent'
  },
  modern: {
    id: 'modern',
    name: 'Modern / Creative',
    tag: 'Creative',
    description: 'Expressive gradient accents, modern cards, emerald and mint highlights in one solid color',
    previewClass: 'bg-[#F8FAFC] border-emerald-500 text-emerald-950',
    pageBg: 'bg-[#F0FDF4] dark:bg-[#04120E]',
    headerBg: 'bg-white/95 dark:bg-[#071511]/95 border-emerald-500/20 dark:border-emerald-500/20',
    container: 'bg-white dark:bg-[#071511] text-slate-900 dark:text-white border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-2xl shadow-emerald-500/5',
    cardBg: 'bg-white dark:bg-[#071511]',
    cardBorder: 'border-emerald-500/20 dark:border-emerald-500/20',
    subCardBg: 'bg-white dark:bg-[#071511]',
    subCardBorder: 'border-emerald-500/20 dark:border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/50',
    textPrimary: 'text-slate-900 dark:text-white font-extrabold tracking-tight',
    textSecondary: 'text-slate-600 dark:text-slate-300',
    textMuted: 'text-slate-400 dark:text-slate-500',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold',
    btnPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 rounded-xl',
    btnSecondary: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-xl',
    divider: 'border-emerald-500/20 dark:border-emerald-500/20',
    fontFamily: 'font-sans',
    pillTheme: 'bg-emerald-100 text-emerald-800',
    coverFallback: 'bg-white dark:bg-[#071511]',
    accentRim: 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent'
  }
};

export function getThemeConfig(theme?: ProfileTheme | string): ThemeConfig {
  if (!theme || theme === 'default') {
    return PROFILE_THEMES.elegant;
  }
  return PROFILE_THEMES[theme as ProfileTheme] || PROFILE_THEMES.elegant;
}
