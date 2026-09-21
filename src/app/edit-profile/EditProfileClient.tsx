'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { ProfileData } from '@/types/profile';
import { FigmaProfileEditorView } from '@/components/profiles/FigmaProfileEditorView';
import { ProfileEditorProvider, useProfileEditor } from '@/context/ProfileEditorContext';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

function EditProfileInner({ initialProfile, userProfiles }: EditProfileClientProps) {
  const { profile, currentActiveIdentifier, handleSwitchToProfile } = useProfileEditor();
  const identifier = profile.slug || profile.id || initialProfile.slug || initialProfile.id || currentActiveIdentifier;

  // Session guard
  useEffect(() => {
    const verifyActiveSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!data.user) window.location.replace('/login');
      } catch {
        window.location.replace('/login');
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

  return (
    <div className="min-h-screen w-full figma-editor-bg text-white font-sans flex flex-col">
      {/* Sleek Minimalist Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#0B131E]/95 backdrop-blur-xl border-b border-[#23354C]/70 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${identifier}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#131F2E] hover:bg-[#1A2B3E] border border-[#23354C] text-slate-200 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Profile</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">
                Avtive Profile Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Multi-Persona Profile Switcher */}
            <ProfileSwitcher
              currentProfileIdOrSlug={identifier}
              initialProfiles={userProfiles}
              onSelectProfile={handleSwitchToProfile}
            />

            <Link
              href={`/profile/${identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#16273C] hover:bg-[#1F3652] border border-[#2C4566] text-white transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Live Card</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Figma Rebuilt Profile Editor Component */}
      <main className="w-full flex-1">
        <FigmaProfileEditorView />
      </main>
    </div>
  );
}

// ─── Outer component — provides shared profile context ────────────────────────
export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  return (
    <ProfileEditorProvider initialProfile={initialProfile} userProfiles={userProfiles}>
      <EditProfileInner initialProfile={initialProfile} userProfiles={userProfiles} />
    </ProfileEditorProvider>
  );
}
