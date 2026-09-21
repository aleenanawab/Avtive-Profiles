'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProfileData } from '@/types/profile';
import { ProfileEditorProvider, useProfileEditor } from '@/context/ProfileEditorContext';
import { DesktopWindowPreview, AvtiveLogoIcon } from '@/components/DesktopWindowPreview';
import { MobileProfileEditor } from '@/components/profiles/MobileProfileEditor';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';
import { 
  ArrowLeft,
  ExternalLink,
  Save,
  Loader2,
  Monitor,
  Smartphone,
  Sparkles
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
  const { 
    profile, 
    updateProfilePartial,
    isSaving, 
    saveProfile, 
    toastMessage, 
    currentIdentifier,
    handleSwitchToProfile
  } = useProfileEditor();

  const [previewMode, setPreviewMode] = useState<'auto' | 'desktop' | 'mobile'>('auto');

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
  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/profile/${identifier}/edit`
    : `https://avtive-profiles-d267.vercel.app/profile/${identifier}/edit`;

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#070D18] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-cyan-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Main Avtive Brand Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#070D18]/95 backdrop-blur-xl border-b border-white/10 py-2.5 px-3 sm:px-6 shadow-md">
        <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Back Button */}
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${identifier}`}
              className="flex items-center gap-2.5 group shrink-0"
              title="Return to Public Profile"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <AvtiveLogoIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white tracking-tight">avtive</span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline-block">Your Profile. Your Story.</span>
              </div>
            </Link>

            <span className="h-4 w-px bg-white/15 hidden sm:inline-block" />

            <Link
              href={`/profile/${identifier}`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors shadow-2xs shrink-0"
              title="Return to Public Profile"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Public Profile</span>
            </Link>
          </div>

          {/* Center: Device View Switcher (Desktop / Mobile / Auto) */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setPreviewMode('auto')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === 'auto'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Auto Responsive Mode"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Auto</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === 'desktop'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3 h-3" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === 'mobile'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3 h-3" />
              <span>Mobile</span>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Multi-Persona Profile Switcher */}
            {userProfiles && userProfiles.length > 1 && (
              <ProfileSwitcher
                currentProfileIdOrSlug={identifier}
                initialProfiles={userProfiles}
                onSelectProfile={handleSwitchToProfile}
              />
            )}

            {/* Quick Save Button */}
            <button
              type="button"
              onClick={() => saveProfile()}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>

            {/* View Live URL in New Tab */}
            <Link
              href={`/profile/${identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors shadow-2xs shrink-0"
              title="Open public profile in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Live URL</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 w-full overflow-y-auto">
        
        {/* 1. FORCE DESKTOP MODE */}
        {previewMode === 'desktop' && (
          <div className="w-full max-w-[1780px] mx-auto p-4 sm:p-6">
            <DesktopWindowPreview
              profile={profile}
              url={profileUrl}
              onUpdateProfile={(updated) => updateProfilePartial(updated)}
              onSave={saveProfile}
              onNext={() => router.push(`/profile/${identifier}`)}
              onViewCard={() => router.push(`/profile/${identifier}`)}
              isSaving={isSaving}
            />
          </div>
        )}

        {/* 2. FORCE MOBILE MODE */}
        {previewMode === 'mobile' && (
          <div className="w-full min-h-full flex justify-center py-6 px-3 bg-[#050A14]">
            <div className="w-full max-w-md bg-[#070D18] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <MobileProfileEditor />
            </div>
          </div>
        )}

        {/* 3. AUTO RESPONSIVE MODE (Desktop on >= 1024px, Mobile on < 1024px) */}
        {previewMode === 'auto' && (
          <>
            {/* Desktop View (>= lg) */}
            <div className="hidden lg:block w-full max-w-[1780px] mx-auto p-4 sm:p-6">
              <DesktopWindowPreview
                profile={profile}
                url={profileUrl}
                onUpdateProfile={(updated) => updateProfilePartial(updated)}
                onSave={saveProfile}
                onNext={() => router.push(`/profile/${identifier}`)}
                onViewCard={() => router.push(`/profile/${identifier}`)}
                isSaving={isSaving}
              />
            </div>

            {/* Mobile View (< lg) */}
            <div className="lg:hidden w-full">
              <MobileProfileEditor />
            </div>
          </>
        )}

      </main>

    </div>
  );
}
