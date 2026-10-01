'use client';

import React from 'react';
import { HeartHandshake, Plus, Trash2 } from 'lucide-react';
import { ProfileData, VolunteerItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface VolunteerSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function VolunteerSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  isEditing = false,
  onUpdateField,
  onSelectSection
}: VolunteerSectionProps) {
  const volunteerList: VolunteerItem[] = profile.volunteerExperiences || (profile as any).volunteer || [];
  const hasVolunteer = volunteerList.length > 0;

  const handleAddVolunteer = () => {
    const newVol: VolunteerItem = {
      id: `vol-${Date.now()}`,
      role: '',
      organization: '',
      period: '2022 - Present',
      category: 'Community Service'
    };
    const updated = [newVol, ...volunteerList];
    onUpdateField?.('volunteerExperiences', updated);
    onUpdateField?.('volunteer' as any, updated);
  };

  const handleUpdateItem = (id: string, field: keyof VolunteerItem, value: string) => {
    const updated = volunteerList.map((vol) => 
      vol.id === id ? { ...vol, [field]: value } : vol
    );
    onUpdateField?.('volunteerExperiences', updated);
    onUpdateField?.('volunteer' as any, updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = volunteerList.filter((vol) => vol.id !== id);
    onUpdateField?.('volunteerExperiences', updated);
    onUpdateField?.('volunteer' as any, updated);
  };

  return (
    <section 
      className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartHandshake className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Volunteer Experience
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleAddVolunteer}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Volunteer Role</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 pt-1">
          {volunteerList.length === 0 ? (
            <div className={`p-5 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No volunteer experiences added yet.</p>
              <button
                type="button"
                onClick={handleAddVolunteer}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add Volunteer Role
              </button>
            </div>
          ) : (
            volunteerList.map((vol, idx) => (
              <div
                key={vol.id || idx}
                className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 relative group/item shadow-2xs`}
              >
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>
                    Volunteer Role #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(vol.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove this volunteer experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Role / Position
                    </label>
                    <input
                      type="text"
                      value={vol.role || ''}
                      onChange={(e) => handleUpdateItem(vol.id, 'role', e.target.value)}
                      placeholder="e.g. Mentor / Organizer"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Organization / Initiative
                    </label>
                    <input
                      type="text"
                      value={vol.organization || ''}
                      onChange={(e) => handleUpdateItem(vol.id, 'organization', e.target.value)}
                      placeholder="e.g. Code for All"
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
                      value={vol.period || ''}
                      onChange={(e) => handleUpdateItem(vol.id, 'period', e.target.value)}
                      placeholder="e.g. 2021 - Present"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Cause / Category
                    </label>
                    <input
                      type="text"
                      value={vol.category || ''}
                      onChange={(e) => handleUpdateItem(vol.id, 'category', e.target.value)}
                      placeholder="e.g. Education, Environment"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : hasVolunteer ? (
        <div className="space-y-2.5">
          {volunteerList.map((vol) => (
            <div
              key={vol.id}
              className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} flex items-start gap-3.5 shadow-2xs`}
            >
              <div className={`w-9 h-9 rounded-xl ${theme.badgeBg} ${theme.accentText} flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
                <HeartHandshake className="w-4.5 h-4.5" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-xs sm:text-sm font-bold ${theme.textPrimary}`}>
                    {vol.role}
                  </h3>
                  {vol.period && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} border ${theme.cardBorder} shrink-0 font-mono`}>
                      {vol.period}
                    </span>
                  )}
                </div>

                <p className={`text-xs font-semibold ${theme.accentText}`}>
                  {vol.organization}
                </p>

                {vol.category && (
                  <p className={`text-[10px] ${theme.textMuted} font-mono`}>
                    {vol.category}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No volunteer experience added yet.
          </p>
        </div>
      )}
    </section>
  );
}
