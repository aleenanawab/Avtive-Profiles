'use client';

import React from 'react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface AboutSectionProps {
  profile: ProfileData;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  theme?: ThemeConfig;
}

export function AboutSection({ 
  profile, 
  isEditing = false, 
  onUpdateField,
  theme = getThemeConfig(profile.theme || 'elegant')
}: AboutSectionProps) {
  if (!profile.fullBio && !profile.shortBio && !isEditing) {
    return null;
  }

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-2 text-left border-b ${theme.divider} ${theme.cardBg} transition-colors`}>
      <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
        ABOUT
      </h2>

      {isEditing ? (
        <div className="space-y-1">
          <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
            Professional Story / Bio
          </label>
          <textarea
            rows={4}
            value={profile.fullBio || profile.shortBio || ''}
            onChange={(e) => onUpdateField?.('fullBio', e.target.value)}
            placeholder="Write your background, experience, accomplishments, or philosophy..."
            className={`w-full p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-transparent text-xs sm:text-sm ${theme.textSecondary} focus:outline-none focus:border-current`}
          />
        </div>
      ) : (
        <p className={`text-xs sm:text-sm ${theme.textSecondary} leading-relaxed font-normal`}>
          {profile.fullBio || profile.shortBio}
        </p>
      )}
    </section>
  );
}

