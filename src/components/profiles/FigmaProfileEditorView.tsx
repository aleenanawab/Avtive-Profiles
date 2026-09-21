'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Monitor,
  Smartphone,
  Columns,
  ExternalLink,
  Save,
  Loader2,
  Check,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { useProfileEditor } from '@/context/ProfileEditorContext';
import { DesktopProfileSidebar } from './DesktopProfileSidebar';
import { DesktopProfileContent } from './DesktopProfileContent';
import { MobileSliderProfileView } from './MobileSliderProfileView';
import { ProfileSwitcher } from './ProfileSwitcher';

export function FigmaProfileEditorView() {
  const {
    profile,
    currentActiveIdentifier,
    isSaving,
    handleSaveChanges,
    saveProfile,
    userProfiles,
    handleSwitchToProfile,
    handleSwitchPersona,
    toastMessage,
    showToast
  } = useProfileEditor();

  const identifier = profile.slug || profile.id || currentActiveIdentifier;

  // View Mode: 'side-by-side' (Desktop Left + Mobile Preview Right) | 'desktop' (Desktop Fullscreen) | 'mobile' (Mobile Studio View)
  const [viewMode, setViewMode] = useState<'side-by-side' | 'desktop' | 'mobile'>('side-by-side');

  const onGlobalSave = async () => {
    try {
      await handleSaveChanges();
    } catch {
      await saveProfile();
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex flex-col bg-[#070B14] text-white select-none">
      
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TOP STUDIO VIEW CONTROLS & STATUS BAR                                      */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#0A101D]/90 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center justify-between gap-3 sticky top-0 z-30">
        
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Side-by-Side View (Desktop Editor + Mobile Preview)"
          >
            <Columns className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Side by Side</span>
            <span className="sm:hidden">Both</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop View Fullscreen"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop View</span>
            <span className="sm:hidden">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile Studio View"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Mobile View</span>
            <span className="sm:hidden">Mobile</span>
          </button>
        </div>

        {/* Center: Live Sync Pill (visible on medium+ screens) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Realtime Synchronization (Desktop ⇄ Mobile)</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onGlobalSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:from-cyan-600 active:to-blue-700 text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save All</span>
          </button>

          <Link
            href={`/profile/${identifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Live Profile</span>
          </Link>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MAIN STUDIO WORKSPACE CONTAINER                                            */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 w-full flex overflow-hidden">
        
        {/* ======================================================================= */}
        {/* 1. SIDE-BY-SIDE VIEW (Default on Desktop)                              */}
        {/* ======================================================================= */}
        {viewMode === 'side-by-side' && (
          <div className="w-full flex flex-col lg:flex-row h-[calc(100vh-108px)] overflow-hidden">
            
            {/* ── LEFT SIDE: DESKTOP PROFILE EDITOR (60-65% width on desktop) ───── */}
            <div className="flex-1 h-full flex overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 min-w-0">
              <DesktopProfileSidebar />
              <DesktopProfileContent hideRightPreview={true} />
            </div>

            {/* ── RIGHT SIDE: MOBILE VIEW WITH LIVE CARD SLIDER (35-40% width) ───── */}
            <aside className="w-full lg:w-[420px] xl:w-[460px] 2xl:w-[490px] shrink-0 h-full bg-[#050811] flex flex-col items-center justify-start p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              <MobileSliderProfileView onSave={onGlobalSave} />
            </aside>

          </div>
        )}

        {/* ======================================================================= */}
        {/* 2. DESKTOP VIEW FULLSCREEN                                             */}
        {/* ======================================================================= */}
        {viewMode === 'desktop' && (
          <div className="w-full h-[calc(100vh-108px)] flex flex-row overflow-hidden">
            <DesktopProfileSidebar />
            <DesktopProfileContent />
          </div>
        )}

        {/* ======================================================================= */}
        {/* 3. MOBILE VIEW ONLY                                                    */}
        {/* ======================================================================= */}
        {viewMode === 'mobile' && (
          <div className="w-full h-[calc(100vh-108px)] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#050811]">
            <MobileSliderProfileView onSave={onGlobalSave} />
          </div>
        )}

      </div>

    </div>
  );
}
