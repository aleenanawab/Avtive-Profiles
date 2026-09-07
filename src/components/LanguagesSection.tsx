'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface LanguagesSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
}

export function LanguagesSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant') 
}: LanguagesSectionProps) {
  if (!profile.languages || profile.languages.length === 0) {
    return null;
  }

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-3 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
        Languages
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {profile.languages.map((lang, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} flex items-center justify-between gap-2 shadow-2xs`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg ${theme.badgeBg} ${theme.accentText} flex items-center justify-center shrink-0`}>
                <Languages className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${theme.textPrimary}`}>
                  {lang.language}
                </h4>
                <p className={`text-[10px] ${theme.textSecondary}`}>
                  {lang.proficiency}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
