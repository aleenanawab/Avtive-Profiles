'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ProfileData, 
  ProfileTheme 
} from '@/types/profile';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { PhonePreview } from '@/components/PhonePreview';
import { DesktopWindowPreview, AvtiveLogoIcon } from '@/components/DesktopWindowPreview';
import { SlidingEditorPanel } from '@/components/profiles/SlidingEditorPanel';
import { getThemeConfig } from '@/components/themeStyles';
import { 
  ArrowLeft,
  Edit3,
  Monitor,
  Smartphone,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Save,
  Loader2,
  Columns,
  Layers,
  Eye,
  SlidersHorizontal,
  Share2
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
  
  // Responsive mode: on large screens both are displayed side-by-side simultaneously.
  // On smaller viewports (< lg), the user can toggle between Dual (stacked), Desktop window, or Mobile phone.
  const [responsiveMode, setResponsiveMode] = useState<'dual' | 'desktop' | 'mobile'>('dual');
  
  // Optional slide-in drawer for advanced fine-tuning
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Active section target to coordinate two-way focus between Mobile Preview and Desktop Window
  const [activeSectionTarget, setActiveSectionTarget] = useState<{
    sectionKey: string;
    fieldKey?: string;
    timestamp: number;
  } | null>(null);

  const phoneContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Two-way interaction: Clicking an element on the mobile preview focuses the desktop window section
  const handleSelectSection = (sectionKey: string, fieldKey?: string) => {
    setActiveSectionTarget({
      sectionKey,
      fieldKey,
      timestamp: Date.now()
    });
    showToast(`Focused section: ${sectionKey}`);
  };

  // Interaction from desktop window "Preview your card" button to highlight mobile preview
  const handleViewCard = () => {
    if (phoneContainerRef.current) {
      phoneContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Mobile card preview in view');
    }
  };

  // Global save handler saving to backend API & localStorage
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profiles/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id || initialProfile.id,
          profileSlug: profile.slug || initialProfile.slug,
          slug: profile.slug || initialProfile.slug,
          userId: profile.userId || initialProfile.userId,
          updatedData: profile
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to save changes.');
        setIsSaving(false);
        return;
      }

      const savedSlug = data.updatedProfile?.slug || data.profile?.slug || profile.slug || initialProfile.slug || initialProfile.id;
      const finalProfile: ProfileData = data.updatedProfile || data.profile || { ...profile, slug: savedSlug };
      setProfile(finalProfile);

      // Cache locally
      try {
        localStorage.setItem(`avtive_profile_${savedSlug}`, JSON.stringify(finalProfile));
        if (initialProfile.slug) {
          localStorage.setItem(`avtive_profile_${initialProfile.slug}`, JSON.stringify(finalProfile));
        }
        localStorage.setItem('avtive_last_saved_profile', JSON.stringify(finalProfile));
      } catch (e) {
        console.error('Failed to cache profile in localStorage:', e);
      }

      showToast('✓ Profile saved successfully! Dual screens synchronized.');
    } catch (err: any) {
      console.error('Save profile error:', err);
      showToast('Network error while saving changes.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const identifier = profile.slug || profile.id || initialProfile.slug || initialProfile.id;
  const currentBrowserUrl = `https://avtive-profiles-d297.vercel.app/profile/${identifier}/edit`;

  return (
    <div 
      className="min-h-screen w-full flex flex-col bg-[#080D1A] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.12), transparent 70%), radial-gradient(ellipse 60% 40% at 100% 40%, rgba(99, 102, 241, 0.08), transparent 60%)'
      }}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-cyan-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Studio Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#080D1A]/90 backdrop-blur-xl border-b border-white/10 transition-colors py-2.5 px-3 sm:px-6 shadow-md">
        <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Avtive Branding & Return to Public Profile */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              href={`/profile/${identifier}`}
              className="flex items-center gap-2 group shrink-0"
              title="Return to Public Profile"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <AvtiveLogoIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white tracking-tight">avtive</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/20 hidden sm:inline-block">
                    PRO STUDIO
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline-block">Your Profile. Your Story.</span>
              </div>
            </Link>

            <span className="h-4 w-px bg-white/15 hidden md:inline-block" />

            <Link
              href={`/profile/${identifier}`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors shadow-2xs shrink-0"
              title="Return to Public Profile"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Public Profile</span>
            </Link>
          </div>

          {/* Center: Live Dual-Screen Indicator & Small Viewport Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Indicator Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Simultaneous Dual-Screen Workspace</span>
            </div>

            {/* View Mode Switcher (Useful for small/medium viewports < lg) */}
            <div className="flex lg:hidden items-center p-0.5 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setResponsiveMode('dual')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  responsiveMode === 'dual'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View Both Previews"
              >
                <Columns className="w-3 h-3" />
                <span className="hidden sm:inline">Dual</span>
              </button>

              <button
                type="button"
                onClick={() => setResponsiveMode('desktop')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  responsiveMode === 'desktop'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop Window Only"
              >
                <Monitor className="w-3 h-3" />
                <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setResponsiveMode('mobile')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  responsiveMode === 'mobile'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile Phone Only"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Right: Actions (Save, Sliding Drawer, View Live) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Optional Slide-in Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shadow-2xs"
              title={isEditorOpen ? 'Close Advanced Drawer' : 'Open Sliding Editor'}
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden md:inline">{isEditorOpen ? 'Close Drawer' : 'Quick Drawer'}</span>
            </button>

            {/* Save Changes Button */}
            <button
              type="button"
              onClick={handleSaveProfile}
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

            {/* View Live Link in New Tab */}
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

      {/* Main Dual-Screen Interactive Workspace */}
      <main className="flex-1 w-full max-w-[1780px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 transition-all duration-300">
        
        {/* Large Screens (lg & xl): Simultaneous Side-By-Side Layout */}
        <div className="hidden lg:flex items-start justify-center gap-6 xl:gap-8 w-full">
          
          {/* SCREEN 1: Desktop Browser/Window Preview (Primary Canvas) */}
          <div className="flex-1 min-w-0 max-w-[960px] xl:max-w-[1060px] 2xl:max-w-[1140px] transition-all">
            <DesktopWindowPreview
              profile={profile}
              url={currentBrowserUrl}
              onUpdateProfile={(updated) => {
                setProfile(updated);
                if (updated.theme && updated.theme !== activeTheme) {
                  setActiveTheme(updated.theme);
                }
              }}
              onSave={handleSaveProfile}
              onViewCard={handleViewCard}
              onSelectSection={handleSelectSection}
              activeSectionTarget={activeSectionTarget}
              isSaving={isSaving}
            />
          </div>

          {/* SCREEN 2: Mobile Profile Preview (Figma Phone Preview alongside) */}
          <aside 
            ref={phoneContainerRef}
            className="sticky top-20 shrink-0 w-[360px] xl:w-[380px] flex flex-col items-center select-none pt-1"
          >
            {/* Header pill above mobile phone */}
            <div className="w-full max-w-[340px] flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-medium text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Live Phone Preview</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Synced
              </span>
            </div>

            {/* Smartphone chassis hosting AvtiveDigitalCard */}
            <PhonePreview
              profile={{ ...profile, theme: activeTheme }}
              isDark={isDark}
              canEdit={true}
              onOpenEdit={() => setIsEditorOpen(true)}
              onOpenShare={() => showToast('Share settings accessible in desktop window')}
              onOpenConnect={() => showToast('Connected!')}
              onSaveContact={() => showToast('Contact information saved!')}
              onSaveEdits={async (updated) => {
                setProfile(updated);
                showToast('Card updated!');
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

            <p className="text-[10px] text-slate-500 text-center mt-2.5">
              Click any element on the phone to focus & edit it in the desktop window.
            </p>
          </aside>

        </div>

        {/* Smaller Screens (< lg): Responsive Adaptations without Horizontal Overflow */}
        <div className="lg:hidden w-full flex flex-col items-center gap-6">
          
          {/* Dual Stacked View */}
          {responsiveMode === 'dual' && (
            <>
              <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between px-2 py-1 mb-2 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop Window</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Screen 1 of 2</span>
                </div>
                <DesktopWindowPreview
                  profile={profile}
                  url={currentBrowserUrl}
                  onUpdateProfile={(updated) => {
                    setProfile(updated);
                    if (updated.theme && updated.theme !== activeTheme) {
                      setActiveTheme(updated.theme);
                    }
                  }}
                  onSave={handleSaveProfile}
                  onViewCard={handleViewCard}
                  onSelectSection={handleSelectSection}
                  activeSectionTarget={activeSectionTarget}
                  isSaving={isSaving}
                />
              </div>

              <div ref={phoneContainerRef} className="w-full max-w-sm flex flex-col items-center pt-4 border-t border-white/10">
                <div className="flex items-center justify-between w-full max-w-[340px] px-2 py-1 mb-2 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile Phone Preview</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Screen 2 of 2</span>
                </div>
                <PhonePreview
                  profile={{ ...profile, theme: activeTheme }}
                  isDark={isDark}
                  canEdit={true}
                  onOpenEdit={() => setIsEditorOpen(true)}
                  onOpenShare={() => showToast('Share settings accessible in desktop window')}
                  onOpenConnect={() => showToast('Connected!')}
                  onSaveContact={() => showToast('Contact information saved!')}
                  onSaveEdits={async (updated) => {
                    setProfile(updated);
                    showToast('Card updated!');
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
            </>
          )}

          {/* Desktop Window Only */}
          {responsiveMode === 'desktop' && (
            <div className="w-full max-w-2xl">
              <DesktopWindowPreview
                profile={profile}
                url={currentBrowserUrl}
                onUpdateProfile={(updated) => {
                  setProfile(updated);
                  if (updated.theme && updated.theme !== activeTheme) {
                    setActiveTheme(updated.theme);
                  }
                }}
                onSave={handleSaveProfile}
                onViewCard={handleViewCard}
                onSelectSection={handleSelectSection}
                activeSectionTarget={activeSectionTarget}
                isSaving={isSaving}
              />
            </div>
          )}

          {/* Mobile Phone Only */}
          {responsiveMode === 'mobile' && (
            <div ref={phoneContainerRef} className="w-full max-w-sm flex flex-col items-center">
              <PhonePreview
                profile={{ ...profile, theme: activeTheme }}
                isDark={isDark}
                canEdit={true}
                onOpenEdit={() => setIsEditorOpen(true)}
                onOpenShare={() => showToast('Share settings accessible in desktop window')}
                onOpenConnect={() => showToast('Connected!')}
                onSaveContact={() => showToast('Contact information saved!')}
                onSaveEdits={async (updated) => {
                  setProfile(updated);
                  showToast('Card updated!');
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
          )}

        </div>

      </main>

      {/* Sliding Drawer for fine-tuning when user clicks "Quick Drawer" */}
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
