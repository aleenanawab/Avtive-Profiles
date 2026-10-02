'use client';

import React from 'react';
import { ProfileData, EducationItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

interface EducationSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function EducationSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  isEditing = false,
  onUpdateField,
  onSelectSection
}: EducationSectionProps) {
  const educationList: EducationItem[] = profile.education || [];
  const hasEducation = educationList.length > 0;

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      year: '2020 - 2024',
      period: '2020 - 2024',
      description: ''
    };
    const updated = [newEdu, ...educationList];
    onUpdateField?.('education', updated);
  };

  const handleUpdateItem = (id: string, field: keyof EducationItem, value: string) => {
    const updated = educationList.map((edu) => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    onUpdateField?.('education', updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = educationList.filter((edu) => edu.id !== id);
    onUpdateField?.('education', updated);
  };

  return (
    <section 
      className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Education
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleAddEducation}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 pt-1">
          {educationList.length === 0 ? (
            <div className={`p-5 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No education credentials added yet.</p>
              <button
                type="button"
                onClick={handleAddEducation}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add First Education
              </button>
            </div>
          ) : (
            educationList.map((edu, idx) => (
              <div
                key={edu.id || idx}
                className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 relative group/item shadow-2xs`}
              >
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>
                    Degree #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(edu.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove this education entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Degree / Qualification
                    </label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => handleUpdateItem(edu.id, 'degree', e.target.value)}
                      placeholder="e.g. B.S. Computer Science"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      School / University
                    </label>
                    <input
                      type="text"
                      value={edu.institution || (edu as any).school || ''}
                      onChange={(e) => handleUpdateItem(edu.id, 'institution', e.target.value)}
                      placeholder="e.g. Stanford University"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Year / Period
                    </label>
                    <input
                      type="text"
                      value={edu.period || edu.year || ''}
                      onChange={(e) => {
                        handleUpdateItem(edu.id, 'period', e.target.value);
                        handleUpdateItem(edu.id, 'year', e.target.value);
                      }}
                      placeholder="e.g. 2018 - 2022"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Description / Honors
                    </label>
                    <input
                      type="text"
                      value={edu.description || ''}
                      onChange={(e) => handleUpdateItem(edu.id, 'description', e.target.value)}
                      placeholder="e.g. Magna Cum Laude"
                      className={`w-full p-2 rounded-xl text-xs ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : hasEducation ? (
        <div className="space-y-3">
          {educationList.map((edu) => (
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
                    {edu.institution || (edu as any).school}
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
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No education details added yet.
          </p>
        </div>
      )}
    </section>
  );
}
