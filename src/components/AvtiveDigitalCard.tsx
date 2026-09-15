'use client';

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  UserPlus, 
  CreditCard, 
  Building2, 
  Save, 
  X, 
  Loader2, 
  Palette, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  ProfileData, 
  ProjectItem, 
  ServiceItem, 
  TeamMemberItem, 
  NavigationOrigin, 
  ProfileTheme 
} from '../types/profile';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { SkillsServicesSection } from './SkillsServicesSection';
import { ExperienceSection } from './ExperienceSection';
import { PortfolioSection } from './PortfolioSection';
import { CertificationsSection } from './CertificationsSection';
import { VolunteerSection } from './VolunteerSection';
import { LanguagesSection } from './LanguagesSection';
import { RecommendationsSection } from './RecommendationsSection';
import { ProfileContactSection } from './ProfileContactSection';
import { CompanyCard } from './CompanyCard';
import { TeamSection } from './TeamSection';
import { NFCCardPreview } from './NFCCardPreview';
import { getThemeConfig, PROFILE_THEMES, ThemeConfig } from './themeStyles';

export { getThemeConfig };

export function getProfileThemeClasses(theme: ProfileTheme = 'elegant') {
  const config = getThemeConfig(theme);
  return {
    container: config.container,
    badge: `${config.badgeBg} ${config.badgeText}`,
    accent: config.accentText
  };
}

const THEME_SELECTION_LIST: { id: ProfileTheme; name: string; tag: string }[] = [
  { id: 'editorial', name: 'Editorial', tag: 'Minimal' },
  { id: 'cyber', name: 'Developer', tag: 'Terminal' },
  { id: 'luxe', name: 'Luxe Velvet', tag: 'Executive' },
  { id: 'elegant', name: 'Elegant', tag: 'Luxury' },
  { id: 'dark', name: 'Dark', tag: 'Executive' },
  { id: 'minimal', name: 'Minimal', tag: 'Pure' },
  { id: 'professional', name: 'Professional', tag: 'Corporate' },
  { id: 'modern', name: 'Modern', tag: 'Creative' },
  { id: 'default', name: 'Clean Neutral', tag: 'Clean' }
];

interface AvtiveDigitalCardProps {
  profile: ProfileData;
  navigationOrigin?: NavigationOrigin;
  canEdit?: boolean;
  isEditing?: boolean;
  isConnected?: boolean;
  onOpenEdit?: () => void;
  onSaveEdits?: (updatedProfile: ProfileData) => Promise<void>;
  onCancelEdit?: () => void;
  onThemePreview?: (theme: ProfileTheme) => void;
  onSaveContact: () => void;
  onOpenShare: () => void;
  onOpenConnect: () => void;
  onOpenQRModal: () => void;
  onOpenResumeModal: () => void;
  onSelectProject: (project: ProjectItem) => void;
  onSelectTeamMember?: (member: TeamMemberItem) => void;
  onViewCompany?: (companyId?: string) => void;
  onNavigateBack?: () => void;
  onInquireService?: (service: ServiceItem) => void;
  onSendMessage?: (data: { name: string; email: string; message: string }) => void;
  onOpenMyCard?: () => void;
  isDark: boolean;
  viewMode?: 'standard' | 'web';
}

