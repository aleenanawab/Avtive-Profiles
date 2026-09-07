'use client';

import React, { useState, useEffect } from 'react';
import { 
  ProfileData, 
  ProfileType, 
  ProjectItem, 
  ServiceItem, 
  TeamMemberItem, 
  UserRole, 
  NavigationOrigin,
  UserSession,
  ProfileTheme 
} from '../types/profile';
import { founderProfile, teamMemberProfile, companyProfile } from '../data/mockProfiles';
import { HeaderNav } from '../components/HeaderNav';
import { AvtiveDigitalCard } from '../components/AvtiveDigitalCard';
import { NFCCardPreview } from '../components/NFCCardPreview';
import { ShareModal } from '../components/ShareModal';
import { ExchangeContactModal } from '../components/ExchangeContactModal';
import { QRFullscreenModal } from '../components/QRFullscreenModal';
import { ProjectDetailModal } from '../components/ProjectDetailModal';
import { ResumeViewerModal } from '../components/ResumeViewerModal';
import { NFCTapModal } from '../components/NFCTapModal';
import { getThemeConfig } from '../components/themeStyles';

export default function Home() {
  // 1. Theme State (Light vs Dark)
  const [isDark, setIsDark] = useState<boolean>(false);
  const [themeMounted, setThemeMounted] = useState(false);

  // 2. View Mode (Desktop Presentation vs Mobile Smartphone Preview)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // 3. User Permission / Session Role
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [session, setSession] = useState<UserSession | null>(null);

  // 4. Current Profile Type & Navigation Origin Context
  const [currentProfileType, setCurrentProfileType] = useState<ProfileType>('individual');
  const [navigationOrigin, setNavigationOrigin] = useState<NavigationOrigin>('my_card');
  const [historyStack, setHistoryStack] = useState<ProfileType[]>([]);

  // 5. Profiles State (Allows real-time live editing & local persistence)
  const [profiles, setProfiles] = useState<Record<ProfileType, ProfileData>>({
    individual: founderProfile,
    'team-member': teamMemberProfile,
    company: companyProfile
  });

  // 6. Same-page Inline Profile Editing State (No Modals)
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // 7. Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isNFCTapModalOpen, setIsNFCTapModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch authenticated session from server on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setSession(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize theme from document or localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('avtive_theme_pref');
      if (savedTheme) {
        const dark = savedTheme === 'dark';
        setIsDark(dark);
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const hasDarkClass = document.documentElement.classList.contains('dark');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialDark = hasDarkClass || systemPrefersDark;
        setIsDark(initialDark);
        if (initialDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Purge all legacy/outdated profile caches containing old blue/contrasting assets
      for (let i = 1; i <= 29; i++) {
        try { localStorage.removeItem(`avtive_custom_profiles_v${i}`); } catch (_) {}
      }

      // Check saved custom profiles if version matches v30
      const savedProfiles = localStorage.getItem('avtive_custom_profiles_v30');
      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        ['individual', 'team-member', 'company'].forEach((key) => {
          if (parsed[key]) {
            if (!parsed[key].theme || parsed[key].theme === 'default') parsed[key].theme = 'elegant';
            if (parsed[key].coverImage && !parsed[key].coverImage.startsWith('/uploads/') && !parsed[key].coverImage.startsWith('data:')) {
              delete parsed[key].coverImage;
            }
          }
        });
        setProfiles(parsed);
      } else {
        setProfiles({
          individual: { ...founderProfile, theme: 'elegant' },
          'team-member': { ...teamMemberProfile, theme: 'elegant' },
          company: { ...companyProfile, theme: 'elegant' }
        });
      }
    } catch (e) {
      console.error(e);
    }
    setThemeMounted(true);
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('avtive_theme_pref', nextDark ? 'dark' : 'light');
    } catch (e) {}
  };

  const currentProfile = profiles[currentProfileType];

  // Helper to determine if the active user role has edit rights on the active profile
  const canEditCurrentProfile = (): boolean => {
    if (userRole === 'visitor') return false;
    if (session && currentProfile.userId === session.id) return true;
    if (userRole === 'owner' && (currentProfileType === 'individual' || currentProfile.id === 'mesum-raza')) return true;
    if (userRole === 'team_member' && (currentProfileType === 'team-member' || currentProfile.id === 'hamza-malik')) return true;
    if (userRole === 'company_admin') return true;
    return false;
  };

  // Navigation Handler with Origin Context & History
  const handleNavigateToProfile = (targetType: ProfileType, origin: NavigationOrigin = 'direct') => {
    setIsEditingProfile(false);
    setHistoryStack((prev) => [...prev, currentProfileType]);
    setCurrentProfileType(targetType);
    setNavigationOrigin(origin);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate back in history
  const handleNavigateBack = () => {
    setIsEditingProfile(false);
    if (historyStack.length > 0) {
      const prevType = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, -1));
      setCurrentProfileType(prevType);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentProfileType('company');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Direct Company Navigation
  const handleNavigateToCompany = (companyId?: string) => {
    setIsEditingProfile(false);
    handleNavigateToProfile('company', 'company');
  };

  // "My Card" direct shortcut
  const handleOpenMyCard = () => {
    setIsEditingProfile(false);
    handleNavigateToProfile('individual', 'my_card');
    showToast('Viewing your digital identity card');
  };

  // Select team member from company directory
  const handleSelectTeamMember = (member: TeamMemberItem) => {
    setIsEditingProfile(false);
    if (member.profileId === 'individual' || member.name.includes('Mesum')) {
      handleNavigateToProfile('individual', 'company');
    } else {
      handleNavigateToProfile('team-member', 'company');
    }
  };

  // Save profile edits (Same-Page Inline Save)
  const handleSaveProfileEdits = async (updatedProfile: ProfileData) => {
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: updatedProfile.id,
          updatedData: updatedProfile
        })
      });

      const data = await res.json();
      const saved = data.updatedProfile || updatedProfile;

      const updatedProfiles = {
        ...profiles,
        [currentProfileType]: saved
      };
      setProfiles(updatedProfiles);
      try {
        localStorage.setItem('avtive_custom_profiles_v30', JSON.stringify(updatedProfiles));
      } catch (e) {}

      setIsEditingProfile(false);
      showToast(`✓ Profile updated successfully!`);
    } catch (err: any) {
      console.error(err);
      const updatedProfiles = {
        ...profiles,
        [currentProfileType]: updatedProfile
      };
      setProfiles(updatedProfiles);
      setIsEditingProfile(false);
      showToast(`✓ Profile updated in local state.`);
    }
  };

  // Cancel profile edits (Discard)
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    showToast('Changes discarded.');
  };

  // Live Theme Preview
  const handleThemePreview = (theme: ProfileTheme) => {
    const updated = {
      ...currentProfile,
      theme
    };
    setProfiles((prev) => ({
      ...prev,
      [currentProfileType]: updated
    }));
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setSession(null);
    setUserRole('visitor');
    setIsEditingProfile(false);
    showToast('✓ Logged out successfully');
  };

  // Generate & Download vCard 3.0 (.vcf)
  const handleDownloadVCard = () => {
    const p = currentProfile;
    const nameParts = p.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${p.name}`,
      `N:${lastName};${firstName};;;`,
      `ORG:${p.company || 'Avtive'};${p.department || ''}`,
      `TITLE:${p.designation || ''}`,
      p.phone ? `TEL;TYPE=CELL,VOICE:${p.phone}` : '',
      p.email ? `EMAIL;TYPE=PREF,INTERNET:${p.email}` : '',
      `URL;TYPE=WORK:${p.website || 'https://www.avtive.app'}`,
      `ADR;TYPE=WORK:;;${p.officeAddress || p.location};Islamabad;;;Pakistan`,
      `NOTE:${p.shortBio || ''}`,
      'END:VCARD'
    ].filter(Boolean);

    const vCardString = vCardLines.join('\r\n');
    const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${p.slug || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`✓ Digital Card saved: ${p.name} (.vcf downloaded)`);
  };

  const canEdit = canEditCurrentProfile();
  const activeThemeConfig = getThemeConfig(currentProfile.theme || 'elegant');

  return (
    <div className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-colors duration-200`}>
      {/* 1. Global Navigation */}
      <HeaderNav
        currentProfile={currentProfile}
        profileType={currentProfileType}
        onSelectProfileType={handleNavigateToProfile}
        onOpenEdit={() => {
          if (canEdit) setIsEditingProfile(true);
        }}
        onOpenShare={() => setIsShareModalOpen(true)}
        canEdit={canEdit}
        isEditing={isEditingProfile}
        userRole={userRole}
        onChangeUserRole={(newRole) => {
          setUserRole(newRole);
          showToast(`Permission role changed to: ${newRole.toUpperCase()}`);
        }}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenMyCard={handleOpenMyCard}
        session={session}
        onLogout={handleLogout}
        theme={activeThemeConfig}
      />

      {/* 2. Main Content Viewport */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {viewMode === 'desktop' ? (
          /* ========================================================================= */
          /* DESKTOP PRESENTATION VIEW: Centered Profile Card + NFC Smart Card Sidebar   */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Digital Business Card Container (max-w-xl) */}
            <div className="lg:col-span-7 xl:col-span-7 flex justify-center">
              <div className="w-full max-w-xl">
                <AvtiveDigitalCard
                  profile={currentProfile}
                  navigationOrigin={navigationOrigin}
                  canEdit={canEdit}
                  isEditing={isEditingProfile}
                  onOpenEdit={() => {
                    if (canEdit) setIsEditingProfile(true);
                  }}
                  onSaveEdits={handleSaveProfileEdits}
                  onCancelEdit={handleCancelEdit}
                  onThemePreview={handleThemePreview}
                  onSaveContact={handleDownloadVCard}
                  onOpenShare={() => setIsShareModalOpen(true)}
                  onOpenConnect={() => setIsConnectModalOpen(true)}
                  onOpenQRModal={() => setIsQRModalOpen(true)}
                  onOpenResumeModal={() => setIsResumeModalOpen(true)}
                  onSelectProject={(proj) => setSelectedProject(proj)}
                  onSelectTeamMember={handleSelectTeamMember}
                  onViewCompany={handleNavigateToCompany}
                  onNavigateBack={handleNavigateBack}
                  onInquireService={() => setIsConnectModalOpen(true)}
                  onSendMessage={() => showToast('✓ Message sent successfully')}
                  onOpenMyCard={handleOpenMyCard}
                  isDark={isDark}
                />
              </div>
            </div>

            {/* Right Column: Physical Smart NFC Card Preview & Platform Verification */}
            <div className="lg:col-span-5 xl:col-span-5 sticky top-20 hidden lg:flex flex-col gap-6">
              {/* Digital Pass Card Box */}
              <div className={`p-6 rounded-[32px] ${activeThemeConfig.cardBg} border ${activeThemeConfig.cardBorder} shadow-lg text-left space-y-4 transition-colors`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold tracking-widest ${activeThemeConfig.accentText} uppercase font-mono`}>
                      DIGITAL IDENTITY
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeThemeConfig.badgeBg} ${activeThemeConfig.badgeText} font-bold font-mono`}>
                      Active
                    </span>
                  </div>
                  <h3 className={`text-base font-bold ${activeThemeConfig.textPrimary} mt-0.5`}>
                    Avtive Digital Pass Card
                  </h3>
                  <p className={`text-xs ${activeThemeConfig.textSecondary}`}>
                    Click company to view profile or download card.
                  </p>
                </div>

                <NFCCardPreview
                  profile={currentProfile}
                  onSimulateNFCTap={() => setIsNFCTapModalOpen(true)}
                  onOpenQRModal={() => setIsQRModalOpen(true)}
                  onViewCompany={handleNavigateToCompany}
                  onDownloadCard={handleDownloadVCard}
                  isDark={isDark}
                  theme={activeThemeConfig}
                />
              </div>

              {/* Active Role & Access Status */}
              <div className={`p-5 rounded-2xl ${activeThemeConfig.cardBg} border ${activeThemeConfig.cardBorder} shadow-sm text-left space-y-3 transition-colors`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${activeThemeConfig.textPrimary} font-mono`}>
                    Session & Role Access
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    canEdit ? `${activeThemeConfig.badgeBg} ${activeThemeConfig.badgeText}` : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {canEdit ? '● Edit Access Active' : '○ View Only Mode'}
                  </span>
                </div>

                <div className={`space-y-2 text-xs ${activeThemeConfig.textSecondary}`}>
                  <div className="flex items-center justify-between">
                    <span>Logged in as</span>
                    <span className={`font-bold ${activeThemeConfig.textPrimary} capitalize`}>
                      {session ? session.name : userRole.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Organization</span>
                    <span className={`font-bold ${activeThemeConfig.accentText}`}>{currentProfile.company || 'Avtive'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Location</span>
                    <span className={`font-mono ${activeThemeConfig.textPrimary}`}>{currentProfile.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MOBILE SMARTPHONE VIEWPORT SIMULATOR                                     */
          /* ========================================================================= */
          <div className="flex flex-col items-center justify-center">
            {/* Smartphone Outer Bezel Frame */}
            <div className="relative w-full max-w-[430px] rounded-[48px] p-3 sm:p-4 bg-neutral-950 shadow-2xl border-4 border-neutral-800">
              {/* Dynamic Island Speaker Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-40 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 mr-3" />
                <div className="w-2 h-2 rounded-full bg-neutral-800" />
              </div>

              {/* Screen Inner Glass */}
              <div className={`w-full rounded-[38px] overflow-hidden ${activeThemeConfig.cardBg} max-h-[85vh] overflow-y-auto`}>
                <AvtiveDigitalCard
                  profile={currentProfile}
                  navigationOrigin={navigationOrigin}
                  canEdit={canEdit}
                  isEditing={isEditingProfile}
                  onOpenEdit={() => {
                    if (canEdit) setIsEditingProfile(true);
                  }}
                  onSaveEdits={handleSaveProfileEdits}
                  onCancelEdit={handleCancelEdit}
                  onThemePreview={handleThemePreview}
                  onSaveContact={handleDownloadVCard}
                  onOpenShare={() => setIsShareModalOpen(true)}
                  onOpenConnect={() => setIsConnectModalOpen(true)}
                  onOpenQRModal={() => setIsQRModalOpen(true)}
                  onOpenResumeModal={() => setIsResumeModalOpen(true)}
                  onSelectProject={(proj) => setSelectedProject(proj)}
                  onSelectTeamMember={handleSelectTeamMember}
                  onViewCompany={handleNavigateToCompany}
                  onNavigateBack={handleNavigateBack}
                  onInquireService={() => setIsConnectModalOpen(true)}
                  onSendMessage={() => showToast('✓ Message transmitted')}
                  onOpenMyCard={handleOpenMyCard}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODALS CONTAINER (All read-only / sharing modals, NO Edit Modal)           */}
      {/* ========================================================================= */}
      {/* 1. Instagram-Style QR Share Profile Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={currentProfile}
        onCopySuccess={() => showToast('✓ Canonical profile link copied to clipboard')}
      />

      {/* 2. Connect / Lead Exchange Modal */}
      <ExchangeContactModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        profile={currentProfile}
        session={session}
        onSuccess={() => showToast(`✓ Contact details sent & connected with ${currentProfile.name}`)}
      />

      {/* 3. Fullscreen QR Code Modal */}
      <QRFullscreenModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        profile={currentProfile}
      />

      {/* 4. Project Detail Modal */}
      <ProjectDetailModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        profile={currentProfile}
      />

      {/* 5. Resume Viewer Modal */}
      <ResumeViewerModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profile={currentProfile}
      />

      {/* 6. NFC Tap Simulator Modal */}
      <NFCTapModal
        isOpen={isNFCTapModalOpen}
        onClose={() => setIsNFCTapModalOpen(false)}
        profile={currentProfile}
        onSaveContact={handleDownloadVCard}
        onExchangeContact={() => {
          setIsNFCTapModalOpen(false);
          setIsConnectModalOpen(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl ${activeThemeConfig.btnPrimary} text-xs font-bold shadow-2xl border ${activeThemeConfig.cardBorder} animate-in fade-in slide-in-from-bottom-3 duration-200`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
