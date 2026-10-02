'use client';

import React from 'react';
import { Briefcase, Plus, Trash2, Pencil } from 'lucide-react';
import { ProfileData, ExperienceItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface ExperienceSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function ExperienceSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  isEditing = false,
  onUpdateField,
  onSelectSection
}: ExperienceSectionProps) {
  const experiences: ExperienceItem[] = (profile.experiences && profile.experiences.length > 0)
    ? profile.experiences
    : (profile.experience && profile.experience.length > 0)
    ? profile.experience
    : [];
  const hasExperience = experiences.length > 0;

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      period: '2023 - Present',
      location: '',
      description: ''
    };
    const updated = [newExp, ...experiences];
    onUpdateField?.('experiences', updated);
    onUpdateField?.('experience', updated);
  };

  const handleUpdateItem = (id: string, field: keyof ExperienceItem, value: string) => {
    const updated = experiences.map((exp) => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onUpdateField?.('experiences', updated);
    onUpdateField?.('experience', updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = experiences.filter((exp) => exp.id !== id);
    onUpdateField?.('experiences', updated);
    onUpdateField?.('experience', updated);
  };

  return (
    <section 
      className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Experience
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleAddExperience}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 pt-1">
          {experiences.length === 0 ? (
            <div className={`p-5 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No work experience listed yet.</p>
              <button
                type="button"
                onClick={handleAddExperience}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add First Experience
              </button>
            </div>
          ) : (
            experiences.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 relative group/item shadow-2xs`}
              >
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>
                    Role #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(exp.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove this experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => handleUpdateItem(exp.id, 'company', e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={exp.role || ''}
                      onChange={(e) => handleUpdateItem(exp.id, 'role', e.target.value)}
                      placeholder="e.g. Product Lead"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Period / Timeframe
                    </label>
                    <input
                      type="text"
                      value={exp.period || ''}
                      onChange={(e) => handleUpdateItem(exp.id, 'period', e.target.value)}
                      placeholder="e.g. 2021 - Present"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => handleUpdateItem(exp.id, 'location', e.target.value)}
                      placeholder="e.g. New York, Remote"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                    Responsibilities & Achievements
                  </label>
                  <textarea
                    rows={2}
                    value={exp.description || ''}
                    onChange={(e) => handleUpdateItem(exp.id, 'description', e.target.value)}
                    placeholder="Describe what you worked on..."
                    className={`w-full p-2 rounded-xl text-xs ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      ) : hasExperience ? (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-1.5 shadow-2xs`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={`text-sm font-bold ${theme.textPrimary}`}>
                    {exp.company}
                  </h3>
                  {exp.role && (
                    <p className={`text-xs font-semibold ${theme.accentText} mt-0.5`}>
                      {exp.role}
                    </p>
                  )}
                </div>

                {exp.period && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} border ${theme.cardBorder} shrink-0 font-mono`}>
                    {exp.period}
                  </span>
                )}
              </div>

              {exp.location && (
                <p className={`text-[11px] ${theme.textSecondary} font-medium`}>
                  {exp.location}
                </p>
              )}

              {exp.description && (
                <p className={`text-xs ${theme.textSecondary} leading-relaxed pt-1`}>
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No work experience added yet.
          </p>
        </div>
      )}
    </section>
  );
}
