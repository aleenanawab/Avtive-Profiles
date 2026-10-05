'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface LanguagesSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
  canEdit?: boolean;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function LanguagesSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  onSelectSection
}: LanguagesSectionProps) {
  const hasLanguages = profile.languages && profile.languages.length > 0;

  if (!hasLanguages && !canEdit) {
    return null;
  }

  return (
    <section 
      onClick={() => canEdit && onSelectSection?.('languages')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Languages
        </h2>
        {canEdit && onSelectSection && (
          <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
            Click to edit
          </span>
        )}
      </div>

      {hasLanguages ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {profile.languages!.map((lang, idx) => (
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
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No language proficiencies added yet.
          </p>
        </div>
      )}
    </section>
  );
}
