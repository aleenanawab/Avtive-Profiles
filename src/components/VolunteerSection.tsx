'use client';

import React from 'react';
import { HeartHandshake } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface VolunteerSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
}

export function VolunteerSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant') 
}: VolunteerSectionProps) {
  if (!profile.volunteerExperiences || profile.volunteerExperiences.length === 0) {
    return null;
  }

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
        Volunteer Experience
      </h2>

      <div className="space-y-2.5">
        {profile.volunteerExperiences.map((vol) => (
          <div
            key={vol.id}
            className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} flex items-start gap-3.5 shadow-2xs`}
          >
            <div className={`w-9 h-9 rounded-xl ${theme.badgeBg} ${theme.accentText} flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
              <HeartHandshake className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`text-xs sm:text-sm font-bold ${theme.textPrimary}`}>
                  {vol.role}
                </h3>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} border ${theme.subCardBorder} shrink-0 font-mono`}>
                  {vol.period}
                </span>
              </div>

              <p className={`text-xs font-semibold ${theme.accentText}`}>
                {vol.organization}
              </p>

              {vol.category && (
                <p className={`text-[10px] ${theme.textMuted} font-mono`}>
                  {vol.category}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
