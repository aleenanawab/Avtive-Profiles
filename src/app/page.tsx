'use client';

import React, { useState, useEffect } from 'react';
import { 
  ProfileData, 
  ProfileType, 
  ProjectItem, 
  ServiceItem, 
  TeamMemberItem, 
  UserRole, 
  NavigationOrigin 
} from '../types/profile';
import { founderProfile, teamMemberProfile, companyProfile } from '../data/mockProfiles';
import { HeaderNav } from '../components/HeaderNav';
import { AvtiveDigitalCard } from '../components/AvtiveDigitalCard';
import { NFCCardPreview } from '../components/NFCCardPreview';
import { EditProfileModal } from '../components/EditProfileModal';
import { ShareModal } from '../components/ShareModal';
import { ExchangeContactModal } from '../components/ExchangeContactModal';
import { QRFullscreenModal } from '../components/QRFullscreenModal';
import { ProjectDetailModal } from '../components/ProjectDetailModal';
import { ResumeViewerModal } from '../components/ResumeViewerModal';
import { NFCTapModal } from '../components/NFCTapModal';

export default function Home() {
  // 1. Theme State (Light vs Dark)
  const [isDark, setIsDark] = useState<boolean>(false);
  const [themeMounted, setThemeMounted] = useState(false);

  // 2. View Mode (Desktop Presentation vs Mobile Smartphone Preview)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // 3. User Permission / Session Role
  const [userRole, setUserRole] = useState<UserRole>('owner');

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

  // 6. Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

      // Check saved custom profiles if version matches
      const savedProfiles = localStorage.getItem('avtive_custom_profiles_v3');
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles));
      } else {
        setProfiles({
          individual: founderProfile,
          'team-member': teamMemberProfile,
          company: companyProfile
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
    if (userRole === 'company_admin') return true;
    if (userRole === 'owner' && (currentProfileType === 'individual' || currentProfile.id === 'mesum-raza')) return true;
    if (userRole === 'team_member' && (currentProfileType === 'team-member' || currentProfile.id === 'hamza-malik')) return true;
    return false;
  };

  // Navigation Handler with Origin Context & History
  const handleNavigateToProfile = (targetType: ProfileType, origin: NavigationOrigin = 'direct') => {
    setHistoryStack((prev) => [...prev, currentProfileType]);
    setCurrentProfileType(targetType);
    setNavigationOrigin(origin);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate back in history
  const handleNavigateBack = () => {
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

  // Direct Company Navigation (e.g. from Founder or Team Member)
  const handleNavigateToCompany = (companyId?: string) => {
    handleNavigateToProfile('company', 'company');
  };

  // "My Card" direct shortcut
  const handleOpenMyCard = () => {
    handleNavigateToProfile('individual', 'my_card');
    showToast('Viewing your digital identity card');
  };

  // Select team member from company directory
  const handleSelectTeamMember = (member: TeamMemberItem) => {
    if (member.profileId === 'individual' || member.name.includes('Mesum')) {
      handleNavigateToProfile('individual', 'company');
    } else {
      handleNavigateToProfile('team-member', 'company');
    }
  };

  // Save profile edits
  const handleSaveProfileEdits = (updatedProfile: ProfileData) => {
    const updatedProfiles = {
      ...profiles,
      [currentProfileType]: updatedProfile
    };
    setProfiles(updatedProfiles);
    try {
      localStorage.setItem('avtive_custom_profiles_v3', JSON.stringify(updatedProfiles));
    } catch (e) {}
    showToast(`✓ Profile updated successfully!`);
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

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC] dark:bg-[#060B1E] text-[#0A1128] dark:text-white transition-colors duration-200">
      {/* 1. Global Navigation */}
      <HeaderNav
        currentProfile={currentProfile}
        profileType={currentProfileType}
        onSelectProfileType={handleNavigateToProfile}
        onOpenEdit={() => {
          if (canEdit) setIsEditModalOpen(true);
        }}
        onOpenShare={() => setIsShareModalOpen(true)}
        canEdit={canEdit}
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
                  onOpenEdit={() => {
                    if (canEdit) setIsEditModalOpen(true);
                  }}
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
              <div className="p-6 rounded-[32px] bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/10 shadow-lg text-left space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest text-[#1E3A8A] dark:text-[#7EC384] uppercase font-mono">
                      DIGITAL IDENTITY
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E3A8A]/10 dark:bg-white/10 text-[#1E3A8A] dark:text-white font-bold font-mono">
                      Active
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0A1128] dark:text-white mt-0.5">
                    Avtive Digital Pass Card
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
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
                />
              </div>

              {/* Active Role & Access Status */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/10 shadow-sm text-left space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
                    Session & Role Access
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    canEdit ? 'bg-[#0A1128]/10 dark:bg-white/15 text-[#0A1128] dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {canEdit ? '● Edit Access Active' : '○ View Only Mode'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#475569] dark:text-[#94A3B8]">
                  <div className="flex items-center justify-between">
                    <span>Logged in as</span>
                    <span className="font-bold text-[#0A1128] dark:text-white capitalize">{userRole.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Organization</span>
                    <span className="font-bold text-[#1E3A8A] dark:text-[#7EC384]">{currentProfile.company || 'Avtive'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Location</span>
                    <span className="font-mono text-[#0A1128] dark:text-white">{currentProfile.location}</span>
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
            <div className="relative w-full max-w-[430px] rounded-[48px] p-3 sm:p-4 bg-slate-900 shadow-2xl border-4 border-slate-700">
              {/* Dynamic Island Speaker Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-40 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950/80 mr-3" />
                <div className="w-2 h-2 rounded-full bg-slate-900" />
              </div>

              {/* Screen Inner Glass */}
              <div className="w-full rounded-[38px] overflow-hidden bg-white dark:bg-[#0A1128] max-h-[85vh] overflow-y-auto">
                <AvtiveDigitalCard
                  profile={currentProfile}
                  navigationOrigin={navigationOrigin}
                  canEdit={canEdit}
                  onOpenEdit={() => {
                    if (canEdit) setIsEditModalOpen(true);
                  }}
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
      {/* MODALS CONTAINER                                                          */}
      {/* ========================================================================= */}
      {/* 1. Edit Profile Modal (Only opens if canEdit is true) */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={currentProfile}
        userRole={userRole}
        onSave={handleSaveProfileEdits}
      />

      {/* 2. Instagram-Style QR Share Profile Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={currentProfile}
        onCopySuccess={() => showToast('✓ Profile link copied to clipboard')}
      />

      {/* 3. Connect / Lead Exchange Modal */}
      <ExchangeContactModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        profile={currentProfile}
        onSuccess={(lead) => showToast(`✓ Contact details sent to ${currentProfile.name}`)}
      />

      {/* 4. Fullscreen QR Code Modal */}
      <QRFullscreenModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        profile={currentProfile}
      />

      {/* 5. Project Detail Modal */}
      <ProjectDetailModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />

      {/* 6. Resume Viewer Modal */}
      <ResumeViewerModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profile={currentProfile}
      />

      {/* 7. NFC Tap Simulator Modal */}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#0A1128] text-white dark:bg-white dark:text-[#0A1128] text-xs font-bold shadow-2xl border border-white/20 dark:border-[#0A1128]/20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
