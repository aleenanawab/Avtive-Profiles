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
import { PhonePreview } from '@/components/PhonePreview';
import { getThemeConfig } from '@/components/themeStyles';
import { ShareModal } from '@/components/ShareModal';
import { ExchangeContactModal } from '@/components/ExchangeContactModal';
import { QRFullscreenModal } from '@/components/QRFullscreenModal';
import { ResumeViewerModal } from '@/components/ResumeViewerModal';
import { ProjectDetailModal } from '@/components/ProjectDetailModal';
import { EditProfileClient } from '@/app/edit-profile/EditProfileClient';
import { ProfileEditorProvider } from '@/context/ProfileEditorContext';
import { downloadVCard } from '@/lib/vcard';
import { motion, AnimatePresence } from 'framer-motion';
import { DesktopProfileSidebar } from '@/components/profiles/DesktopProfileSidebar';
import { Edit3 } from 'lucide-react';
import { DualScreenWorkspace } from '@/components/layout/DualScreenWorkspace';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isTouchRef = React.useRef(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(session);

  const activeThemeConfig = getThemeConfig(activeTheme);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const startCloseTimer = () => {
    if (isSidebarPinned) return;
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 280);
  };

  const handleTriggerMouseEnter = () => {
    if (isTouchRef.current) return;
    clearCloseTimer();
    setIsSidebarOpen(true);
  };

  const handleTriggerMouseLeave = () => {
    if (isTouchRef.current) return;
    startCloseTimer();
  };

  const handlePanelMouseEnter = () => {
    if (isTouchRef.current) return;
    clearCloseTimer();
    setIsSidebarOpen(true);
  };

  const handlePanelMouseLeave = () => {
    if (isTouchRef.current) return;
    startCloseTimer();
  };

  const handleTriggerClick = () => {
    clearCloseTimer();
    if (isSidebarOpen && isSidebarPinned) {
      setIsSidebarOpen(false);
      setIsSidebarPinned(false);
    } else {
      setIsSidebarOpen(true);
      setIsSidebarPinned(true);
    }
  };

  const handleCloseSidebar = () => {
    clearCloseTimer();
    setIsSidebarOpen(false);
    setIsSidebarPinned(false);
  };

  const handleSectionSelect = (sectionKey: string) => {
    const targetId = 
      sectionKey === 'profile' || sectionKey === 'hero'
        ? 'section-hero'
        : sectionKey === 'personalDetails' || sectionKey === 'about'
        ? 'section-about'
        : sectionKey === 'contactInfo' || sectionKey === 'contact'
        ? 'section-contact'
        : sectionKey === 'skills' || sectionKey === 'services'
        ? 'section-skills'
        : `section-${sectionKey}`;

    const el = document.getElementById(targetId) || document.getElementById(`section-${sectionKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    handleCloseSidebar();
  };

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

  // Synchronize edit mode with browser URL and listen to popstate (back/forward)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const isEditParam = params.get('edit') === 'true' || params.get('edit') === '1';
      if (isEditParam && isOwner) {
        setIsEditing(true);
      } else if (!isEditParam) {
        setIsEditing(false);
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [isOwner]);

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
    } catch {
      showToast('Contact information saved!');
    }
  };

  const handleOpenEditMode = () => {
    if (!isOwner) return;
    setIsEditing(true);
    const slug = profile.slug || profile.id || initialProfile.slug || initialProfile.id;
    if (slug && typeof window !== 'undefined') {
      window.history.pushState(null, '', `/profile/${encodeURIComponent(slug)}?edit=true`);
    }
  };

  const handleReturnToView = (updatedProfile?: ProfileData) => {
    const fresh = updatedProfile || profile;
    setProfile(fresh);
    if (fresh.theme) setActiveTheme(fresh.theme);
    setIsEditing(false);
    const slug = fresh.slug || fresh.id || profile.slug || profile.id;
    if (slug && typeof window !== 'undefined') {
      window.history.pushState(null, '', `/profile/${encodeURIComponent(slug)}`);
    }
    router.refresh();
  };

  // Single shared editor: switches on the same page with no /edit route and no navigation
  if (isEditing && isOwner) {
    return (
      <EditProfileClient
        initialProfile={profile}
        userProfiles={userProfiles && userProfiles.length > 0 ? userProfiles : [profile]}
        onSaveProfile={(savedProfile) => {
          if (savedProfile) {
            setProfile(savedProfile);
            if (savedProfile.theme) setActiveTheme(savedProfile.theme);
          }
        }}
        onReturnToView={(updatedProfile) => {
          handleReturnToView(updatedProfile);
        }}
        onCancel={() => {
          handleReturnToView();
        }}
      />
    );
  }

  const desktopToolbarRight = (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {isOwner && (
        <button
          type="button"
          onClick={handleOpenEditMode}
          className="px-2.5 py-1 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
          title="Edit Profile"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit Profile</span>
        </button>
      )}
    </div>
  );

  const desktopView = (
    <div className="w-full flex-1 flex flex-col min-h-0 relative">
      {/* Clean Public & Owner Header */}
      <HeaderNav
        currentProfile={{ ...profile, theme: activeTheme }}
        profileType={profileType}
        onSelectProfileType={(type) => setProfileType(type)}
        canEdit={isOwner}
        isEditing={false}
        onOpenEdit={handleOpenEditMode}
        onOpenShare={() => setIsShareModalOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        session={currentUser}
        onLogout={handleLogout}
        theme={activeThemeConfig}
      />

      {/* Left Edge Hover / Touch Trigger Strip for Section Navigation */}
      {!isSidebarOpen && (
        <div
          onMouseEnter={handleTriggerMouseEnter}
          onMouseLeave={handleTriggerMouseLeave}
          onClick={handleTriggerClick}
          onTouchStart={() => { isTouchRef.current = true; }}
          title="Hover or tap to open Sections"
          aria-label="Open Sections Navigation"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center py-6 w-3 sm:w-2.5 hover:w-6 bg-slate-400/20 dark:bg-white/10 hover:bg-cyan-500/20 border-r border-y border-slate-300 dark:border-white/20 hover:border-cyan-500/40 rounded-r-xl transition-all duration-200 cursor-pointer group shadow-sm select-none"
        >
          <div className="w-1 h-8 rounded-full bg-slate-400 dark:bg-white/40 group-hover:bg-cyan-500 transition-colors" />
        </div>
      )}

      {/* Slide-In Section Drawer on Hover (Desktop) or Tap (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              key="public-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleCloseSidebar}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-40 cursor-pointer"
            />
            <motion.div
              key="public-sidebar-drawer"
              initial={{ x: -340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -340, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              onMouseEnter={handlePanelMouseEnter}
              onMouseLeave={handlePanelMouseLeave}
              className="absolute top-0 bottom-0 left-0 z-50 h-full shadow-2xl max-w-full"
            >
              <DesktopProfileSidebar
                onClose={handleCloseSidebar}
                onSelectSection={handleSectionSelect}
                isPublicView={!isOwner}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Responsive Profile Container */}
      <div className="flex-1 w-full max-w-3xl mx-auto p-3 sm:p-6 lg:p-8 min-w-0">
        <div className={`w-full rounded-2xl sm:rounded-3xl border ${activeThemeConfig.cardBorder} ${activeThemeConfig.cardBg} shadow-xl overflow-hidden relative`}>
          <AvtiveDigitalCard
            profile={{ ...profile, type: profileType, theme: activeTheme }}
            canEdit={isOwner}
            isEditing={false}
            isConnected={false}
            onOpenEdit={handleOpenEditMode}
            onCancelEdit={handleReturnToView}
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
      </div>
    </div>
  );

  const mobileView = (
    <div className="w-full flex-1 flex flex-col min-h-0">
      <AvtiveDigitalCard
        profile={{ ...profile, type: profileType, theme: activeTheme }}
        canEdit={isOwner}
        isEditing={false}
        isConnected={false}
        onOpenEdit={handleOpenEditMode}
        onCancelEdit={handleReturnToView}
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
  );

  return (
    <div 
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-all duration-300 font-sans`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xl border border-white/10 dark:border-black/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      <DualScreenWorkspace
        workflowTitle="Digital Pass Identity"
        workflowSubtitle="Verified Public Profile"
        currentUrlPath={`/profile/${profile.slug || profile.id}`}
        desktopToolbarRight={desktopToolbarRight}
        desktopContent={desktopView}
        mobileContent={mobileView}
      />

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
