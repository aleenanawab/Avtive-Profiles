'use client';

import React from 'react';
import { Languages, Plus, X } from 'lucide-react';
import { ProfileData, LanguageItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface LanguagesSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function LanguagesSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  isEditing = false,
  onUpdateField,
  onSelectSection
}: LanguagesSectionProps) {
  const languages: LanguageItem[] = profile.languages || [];
  const hasLanguages = languages.length > 0;

  if (!hasLanguages && !canEdit && !isEditing) {
    return null;
  }

  const handleAddLanguage = () => {
    const newLang: LanguageItem = {
      language: 'New Language',
      proficiency: 'Professional Working'
    };
    const updated = [...languages, newLang];
    onUpdateField?.('languages', updated);
  };

  const handleUpdateLanguage = (index: number, updates: Partial<LanguageItem>) => {
    const updated = languages.map((l, idx) => (idx === index ? { ...l, ...updates } : l));
    onUpdateField?.('languages', updated);
  };

  const handleRemoveLanguage = (index: number) => {
    const updated = languages.filter((_, idx) => idx !== index);
    onUpdateField?.('languages', updated);
  };

  return (
    <section 
      onClick={() => canEdit && !isEditing && onSelectSection?.('languages')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && !isEditing && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Languages
        </h2>
        {isEditing ? (
          <button
            type="button"
            onClick={handleAddLanguage}
            className={`flex items-center gap-1 text-[11px] font-bold ${theme.accentText} hover:underline cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Language</span>
          </button>
        ) : (
          canEdit && onSelectSection && (
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
              Click to edit
            </span>
          )
        )}
      </div>

      {hasLanguages ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {languages.map((lang, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xs`}
            >
              {isEditing ? (
                /* Editable Language Item */
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1.5">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          Language
                        </label>
                        <input
                          type="text"
                          value={lang.language || ''}
                          onChange={(e) => handleUpdateLanguage(idx, { language: e.target.value })}
                          placeholder="e.g. English, French, Spanish"
                          className={`w-full text-xs font-bold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          Proficiency
                        </label>
                        <input
                          type="text"
                          value={lang.proficiency || ''}
                          onChange={(e) => handleUpdateLanguage(idx, { proficiency: e.target.value })}
                          placeholder="e.g. Native / Professional Working / Fluent"
                          className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                      title="Remove language"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* View Language Item */
                <div className="flex items-center justify-between gap-2">
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
              )}
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
