'use client';

import React from 'react';
import { Plus, X, GraduationCap } from 'lucide-react';
import { ProfileData, EducationItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

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

  if (!hasEducation && !canEdit && !isEditing) {
    return null;
  }

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: 'Degree / Program',
      institution: 'University / Institution',
      period: '2019 - 2023',
      description: ''
    };
    const updated = [newEdu, ...educationList];
    onUpdateField?.('education', updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<EducationItem>) => {
    const updated = educationList.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu));
    onUpdateField?.('education', updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = educationList.filter((edu) => edu.id !== id);
    onUpdateField?.('education', updated);
  };

  return (
    <section 
      onClick={() => canEdit && !isEditing && onSelectSection?.('education')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && !isEditing ? 'cursor-pointer hover:bg-accent/5 transition-all' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Education
        </h2>
        {isEditing ? (
          <button
            type="button"
            onClick={handleAddEducation}
            className={`flex items-center gap-1 text-[11px] font-bold ${theme.accentText} hover:underline cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        ) : (
          canEdit && onSelectSection && (
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-medium">
              Click to edit
            </span>
          )
        )}
      </div>

      {hasEducation ? (
        <div className="space-y-3">
          {educationList.map((edu) => (
            <div
              key={edu.id}
              className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-2 shadow-2xs relative`}
            >
              {isEditing ? (
                /* Editable Education Card */
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          Degree / Certification
                        </label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => handleUpdateItem(edu.id, { degree: e.target.value })}
                          placeholder="e.g. B.S. in Computer Science"
                          className={`w-full text-xs font-semibold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          School / Institution
                        </label>
                        <input
                          type="text"
                          value={edu.institution || (edu as any).school || ''}
                          onChange={(e) => handleUpdateItem(edu.id, { institution: e.target.value })}
                          placeholder="e.g. Stanford University"
                          className={`w-full text-xs font-bold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary}`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(edu.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                      title="Remove education"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                      Graduation Year / Period
                    </label>
                    <input
                      type="text"
                      value={edu.period || edu.year || ''}
                      onChange={(e) => handleUpdateItem(edu.id, { period: e.target.value, year: e.target.value })}
                      placeholder="e.g. 2019 - 2023"
                      className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                      Notes / Honors / Activities
                    </label>
                    <textarea
                      rows={2}
                      value={edu.description || ''}
                      onChange={(e) => handleUpdateItem(edu.id, { description: e.target.value })}
                      placeholder="Honors, thesis, activities, or coursework..."
                      className={`w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                    />
                  </div>
                </div>
              ) : (
                /* View Education Card */
                <>
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
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center space-y-2`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No education details added yet.
          </p>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddEducation}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed ${theme.cardBorder} text-xs font-bold ${theme.accentText} hover:opacity-80 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add your first education</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
