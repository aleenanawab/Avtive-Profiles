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
import { getThemeConfig, PROFILE_THEMES } from '@/components/themeStyles';
import { ShareModal } from '@/components/ShareModal';
import { SectionsSidePanel } from '@/components/profiles/SectionsSidePanel';
import { ProfileEditorProvider } from '@/context/ProfileEditorContext';
import { 
  Share2, 
  Home, 
  Users, 
  Pencil, 
  Save,
  X,
  Loader2,
  Monitor, 
  Smartphone, 
  Sparkles, 
  ExternalLink, 
  Lock,
  LogOut,
  LayoutGrid,
  LogIn,
  Check,
  Palette,
  Layers
} from 'lucide-react';

export interface PublicProfileClientProps {
  initialProfile: ProfileData;
  session: UserSession | null;
  isOwner: boolean;
  initialIsEditing?: boolean;
  userProfiles?: ProfileData[];
}

export function PublicProfileClient({
  initialProfile,
  session,
  isOwner,
  initialIsEditing = false,
  userProfiles = []
}: PublicProfileClientProps) {
  return (
    <ProfileEditorProvider initialProfile={initialProfile} userProfiles={userProfiles}>
      <PublicProfileClientInner
        initialProfile={initialProfile}
        session={session}
        isOwner={isOwner}
        initialIsEditing={initialIsEditing}
        userProfiles={userProfiles}
      />
    </ProfileEditorProvider>
  );
}

