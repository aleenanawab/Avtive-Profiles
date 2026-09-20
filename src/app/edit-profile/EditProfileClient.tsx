'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit3,
  ExternalLink,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { ProfileData } from '@/types/profile';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { PhonePreview } from '@/components/PhonePreview';
import { SlidingEditorPanel } from '@/components/profiles/SlidingEditorPanel';
import { getThemeConfig } from '@/components/themeStyles';
import {
  ProfileEditorProvider,
  useProfileEditor,
} from '@/context/ProfileEditorContext';

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

function EditProfileInner({ initialProfile, userProfiles }: EditProfileClientProps) {
  const router = useRouter();

  const {
    profile,
    liveProfile,
    activeTheme,
  } = useProfileEditor();

  const [isDark, setIsDark] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeThemeConfig = getThemeConfig(activeTheme);
  const identifier = profile.slug || profile.id || initialProfile.slug || initialProfile.id;

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

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
    <div
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans ${isEditorOpen ? 'lg:pl-[580px] xl:pl-[620px]' : 'lg:pl-0'}`}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Studio Bar */}
      <header className="sticky top-[53px] z-30 w-full bg-white/85 dark:bg-[#0B0D13]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors py-2 px-2.5 sm:px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/profile/${identifier}`}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Profile</span>
            </Link>
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700">
              {(['desktop', 'mobile'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDeviceView(v)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deviceView === v
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {v === 'desktop' ? <Monitor className="w-3.5 h-3.5 shrink-0" /> : <Smartphone className="w-3.5 h-3.5 shrink-0" />}
                  <span className="hidden sm:inline capitalize">{v}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Interactive Canvas
            </span>
            <button
              type="button"
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs cursor-pointer shrink-0 ${
                isEditorOpen
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                  : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span>{isEditorOpen ? 'Editor Open' : 'Edit Profile'}</span>
            </button>
            <Link
              href={`/profile/${identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">View Live</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Studio Live Preview Canvas */}
      <main className="w-full flex-1 flex items-start justify-center py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
        {deviceView === 'mobile' ? (
          <div className="w-full flex justify-center items-start">
            <div className="hidden sm:block">
              <PhonePreview
                profile={liveProfile}
                isDark={isDark}
                canEdit={true}
                onOpenEdit={() => setIsEditorOpen(true)}
                onOpenShare={() => showToast('Share settings accessible in editor panel')}
                onOpenConnect={() => showToast('Connected!')}
                onSaveContact={() => showToast('Contact information saved!')}
                onSaveEdits={async () => { showToast('Changes updated!'); }}
                onSelectTeamMember={(member) => {
                  const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                  router.push(`/profile/${slug}`);
                }}
                onViewCompany={() => { if (liveProfile.companyId) router.push(`/profile/${liveProfile.companyId}`); }}
                hideHeaderLabel={true}
              />
            </div>
            <div className="sm:hidden w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
              <AvtiveDigitalCard
                profile={liveProfile}
                canEdit={true}
                isEditing={false}
                isConnected={false}
                onOpenEdit={() => setIsEditorOpen(true)}
                onCancelEdit={() => {}}
                onSaveEdits={async () => { showToast('Changes updated!'); }}
                onSaveContact={() => showToast('Contact information saved!')}
                onOpenShare={() => showToast('Share settings accessible in editor panel')}
                onOpenConnect={() => showToast('Connected!')}
                onOpenQRModal={() => {}}
                onOpenResumeModal={() => {}}
                onSelectProject={() => {}}
                onSelectTeamMember={(member) => {
                  const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                  router.push(`/profile/${slug}`);
                }}
                onViewCompany={() => { if (liveProfile.companyId) router.push(`/profile/${liveProfile.companyId}`); }}
                isDark={isDark}
                viewMode="standard"
              />
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center max-w-4xl lg:max-w-5xl">
            <div className="w-full bg-white dark:bg-[#18181B] sm:rounded-3xl sm:border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
              <AvtiveDigitalCard
                profile={liveProfile}
                canEdit={true}
                isEditing={false}
                isConnected={false}
                onOpenEdit={() => setIsEditorOpen(true)}
                onCancelEdit={() => {}}
                onSaveEdits={async () => { showToast('Changes updated!'); }}
                onSaveContact={() => showToast('Contact information saved!')}
                onOpenShare={() => showToast('Share settings accessible in editor panel')}
                onOpenConnect={() => showToast('Connected!')}
                onOpenQRModal={() => {}}
                onOpenResumeModal={() => {}}
                onSelectProject={() => {}}
                onSelectTeamMember={(member) => {
                  const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                  router.push(`/profile/${slug}`);
                }}
                onViewCompany={() => { if (liveProfile.companyId) router.push(`/profile/${liveProfile.companyId}`); }}
                isDark={isDark}
                viewMode="standard"
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating edit pill */}
      {!isEditorOpen && (
        <button
          type="button"
          onClick={() => setIsEditorOpen(true)}
          className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 backdrop-blur-md shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-bold border border-white/20 dark:border-slate-300/40 cursor-pointer group"
          title="Open profile editor"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse group-hover:scale-125 transition-transform" />
          <Edit3 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>Edit Profile</span>
        </button>
      )}

      {/* Sliding Editor Panel — shares state via context */}
      <SlidingEditorPanel
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialProfile={initialProfile}
        userProfiles={userProfiles}
      />
    </div>
  );
}

// ─── Outer component — provides shared context ────────────────────────────────
export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  return (
    <ProfileEditorProvider initialProfile={initialProfile} userProfiles={userProfiles}>
      <EditProfileInner initialProfile={initialProfile} userProfiles={userProfiles} />
    </ProfileEditorProvider>
  );
}
