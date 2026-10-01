'use client';

import React from 'react';
import { Languages, Plus, Trash2 } from 'lucide-react';
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
  const languagesList: LanguageItem[] = profile.languages || [];
  const hasLanguages = languagesList.length > 0;

  const handleAddLanguage = () => {
    const newLang: LanguageItem = {
      language: '',
      proficiency: 'Fluent'
    };
    const updated = [newLang, ...languagesList];
    onUpdateField?.('languages', updated);
  };

  const handleUpdateItem = (index: number, field: keyof LanguageItem, value: string) => {
    const updated = languagesList.map((lang, idx) => 
      idx === index ? { ...lang, [field]: value } : lang
    );
    onUpdateField?.('languages', updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = languagesList.filter((_, idx) => idx !== index);
    onUpdateField?.('languages', updated);
  };

  return (
    <section 
      className={`px-6 sm:px-8 py-5 space-y-3 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Languages
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleAddLanguage}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Language</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3 pt-1">
          {languagesList.length === 0 ? (
            <div className={`p-4 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No languages listed yet.</p>
              <button
                type="button"
                onClick={handleAddLanguage}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add First Language
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {languagesList.map((lang, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl ${theme.cardBg} border ${theme.cardBorder} space-y-2 relative group/item shadow-2xs`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>
                      Language #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove language"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      value={lang.language || ''}
                      onChange={(e) => handleUpdateItem(idx, 'language', e.target.value)}
                      placeholder="e.g. English, Spanish"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <select
                      value={lang.proficiency || 'Fluent'}
                      onChange={(e) => handleUpdateItem(idx, 'proficiency', e.target.value)}
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    >
                      <option value="Native / Bilingual">Native / Bilingual</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Full Professional">Full Professional</option>
                      <option value="Professional Working">Professional Working</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Elementary / Basic">Elementary / Basic</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : hasLanguages ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {languagesList.map((lang, idx) => (
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
