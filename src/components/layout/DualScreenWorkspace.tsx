'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Lock,
  LogOut,
  Sun,
  Moon,
  LayoutGrid,
  Monitor,
  Smartphone
} from 'lucide-react';
import { usePortfolioTheme } from '@/context/ThemeContext';

export interface DualScreenWorkspaceProps {
  workflowTitle?: string;
  workflowSubtitle?: string;
  currentUrlPath?: string;
  desktopContent: React.ReactNode;
  mobileContent: React.ReactNode;
  desktopToolbarRight?: React.ReactNode;
  mobileToolbarRight?: React.ReactNode;
  headerCenterPill?: React.ReactNode;
  badgeText?: string;
  className?: string;
  isSaving?: boolean;
}

export function DualScreenWorkspace({
  currentUrlPath = '/app',
  desktopContent,
  mobileContent,
  desktopToolbarRight,
  className = ''
}: DualScreenWorkspaceProps) {
  const { isDark, toggleDarkMode } = usePortfolioTheme();
  const [activeScreenTab, setActiveScreenTab] = useState<'both' | 'desktop' | 'mobile'>('both');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      try {
        sessionStorage.removeItem('avtive_active_session');
      } catch {}
      window.location.replace('/login');
    }
  };

  return (
    <div className={`w-full min-h-screen flex flex-col justify-center bg-slate-100 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-200 overflow-x-hidden ${className}`}>
      
      {/* Responsive Viewport Switcher for Small Screens */}
      <div className="w-full flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-white/5 xl:hidden shrink-0 bg-white/90 dark:bg-[#0A101E]/90 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
            A
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">Avtive Twin-Screen</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-[#050913] p-1 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveScreenTab('desktop')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreenTab === 'desktop'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreenTab('mobile')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreenTab === 'mobile'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreenTab('both')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreenTab === 'both'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-white/10 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>Both</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PERMANENT TWIN-SCREEN STAGE CONTAINER                                      */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className={`flex-1 w-full p-2.5 sm:p-5 lg:p-7 flex flex-row items-stretch justify-center gap-6 max-w-[1920px] mx-auto my-auto box-border overflow-x-hidden xl:overflow-x-visible ${
        activeScreenTab === 'both' ? 'min-w-0 xl:min-w-0' : 'min-w-0'
      }`}>
        
        {/* ======================================================================= */}
        {/* SCREEN 1: DESKTOP WORKING SCREEN (Clean Minimalist Window)              */}
        {/* ======================================================================= */}
        <section 
          aria-label="Desktop Working Screen"
          className={`flex-1 min-w-0 sm:min-w-[480px] max-w-[1240px] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A101E] shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/60 overflow-hidden transition-colors ${
            activeScreenTab === 'mobile' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          {/* Desktop Browser Window Header Frame */}
          <div className="w-full bg-slate-50/90 dark:bg-[#0E1528] border-b border-slate-200 dark:border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 transition-colors">
            
            {/* macOS Window Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/40" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/40" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/40" />
            </div>

            {/* Desktop URL Address Bar */}
            <div className="flex-1 max-w-sm mx-auto hidden sm:flex items-center justify-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 transition-colors">
              <Lock className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-400">https://</span>
              <span className="text-cyan-700 dark:text-cyan-300 font-semibold truncate">avtive.platform{currentUrlPath}</span>
            </div>

            {/* Desktop Inside Functional Actions Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {desktopToolbarRight}

              <Link
                href="/dashboard"
                title="Workspaces Dashboard"
                aria-label="Dashboard"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={toggleDarkMode}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Logout"
                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/15 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Screen Canvas Workspace */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col bg-slate-100/70 dark:bg-[#070D1A] transition-colors">
            {desktopContent}
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SCREEN 2: MOBILE WORKING SCREEN (Exact 375×667 Smartphone Chassis)      */}
        {/* ======================================================================= */}
        <aside 
          aria-label="Mobile Working Screen"
          className={`w-full max-w-[375px] shrink-0 flex flex-col items-center justify-center box-border transition-colors ${
            activeScreenTab === 'desktop' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          {/* Smartphone Chassis Frame (Standard 375px × 667px) */}
          <div className="w-full max-w-[375px] h-[640px] sm:h-[667px] rounded-[36px] sm:rounded-[40px] border-[6px] border-slate-300 dark:border-slate-800 bg-white dark:bg-[#090E1B] shadow-xl shadow-slate-300/40 dark:shadow-2xl dark:shadow-black/80 flex flex-col overflow-hidden relative ring-1 ring-slate-900/5 dark:ring-white/10 transition-colors box-border">
            
            {/* Phone Top Notch / Dynamic Island + 9:41 Status Bar */}
            <div className="w-full bg-slate-100/90 dark:bg-[#090E1B] pt-2 px-4 pb-1 flex items-center justify-between text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 shrink-0 border-b border-slate-200 dark:border-white/5 select-none transition-colors">
              <span>9:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-20 h-4 rounded-full bg-slate-900 dark:bg-black border border-slate-700 dark:border-white/10 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-900 border border-slate-600 dark:border-white/20" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mobile Screen Content Canvas: Fixed 375px internal website design viewport */}
            <div className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden flex flex-col items-center bg-white dark:bg-[#050913] transition-colors box-border">
              <div className="w-full max-w-full flex-1 min-h-0 flex flex-col overflow-x-hidden box-border">
                {mobileContent}
              </div>
            </div>

            {/* Phone Bottom Home Indicator Bar */}
            <div className="w-full py-1.5 bg-slate-100/90 dark:bg-[#090E1B] flex items-center justify-center shrink-0 border-t border-slate-200 dark:border-white/5 transition-colors">
              <div className="w-28 h-1 rounded-full bg-slate-400 dark:bg-white/30 transition-colors" />
            </div>

          </div>
        </aside>

      </div>

    </div>
  );
}
