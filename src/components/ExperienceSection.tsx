'use client';

import React from 'react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface ExperienceSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
  canEdit?: boolean;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function ExperienceSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  onSelectSection
}: ExperienceSectionProps) {
  if (!profile.experiences || profile.experiences.length === 0) {
    return null;
  }

  return (
    <section 
      onClick={() => canEdit && onSelectSection?.('experience')}
      className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${canEdit ? 'cursor-pointer hover:ring-1 hover:ring-emerald-500/40 rounded-xl transition-all' : ''}`}
    >
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Experience
        </h2>
        {canEdit && (
          <span className="text-[10px] font-mono text-emerald-500 opacity-80 hover:opacity-100">
            Click to edit ↗
          </span>
        )}
      </div>

      <div className="space-y-3">
        {profile.experiences.map((exp) => (
          <div
            key={exp.id}
            className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-1.5 shadow-2xs`}
          >
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className={`text-sm font-bold ${theme.textPrimary} break-words`}>
                  {exp.company}
                </h3>
                {exp.role && (
                  <p className={`text-xs font-semibold ${theme.accentText} mt-0.5 break-words`}>
                    {exp.role}
                  </p>
                )}
              </div>

              {exp.period && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} border ${theme.cardBorder} shrink-0 font-mono`}>
                  {exp.period}
                </span>
              )}
            </div>

            {exp.location && (
              <p className={`text-[11px] ${theme.textSecondary} font-medium break-words`}>
                {exp.location}
              </p>
            )}

            {exp.description && (
              <p className={`text-xs ${theme.textSecondary} leading-relaxed pt-1 break-words`}>
                {exp.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
