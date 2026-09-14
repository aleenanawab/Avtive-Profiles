'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LogIn, 
  Palette, 
  UserPlus, 
  Users, 
  Layers, 
  ShieldCheck, 
  Building2, 
  Smartphone, 
  Sun, 
  Moon,
  LayoutGrid,
  ExternalLink
} from 'lucide-react';
import { usePortfolioTheme } from '@/context/ThemeContext';

export function AvtivePlatformHeader() {
  const pathname = usePathname();
  const { isDark, toggleDarkMode, theme, cycleTheme } = usePortfolioTheme();

  const navItems = [
    {
      id: 'auth',
      label: 'Register / Login First',
      href: '/login',
      icon: LogIn,
      active: pathname === '/login' || pathname === '/register'
    },
    {
      id: 'theme',
      label: 'Choose Theme',
      href: '/onboarding/theme',
      icon: Palette,
      active: pathname === '/onboarding/theme'
    },
    {
      id: 'create',
      label: 'Create Profile',
      href: '/onboarding/details',
      icon: UserPlus,
      active: pathname === '/onboarding/details' || pathname === '/create-profile'
    },
    {
      id: 'multiple',
      label: 'Multiple Profiles',
      href: '/dashboard',
      icon: Users,
      active: pathname === '/dashboard'
    },
    {
      id: 'theme-profile',
      label: 'Theme per Profile',
      href: '#',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        cycleTheme();
      },
      icon: Layers,
      active: false,
      badge: theme
    },
    {
      id: 'privacy',
      label: 'Share with Privacy',
      href: '/profile/edit',
      icon: ShieldCheck,
      active: pathname?.includes('/share')
    },
    {
      id: 'roles',
      label: 'Owner / Employee / Company',
      href: '/onboarding/role',
      icon: Building2,
      active: pathname === '/onboarding/role'
    },
    {
      id: 'responsive',
      label: 'Responsive & Smooth',
      href: '/figma',
      icon: Smartphone,
      active: pathname === '/figma',
      highlight: true
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-colors duration-200 border-b bg-white/95 text-slate-900 border-slate-200 shadow-xs dark:bg-[#0B0D13]/95 dark:text-white dark:border-white/10 dark:shadow-none backdrop-blur-md">
      <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-5 lg:px-7 py-2.5 flex items-center justify-between gap-3 sm:gap-5">
        
        {/* Left Section: Brand Logo & Platform Title */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 group hover:opacity-95 transition-opacity"
        >
          {/* Stylized Circle "A" Icon */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform font-sans">
            A
          </div>
          
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight font-sans">
                Avtive
              </span>
            </div>
            <span className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-zinc-100 tracking-tight">
              Complete Profile Platform
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-normal">
              Multiple Profiles &middot; Custom Themes &middot; Smart Sharing
            </span>
          </div>
        </Link>

        {/* Center Section: 8 Interactive Feature Pills from Figma */}
        <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-2.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div
                className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all duration-150 cursor-pointer text-center group ${
                  item.active
                    ? 'bg-slate-100 text-slate-950 dark:bg-white/15 dark:text-white ring-1 ring-slate-300 dark:ring-white/30'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5 stroke-[2] group-hover:scale-110 transition-transform" />
                  {item.badge && (
                    <span className="text-[9px] px-1 rounded uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-tight whitespace-nowrap mt-0.5">
                  {item.label}
                </span>
              </div>
            );

            if (item.onClick) {
              return (
                <button key={item.id} type="button" onClick={item.onClick} className="focus:outline-none">
                  {content}
                </button>
              );
            }

            return (
              <Link key={item.id} href={item.href}>
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Tagline, Light/Dark Mode Switcher & Canvas View */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Tagline from Figma */}
          <div className="hidden lg:flex flex-col text-right leading-tight pr-1">
            <span className="font-bold text-xs sm:text-[13px] tracking-tight text-slate-900 dark:text-white">
              Your Identity, Your Story
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400">
              Create. Manage. Share.
            </span>
          </div>

          {/* Figma Board Showcase Link */}
          <Link
            href="/figma"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/15 transition-all shadow-2xs"
            title="View full Figma multi-screen design canvas"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Figma Board</span>
          </Link>

          {/* Primary Requirement: Light & Dark Mode Toggle on the Above Header */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label="Toggle Light / Dark Mode"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs bg-white hover:bg-slate-100 text-slate-900 border-slate-300 dark:bg-[#161821] dark:hover:bg-[#1f222e] dark:text-white dark:border-white/15"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700 fill-slate-700" />
                <span className="text-[11px] font-medium">Dark</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Mobile / Tablet Horizontal Navigation Scrollbar for the 8 Features */}
      <div className="xl:hidden w-full overflow-x-auto border-t border-slate-200 dark:border-white/10 px-3 py-1.5 flex items-center gap-1 no-scrollbar bg-slate-50/70 dark:bg-black/40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const inner = (
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap font-medium transition-colors ${
                item.active
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </span>
          );

          if (item.onClick) {
            return (
              <button key={item.id} type="button" onClick={item.onClick} className="shrink-0">
                {inner}
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.href} className="shrink-0">
              {inner}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
