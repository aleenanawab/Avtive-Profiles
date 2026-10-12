'use client';

import React from 'react';
import { ArrowRight, Building2, Pencil } from 'lucide-react';
import { CompanyInfo, ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface CompanyCardProps {
  companyInfo?: CompanyInfo | null;
  profile?: ProfileData;
  onViewCompany?: () => void;
  theme?: ThemeConfig;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionId: string) => void;
}

export function CompanyCard({ 
  companyInfo, 
  profile,
  onViewCompany, 
  theme = getThemeConfig('editorial'),
  canEdit,
  isEditing = false,
  onUpdateField,
  onSelectSection
}: CompanyCardProps) {
  const currentInfo: CompanyInfo = companyInfo || {
    id: `comp-${Date.now()}`,
    name: profile?.company || '',
    tagline: '',
    logo: profile?.companyLogo || '/images/avtive-symbol.png',
    industry: '',
    location: profile?.location || '',
    website: profile?.website || '',
    employeeCount: '',
    profileId: ''
  };

  const handleUpdate = (updates: Partial<CompanyInfo>) => {
    const nextInfo = { ...currentInfo, ...updates };
    onUpdateField?.('companyInfo', nextInfo);
    if (updates.name !== undefined) {
      onUpdateField?.('company', updates.name);
    }
  };

  if (!isEditing && (!companyInfo || !companyInfo.name)) {
    if (!canEdit) return null;

    return (
      <section 
        onClick={() => canEdit && onSelectSection?.('company')}
        className={`px-4 sm:px-6 md:px-8 py-3.5 ${theme.cardBg} border-b ${theme.divider} transition-colors ${
          canEdit && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
        }`}
      >
        <div className={`p-3.5 sm:p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-left`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl ${theme.badgeBg} flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-xs`}>
              <Building2 className={`w-6 h-6 ${theme.textMuted}`} />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${theme.textPrimary}`}>
                Company Profile
              </h3>
              <p className={`text-[11px] ${theme.textSecondary} mt-0.5 font-medium italic`}>
                No company profile linked yet. Click to configure.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      onClick={() => canEdit && !isEditing && onSelectSection?.('company')}
      className={`px-4 sm:px-6 md:px-8 py-3.5 ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && !isEditing && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
      }`}
    >
      {isEditing ? (
        /* Editable Company Details Card */
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 text-left`}>
          <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Building2 className={`w-4 h-4 ${theme.accentText}`} />
              <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${theme.textPrimary}`}>
                Company & Organization Details
              </h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} font-semibold`}>
              Company Profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                Company Name
              </label>
              <input
                type="text"
                value={currentInfo.name || ''}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                placeholder="e.g. Avtive Technologies Inc."
                className={`w-full text-xs font-bold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                Tagline / Industry Subtitle
              </label>
              <input
                type="text"
                value={currentInfo.tagline || ''}
                onChange={(e) => handleUpdate({ tagline: e.target.value })}
                placeholder="e.g. Next-Generation Identity Cloud"
                className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                Industry
              </label>
              <input
                type="text"
                value={currentInfo.industry || ''}
                onChange={(e) => handleUpdate({ industry: e.target.value })}
                placeholder="e.g. Software · Enterprise SaaS"
                className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                Website URL
              </label>
              <input
                type="text"
                value={currentInfo.website || ''}
                onChange={(e) => handleUpdate({ website: e.target.value })}
                placeholder="e.g. https://company.com"
                className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                Headquarters / Location
              </label>
              <input
                type="text"
                value={currentInfo.location || ''}
                onChange={(e) => handleUpdate({ location: e.target.value })}
                placeholder="e.g. San Francisco, California / Global Remote"
                className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
              />
            </div>
          </div>
        </div>
      ) : (
        /* View Company Details Card */
        <div
          onClick={(e) => {
            if (onViewCompany) {
              onViewCompany();
            }
          }}
          className={`cursor-pointer group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} transition-all shadow-xs hover:shadow-sm text-left`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-xl ${theme.cardBg} p-2 flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
              <img
                src={companyInfo?.logo || '/images/avtive-symbol.png'}
                alt={companyInfo?.name || 'Company'}
                onError={(e) => { e.currentTarget.src = '/images/avtive-symbol.png'; }}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-bold ${theme.accentText} group-hover:underline transition-colors truncate`}>
                  {companyInfo?.name}
                </h3>
                {companyInfo?.industry && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} font-mono`}>
                    {companyInfo.industry}
                  </span>
                )}
              </div>
              <p className={`text-[11px] ${theme.textSecondary} truncate mt-0.5 font-medium`}>
                {companyInfo?.tagline || 'Company Profile'}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-1 text-xs font-bold ${theme.textPrimary} shrink-0 ml-3`}>
            <span className="hidden sm:inline">View Company Profile</span>
            <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${theme.accentText}`} />
          </div>
        </div>
      )}
    </section>
  );
}
