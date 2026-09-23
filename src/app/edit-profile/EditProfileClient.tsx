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
import { PhonePreview } from '@/components/PhonePreview';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';
import { 
  ArrowLeft, 
  ArrowRight,
  ExternalLink, 
  Save, 
  Loader2, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Lock
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { isDark, toggleDarkMode } = usePortfolioTheme();
  const { 
    profile, 
    liveProfile,
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
      setIsSaved(true);
    } catch {
      await saveProfile();
      setIsSaved(true);
    }
  };

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
    <div className="h-screen max-h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-center bg-slate-100 dark:bg-[#070D18] text-slate-800 dark:text-slate-100 font-sans selection:bg-slate-300 dark:selection:bg-white/20 selection:text-slate-900 dark:selection:text-white relative overflow-hidden transition-colors">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-slate-300 dark:border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PERMANENT TWIN-SCREEN WORKING WORKSPACE (Clean Minimalist Window)          */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <main 
        className="flex-1 w-full h-full min-h-0 p-2 sm:p-3 lg:p-4 flex flex-row items-center justify-center gap-3 sm:gap-5 min-w-0 max-w-[1920px] mx-auto overflow-hidden"
      >
        
        {/* ======================================================================= */}
        {/* WORKING SCREEN 1: DESKTOP PROFILE STUDIO EDITOR                        */}
        {/* ======================================================================= */}
        <section 
          aria-label="Desktop Working Screen"
          className="flex-1 min-w-0 max-w-[1240px] h-full flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A101E] shadow-2xl shadow-slate-300/40 dark:shadow-black/60 overflow-hidden transition-colors min-h-0"
        >
          {/* Desktop Frame Window Bar */}
          <div className="w-full bg-slate-50 dark:bg-[#0E1528] border-b border-slate-200 dark:border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 transition-colors overflow-hidden">
            
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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-200/70 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                {isSidebarOpen ? (
                  <X className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
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
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/70 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop Browser URL Address Bar */}
            <div className="flex-1 max-w-xs md:max-w-sm mx-auto hidden md:flex items-center justify-center gap-2 px-3 py-1 rounded-xl bg-slate-200/70 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 min-w-0">
              <Lock className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 truncate">https://</span>
              <span className="text-slate-900 dark:text-white font-semibold truncate">avtive.platform/profile/{identifier}/edit</span>
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

              {/* Dark / Light Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleDarkMode}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/70 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                )}
              </button>

              <button
                type="button"
                onClick={onGlobalSave}
                disabled={isSaving}
                aria-label="Save All"
                title="Save All"
                className="p-1.5 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Save</span>
              </button>

              {/* Next Button: Displayed after saving changes, redirects to profile view */}
              {isSaved && (
                <button
                  type="button"
                  onClick={() => router.push(`/profile/${identifier}`)}
                  aria-label="Next: View Profile"
                  title="Next: View Profile"
                  className="p-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 animate-in fade-in"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <Link
                href={`/profile/${identifier}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Live URL"
                title="Open public profile in new tab"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/70 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                title="Sign Out"
                className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Editor Canvas (Relative container for slide-in drawer) */}
          <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-row relative">
            
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
            <div className="flex-1 w-full h-full min-h-0 overflow-hidden">
              <DesktopProfileContent hideRightPreview={true} />
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* WORKING SCREEN 2: MOBILE SMARTPHONE LIVE PREVIEW                       */}
        {/* ======================================================================= */}
        <aside 
          aria-label="Mobile Working Screen"
          className="w-auto shrink-0 h-full flex flex-col items-center justify-center min-h-0"
        >
          <PhonePreview
            profile={liveProfile}
            isDark={isDark}
            canEdit={false}
            hideHeaderLabel={false}
            headerTitle="Mobile Screen · Live Preview"
          />
        </aside>

      </main>

    </div>
  );
}
