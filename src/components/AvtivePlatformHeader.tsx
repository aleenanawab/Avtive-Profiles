'use client';

import React from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { usePortfolioTheme } from '@/context/ThemeContext';

export function AvtivePlatformHeader() {
  const { isDark, toggleDarkMode } = usePortfolioTheme();

  return (
    <header className="sticky top-0 z-50 w-full transition-colors duration-200 border-b bg-white/95 text-slate-900 border-slate-200 shadow-xs dark:bg-[#0B0D13]/95 dark:text-white dark:border-white/10 dark:shadow-none backdrop-blur-md">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
        
        {/* Left Section: Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 group hover:opacity-95 transition-opacity"
          aria-label="Avtive Home"
        >
          {/* Stylized Circle "A" Icon */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform font-sans">
            A
          </div>
          
          <span className="font-bold text-base sm:text-lg tracking-tight font-sans text-slate-900 dark:text-white">
            Avtive
          </span>
        </Link>

        {/* Right Section: Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label="Toggle Light / Dark Mode"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs bg-white hover:bg-slate-100 text-slate-900 border-slate-300 dark:bg-[#161821] dark:hover:bg-[#1f222e] dark:text-white dark:border-white/15 active:scale-95"
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
    </header>
  );
}
