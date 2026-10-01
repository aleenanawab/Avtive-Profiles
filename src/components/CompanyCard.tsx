'use client';

import React from 'react';
import { ArrowRight, Building2 } from 'lucide-react';
import { CompanyInfo } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface CompanyCardProps {
  companyInfo?: CompanyInfo | null;
  onViewCompany?: () => void;
  theme?: ThemeConfig;
  canEdit?: boolean;
  onSelectSection?: (sectionId: string) => void;
}

export function CompanyCard({ 
  companyInfo, 
  onViewCompany, 
  theme = getThemeConfig('elegant'),
  canEdit,
  onSelectSection
}: CompanyCardProps) {
  if (!companyInfo || !companyInfo.name) {
    return (
      <section 
        onClick={() => canEdit && onSelectSection?.('company')}
        className={`px-6 sm:px-8 py-3.5 ${theme.cardBg} border-b ${theme.divider} transition-colors ${
          canEdit && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
        }`}
      >
        <div className={`p-3.5 sm:p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-left`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl ${theme.badgeBg} flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
              <Building2 className={`w-6 h-6 ${theme.textMuted}`} />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${theme.textPrimary}`}>
                Company Profile
              </h3>
              <p className={`text-[11px] ${theme.textSecondary} mt-0.5 font-medium italic`}>
                No company profile linked yet.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      onClick={() => canEdit && onSelectSection?.('company')}
      className={`px-6 sm:px-8 py-3.5 ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
      }`}
    >
      <div
        onClick={(e) => {
          if (onViewCompany) {
            onViewCompany();
          }
        }}
        className={`cursor-pointer group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} transition-all shadow-2xs hover:shadow-xs text-left`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-xl ${theme.cardBg} p-2 flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
            <img
              src={companyInfo.logo || '/images/avtive-symbol.png'}
              alt={companyInfo.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-bold ${theme.accentText} group-hover:underline transition-colors truncate`}>
                {companyInfo.name}
              </h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} font-mono`}>
                SaaS Platform
              </span>
            </div>
            <p className={`text-[11px] ${theme.textSecondary} truncate mt-0.5 font-medium`}>
              {companyInfo.tagline}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-1 text-xs font-bold ${theme.textPrimary} shrink-0 ml-3`}>
          <span className="hidden sm:inline">View Company Profile</span>
          <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${theme.accentText}`} />
        </div>
      </div>
    </section>
  );
}
