'use client';

import React from 'react';
import Link from 'next/link';
import { 
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
  mobileContent?: React.ReactNode;
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
      try {
        sessionStorage.removeItem('avtive_active_session');
      } catch {}
      window.location.replace('/login');
    }
  };

  return (
    <div className={`w-full min-h-screen flex flex-col justify-center bg-slate-100 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-200 overflow-x-hidden ${className}`}>
      
      {/* Responsive Workspace Stage Container */}
      <div className="flex-1 w-full p-2.5 sm:p-5 lg:p-7 flex flex-col items-center justify-center max-w-5xl mx-auto my-auto box-border min-w-0">
        <section 
          className="w-full flex-1 min-w-0 flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A101E] shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/60 overflow-hidden transition-colors"
        >
          {/* Desktop Browser Window Header Frame */}
          <div className="w-full bg-slate-50/90 dark:bg-[#0E1528] border-b border-slate-200 dark:border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 transition-colors">
            
            {/* Window Controls */}
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

            {/* Inside Functional Actions Toolbar */}
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

          {/* Screen Canvas Workspace */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col bg-slate-100/70 dark:bg-[#070D1A] transition-colors">
            {desktopContent}
          </div>
        </section>
      </div>

    </div>
  );
}