function PublicProfileClientInner({
  initialProfile,
  session,
  isOwner,
  initialIsEditing = false,
  userProfiles = []
}: PublicProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme && initialProfile.theme !== 'default' ? initialProfile.theme : 'editorial'
  );
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'web'>('standard');
  const [isEditing, setIsEditing] = useState(Boolean(initialIsEditing && isOwner));
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [activeScreenTab, setActiveScreenTab] = useState<'both' | 'desktop' | 'mobile'>('both');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSectionsSidePanelOpen, setIsSectionsSidePanelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(session);

  const activeThemeConfig = getThemeConfig(activeTheme);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const hasDark = document.documentElement.classList.contains('dark');
    setIsDark(hasDark);
  }, []);

  // Check sessionStorage for post-creation edit mode or URL param
  useEffect(() => {
    if (typeof window !== 'undefined' && isOwner) {
      try {
        const storedEditTarget = sessionStorage.getItem('avtive_open_edit_mode');
        const targetSlug = profile.slug || profile.id || initialProfile.slug || initialProfile.id;
        if (storedEditTarget && (storedEditTarget === targetSlug || storedEditTarget === 'true' || storedEditTarget === (profile.slug || profile.id))) {
          setIsEditing(true);
          sessionStorage.removeItem('avtive_open_edit_mode');
        }
      } catch {}

      if (window.location.search.includes('edit=')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [profile.id, profile.slug, initialProfile.id, initialProfile.slug, isOwner]);

  // Hydrate updated profile from localStorage on mount & listen to real-time updates
  useEffect(() => {
    try {
      const cached =
        localStorage.getItem(`avtive_profile_${initialProfile.slug}`) ||
        localStorage.getItem(`avtive_profile_${initialProfile.id}`) ||
        localStorage.getItem('avtive_last_saved_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.id === initialProfile.id || parsed.slug === initialProfile.slug)) {
          setProfile((prev) => ({ ...prev, ...parsed }));
          if (parsed.theme) setActiveTheme(parsed.theme);
        }
      }
    } catch {}

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ProfileData>;
      if (customEvent.detail) {
        const updated = customEvent.detail;
        if (updated.id === initialProfile.id || updated.slug === initialProfile.slug) {
          setProfile((prev) => ({ ...prev, ...updated }));
          if (updated.theme) setActiveTheme(updated.theme);
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('avtive_profile_') && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (updated && (updated.id === initialProfile.id || updated.slug === initialProfile.slug)) {
            setProfile((prev) => ({ ...prev, ...updated }));
            if (updated.theme) setActiveTheme(updated.theme);
          }
        } catch {}
      }
    };

    window.addEventListener('avtive_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('avtive_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initialProfile.id, initialProfile.slug]);

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
      try {
        sessionStorage.removeItem('avtive_active_session');
      } catch {}
      setCurrentUser(null);
      window.location.replace('/login');
    }
  };

  const handleSaveEdits = async (updatedData: ProfileData) => {
    setIsSavingGlobal(true);
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
      const savedProfile = data.profile || updatedData;
      setProfile(savedProfile);
      if (savedProfile.theme) {
        setActiveTheme(savedProfile.theme);
      }
      
      // Update local storage caches
      try {
        if (savedProfile.slug) localStorage.setItem(`avtive_profile_${savedProfile.slug}`, JSON.stringify(savedProfile));
        if (savedProfile.id) localStorage.setItem(`avtive_profile_${savedProfile.id}`, JSON.stringify(savedProfile));
        localStorage.setItem('avtive_last_saved_profile', JSON.stringify(savedProfile));
        window.dispatchEvent(new CustomEvent('avtive_profile_updated', { detail: savedProfile }));
      } catch {}

      setIsEditing(false);
      showToast('✓ Profile changes saved successfully!');
    } catch (err: any) {
      console.error('Update profile error:', err);
      showToast(err.message || 'Failed to save profile changes.');
      throw err;
    } finally {
      setIsSavingGlobal(false);
    }
  };

  const handleCancelEdits = () => {
    setIsEditing(false);
    showToast('Editing cancelled');
  };

  const identifier = profile.slug || profile.id;

  return (
    <div 
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-all duration-300 font-sans overflow-x-hidden`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-cyan-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Top Status Toolbar */}
      <div className="sticky top-[53px] z-30 w-full bg-white/90 dark:bg-[#0B0D13]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors py-2 px-3 sm:px-6 shadow-2xs shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          
          {/* Left: Brand / Persona Info */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
              {profile.profileName || profile.name}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              &middot; {profile.designation || 'Verified Pass'}
            </span>
            {isEditing && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono animate-pulse">
                Editing Mode
              </span>
            )}
          </div>

          {/* Center: Live Twin-Screen Synchronization Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-950/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-semibold shadow-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Twin-Screen Platform &middot; </span>
            <span>Desktop ⇄ Mobile Live Working View</span>
          </div>

          {/* Right Toolbar Actions: In-Place Edit / Save / Cancel, Dashboard, Share & Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {isOwner && (
              isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdits}
                    disabled={isSavingGlobal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
                    title="Cancel Editing"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveEdits(profile)}
                    disabled={isSavingGlobal}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    title="Save Changes"
                  >
                    {isSavingGlobal ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingGlobal ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-2xs shrink-0 cursor-pointer"
                  title="Edit Profile on this page"
                >
                  <Pencil className="w-3.5 h-3.5 text-purple-400 dark:text-purple-600" />
                  <span>Edit Profile</span>
                </button>
              )
            )}

            {/* Sections Side Panel Button */}
            <button
              type="button"
              onClick={() => setIsSectionsSidePanelOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
              title="Open Profile Sections Panel"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              <span>Sections</span>
            </button>

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

      {/* Responsive Viewport Switcher for Small Screens (< xl) */}
      <div className="w-full flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-white/5 xl:hidden shrink-0 bg-white/90 dark:bg-[#0A101E]/90 backdrop-blur-md transition-colors z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
            A
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">Avtive Twin-Screen</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-[#050913] p-1 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveScreenTab('desktop')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreenTab === 'desktop'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreenTab('mobile')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreenTab === 'mobile'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreenTab('both')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreenTab === 'both'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-white/10 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>Both</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PERMANENT TWIN-SCREEN VIEWPORT                                             */}
      {/* Both Desktop Screen and Mobile Screen are permanently mounted & visible.   */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <main className={`flex-1 w-full p-2.5 sm:p-5 lg:p-6 flex flex-row items-start justify-center gap-4 sm:gap-6 max-w-[1920px] mx-auto min-w-0 box-border ${
        activeScreenTab === 'both' ? 'overflow-x-auto xl:overflow-x-visible' : 'overflow-x-hidden'
      }`}>
        
        {/* ======================================================================= */}
        {/* WORKING SCREEN 1: DESKTOP PUBLIC PROFILE CARD                          */}
        {/* ======================================================================= */}
        <section 
          aria-label="Desktop Working Screen"
          className={`flex-1 min-w-0 max-w-[1240px] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1528] shadow-2xl shadow-black/30 overflow-hidden ${
            activeScreenTab === 'mobile' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          {/* Desktop Frame Window Header */}
          <div className="w-full bg-slate-100 dark:bg-[#0A101E] border-b border-slate-200 dark:border-white/10 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 ml-2 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-cyan-500" />
                <span>Desktop Screen &middot; Responsive Profile</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setIsSectionsSidePanelOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white hover:bg-slate-200/80 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-slate-200 dark:border-white/10 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Open Sections Side Panel"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-500" />
                <span>Sections</span>
              </button>
              <span className={`w-1.5 h-1.5 rounded-full ${isEditing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="hidden sm:inline">{isEditing ? 'Editing Mode Active' : 'Live Public Representation'}</span>
            </div>
          </div>

          {/* Desktop Profile Card Content */}
          <div className="flex-1 w-full overflow-y-auto p-4 sm:p-6 min-w-0">
            <AvtiveDigitalCard
              profile={{ ...profile, theme: activeTheme }}
              canEdit={isOwner}
              isEditing={isEditing}
              isConnected={false}
              onOpenEdit={() => setIsEditing(true)}
              onCancelEdit={handleCancelEdits}
              onSaveEdits={handleSaveEdits}
              onThemePreview={(theme) => setActiveTheme(theme)}
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
        {/* WORKING SCREEN 2: ORIGINAL LIVE MOBILE PREVIEW (Standard 375×667 px)    */}
        {/* ======================================================================= */}
        <aside 
          aria-label="Mobile Working Screen"
          className={`w-full max-w-[375px] shrink-0 flex flex-col items-center min-w-0 ${
            activeScreenTab === 'desktop' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          {/* Top Label */}
          <div className="w-full flex items-center justify-between px-2 mb-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-cyan-500" />
              <span>Mobile Screen &middot; 375×667 px</span>
            </span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isEditing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span>{isEditing ? 'Editing View' : 'Live Card'}</span>
            </span>
          </div>

          {/* Smartphone Chassis Frame with Original Live PhonePreview */}
          <div className="w-full flex justify-center">
            <PhonePreview
              profile={{ ...profile, theme: activeTheme }}
              isDark={isDark}
              canEdit={isOwner}
              isEditing={isEditing}
              onOpenEdit={() => setIsEditing(true)}
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

      {/* Sections Side Panel (Slides over the existing profile without navigating away) */}
      <SectionsSidePanel
        isOpen={isSectionsSidePanelOpen}
        onClose={() => setIsSectionsSidePanelOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          try {
            if (updated.slug) localStorage.setItem(`avtive_profile_${updated.slug}`, JSON.stringify(updated));
            if (updated.id) localStorage.setItem(`avtive_profile_${updated.id}`, JSON.stringify(updated));
            localStorage.setItem('avtive_last_saved_profile', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('avtive_profile_updated', { detail: updated }));
          } catch {}
        }}
        onSaveProfile={async (profileToSave) => {
          await handleSaveEdits(profileToSave || profile);
        }}
        isSaving={isSavingGlobal}
        isOwner={isOwner}
      />

    </div>
  );
}
