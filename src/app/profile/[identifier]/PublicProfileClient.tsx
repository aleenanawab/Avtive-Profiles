'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ProfileData, 
  ProfileTheme, 
  UserSession 
} from '@/types/profile';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { PhonePreview } from '@/components/PhonePreview';
import { getThemeConfig } from '@/components/themeStyles';
import { ShareModal } from '@/components/ShareModal';
import { SlidingEditorPanel } from '@/components/profiles/SlidingEditorPanel';
import { ProfileEditorProvider } from '@/context/ProfileEditorContext';
import { usePortfolioTheme } from '@/context/ThemeContext';
import { 
  Share2, 
  Home, 
  Users, 
  Edit3, 
  Monitor, 
  Smartphone,
  Sparkles,
  ExternalLink,
  Lock,
  Sun,
  Moon
} from 'lucide-react';

interface PublicProfileClientProps {
  initialProfile: ProfileData;
  session: UserSession | null;
  isOwner: boolean;
}

export function PublicProfileClient({
  initialProfile,
  session,
  isOwner
}: PublicProfileClientProps) {
  return (
    <ProfileEditorProvider initialProfile={initialProfile}>
      <PublicProfileClientInner
        initialProfile={initialProfile}
        session={session}
        isOwner={isOwner}
      />
    </ProfileEditorProvider>
  );
}

function PublicProfileClientInner({
  initialProfile,
  session,
  isOwner
}: PublicProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme && initialProfile.theme !== 'default' ? initialProfile.theme : 'editorial'
  );
  const { isDark, toggleDarkMode } = usePortfolioTheme();
  const [viewMode, setViewMode] = useState<'standard' | 'web'>('standard');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeThemeConfig = getThemeConfig(activeTheme);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveEdits = async (updatedData: ProfileData) => {
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          updatedData
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes.');
      }
      setProfile(data.profile || updatedData);
      setIsEditing(false);
      showToast('Profile saved successfully!');
    } catch (err: any) {
      console.error('Update profile error:', err);
      showToast(err.message || 'Failed to save profile changes.');
      throw err;
    }
  };

  const identifier = profile.slug || profile.id;

  return (
    <div 
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-all duration-300 font-sans overflow-x-auto`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Sticky Top Status Toolbar */}
      <div className="sticky top-[53px] z-30 w-full bg-white/90 dark:bg-[#0B0D13]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors py-2 px-3 sm:px-6 shadow-2xs shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Brand / Persona Info */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
              {profile.profileName || profile.name}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              &middot; {profile.designation || 'Verified Pass'}
            </span>
          </div>

          {/* Center: Live Twin-Screen Synchronization Indicator */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-950/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Twin-Screen Platform &middot; </span>
            <span>Desktop ⇄ Mobile Simultaneous Working View</span>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {isOwner && (
              <Link
                href={`/profile/${identifier}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-2xs shrink-0 cursor-pointer"
                title="Open Studio Editor"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Studio Editor</span>
              </Link>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-700" />
              )}
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              title="Share Profile"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>Share</span>
            </button>
          </div>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PERMANENT TWIN-SCREEN VIEWPORT                                             */}
      {/* Both Desktop Screen and Mobile Screen are permanently mounted & visible.   */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <main 
        className="flex-1 w-full p-3 sm:p-4 lg:p-5 flex flex-row items-center justify-center gap-4 sm:gap-6 min-w-[1100px] xl:min-w-0 max-w-[1920px] mx-auto min-h-0 overflow-hidden"
        style={{ height: 'calc(100vh - 56px)', maxHeight: 'calc(100vh - 56px)' }}
      >
        
        {/* ======================================================================= */}
        {/* WORKING SCREEN 1: DESKTOP PUBLIC PROFILE CARD                          */}
        {/* ======================================================================= */}
        <section 
          aria-label="Desktop Working Screen"
          className="flex-1 min-w-[560px] max-w-[1240px] h-full flex flex-col rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1528] shadow-2xl shadow-black/30 overflow-hidden min-h-0"
        >
          {/* Desktop Frame Window Header */}
          <div className="w-full bg-slate-100 dark:bg-[#0A101E] border-b border-slate-200 dark:border-white/10 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 ml-2 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-cyan-500" />
                <span>Desktop Screen &middot; Responsive Portfolio</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Public Representation</span>
            </div>
          </div>

          {/* Desktop Profile Card Content */}
          <div className="flex-1 w-full overflow-y-auto p-4 sm:p-6">
            <AvtiveDigitalCard
              profile={{ ...profile, theme: activeTheme }}
              canEdit={isOwner}
              isEditing={isEditing}
              isConnected={false}
              onOpenEdit={() => router.push(`/profile/${identifier}/edit`)}
              onCancelEdit={() => setIsEditing(false)}
              onSaveEdits={handleSaveEdits}
              onSaveContact={() => showToast('Contact information saved!')}
              onOpenShare={() => setIsShareModalOpen(true)}
              onOpenConnect={() => showToast('Connected!')}
              onOpenQRModal={() => {}}
              onOpenResumeModal={() => {}}
              onSelectProject={() => {}}
              onSelectTeamMember={(member) => {
                const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                router.push(`/profile/${slug}`);
              }}
              onViewCompany={() => {
                if (profile.companyId) {
                  router.push(`/profile/${profile.companyId}`);
                }
              }}
              isDark={isDark}
              viewMode="standard"
            />
          </div>
        </section>

        {/* ======================================================================= */}
        {/* WORKING SCREEN 2: MOBILE SMARTPHONE PASS                               */}
        {/* ======================================================================= */}
        <aside 
          aria-label="Mobile Working Screen"
          className="w-auto shrink-0 h-full flex flex-col items-center justify-center min-h-0"
        >
          {/* Top Label */}
          <div className="w-full flex items-center justify-between px-2 mb-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 max-w-[375px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-cyan-500" />
              <span>Mobile Screen &middot; Interactive Pass</span>
            </span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Card</span>
            </span>
          </div>

          {/* Smartphone Chassis Frame */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <PhonePreview
              profile={{ ...profile, theme: activeTheme }}
              isDark={isDark}
              canEdit={isOwner}
              onOpenEdit={() => router.push(`/profile/${identifier}/edit`)}
              onOpenShare={() => setIsShareModalOpen(true)}
              onOpenConnect={() => showToast('Connected!')}
              onSaveContact={() => showToast('Contact information saved!')}
              onSaveEdits={handleSaveEdits}
              onSelectTeamMember={(member) => {
                const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                router.push(`/profile/${slug}`);
              }}
              onViewCompany={() => {
                if (profile.companyId) {
                  router.push(`/profile/${profile.companyId}`);
                }
              }}
              hideHeaderLabel={true}
            />
          </div>
        </aside>

      </main>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          profile={profile}
        />
      )}

    </div>
  );
}
