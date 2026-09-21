'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProfileData } from '@/types/profile';
import { ProfileEditorProvider, useProfileEditor } from '@/context/ProfileEditorContext';
import { DesktopProfileEditor } from '@/components/profiles/DesktopProfileEditor';
import { SlidingEditorPanel } from '@/components/profiles/SlidingEditorPanel';
import { PhonePreview } from '@/components/PhonePreview';
import { AvtiveLogoIcon } from '@/components/DesktopWindowPreview';
import { 
  ArrowLeft,
  Edit3,
  ExternalLink,
  Save,
  Loader2,
  Smartphone
} from 'lucide-react';

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  return (
    <ProfileEditorProvider initialProfile={initialProfile} userProfiles={userProfiles}>
      <EditProfileClientInner />
    </ProfileEditorProvider>
  );
}

function EditProfileClientInner() {
  const router = useRouter();
  const { 
    profile, 
    setProfile, 
    updateProfilePartial,
    isSaving, 
    saveProfile, 
    toastMessage, 
    showToast, 
    activeTheme, 
    isDark, 
    currentIdentifier,
    setActiveSectionTarget,
    userProfiles
  } = useProfileEditor();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#080D1A] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-cyan-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#080D1A]/95 backdrop-blur-xl border-b border-white/10 py-2.5 px-3 sm:px-6 shadow-md">
        <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Back Button */}
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${currentIdentifier}`}
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

            <span className="h-4 w-px bg-white/15 hidden sm:inline-block" />

            <Link
              href={`/profile/${currentIdentifier}`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors shadow-2xs shrink-0"
              title="Return to Public Profile"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Public Profile</span>
            </Link>
          </div>

          {/* Center Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Figma Desktop Studio Active</span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Drawer Toggle (visible on < lg screens) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMobileDrawerOpen ? 'Close Drawer' : 'Edit Profile'}</span>
            </button>

            {/* Save Button */}
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

            {/* View Live URL */}
            <Link
              href={`/profile/${currentIdentifier}`}
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

      {/* Main Container */}
      <main className="flex-1 w-full overflow-hidden">
        
        {/* DESKTOP VIEW (>= 1024px): New Figma Desktop Profile Editor */}
        <div className="hidden lg:block w-full h-full">
          <DesktopProfileEditor />
        </div>

        {/* MOBILE & TABLET VIEW (< 1024px): Existing Mobile Profile Editor Layout */}
        <div className="lg:hidden w-full min-h-[calc(100vh-56px)] flex flex-col items-center justify-start p-4 pb-20">
          
          <div className="w-full max-w-[360px] flex items-center justify-between px-3 py-1.5 mb-3 rounded-xl bg-white/5 border border-white/10 text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Card Preview</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>

          <PhonePreview
            profile={{ ...profile, theme: activeTheme }}
            isDark={isDark}
            canEdit={true}
            onOpenEdit={() => setIsMobileDrawerOpen(true)}
            onOpenShare={() => showToast('Share settings available in editor')}
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
            onSelectSection={(secKey, fieldKey) => {
              setIsMobileDrawerOpen(true);
              setActiveSectionTarget({
                sectionKey: secKey,
                fieldKey,
                timestamp: Date.now()
              });
            }}
          />

          {/* Floating Action Button on Mobile to Open Drawer */}
          {!isMobileDrawerOpen && (
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all border border-cyan-400/30 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}

          {/* Mobile Sliding Drawer Panel (Preserving 100% of existing mobile editor behavior) */}
          <SlidingEditorPanel
            isOpen={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
            initialProfile={profile}
            userProfiles={userProfiles}
            onLiveUpdate={(updated) => {
              updateProfilePartial(updated);
            }}
            onSaveSuccess={(saved) => {
              updateProfilePartial(saved);
              showToast('✓ Profile saved successfully!');
            }}
          />
        </div>

      </main>

    </div>
  );
}
