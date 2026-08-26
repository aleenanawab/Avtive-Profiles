'use client';

import React from 'react';
import { Phone, MessageSquare, UserPlus, CreditCard, Building2 } from 'lucide-react';
import { ProfileData, ProjectItem, ServiceItem, TeamMemberItem, NavigationOrigin } from '../types/profile';
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

interface AvtiveDigitalCardProps {
  profile: ProfileData;
  navigationOrigin?: NavigationOrigin;
  canEdit?: boolean;
  onOpenEdit?: () => void;
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
  onOpenEdit,
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
  const isIndividual = profile.type === 'individual';
  const isTeamMember = profile.type === 'team-member';
  const isCompany = profile.type === 'company';
  const companyName = profile.company || profile.companyInfo?.name || 'Avtive';

  return (
    <div className="relative w-full pb-20 sm:pb-8 text-left">
      {/* Main Profile Container Card */}
      <div className="w-full rounded-[28px] sm:rounded-[36px] bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/10 shadow-lg overflow-hidden transition-all duration-300">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Includes Direct Contact section immediately below CTA)   */}
        {/* ========================================================================= */}
        <HeroSection
          profile={profile}
          navigationOrigin={navigationOrigin}
          canEdit={canEdit}
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
        />

        {/* ========================================================================= */}
        {/* 2. SUBTLE COMPANY CONNECTION CARD                                         */}
        {/* ========================================================================= */}
        {!isCompany && profile.companyInfo && onViewCompany && (
          <CompanyCard
            companyInfo={profile.companyInfo}
            onViewCompany={() => onViewCompany(profile.companyId || 'avtive-company')}
          />
        )}

        {/* ========================================================================= */}
        {/* 3. ABOUT SECTION                                                         */}
        {/* ========================================================================= */}
        <AboutSection profile={profile} />

        {/* ========================================================================= */}
        {/* 4. SERVICES SECTION (Simplified Heading: SERVICES)                       */}
        {/* ========================================================================= */}
        <SkillsServicesSection
          profile={profile}
          onInquireService={onInquireService}
        />

        {/* ========================================================================= */}
        {/* 5. PROFESSIONAL EXPERIENCE                                               */}
        {/* ========================================================================= */}
        <ExperienceSection profile={profile} />

        {/* ========================================================================= */}
        {/* 6. SELECTED PROJECTS / WORK                                              */}
        {/* ========================================================================= */}
        <PortfolioSection
          profile={profile}
          onSelectProject={onSelectProject}
        />

        {/* ========================================================================= */}
        {/* 7. CERTIFICATIONS                                                        */}
        {/* ========================================================================= */}
        <CertificationsSection profile={profile} />

        {/* ========================================================================= */}
        {/* 8. VOLUNTEER EXPERIENCE                                                  */}
        {/* ========================================================================= */}
        <VolunteerSection profile={profile} />

        {/* ========================================================================= */}
        {/* 9. LANGUAGES                                                             */}
        {/* ========================================================================= */}
        <LanguagesSection profile={profile} />

        {/* ========================================================================= */}
        {/* 10. RECOMMENDATIONS                                                      */}
        {/* ========================================================================= */}
        <RecommendationsSection profile={profile} />

        {/* ========================================================================= */}
        {/* 11. COMPANY SPECIAL: Live Team Directory                                 */}
        {/* ========================================================================= */}
        {isCompany && profile.teamMembers && (
          <TeamSection
            profile={profile}
            onSelectTeamMember={onSelectTeamMember}
          />
        )}

        {/* ========================================================================= */}
        {/* 12. VIRTUAL CARD (Requirement #16 & #24)                                  */}
        {/* ========================================================================= */}
        <div id="virtual-card-section" className="px-6 sm:px-8 py-6 bg-[#F8FAFC] dark:bg-[#060B1E] border-t border-[#E2E8F0] dark:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
              VIRTUAL CARD
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E3A8A]/10 dark:bg-white/10 text-[#1E3A8A] dark:text-[#60A5FA] font-bold font-mono">
              Digital Identity
            </span>
          </div>

          <NFCCardPreview
            profile={profile}
            onViewCompany={onViewCompany}
            onDownloadCard={onSaveContact}
            isDark={isDark}
          />
        </div>

        {/* ========================================================================= */}
        {/* 13. FOOTER: ONLY "Powered by Avtive"                                     */}
        {/* ========================================================================= */}
        <div className="py-5 px-6 text-center bg-[#F8FAFC] dark:bg-[#060B1E] border-t border-[#E2E8F0] dark:border-white/10 transition-colors">
          <div className="flex items-center justify-center gap-1 text-xs text-[#475569] dark:text-[#94A3B8]">
            <span>Powered by</span>
            <a
              href="https://www.avtive.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#1E3A8A] dark:text-[#60A5FA] hover:underline transition-colors"
            >
              Avtive
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STICKY BOTTOM MOBILE ACTION BAR                                          */}
      {/* ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 bg-white/95 dark:bg-[#0A1128]/95 backdrop-blur-lg border-t border-[#E2E8F0] dark:border-white/10 flex items-center justify-around gap-2 shadow-lg transition-colors">
        {isCompany ? (
          onOpenMyCard && (
            <button
              onClick={onOpenMyCard}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#152238] text-xs font-bold text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 active:scale-95 transition-transform"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>My Card</span>
            </button>
          )
        ) : (
          onViewCompany && (
            <button
              onClick={() => onViewCompany(profile.companyId || 'avtive-company')}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#152238] text-xs font-bold text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 active:scale-95 transition-transform"
            >
              <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="truncate max-w-[70px]">{companyName}</span>
            </button>
          )
        )}

        {profile.phone && (
          <a
            href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#152238] text-xs font-bold text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 active:scale-95 transition-transform"
          >
            <Phone className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Call</span>
          </a>
        )}

        {profile.whatsapp && (
          <a
            href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(profile.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#152238] text-xs font-bold text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 active:scale-95 transition-transform"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp</span>
          </a>
        )}

        <button
          onClick={onSaveContact}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A1128] text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#7EC384]" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}
