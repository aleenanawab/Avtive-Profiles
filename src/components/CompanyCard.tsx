'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CompanyInfo } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface CompanyCardProps {
  companyInfo: CompanyInfo;
  onViewCompany: () => void;
  theme?: ThemeConfig;
}

export function CompanyCard({ companyInfo, onViewCompany, theme = getThemeConfig('elegant') }: CompanyCardProps) {
  return (
    <section className={`px-6 sm:px-8 py-3.5 ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <div
        onClick={onViewCompany}
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
