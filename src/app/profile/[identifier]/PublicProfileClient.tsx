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
import { getThemeConfig } from '@/components/themeStyles';
import { ShareModal } from '@/components/ShareModal';
import { 
  Share2, 
  Home, 
  Users, 
  Edit3 
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
  const [isEditing, setIsEditing] = useState(false);
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
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-colors duration-200 font-sans`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}



      {/* Main Profile Content Viewport - Responsive Desktop Width (NOT a phone mockup) */}
      <main className={`flex-1 w-full mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 flex justify-center transition-all duration-300 ${
        viewMode === 'web' ? 'max-w-6xl xl:max-w-7xl' : 'max-w-4xl lg:max-w-5xl'
      }`}>
        <div className="w-full bg-white dark:bg-[#18181B] sm:rounded-3xl sm:border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          <AvtiveDigitalCard
            profile={{ ...profile, theme: activeTheme }}
            canEdit={isOwner}
            isEditing={isEditing}
            isConnected={false}
            onOpenEdit={() => router.push(`/profile/${profile.userId || profile.slug}/edit`)}
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
              onClick={() => setIsEditing(!isEditing)}
              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Edit3 className="w-5 h-5" />
              <span className="text-[10px] font-medium">{isEditing ? 'Done' : 'Edit'}</span>
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
