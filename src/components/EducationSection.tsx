'use client';

import React from 'react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';
import { GraduationCap } from 'lucide-react';

interface EducationSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
}

export function EducationSection({ profile, theme = getThemeConfig(profile.theme || 'elegant') }: EducationSectionProps) {
  if (!profile.education || profile.education.length === 0) {
    return null;
  }

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <div className="flex items-center gap-2">
        <GraduationCap className={`w-4 h-4 ${theme.accentText}`} />
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Education
        </h2>
      </div>

      <div className="space-y-3">
        {profile.education.map((edu) => (
          <div
            key={edu.id}
            className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-1.5 shadow-2xs`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`text-sm font-bold ${theme.textPrimary}`}>
                  {edu.degree}
                </h3>
                <p className={`text-xs font-semibold ${theme.accentText} mt-0.5`}>
                  {edu.institution}
                </p>
              </div>

              {(edu.period || edu.year) && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} border ${theme.cardBorder} shrink-0 font-mono`}>
                  {edu.period || edu.year}
                </span>
              )}
            </div>

            {edu.description && (
              <p className={`text-xs ${theme.textSecondary} leading-relaxed pt-1`}>
                {edu.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
