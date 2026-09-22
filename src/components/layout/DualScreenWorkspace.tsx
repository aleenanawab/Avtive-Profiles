'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Lock,
  LogOut,
  Sun,
  Moon,
  LayoutGrid
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.replace('/login');
    }
  };

  return (
    <div className={`w-full min-h-screen flex flex-col justify-center bg-[#070B14] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-auto ${className}`}>
      
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PERMANENT TWIN-SCREEN STAGE CONTAINER                                      */}
      {/* Clean, minimalist window presentation with zero floating external text     */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-row items-stretch justify-center gap-6 min-w-[1100px] xl:min-w-0 max-w-[1920px] mx-auto my-auto">
        
        {/* ======================================================================= */}
        {/* SCREEN 1: DESKTOP WORKING SCREEN (Clean Minimalist Window)              */}
        {/* ======================================================================= */}
        <section 
          aria-label="Desktop Working Screen"
          className="flex-1 min-w-[540px] max-w-[1240px] flex flex-col rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0A101E] shadow-2xl shadow-black/60 overflow-hidden"
        >
          {/* Desktop Browser Window Header Frame */}
          <div className="w-full bg-[#0E1528] border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
            
            {/* macOS Window Controls (Clean dots: No text inside or beside red dot) */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/40" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/40" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/40" />
            </div>

            {/* Desktop URL Address Bar */}
            <div className="flex-1 max-w-sm mx-auto hidden sm:flex items-center justify-center gap-2 px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-slate-400">https://</span>
              <span className="text-cyan-300 font-semibold truncate">avtive.platform{currentUrlPath}</span>
            </div>

            {/* Desktop Inside Functional Actions Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {desktopToolbarRight}

              <Link
                href="/dashboard"
                title="Workspaces Dashboard"
                aria-label="Dashboard"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={toggleDarkMode}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Logout"
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Screen Canvas Workspace */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col bg-[#070D1A]">
            {desktopContent}
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SCREEN 2: MOBILE WORKING SCREEN (Exact 375×667 Smartphone Chassis)      */}
        {/* ======================================================================= */}
        <aside 
          aria-label="Mobile Working Screen"
          className="w-[375px] min-w-[375px] max-w-[375px] shrink-0 flex flex-col items-center justify-center"
        >
          {/* Smartphone Chassis Frame (Standard 375px × 667px) */}
          <div className="w-[375px] min-w-[375px] max-w-[375px] h-[667px] min-h-[667px] max-h-[667px] rounded-[40px] border-[6px] border-slate-800 bg-[#090E1B] shadow-2xl shadow-black/80 flex flex-col overflow-hidden relative ring-1 ring-white/10">
            
            {/* Phone Top Notch / Dynamic Island + 9:41 Status Bar */}
            <div className="w-full bg-[#090E1B] pt-2 px-4 pb-1 flex items-center justify-between text-[11px] font-mono font-semibold text-slate-300 shrink-0 border-b border-white/5 select-none">
              <span>9:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-20 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-slate-900 border border-white/20" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mobile Screen Content Canvas: Fixed 375px internal website design viewport */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center bg-[#050913]">
              <div className="w-full flex-1 flex flex-col overflow-x-hidden">
                {mobileContent}
              </div>
            </div>

            {/* Phone Bottom Home Indicator Bar */}
            <div className="w-full py-1.5 bg-[#090E1B] flex items-center justify-center shrink-0 border-t border-white/5">
              <div className="w-28 h-1 rounded-full bg-white/30" />
            </div>

          </div>
        </aside>

      </div>

    </div>
  );
}
