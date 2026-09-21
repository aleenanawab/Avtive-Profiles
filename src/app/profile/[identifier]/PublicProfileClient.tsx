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
import { 
  Share2, 
  Home, 
  Users, 
  Edit3,
  Monitor,
  Smartphone
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
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme && initialProfile.theme !== 'default' ? initialProfile.theme : 'editorial'
  );
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'web'>('standard');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeThemeConfig = getThemeConfig(activeTheme);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const hasDark = document.documentElement.classList.contains('dark');
    setIsDark(hasDark);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'mobile') {
        setDeviceView('mobile');
      }
    }
  }, []);


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
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-all duration-300 font-sans ${isEditorOpen ? 'lg:pl-[540px] xl:pl-[580px]' : ''}`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Sticky View Mode Toolbar: Switch between Desktop View & Mobile View */}
      <div className="sticky top-[53px] z-30 w-full bg-white/85 dark:bg-[#0B0D13]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors py-2 px-2.5 sm:px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Device View Switcher */}
          <div className="inline-flex items-center p-0.5 sm:p-1 rounded-2xl bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/80 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                deviceView === 'desktop'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Desktop View</span>
              <span className="sm:hidden">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                deviceView === 'mobile'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Mobile View</span>
              <span className="sm:hidden">Mobile</span>
            </button>
          </div>

          {/* Right: Quick Action Buttons & Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {deviceView === 'mobile' && (
              <span className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Mobile View
              </span>
            )}

            {isOwner && (
              <Link
                href={`/profile/${identifier}/edit`}
                className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xs transition-all shrink-0"
                title="Open Profile Editing Studio"
              >
                <Edit3 className="w-3.5 h-3.5 shrink-0" />
                <span>Edit Profile</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              title="Share Profile"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

        </div>
      </div>

      {deviceView === 'mobile' ? (
        <main className="flex-1 w-full mx-auto px-4 py-6 sm:py-8 flex justify-center items-start transition-all duration-300">
          {/* On Desktop & Tablet: Realistic Smartphone Chassis */}
          <div className="hidden sm:block">
            <PhonePreview
              profile={{ ...profile, theme: activeTheme }}
              isDark={isDark}
              canEdit={isOwner}
              onOpenEdit={() => setIsEditorOpen(true)}
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

          {/* On Physical Small Mobile Viewports (< sm): Full-Width Responsive Mobile View */}
          <div className="sm:hidden w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <AvtiveDigitalCard
              profile={{ ...profile, theme: activeTheme }}
              canEdit={isOwner}
              isEditing={isEditing}
              isConnected={false}
              onOpenEdit={() => setIsEditorOpen(true)}
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
        </main>
      ) : (
        /* Main Profile Content Viewport - Responsive Desktop Width */
        <main className={`flex-1 w-full mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 flex justify-center transition-all duration-300 ${
          viewMode === 'web' ? 'max-w-6xl xl:max-w-7xl' : 'max-w-4xl lg:max-w-5xl'
        }`}>
          <div className="w-full bg-white dark:bg-[#18181B] sm:rounded-3xl sm:border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <AvtiveDigitalCard
              profile={{ ...profile, theme: activeTheme }}
              canEdit={isOwner}
              isEditing={isEditing}
              isConnected={false}
              onOpenEdit={() => setIsEditorOpen(true)}
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
              viewMode={viewMode}
            />
          </div>
        </main>
      )}

      {/* Floating Action Pill to Reopen Editor when Collapsed */}
      {isOwner && !isEditorOpen && (
        <button
          type="button"
          onClick={() => setIsEditorOpen(true)}
          className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 backdrop-blur-md shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-bold border border-white/20 dark:border-slate-300/40 cursor-pointer group"
          title="Open sliding profile editor"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse group-hover:scale-125 transition-transform" />
          <Edit3 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>Edit Profile</span>
        </button>
      )}

      {/* Linktree-inspired Sliding Editor Panel */}
      <SlidingEditorPanel
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialProfile={profile}
        onLiveUpdate={(updated) => {
          setProfile(updated);
          if (updated.theme && updated.theme !== activeTheme) {
            setActiveTheme(updated.theme);
          }
        }}
        onSaveSuccess={(saved) => {
          setProfile(saved);
          if (saved.theme) {
            setActiveTheme(saved.theme);
          }
          showToast('Profile saved successfully!');
        }}
      />

      {/* Mobile Bottom Navigation Bar - STRICTLY HIDDEN ON TABLET & DESKTOP (sm:hidden) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 transition-colors shadow-lg">
        <div className="max-w-md mx-auto px-6 py-2 flex items-center justify-between">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profiles</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Share</span>
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
                isEditorOpen ? 'text-emerald-500 font-bold' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Edit3 className="w-5 h-5" />
              <span className="text-[10px] font-medium">{isEditorOpen ? 'Close' : 'Edit'}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Granular 4-Step Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        onCopySuccess={() => showToast('Profile link copied to clipboard!')}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          showToast('Sharing & privacy settings saved!');
        }}
      />
    </div>
  );
}
