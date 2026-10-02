'use client';

import React, { useState } from 'react';
import { Plus, X, Pencil, Wrench } from 'lucide-react';
import { ProfileData, ServiceItem, SkillItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface SkillsServicesSectionProps {
  profile: ProfileData;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onInquireService?: (service: ServiceItem) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
  theme?: ThemeConfig;
}

export function SkillsServicesSection({ 
  profile, 
  canEdit = false,
  isEditing = false,
  onUpdateField,
  onInquireService,
  onSelectSection,
  theme = getThemeConfig(profile.theme || 'elegant')
}: SkillsServicesSectionProps) {
  const [newSkillText, setNewSkillText] = useState('');
  const hasServices = profile.services && profile.services.length > 0;
  const rawSkills = profile.skills || [];
  const hasSkills = rawSkills.length > 0;

  const handleAddService = () => {
    const newService: ServiceItem = {
      id: `svc-${Date.now()}`,
      title: 'New Service',
      badge: 'Available'
    };
    const updated = [...(profile.services || []), newService];
    onUpdateField?.('services', updated);
  };

  const handleRemoveService = (id: string) => {
    const updated = (profile.services || []).filter((s) => s.id !== id);
    onUpdateField?.('services', updated);
  };

  const handleUpdateServiceTitle = (id: string, title: string) => {
    const updated = (profile.services || []).map((s) => (s.id === id ? { ...s, title } : s));
    onUpdateField?.('services', updated);
  };

  const handleAddSkill = () => {
    if (!newSkillText.trim()) return;
    const skillName = newSkillText.trim();
    const updated = [...rawSkills, skillName];
    onUpdateField?.('skills', updated);
    setNewSkillText('');
  };

  const handleRemoveSkill = (index: number) => {
    const updated = rawSkills.filter((_, idx) => idx !== index);
    onUpdateField?.('skills', updated);
  };

  return (
    <section 
      className={`px-6 sm:px-8 py-5 space-y-4 text-left border-b ${theme.divider} ${theme.cardBg} transition-all relative`}
    >
      {/* Services Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className={`w-4 h-4 ${theme.accentText}`} />
            <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
              SERVICES
            </h2>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddService}
              className={`flex items-center gap-1 text-[11px] font-bold ${theme.accentText} hover:underline cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {profile.services?.map((service) => (
            <div
              key={service.id}
              className={`p-3 rounded-xl ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} flex items-center justify-between gap-1 shadow-2xs transition-all`}
            >
              {isEditing ? (
                <div className="flex items-center justify-between w-full gap-2">
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => handleUpdateServiceTitle(service.id, e.target.value)}
                    className={`flex-1 bg-transparent text-xs font-bold ${theme.textPrimary} focus:outline-none border-b border-dashed border-slate-300 dark:border-white/20`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service.id)}
                    className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                    title="Remove Service"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className={`text-xs font-bold ${theme.textPrimary}`}>
                    {service.title}
                  </span>
                  {service.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} font-mono`}>
                      {service.badge}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
          {!hasServices && !isEditing && (
            <div className={`col-span-1 sm:col-span-2 lg:col-span-3 p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
              <p className={`text-xs ${theme.textMuted}`}>
                No services listed yet.
              </p>
            </div>
          )}
          {isEditing && (!profile.services || profile.services.length === 0) && (
            <button
              type="button"
              onClick={handleAddService}
              className={`col-span-1 sm:col-span-2 lg:col-span-3 p-3 rounded-xl border border-dashed ${theme.cardBorder} text-xs font-bold ${theme.textMuted} hover:${theme.accentText} flex items-center justify-center gap-1.5 cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              <span>Add your first service</span>
            </button>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-2.5 pt-2 text-left border-t border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Skills & Expertise
          </h2>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2 pb-2">
            <input
              type="text"
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Type skill & press Add..."
              className={`flex-1 p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className={`px-3 py-2 rounded-xl text-xs font-bold ${theme.btnPrimary} flex items-center gap-1 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        )}

        {hasSkills ? (
          <div className="flex flex-wrap gap-1.5">
            {rawSkills.map((skill, idx) => {
              const skillLabel = typeof skill === 'string' ? skill : skill.name;
              return (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-full ${theme.badgeBg} ${theme.badgeText} border ${theme.cardBorder} text-xs font-medium shadow-2xs flex items-center gap-1.5`}
                >
                  <span>{skillLabel}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="hover:text-rose-500 cursor-pointer p-0.5"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
            <p className={`text-xs ${theme.textMuted}`}>
              No skills added yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
