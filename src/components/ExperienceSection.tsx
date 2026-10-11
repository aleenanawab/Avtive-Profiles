'use client';

import React from 'react';
import { Plus, X, Pencil, Briefcase } from 'lucide-react';
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

  if (!hasExperience && !canEdit && !isEditing) {
    return null;
  }

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: 'Company Name',
      role: 'Job Title / Role',
      period: '2023 - Present',
      location: '',
      description: ''
    };
    const updated = [newExp, ...experiences];
    onUpdateField?.('experiences', updated);
    onUpdateField?.('experience', updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<ExperienceItem>) => {
    const updated = experiences.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp));
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
      onClick={() => canEdit && !isEditing && onSelectSection?.('experience')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && !isEditing ? 'cursor-pointer hover:bg-accent/5 transition-all' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Experience
        </h2>
        {isEditing ? (
          <button
            type="button"
            onClick={handleAddExperience}
            className={`flex items-center gap-1 text-[11px] font-bold ${theme.accentText} hover:underline cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        ) : (
          canEdit && (
            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 opacity-80 hover:opacity-100">
              Click to edit ↗
            </span>
          )
        )}
      </div>

      {hasExperience ? (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-2 shadow-2xs relative`}
            >
              {isEditing ? (
                /* Editable Experience Card */
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          Role / Title
                        </label>
                        <input
                          type="text"
                          value={exp.role || ''}
                          onChange={(e) => handleUpdateItem(exp.id, { role: e.target.value })}
                          placeholder="e.g. Lead Designer"
                          className={`w-full text-xs font-semibold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => handleUpdateItem(exp.id, { company: e.target.value })}
                          placeholder="e.g. Acme Corp"
                          className={`w-full text-xs font-bold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary}`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(exp.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                      title="Remove experience"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                        Duration / Period
                      </label>
                      <input
                        type="text"
                        value={exp.period || ''}
                        onChange={(e) => handleUpdateItem(exp.id, { period: e.target.value })}
                        placeholder="e.g. Jan 2021 - Present"
                        className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => handleUpdateItem(exp.id, { location: e.target.value })}
                        placeholder="e.g. San Francisco, CA / Remote"
                        className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                      Description & Accomplishments
                    </label>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) => handleUpdateItem(exp.id, { description: e.target.value })}
                      placeholder="Highlights, achievements, or tech stack used..."
                      className={`w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                    />
                  </div>
                </div>
              ) : (
                /* View Experience Card */
                <>
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
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center space-y-2`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No work experience added yet.
          </p>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddExperience}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed ${theme.cardBorder} text-xs font-bold ${theme.accentText} hover:opacity-80 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add your first work experience</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
