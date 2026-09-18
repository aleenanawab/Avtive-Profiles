'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ProfileData, 
  ProfileTheme 
} from '@/types/profile';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { PhonePreview } from '@/components/PhonePreview';
import { getThemeConfig } from '@/components/themeStyles';
import { SlidingEditorPanel } from '@/components/profiles/SlidingEditorPanel';
import { 
  ArrowLeft,
  Edit3,
  Monitor,
  Smartphone,
  ExternalLink,
  Sparkles,
  Share2,
  CheckCircle2
} from 'lucide-react';

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme === 'default' ? 'editorial' : (initialProfile.theme || 'editorial')
  );
  const [isDark, setIsDark] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(true); // Open by default for Linktree sliding editing experience
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSectionTarget, setActiveSectionTarget] = useState<{
    sectionKey: string;
    fieldKey?: string;
    timestamp: number;
  } | null>(null);

  const activeThemeConfig = getThemeConfig(activeTheme);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectSection = (sectionKey: string, fieldKey?: string) => {
    setIsEditorOpen(true);
    setActiveSectionTarget({
      sectionKey,
      fieldKey,
      timestamp: Date.now()
    });
  };

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const identifier = profile.slug || profile.id || initialProfile.slug || initialProfile.id;

  return (
    <div 
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-all duration-300 font-sans ${isEditorOpen ? 'md:pl-[460px] lg:pl-[500px] xl:pl-[540px]' : ''}`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Studio Bar */}
      <header className="sticky top-[53px] z-30 w-full bg-white/85 dark:bg-[#0B0D13]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors py-2 px-2.5 sm:px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Back Link & Device View Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/profile/${identifier}`}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs shrink-0"
              title="Return to Public Profile"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Profile</span>
            </Link>

            {/* Device View Switcher */}
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
                <span className="hidden sm:inline">Desktop</span>
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
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Right: Studio Status & Toggle Button */}
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
              title={isEditorOpen ? 'Collapse Editor Panel' : 'Open Sliding Editor'}
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span>{isEditorOpen ? 'Editor Open' : 'Edit Profile'}</span>
            </button>

            <Link
              href={`/profile/${identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs shrink-0"
              title="Open public profile in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">View Live</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Live Preview Canvas */}
      {deviceView === 'mobile' ? (
        <main className="flex-1 w-full mx-auto px-4 py-6 sm:py-8 flex justify-center items-start transition-all duration-300">
          {/* Smartphone Chassis on Tablet/Desktop */}
          <div className="hidden sm:block">
            <PhonePreview
              profile={{ ...profile, theme: activeTheme }}
              isDark={isDark}
              canEdit={true}
              onOpenEdit={() => setIsEditorOpen(true)}
              onOpenShare={() => showToast('Share settings accessible in editor panel')}
              onOpenConnect={() => showToast('Connected!')}
              onSaveContact={() => showToast('Contact information saved!')}
              onSaveEdits={async (updated) => {
                setProfile(updated);
                showToast('Changes updated!');
              }}
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
              onSelectSection={handleSelectSection}
            />
          </div>

          {/* Full-Width Mobile View on Small Screens (< sm) */}
          <div className="sm:hidden w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <AvtiveDigitalCard
              profile={{ ...profile, theme: activeTheme }}
              canEdit={true}
              isEditing={false}
              isConnected={false}
              onOpenEdit={() => setIsEditorOpen(true)}
              onCancelEdit={() => {}}
              onSaveEdits={async (updated) => {
                setProfile(updated);
                showToast('Changes updated!');
              }}
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
              onViewCompany={() => {
                if (profile.companyId) {
                  router.push(`/profile/${profile.companyId}`);
                }
              }}
              isDark={isDark}
              viewMode="standard"
              onSelectSection={handleSelectSection}
            />
          </div>
        </main>
      ) : (
        /* Full Desktop Profile Card Viewport */
        <main className="flex-1 w-full mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 flex justify-center transition-all duration-300 max-w-4xl lg:max-w-5xl">
          <div className="w-full bg-white dark:bg-[#18181B] sm:rounded-3xl sm:border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <AvtiveDigitalCard
              profile={{ ...profile, theme: activeTheme }}
              canEdit={true}
              isEditing={false}
              isConnected={false}
              onOpenEdit={() => setIsEditorOpen(true)}
              onCancelEdit={() => {}}
              onSaveEdits={async (updated) => {
                setProfile(updated);
                showToast('Changes updated!');
              }}
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
              onViewCompany={() => {
                if (profile.companyId) {
                  router.push(`/profile/${profile.companyId}`);
                }
              }}
              isDark={isDark}
              viewMode="standard"
              onSelectSection={handleSelectSection}
            />
          </div>
        </main>
      )}

      {/* Floating Action Pill to Reopen Editor when Collapsed */}
      {!isEditorOpen && (
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

      {/* Linktree-inspired Sliding Editing Panel */}
      <SlidingEditorPanel
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialProfile={profile}
        userProfiles={userProfiles}
        activeSectionTarget={activeSectionTarget}
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
          showToast('✓ Profile saved successfully!');
        }}
      />
    </div>
  );
}
