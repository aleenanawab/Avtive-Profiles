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
import { ContactSection } from './ContactSection';
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
  isDark
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
    <div className="relative w-full pb-20 sm:pb-8 text-left">
      {/* Main Profile Container Card with dynamic theme styling */}
      <div className={`w-full rounded-[28px] sm:rounded-[36px] border overflow-hidden transition-all duration-300 ${theme.container}`}>
        
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
        {/* 2. SUBTLE COMPANY CONNECTION CARD                                         */}
        {/* ========================================================================= */}
        {!isCompany && draftProfile.companyInfo && onViewCompany && (
          <CompanyCard
            companyInfo={draftProfile.companyInfo}
            onViewCompany={() => onViewCompany(draftProfile.companyId || 'avtive-company')}
            theme={theme}
          />
        )}

        {/* ========================================================================= */}
        {/* 3. ABOUT SECTION                                                         */}
        {/* ========================================================================= */}
        <AboutSection 
          profile={draftProfile} 
          isEditing={isEditing}
          onUpdateField={handleFieldUpdate}
          theme={theme}
        />

        {/* ========================================================================= */}
        {/* 4. SERVICES SECTION                                                      */}
        {/* ========================================================================= */}
        <SkillsServicesSection
          profile={draftProfile}
          isEditing={isEditing}
          onUpdateField={handleFieldUpdate}
          onInquireService={onInquireService}
          theme={theme}
        />

        {/* ========================================================================= */}
        {/* 5. PROFESSIONAL EXPERIENCE                                               */}
        {/* ========================================================================= */}
        <ExperienceSection profile={draftProfile} theme={theme} />

        {/* ========================================================================= */}
        {/* 6. SELECTED PROJECTS / WORK                                              */}
        {/* ========================================================================= */}
        <PortfolioSection
          profile={draftProfile}
          onSelectProject={onSelectProject}
          theme={theme}
        />

        {/* ========================================================================= */}
        {/* 7. CERTIFICATIONS                                                        */}
        {/* ========================================================================= */}
        <CertificationsSection profile={draftProfile} theme={theme} />

        {/* ========================================================================= */}
        {/* 8. VOLUNTEER EXPERIENCE                                                  */}
        {/* ========================================================================= */}
        <VolunteerSection profile={draftProfile} theme={theme} />

        {/* ========================================================================= */}
        {/* 9. LANGUAGES                                                             */}
        {/* ========================================================================= */}
        <LanguagesSection profile={draftProfile} theme={theme} />

        {/* ========================================================================= */}
        {/* 10. RECOMMENDATIONS                                                      */}
        {/* ========================================================================= */}
        <RecommendationsSection profile={draftProfile} theme={theme} />

        {/* ========================================================================= */}
        {/* 11. COMPANY SPECIAL: Live Team Directory                                 */}
        {/* ========================================================================= */}
        {isCompany && draftProfile.teamMembers && (
          <TeamSection
            profile={draftProfile}
            onSelectTeamMember={onSelectTeamMember}
            theme={theme}
          />
        )}

        {/* ========================================================================= */}
        {/* 12. VIRTUAL CARD (Requirement #16 & #24)                                  */}
        {/* ========================================================================= */}
        <div id="virtual-card-section" className={`px-6 sm:px-8 py-6 ${theme.cardBg} border-t ${theme.divider} transition-colors`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
              VIRTUAL CARD
            </h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} font-bold font-mono`}>
              Digital Identity
            </span>
          </div>

          <NFCCardPreview
            profile={draftProfile}
            onViewCompany={onViewCompany}
            onDownloadCard={onSaveContact}
            isDark={isDark}
            theme={theme}
          />
        </div>

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

      {/* ========================================================================= */}
      {/* STICKY BOTTOM MOBILE ACTION BAR                                          */}
      {/* ========================================================================= */}
      {!isEditing && (
        <div className={`sm:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 ${theme.cardBg}/95 backdrop-blur-lg border-t ${theme.divider} flex items-center justify-around gap-2 shadow-lg transition-colors`}>
          {isCompany ? (
            onOpenMyCard && (
              <button
                onClick={onOpenMyCard}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl ${theme.cardBg} text-xs font-bold ${theme.textPrimary} border ${theme.cardBorder} active:scale-95 transition-transform`}
              >
                <CreditCard className={`w-3.5 h-3.5 ${theme.accentText}`} />
                <span>My Card</span>
              </button>
            )
          ) : (
            onViewCompany && (
              <button
                onClick={() => onViewCompany(draftProfile.companyId || 'avtive-company')}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl ${theme.cardBg} text-xs font-bold ${theme.textPrimary} border ${theme.cardBorder} active:scale-95 transition-transform`}
              >
                <Building2 className={`w-3.5 h-3.5 ${theme.accentText}`} />
                <span className="truncate max-w-[70px]">{companyName}</span>
              </button>
            )
          )}

          {draftProfile.phone && (
            <a
              href={`tel:${draftProfile.phone.replace(/[^0-9+]/g, '')}`}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl ${theme.cardBg} text-xs font-bold ${theme.textPrimary} border ${theme.cardBorder} active:scale-95 transition-transform`}
            >
              <Phone className={`w-3.5 h-3.5 ${theme.accentText}`} />
              <span>Call</span>
            </a>
          )}

          {draftProfile.whatsapp && (
            <a
              href={`https://wa.me/${draftProfile.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(draftProfile.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl ${theme.cardBg} text-xs font-bold ${theme.textPrimary} border ${theme.cardBorder} active:scale-95 transition-transform`}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${theme.accentText}`} />
              <span>WhatsApp</span>
            </a>
          )}

          <button
            onClick={onSaveContact}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl ${theme.btnPrimary} text-xs font-bold shadow-xs active:scale-95 transition-all`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      )}
    </div>
  );
}
