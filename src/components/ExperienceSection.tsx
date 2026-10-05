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
  const experiences = (profile.experiences && profile.experiences.length > 0)
    ? profile.experiences
    : (profile.experience && profile.experience.length > 0)
    ? profile.experience
    : [];
  const hasExperience = experiences.length > 0;

  if (!hasExperience && !canEdit) {
    return null;
  }

  return (
    <section 
      onClick={() => canEdit && onSelectSection?.('experience')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${canEdit ? 'cursor-pointer hover:bg-accent/5 transition-all' : ''}`}
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

      {hasExperience ? (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-1.5 shadow-2xs`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={`text-sm font-bold ${theme.textPrimary}`}>
                    {exp.company}
                  </h3>
                  {exp.role && (
                    <p className={`text-xs font-semibold ${theme.accentText} mt-0.5`}>
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
                <p className={`text-[11px] ${theme.textSecondary} font-medium`}>
                  {exp.location}
                </p>
              )}

              {exp.description && (
                <p className={`text-xs ${theme.textSecondary} leading-relaxed pt-1`}>
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No work experience added yet.
          </p>
        </div>
      )}
    </section>
  );
}
