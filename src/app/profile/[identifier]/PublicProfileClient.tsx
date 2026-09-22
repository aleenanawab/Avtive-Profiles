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
import { MobileSliderProfileView } from '@/components/profiles/MobileSliderProfileView';
import { getThemeConfig } from '@/components/themeStyles';
import { ShareModal } from '@/components/ShareModal';
import { SlidingEditorPanel } from '@/components/profiles/SlidingEditorPanel';
import { ProfileEditorProvider } from '@/context/ProfileEditorContext';
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
  LogOut,
  LayoutGrid,
  LogIn,
  SlidersHorizontal,
  Signal,
  Wifi,
  Battery
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
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'web'>('standard');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(session);

  // Mobile screen view tab: 'slider' (Split Slider Window) | 'card' (Live Pass Card)
  const [mobileTab, setMobileTab] = useState<'slider' | 'card'>('slider');

  const activeThemeConfig = getThemeConfig(activeTheme);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const hasDark = document.documentElement.classList.contains('dark');
    setIsDark(hasDark);
  }, []);

  // Fetch / verify session dynamically so logout button is always available when user is logged in
  useEffect(() => {
    if (!currentUser) {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      window.location.replace('/login');
    }
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

          {/* Right Toolbar Actions: Studio Editor, Dashboard, Share & Logout */}
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

            {currentUser && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer shrink-0"
                title="View Profiles Dashboard"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              title="Share Profile"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>Share</span>
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/30 border border-rose-500/20 transition-all cursor-pointer shadow-2xs shrink-0"
                title="Sign Out of Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-2xs shrink-0 cursor-pointer"
                title="Log In"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PERMANENT TWIN-SCREEN VIEWPORT                                             */}
      {/* Both Desktop Screen and Mobile Screen are permanently mounted & visible.   */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full p-3 sm:p-5 lg:p-6 flex flex-row items-start justify-center gap-4 sm:gap-6 min-w-[1100px] xl:min-w-0 max-w-[1920px] mx-auto">
        
        {/* ======================================================================= */}
        {/* WORKING SCREEN 1: DESKTOP PUBLIC PROFILE CARD                          */}
        {/* ======================================================================= */}
        <section 
          aria-label="Desktop Working Screen"
          className="flex-1 min-w-[560px] max-w-[1240px] flex flex-col rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1528] shadow-2xl shadow-black/30 overflow-hidden"
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
        {/* WORKING SCREEN 2: MOBILE SMARTPHONE PASS (Exact 375×667 Dimensions)     */}
        {/* ======================================================================= */}
        <aside 
          aria-label="Mobile Working Screen"
          className="w-[375px] min-w-[375px] max-w-[375px] shrink-0 flex flex-col items-center"
        >
          {/* Top Label & View Tabs: Slider Window (with 3-line icon) vs Live Card */}
          <div className="w-full flex items-center justify-between px-1 mb-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-cyan-500" />
              <span>375×667 px</span>
            </span>

            {/* Toggle between Slider Window & Live Card */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => setMobileTab('slider')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mobileTab === 'slider'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Slider Window with three-lines split handle"
              >
                {/* 3 Horizontal Lines Icon */}
                <div className="flex flex-col gap-0.5 justify-center">
                  <div className="w-2.5 h-[1.5px] bg-current rounded-full" />
                  <div className="w-2.5 h-[1.5px] bg-current rounded-full" />
                  <div className="w-2.5 h-[1.5px] bg-current rounded-full" />
                </div>
                <span>Slider Window</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('card')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mobileTab === 'card'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Live Pass Digital Card"
              >
                <span>Live Card</span>
              </button>
            </div>
          </div>

          {/* Smartphone Chassis Frame (Standard 375px x 667px) */}
          <div className="w-[375px] min-w-[375px] max-w-[375px] h-[667px] min-h-[667px] max-h-[667px] rounded-[40px] border-[6px] border-slate-800 bg-[#090E1B] shadow-2xl shadow-black/80 flex flex-col overflow-hidden relative ring-1 ring-white/10">
            
            {/* Phone Status Bar (9:41, Wifi, Battery) */}
            <div className="w-full bg-[#090E1B] pt-2 px-4 pb-1 flex items-center justify-between text-[11px] font-mono font-semibold text-slate-300 shrink-0 border-b border-white/5 select-none">
              <span>9:41</span>
              <div className="w-20 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-slate-900 border border-white/20" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mobile Viewport Content (375x667) */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center bg-[#050811]">
              {mobileTab === 'slider' ? (
                <div className="w-full flex-1 flex flex-col overflow-x-hidden">
                  <MobileSliderProfileView />
                </div>
              ) : (
                <div className="w-full flex-1 overflow-y-auto overflow-x-hidden">
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
              )}
            </div>

            {/* Phone Bottom Home Bar */}
            <div className="w-full py-1.5 bg-[#090E1B] flex items-center justify-center shrink-0 border-t border-white/5">
              <div className="w-28 h-1 rounded-full bg-white/30" />
            </div>

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
