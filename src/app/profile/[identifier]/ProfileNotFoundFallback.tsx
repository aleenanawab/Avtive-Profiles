'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserX, Loader2 } from 'lucide-react';
import { 
  ProfileData, 
  UserSession,
  DEFAULT_SHARING_SETTINGS,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY
} from '@/types/profile';
import { PublicProfileClient } from './PublicProfileClient';

interface ProfileNotFoundFallbackProps {
  identifier: string;
  session: UserSession | null;
}

export function ProfileNotFoundFallback({ identifier, session }: ProfileNotFoundFallbackProps) {
  const [cachedProfile, setCachedProfile] = useState<ProfileData | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    try {
      // 1. Check exact slug or identifier match in localStorage
      const exactMatch = localStorage.getItem(`avtive_profile_${identifier}`);
      const lastSaved = localStorage.getItem('avtive_last_saved_profile');

      let candidate: ProfileData | null = null;
      if (exactMatch) {
        candidate = JSON.parse(exactMatch);
      } else if (lastSaved) {
        const parsed = JSON.parse(lastSaved);
        if (
          parsed &&
          (parsed.slug === identifier ||
            parsed.id === identifier ||
            identifier.toLowerCase().includes(parsed.slug?.toLowerCase()) ||
            parsed.slug?.toLowerCase().includes(identifier.toLowerCase()) ||
            (session?.id && parsed.userId === session.id))
        ) {
          candidate = parsed;
        }
      }

      // 2. Comprehensive localStorage scan across all profile keys
      if (!candidate && typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('avtive_profile_') || key.startsWith('avtive_'))) {
            try {
              const val = JSON.parse(localStorage.getItem(key) || '{}');
              if (
                val &&
                (val.slug === identifier ||
                  val.id === identifier ||
                  (val.slug && val.slug.toLowerCase() === identifier.toLowerCase()) ||
                  (val.id && val.id.toLowerCase() === identifier.toLowerCase()))
              ) {
                candidate = val;
                break;
              }
            } catch {}
          }
        }
      }

      if (candidate) {
        const normalizedCandidate: ProfileData = {
          ...candidate,
          theme: candidate.theme || 'editorial',
          skills: Array.isArray(candidate.skills) ? candidate.skills : [],
          projects: Array.isArray(candidate.projects) ? candidate.projects : [],
          experiences: Array.isArray(candidate.experiences) ? candidate.experiences : Array.isArray((candidate as any).experience) ? (candidate as any).experience : [],
          education: Array.isArray(candidate.education) ? candidate.education : [],
          socialLinks: (Array.isArray(candidate.socialLinks) ? candidate.socialLinks : Array.isArray(candidate.socials) ? candidate.socials : []) as any,
          socials: (Array.isArray(candidate.socials) ? candidate.socials : Array.isArray(candidate.socialLinks) ? candidate.socialLinks : []) as any,
          customFields: Array.isArray(candidate.customFields) ? candidate.customFields : [],
          dynamicSections: Array.isArray(candidate.dynamicSections) ? candidate.dynamicSections : [],
          sharingSettings: candidate.sharingSettings || { ...DEFAULT_SHARING_SETTINGS },
          sectionOrder: (candidate.sectionOrder && candidate.sectionOrder.length) ? candidate.sectionOrder : [...DEFAULT_SECTION_ORDER],
          sectionVisibility: candidate.sectionVisibility || { ...DEFAULT_SECTION_VISIBILITY }
        };

        setCachedProfile(normalizedCandidate);
        // Silently sync to server lambda so server DB has it
        fetch('/api/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: normalizedCandidate.id,
            profileSlug: normalizedCandidate.slug,
            slug: normalizedCandidate.slug,
            updatedData: normalizedCandidate
          })
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to load cached profile from localStorage:', e);
    } finally {
      setIsChecking(false);
    }
  }, [identifier, session]);

  if (isChecking) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-white font-sans">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          <span className="text-xs text-slate-400">Loading profile...</span>
        </div>
      </main>
    );
  }

  if (cachedProfile) {
    const isOwner = Boolean(
      session?.id && (
        (cachedProfile.userId && session.id === cachedProfile.userId) ||
        (cachedProfile.email && session.email && cachedProfile.email.toLowerCase().trim() === session.email.toLowerCase().trim()) ||
        (cachedProfile.id === session.id) ||
        (cachedProfile.slug === session.id)
      )
    );

    return (
      <PublicProfileClient
        initialProfile={cachedProfile}
        session={session}
        isOwner={isOwner}
      />
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-white font-sans">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-2xl p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/10 mx-auto flex items-center justify-center text-[#475569] dark:text-[#94A3B8]">
          <UserX className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Profile Not Found
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
            The profile &quot;{identifier}&quot; does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
