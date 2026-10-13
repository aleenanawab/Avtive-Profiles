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
import { ProfileEditorProvider, useProfileEditor } from '@/context/ProfileEditorContext';
import { downloadVCard } from '@/lib/vcard';
import { motion, AnimatePresence } from 'framer-motion';
import { DesktopProfileSidebar } from '@/components/profiles/DesktopProfileSidebar';
import { Edit3, Save, X, Loader2, LayoutGrid, Sun, Moon, LogOut } from 'lucide-react';
import { DualScreenWorkspace } from '@/components/layout/DualScreenWorkspace';
import { usePortfolioTheme } from '@/context/ThemeContext';

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
  const { isDark, toggleDarkMode } = usePortfolioTheme();
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
    // If owner selects a section from the Sections sidebar, ensure edit mode is enabled
    if (isOwner && !isEditing) {
      handleOpenEditMode();
    }

    const targetId = 
      sectionKey === 'profile' || sectionKey === 'hero'
        ? 'section-hero'
        : sectionKey === 'personalDetails' || sectionKey === 'about'
        ? 'section-about'
        : sectionKey === 'contactInfo' || sectionKey === 'contact' || sectionKey === 'basicInfo'
        ? 'section-contact'
        : sectionKey === 'skills' || sectionKey === 'services'
        ? 'section-skills'
        : sectionKey === 'projects' || sectionKey === 'portfolio'
        ? 'section-projects'
        : sectionKey === 'education'
        ? 'section-education'
        : sectionKey === 'experience'
        ? 'section-experience'
        : sectionKey === 'socialLinks' || sectionKey === 'socials'
        ? 'section-socialLinks'
        : sectionKey === 'teamMembers' || sectionKey === 'team'
        ? 'section-teamMembers'
        : sectionKey === 'companyInfo' || sectionKey === 'company'
        ? 'section-company'
        : sectionKey === 'certifications' || sectionKey === 'certificates'
        ? 'section-certifications'
        : sectionKey === 'languages'
        ? 'section-languages'
        : sectionKey === 'recommendations'
        ? 'section-recommendations'
        : sectionKey === 'customFields' || sectionKey === 'custom-fields' || sectionKey === 'enhanceProfile'
        ? 'section-custom-fields'
        : sectionKey === 'virtualCard' || sectionKey === 'virtual-card'
        ? 'virtual-card-section'
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
    toggleDarkMode();
  };

  const handleLogout = async () => {
    try {
      const emailToRemember = currentUser?.email || profile?.email;
      if (emailToRemember) {
        localStorage.setItem('avtive_remembered_identifier', emailToRemember);
      }
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
      // Sanitize custom fields: filter out entries that have neither a label nor a value
      const sanitizedCustomFields = Array.isArray(updatedData.customFields)
        ? updatedData.customFields.filter(f => (f.label && f.label.trim()) || (f.value && f.value.trim()))
        : updatedData.customFields;

      // Sanitize certifications: filter out entries that have neither a name nor an issuer
      const sanitizedCertifications = Array.isArray(updatedData.certifications)
        ? updatedData.certifications.filter(c => (c.name && c.name.trim()) || (c.issuer && c.issuer.trim()))
        : updatedData.certifications;

      const payload = {
        ...updatedData,
        customFields: sanitizedCustomFields,
        certifications: sanitizedCertifications
      };

      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          updatedData: payload
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes.');
      }
      setProfile(data.profile || payload);
      setIsEditing(false);
      showToast('Profile saved successfully!');
    } catch (err: any) {
      console.error('Update profile error:', err);
      showToast(err.message || 'Failed to save profile changes.');
      throw err;
    }
  };

  const handleSavePartial = async (partialData: Partial<ProfileData>): Promise<ProfileData> => {
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          updatedData: partialData
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes.');
      }
      const updated = data.profile || { ...profile, ...partialData };
      setProfile(updated);
      setCurrentDraft(updated);
      try {
        localStorage.setItem(`avtive_profile_${updated.slug || updated.id}`, JSON.stringify(updated));
        localStorage.setItem(`avtive_profile_${updated.id}`, JSON.stringify(updated));
        localStorage.setItem('avtive_last_saved_profile', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('avtive_profile_updated', { detail: updated }));
      } catch {}
      showToast('Changes saved successfully!');
      return updated;
    } catch (err: any) {
      console.error('Update section error:', err);
      showToast(err.message || 'Failed to save changes.');
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

  const {
    liveProfile,
    activeSection,
    setActiveSection,
    isSaving,
    saveProfile,
    handleSwitchToProfile
  } = useProfileEditor();

  const [currentDraft, setCurrentDraft] = useState<ProfileData>(profile);

  useEffect(() => {
    setCurrentDraft(profile);
  }, [profile]);

  const handleDraftChange = (draft: ProfileData) => {
    setCurrentDraft(draft);
  };

  const handleOpenEditMode = () => {
    if (!isOwner) return;
    setIsEditing(true);
    const slug = profile.slug || profile.id || initialProfile.slug || initialProfile.id;
    if (slug && typeof window !== 'undefined') {
      window.history.pushState(null, '', `/profile/${encodeURIComponent(slug)}?edit=true`);
    }
  };

  const handleCancelEdit = () => {
    setCurrentDraft(profile);
    handleSwitchToProfile(profile);
    setIsEditing(false);
    const slug = profile.slug || profile.id || initialProfile.slug || initialProfile.id;
    if (slug && typeof window !== 'undefined') {
      window.history.pushState(null, '', `/profile/${encodeURIComponent(slug)}`);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing]);

  const handleSaveAndExit = async () => {
    try {
      await handleSaveEdits(currentDraft);
    } catch (err: any) {
      console.error('Update profile error:', err);
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

  const desktopView = (
    <div className="w-full flex-1 flex flex-col min-h-0 relative">
      {/* Clean Public & Owner Header */}
      <HeaderNav
        currentProfile={{ ...profile, theme: activeTheme }}
        profileType={profileType}
        onSelectProfileType={(type) => setProfileType(type)}
        canEdit={isOwner}
        isEditing={isEditing}
        onCancelEdit={handleCancelEdit}
        onSaveEdits={handleSaveAndExit}
        isSaving={isSaving}
        onOpenEdit={handleOpenEditMode}
        onOpenShare={() => setIsShareModalOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        session={currentUser}
        onLogout={handleLogout}
        theme={activeThemeConfig}
        onToggleSections={handleTriggerClick}
        onSectionsMouseEnter={handleTriggerMouseEnter}
        onSectionsMouseLeave={handleTriggerMouseLeave}
      />

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
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 cursor-pointer"
            />
            <motion.div
              key="public-sidebar-drawer"
              initial={{ x: -340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -340, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              onMouseEnter={handlePanelMouseEnter}
              onMouseLeave={handlePanelMouseLeave}
              className="fixed top-0 bottom-0 left-0 z-50 h-full shadow-2xl max-w-full"
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

      {/* Main Responsive Profile Container - Identical in both View and Edit Mode */}
      <div className="flex-1 w-full max-w-3xl mx-auto p-3 sm:p-6 lg:p-8 min-w-0">
        <div className={`w-full rounded-2xl sm:rounded-3xl border ${activeThemeConfig.cardBorder} ${activeThemeConfig.cardBg} shadow-xl overflow-hidden relative`}>
          <AvtiveDigitalCard
            profile={{ ...profile, type: profileType, theme: activeTheme }}
            canEdit={isOwner}
            isEditing={isEditing}
            isConnected={false}
            onDraftChange={handleDraftChange}
            onOpenEdit={handleOpenEditMode}
            onCancelEdit={handleCancelEdit}
            onSaveEdits={handleSaveEdits}
            onSavePartial={handleSavePartial}
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
            onSelectSection={handleSectionSelect}
            onToggleSections={handleTriggerClick}
            onSectionsMouseEnter={handleTriggerMouseEnter}
            onSectionsMouseLeave={handleTriggerMouseLeave}
          />
        </div>
      </div>
    </div>
  );

  const mobileView = (
    <div className="w-full flex-1 flex flex-col min-h-0 relative">
      <div className="flex-1 w-full overflow-y-auto min-h-0">
        <AvtiveDigitalCard
          profile={{ ...profile, type: profileType, theme: activeTheme }}
          canEdit={isOwner}
          isEditing={isEditing}
          isConnected={false}
          onDraftChange={handleDraftChange}
          onOpenEdit={handleOpenEditMode}
          onCancelEdit={handleCancelEdit}
          onSaveEdits={handleSaveEdits}
          onSavePartial={handleSavePartial}
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
          onSelectSection={handleSectionSelect}
          onToggleSections={handleTriggerClick}
          onSectionsMouseEnter={handleTriggerMouseEnter}
          onSectionsMouseLeave={handleTriggerMouseLeave}
        />
      </div>
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
        showWindowHeader={false}
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
