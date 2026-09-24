'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileData } from '@/types/profile';
import { ProfileEditorProvider, useProfileEditor } from '@/context/ProfileEditorContext';
import { usePortfolioTheme } from '@/context/ThemeContext';
import { DesktopProfileSidebar } from '@/components/profiles/DesktopProfileSidebar';
import { DesktopProfileContent } from '@/components/profiles/DesktopProfileContent';
import { MobileSliderProfileView } from '@/components/profiles/MobileSliderProfileView';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';
import { 
  ArrowLeft, 
  ExternalLink, 
  Save, 
  Loader2, 
  Signal, 
  Wifi, 
  Battery,
  LogOut,
  Menu,
  X,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  return (
    <ProfileEditorProvider initialProfile={initialProfile} userProfiles={userProfiles}>
      <EditProfileClientInner initialProfile={initialProfile} userProfiles={userProfiles} />
    </ProfileEditorProvider>
  );
}

function EditProfileClientInner({ initialProfile, userProfiles }: EditProfileClientProps) {
  const router = useRouter();
  const { isDark, toggleDarkMode } = usePortfolioTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    profile, 
    activeSection,
    setActiveSection,
    isSaving, 
    saveProfile, 
    handleSaveChanges, 
    toastMessage, 
    currentIdentifier,
    handleSwitchToProfile
  } = useProfileEditor();

  // Session guard
  useEffect(() => {
    const verifyActiveSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!data.user) window.location.replace('/login');
      } catch {
        // Continue in dev or offline
      }
    };
    verifyActiveSession();
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') verifyActiveSession();
    };
    const handlePageShow = (e: PageTransitionEvent) => { if (e.persisted) verifyActiveSession(); };
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleVisibilityOrFocus);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  const identifier = profile.slug || profile.id || initialProfile.slug || initialProfile.id || currentIdentifier;

  const onGlobalSave = async () => {
    try {
      if (handleSaveChanges) {
        await handleSaveChanges();
      } else {
        await saveProfile();
      }
    } catch {
      await saveProfile();
    }
  };

  const handleTopBarNext = async () => {
    try {
      await onGlobalSave();
    } catch (err) {
      console.error('Error auto-saving before next section:', err);
    }
    const sectionKeys = [
      'profile',
      'personalDetails',
      'skills',
      'projects',
      'education',
      'contactInfo',
      'socialLinks',
      'experience',
      'enhanceProfile'
    ];
    const currentIndex = sectionKeys.indexOf(activeSection);
    if (currentIndex >= 0 && currentIndex < sectionKeys.length - 1) {
      setActiveSection(sectionKeys[currentIndex + 1]);
    } else {
      router.push(`/profile/${identifier}`);
    }
  };

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
    <div className="min-h-screen w-full flex flex-col justify-center bg-slate-100 dark:bg-[#070D18] text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-auto transition-colors">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-cyan-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PERMANENT TWIN-SCREEN WORKING WORKSPACE (Clean Minimalist Window)          */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-row items-stretch justify-center gap-6 min-w-[1100px] xl:min-w-0 max-w-[1920px] mx-auto my-auto">
        
        {/* ======================================================================= */}
        {/* WORKING SCREEN 1: DESKTOP PROFILE STUDIO EDITOR                        */}
        {/* ======================================================================= */}
        <section 
          aria-label="Desktop Working Screen"
          className="flex-1 min-w-[560px] max-w-[1240px] flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A101E] shadow-xl dark:shadow-2xl dark:shadow-black/60 overflow-hidden transition-colors"
        >
          {/* Desktop Frame Window Bar */}
          <div className="w-full bg-slate-50 dark:bg-[#0E1528] border-b border-slate-200 dark:border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 transition-colors">
            
            {/* macOS Window Controls + Hamburger Toggle Button */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/40" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/40" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/40" />
              </div>

              {/* Hamburger Button to Open Slide-in Sidebar Panel */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(prev => !prev)}
                aria-label={isSidebarOpen ? "Close section sidebar" : "Open section sidebar"}
                title={isSidebarOpen ? "Close Sections Menu" : "Open Sections Menu"}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 dark:border-white/10 transition-all cursor-pointer active:scale-95"
              >
                {isSidebarOpen ? (
                  <X className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                ) : (
                  <Menu className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                )}
                <span className="hidden sm:inline text-[11px] font-medium">Sections</span>
              </button>
            </div>

            {/* Public Profile Navigation with Intuitive ArrowLeft Icon */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/profile/${identifier}`}
                aria-label="Return to Public Profile"
                title="Return to Public Profile"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Inside Action Buttons: Functional Buttons Moved Inside Screen */}
            <div className="flex items-center gap-2 shrink-0">
              {userProfiles && userProfiles.length > 1 && (
                <ProfileSwitcher
                  currentProfileIdOrSlug={identifier}
                  initialProfiles={userProfiles}
                  onSelectProfile={handleSwitchToProfile}
                />
              )}

              <button
                type="button"
                onClick={onGlobalSave}
                disabled={isSaving}
                aria-label="Save All"
                title="Save All"
                className="p-1.5 px-3 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 text-white shadow-2xs dark:shadow-md dark:shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Save</span>
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleTopBarNext}
                aria-label="Next"
                title="Next section"
                className="p-1.5 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/10 dark:shadow-none flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </button>

              {/* Minimal Light/Dark Theme Toggle: icon only, no text */}
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer shrink-0"
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                )}
              </button>

              <Link
                href={`/profile/${identifier}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Live URL"
                title="Open public profile in new tab"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                title="Sign Out"
                className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/15 border border-rose-200 dark:border-rose-500/20 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Editor Canvas (Relative container for slide-in drawer) */}
          <div className="flex-1 w-full overflow-hidden flex flex-row relative">
            
            {/* Animated Slide-In Sidebar Drawer on the Same Desktop Screen */}
            <AnimatePresence>
              {isSidebarOpen && (
                <>
                  {/* Backdrop inside Desktop Screen Canvas */}
                  <motion.div
                    key="desktop-sidebar-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-30 cursor-pointer"
                  />

                  {/* Slide-In Drawer Panel */}
                  <motion.div
                    key="desktop-sidebar-drawer"
                    initial={{ x: -340, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -340, opacity: 0 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 240 }}
                    className="absolute top-0 bottom-0 left-0 z-40 h-full shadow-2xl"
                  >
                    <DesktopProfileSidebar onClose={() => setIsSidebarOpen(false)} />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main Desktop Profile Editor Content */}
            <div className="flex-1 w-full h-full overflow-hidden">
              <DesktopProfileContent hideRightPreview={true} />
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* WORKING SCREEN 2: MOBILE SMARTPHONE WORKING EDITOR (Standard 375×667)   */}
        {/* ======================================================================= */}
        <aside 
          aria-label="Mobile Working Screen"
          className="w-[375px] min-w-[375px] max-w-[375px] shrink-0 flex flex-col items-center justify-center"
        >
          {/* Smartphone Chassis Frame (Standard 375px × 667px) */}
          <div className="w-[375px] min-w-[375px] max-w-[375px] h-[667px] min-h-[667px] max-h-[667px] rounded-[40px] border-[6px] border-slate-300 dark:border-slate-800 bg-white dark:bg-[#090E1B] shadow-2xl shadow-slate-400/20 dark:shadow-black/80 flex flex-col overflow-hidden relative ring-1 ring-slate-200 dark:ring-white/10 transition-colors">
            
            {/* Phone Status Bar (9:41, Wifi, Battery) */}
            <div className="w-full bg-slate-100 dark:bg-[#090E1B] pt-2 px-4 pb-1 flex items-center justify-between text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 shrink-0 border-b border-slate-200 dark:border-white/5 select-none transition-colors">
              <span>9:41</span>
              <div className="w-20 h-4 rounded-full bg-slate-900 dark:bg-black border border-slate-700 dark:border-white/10 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-900 border border-slate-600 dark:border-white/20" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mobile Editor Canvas: Fixed 375px internal website design viewport */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center bg-slate-50 dark:bg-[#050811] transition-colors">
              <div className="w-full flex-1 flex flex-col overflow-x-hidden">
                <MobileSliderProfileView onSave={onGlobalSave} />
              </div>
            </div>

            {/* Phone Bottom Home Bar */}
            <div className="w-full py-1.5 bg-slate-100 dark:bg-[#090E1B] flex items-center justify-center shrink-0 border-t border-slate-200 dark:border-white/5 transition-colors">
              <div className="w-28 h-1 rounded-full bg-slate-400 dark:bg-white/30" />
            </div>

          </div>
        </aside>

      </main>

    </div>
  );
}
