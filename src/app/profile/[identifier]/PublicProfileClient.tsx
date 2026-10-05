'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ProfileData, 
  ProfileTheme, 
  UserSession,
  ProjectItem,
  ProfileType 
} from '@/types/profile';
import { HeaderNav } from '@/components/HeaderNav';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { getThemeConfig } from '@/components/themeStyles';
import { ShareModal } from '@/components/ShareModal';
import { ExchangeContactModal } from '@/components/ExchangeContactModal';
import { QRFullscreenModal } from '@/components/QRFullscreenModal';
import { ResumeViewerModal } from '@/components/ResumeViewerModal';
import { ProjectDetailModal } from '@/components/ProjectDetailModal';
import { EditProfileClient } from '@/app/edit-profile/EditProfileClient';
import { ProfileEditorProvider } from '@/context/ProfileEditorContext';
import { downloadVCard } from '@/lib/vcard';

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
  const [profileType, setProfileType] = useState<ProfileType>(initialProfile.type || 'individual');
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme && initialProfile.theme !== 'default' ? initialProfile.theme : 'editorial'
  );
  const [isDark, setIsDark] = useState(false);
  const [isEditing, setIsEditing] = useState(Boolean(initialIsEditing && isOwner));
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(session);

  const activeThemeConfig = getThemeConfig(activeTheme);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    try {
      const savedPref = localStorage.getItem('avtive_theme_pref');
      const hasDark = savedPref === 'dark' || (!savedPref && document.documentElement.classList.contains('dark'));
      setIsDark(hasDark);
      if (hasDark) {
        document.documentElement.classList.add('dark');
      } else if (savedPref === 'light') {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  // Check sessionStorage for post-creation edit mode or URL param (Owner only)
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

  // Fetch / verify session dynamically so header auth status is accurate
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

  const handleToggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    try {
      localStorage.setItem('avtive_theme_pref', newDark ? 'dark' : 'light');
    } catch {}
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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

  const handleSaveContact = () => {
    try {
      downloadVCard(profile);
      showToast('Contact card downloaded!');
    } catch (err) {
      showToast('Contact information saved!');
    }
  };

  // Single shared editor: switches on the same page with no /edit route and no navigation
  if (isEditing && isOwner) {
    return (
      <EditProfileClient
        initialProfile={profile}
        userProfiles={userProfiles && userProfiles.length > 0 ? userProfiles : [profile]}
        onReturnToView={(updatedProfile) => {
          if (updatedProfile) {
            setProfile(updatedProfile);
            if (updatedProfile.theme) setActiveTheme(updatedProfile.theme);
          }
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <div 
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-all duration-300 font-sans overflow-x-hidden`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xl border border-white/10 dark:border-black/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Clean Public & Owner Header */}
      <HeaderNav
        currentProfile={{ ...profile, theme: activeTheme }}
        profileType={profileType}
        onSelectProfileType={(type) => setProfileType(type)}
        canEdit={isOwner}
        isEditing={false}
        onOpenEdit={() => setIsEditing(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        session={currentUser}
        onLogout={handleLogout}
        theme={activeThemeConfig}
      />

      {/* Main Responsive Profile Container - Single Source of Truth */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 min-w-0">
        <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1528] shadow-xl overflow-hidden">
          <AvtiveDigitalCard
            profile={{ ...profile, type: profileType, theme: activeTheme }}
            canEdit={isOwner}
            isEditing={false}
            isConnected={false}
            onOpenEdit={() => setIsEditing(true)}
            onCancelEdit={() => setIsEditing(false)}
            onSaveEdits={handleSaveEdits}
            onSaveContact={handleSaveContact}
            onOpenShare={() => setIsShareModalOpen(true)}
            onOpenConnect={() => setIsConnectModalOpen(true)}
            onOpenQRModal={() => setIsQRModalOpen(true)}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
            onSelectProject={(project) => setSelectedProject(project)}
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

      {/* Connect / Exchange Contact Modal */}
      {isConnectModalOpen && (
        <ExchangeContactModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          profile={profile}
          session={currentUser}
          onSuccess={() => showToast('Connected successfully!')}
        />
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          profile={profile}
        />
      )}

      {/* QR Code Fullscreen Modal */}
      {isQRModalOpen && (
        <QRFullscreenModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          profile={profile}
        />
      )}

      {/* Resume Viewer Modal */}
      {isResumeModalOpen && (
        <ResumeViewerModal
          isOpen={isResumeModalOpen}
          onClose={() => setIsResumeModalOpen(false)}
          profile={profile}
        />
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          isOpen={Boolean(selectedProject)}
          onClose={() => setSelectedProject(null)}
          project={selectedProject}
          profile={profile}
        />
      )}
    </div>
  );
}