export function AvtiveDigitalCard({
  profile,
  navigationOrigin = 'direct',
  canEdit = false,
  isEditing = false,
  isConnected = false,
  onOpenEdit,
  onSaveEdits,
  onCancelEdit,
  onThemePreview,
  onSaveContact,
  onOpenShare,
  onOpenConnect,
  onOpenQRModal,
  onOpenResumeModal,
  onSelectProject,
  onSelectTeamMember,
  onViewCompany,
  onNavigateBack,
  onInquireService,
  onSendMessage,
  onOpenMyCard,
  isDark,
  viewMode = 'standard'
}: AvtiveDigitalCardProps) {
  const [draftProfile, setDraftProfile] = useState<ProfileData>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync draft with external profile when not actively editing
  useEffect(() => {
    if (!isEditing) {
      setDraftProfile(profile);
      setErrorMessage(null);
    }
  }, [profile, isEditing]);

  const activeThemeKey = draftProfile.theme || 'elegant';
  const theme = getThemeConfig(activeThemeKey);

  const isCompany = draftProfile.type === 'company';
  const companyName = draftProfile.company || draftProfile.companyInfo?.name || 'Avtive';

  const handleFieldUpdate = (field: keyof ProfileData, value: any) => {
    setDraftProfile((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleThemeChange = (selectedTheme: ProfileTheme) => {
    handleFieldUpdate('theme', selectedTheme);
    if (onThemePreview) {
      onThemePreview(selectedTheme);
    }
  };

  const handleSave = async () => {
    if (!draftProfile.name || !draftProfile.name.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      if (onSaveEdits) {
        await onSaveEdits(draftProfile);
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMessage(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftProfile(profile);
    setErrorMessage(null);
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="relative w-full text-left">
      {/* Main Profile Container Card with dynamic theme styling */}
      <div 
        data-theme={activeThemeKey}
        className="w-full overflow-hidden transition-colors duration-200"
      >
        
        {/* ========================================================================= */}
        {/* INSTAGRAM-STYLE IN-PLACE EDIT HEADER: Sticky top Save / Cancel & Themes    */}
        {/* ========================================================================= */}
        {isEditing && (
          <div className={`sticky top-16 z-30 ${theme.headerBg} backdrop-blur-md border-b ${theme.divider} shadow-sm animate-in fade-in duration-150`}>
            {/* Action Bar */}
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.accentText} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 bg-current ${theme.accentText}`}></span>
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
                  Edit Profile (In-Place)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Discard / Cancel */}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${theme.subCardBg} text-xs font-bold ${theme.textPrimary} border ${theme.subCardBorder} hover:opacity-80 transition-all active:scale-95 disabled:opacity-50`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                {/* Save Changes */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl ${theme.btnPrimary} text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Validation / Error banner */}
            {errorMessage && (
              <div className="mx-4 sm:mx-6 mb-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Theme Selector Strip: 6 Themes with Instant Live Preview */}
            <div className={`px-4 sm:px-6 pb-3 pt-1 border-t ${theme.divider} flex flex-col gap-1.5`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-[11px] font-bold ${theme.textMuted} uppercase font-mono`}>
                  <Palette className={`w-3.5 h-3.5 ${theme.accentText}`} />
                  <span>Choose Theme</span>
                </div>
                <span className={`text-[10px] font-mono ${theme.accentText} font-bold`}>
                  ● Live Preview
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {THEME_SELECTION_LIST.map((th) => {
                  const isSelected = activeThemeKey === th.id;
                  const thConfig = getThemeConfig(th.id);
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => handleThemeChange(th.id)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        isSelected
                          ? `border-current shadow-sm scale-[1.02] ${thConfig.badgeBg} ${thConfig.accentText}`
                          : `${theme.cardBorder} hover:opacity-80 ${theme.subCardBg} ${theme.textSecondary}`
                      }`}
                      title={thConfig.description}
                    >
                      {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      <span className="truncate">{th.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Includes Direct Contact section immediately below CTA)   */}
        {/* ========================================================================= */}
        <HeroSection
          profile={draftProfile}
          navigationOrigin={navigationOrigin}
          canEdit={canEdit}
          isEditing={isEditing}
          isConnected={isConnected}
          onUpdateField={handleFieldUpdate}
          onOpenEdit={onOpenEdit}
          onOpenShare={onOpenShare}
          onOpenConnect={onOpenConnect}
          onOpenVirtualCard={() => {
            const el = document.getElementById('virtual-card-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onNavigateToCompany={onViewCompany}
          onNavigateBack={onNavigateBack}
          theme={theme}
        />

        {/* ========================================================================= */}
        {/* DYNAMIC PROFILE SECTIONS RENDERED ACCORDING TO sectionOrder & sharingSettings */}
        {/* ========================================================================= */}
        {(() => {
          const defaultCardSectionOrder = [
            'company',
            'about',
            'contact',
            'skills',
            'services',
            'projects',
            'experience',
            'certifications',
            'volunteer',
            'languages',
            'recommendations',
            'virtual-card'
          ];

          const userOrder = (draftProfile.sectionOrder || []).filter((s) => s !== 'hero');
          const effectiveOrder: string[] = [];
          
          for (const s of userOrder) {
            const normalized = s === 'skills' ? 'services' : s;
            if (!effectiveOrder.includes(normalized) && defaultCardSectionOrder.includes(normalized)) {
              effectiveOrder.push(normalized);
            }
          }
          
          for (const s of defaultCardSectionOrder) {
            if (!effectiveOrder.includes(s)) {
              effectiveOrder.push(s);
            }
          }

          const sharing = draftProfile.sharingSettings || {};

          const renderSection = (sectionKey: string) => {
            switch (sectionKey) {
              case 'company':
                if (!isEditing && sharing.companySection === false) return null;
                if (!isCompany && draftProfile.companyInfo && onViewCompany) {
                  return (
                    <CompanyCard
                      key="company"
                      companyInfo={draftProfile.companyInfo}
                      onViewCompany={() => onViewCompany(draftProfile.companyId || 'avtive-company')}
                      theme={theme}
                    />
                  );
                }
                if (isCompany && draftProfile.teamMembers && onSelectTeamMember) {
                  return (
                    <TeamSection
                      key="team"
                      profile={draftProfile}
                      onSelectTeamMember={onSelectTeamMember}
                      theme={theme}
                    />
                  );
                }
                return null;

              case 'about':
                if (!isEditing && sharing.bio === false) return null;
                return (
                  <AboutSection 
                    key="about"
                    profile={draftProfile} 
                    isEditing={isEditing}
                    onUpdateField={handleFieldUpdate}
                    theme={theme}
                  />
                );

              case 'contact':
                return (
                  <ProfileContactSection
                    key="contact"
                    profile={draftProfile}
                    isEditing={isEditing}
                    onUpdateField={handleFieldUpdate}
                    theme={theme}
                  />
                );

              case 'services':
              case 'skills':
                if (!isEditing && sharing.services === false && sharing.skills === false) return null;
                return (
                  <SkillsServicesSection
                    key="services"
                    profile={draftProfile}
                    isEditing={isEditing}
                    onUpdateField={handleFieldUpdate}
                    onInquireService={onInquireService}
                    theme={theme}
                  />
                );

              case 'experience':
                if (!isEditing && sharing.experience === false) return null;
                if (!isEditing && (!draftProfile.experiences || draftProfile.experiences.length === 0)) return null;
                return (
                  <ExperienceSection key="experience" profile={draftProfile} theme={theme} />
                );

              case 'projects':
                if (!isEditing && sharing.projects === false) return null;
                if (!isEditing && (!draftProfile.projects || draftProfile.projects.length === 0)) return null;
                return (
                  <PortfolioSection
                    key="projects"
                    profile={draftProfile}
                    onSelectProject={onSelectProject}
                    theme={theme}
                  />
                );

              case 'certifications':
                if (!isEditing && sharing.certifications === false) return null;
                if (!isEditing && (!draftProfile.certifications || draftProfile.certifications.length === 0)) return null;
                return (
                  <CertificationsSection key="certifications" profile={draftProfile} theme={theme} />
                );

              case 'volunteer':
                if (!isEditing && sharing.volunteer === false) return null;
                if (!isEditing && (!draftProfile.volunteerExperiences || draftProfile.volunteerExperiences.length === 0)) return null;
                return (
                  <VolunteerSection key="volunteer" profile={draftProfile} theme={theme} />
                );

              case 'languages':
                if (!isEditing && sharing.languages === false) return null;
                if (!isEditing && (!draftProfile.languages || draftProfile.languages.length === 0)) return null;
                return (
                  <LanguagesSection key="languages" profile={draftProfile} theme={theme} />
                );

              case 'recommendations':
                if (!isEditing && sharing.recommendations === false) return null;
                return (
                  <RecommendationsSection key="recommendations" profile={draftProfile} theme={theme} />
                );

              case 'virtual-card':
                if (!isEditing && sharing.nfcCard === false) return null;
                return (
                  <div key="virtual-card" id="virtual-card-section" className={`px-6 sm:px-8 py-6 ${theme.cardBg} border-t ${theme.divider} transition-colors`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
                        Virtual Card Preview
                      </h2>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} font-bold font-mono`}>
                        Digital Identity
                      </span>
                    </div>

                    <NFCCardPreview
                      profile={draftProfile}
                      onViewCompany={onViewCompany}
                      onDownloadCard={onSaveContact}
                      onOpenShare={onOpenShare}
                      isDark={isDark}
                      theme={theme}
                    />
                  </div>
                );

              default:
                return null;
            }
          };

          if (viewMode === 'web') {
            const leftKeys = ['company', 'about', 'contact', 'virtual-card'];
            const leftSections = effectiveOrder.filter((k) => leftKeys.includes(k));
            const rightSections = effectiveOrder.filter((k) => !leftKeys.includes(k));

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-slate-200/80 dark:border-zinc-800/80 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-zinc-800/80">
                <div className="lg:col-span-5 flex flex-col">
                  {leftSections.map(renderSection)}
                </div>
                <div className="lg:col-span-7 flex flex-col">
                  {rightSections.map(renderSection)}
                </div>
              </div>
            );
          }

          return effectiveOrder.map(renderSection);
        })()}

        {/* ========================================================================= */}
        {/* 13. FOOTER: ONLY "Powered by Avtive"                                     */}
        {/* ========================================================================= */}
        <div className={`py-5 px-6 text-center ${theme.cardBg} border-t ${theme.divider} transition-colors`}>
          <div className={`flex items-center justify-center gap-1 text-xs ${theme.textSecondary}`}>
            <span>Powered by</span>
            <a
              href="https://www.avtive.app"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-bold ${theme.accentText} hover:underline transition-colors`}
            >
              Avtive
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
