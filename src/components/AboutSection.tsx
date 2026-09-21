import React from 'react';
import { Pencil } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface AboutSectionProps {
  profile: ProfileData;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
  theme?: ThemeConfig;
}

export function AboutSection({ 
  profile, 
  canEdit = false,
  isEditing = false, 
  onUpdateField,
  onSelectSection,
  theme = getThemeConfig(profile.theme || 'elegant')
}: AboutSectionProps) {
  if (!profile.about && !profile.fullBio && !profile.shortBio && !profile.tagline && !isEditing) {
    return null;
  }

  return (
    <section 
      onClick={() => canEdit && onSelectSection?.('about', 'about')}
      className={`px-6 sm:px-8 py-5 space-y-2 text-left border-b ${theme.divider} ${theme.cardBg} transition-all relative ${
        canEdit ? 'cursor-pointer group/about hover:bg-purple-500/[0.04] dark:hover:bg-purple-500/10' : ''
      }`}
      title={canEdit ? 'Click to edit Story & Bio in Studio' : undefined}
    >
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          About
        </h2>
        {canEdit && !isEditing && (
          <span className="opacity-0 group-hover/about:opacity-100 transition-opacity text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Pencil className="w-2.5 h-2.5" />
            Edit Story
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
              Describe yourself best
            </label>
            <input
              type="text"
              value={profile.tagline || ''}
              onChange={(e) => onUpdateField?.('tagline', e.target.value)}
              placeholder="A punchy phrase, personal tagline, or motto that describes you best..."
              className={`w-full p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-transparent text-xs sm:text-sm ${theme.textSecondary} focus:outline-none focus:border-current`}
            />
          </div>
          <div className="space-y-1">
            <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
              Professional Story / Bio
            </label>
            <textarea
              rows={4}
              value={profile.about || profile.fullBio || profile.shortBio || ''}
              onChange={(e) => onUpdateField?.('about', e.target.value)}
              placeholder="Write your background, experience, accomplishments, or philosophy..."
              className={`w-full p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-transparent text-xs sm:text-sm ${theme.textSecondary} focus:outline-none focus:border-current`}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {profile.tagline && (
            <p className={`text-xs sm:text-sm font-medium italic ${theme.accentText}`}>
              &ldquo;{profile.tagline}&rdquo;
            </p>
          )}
          {(profile.about || profile.fullBio || profile.shortBio) && (
            <p className={`text-xs sm:text-sm ${theme.textSecondary} leading-relaxed font-normal whitespace-pre-line`}>
              {profile.about || profile.fullBio || profile.shortBio}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

