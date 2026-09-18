import React from 'react';
import { Plus, X, Pencil } from 'lucide-react';
import { ProfileData, ServiceItem } from '../types/profile';
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
  const hasServices = profile.services && profile.services.length > 0;
  const hasSkills = profile.skills && profile.skills.length > 0;

  if (!hasServices && !hasSkills && !isEditing) return null;

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

  return (
    <section 
      onClick={() => canEdit && onSelectSection?.('skills', 'skills')}
      className={`px-6 sm:px-8 py-5 space-y-3.5 text-left border-b ${theme.divider} ${theme.cardBg} transition-all relative ${
        canEdit ? 'cursor-pointer group/skills hover:bg-purple-500/[0.04] dark:hover:bg-purple-500/10' : ''
      }`}
      title={canEdit ? 'Click to edit Skills & Services in Studio' : undefined}
    >
      {/* Services Section with strict heading: SERVICES */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
              SERVICES
            </h2>
            {canEdit && !isEditing && (
              <span className="opacity-0 group-hover/skills:opacity-100 transition-opacity text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Pencil className="w-2.5 h-2.5" />
                Edit Skills & Services
              </span>
            )}
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddService}
              className={`flex items-center gap-1 text-[11px] font-bold ${theme.accentText} hover:underline`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {profile.services?.map((service) => (
            <div
              key={service.id}
              className={`p-3 rounded-xl ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} flex items-center justify-between gap-1 shadow-2xs transition-all`}
            >
              {isEditing ? (
                <div className="flex items-center justify-between w-full gap-1">
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => handleUpdateServiceTitle(service.id, e.target.value)}
                    className={`w-full bg-transparent text-xs font-bold ${theme.textPrimary} focus:outline-none border-b border-dashed border-slate-300 dark:border-white/20`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service.id)}
                    className="text-rose-500 hover:text-rose-700 p-0.5"
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
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${theme.badgeBg} ${theme.badgeText} font-mono`}>
                      {service.badge}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
          {isEditing && (!profile.services || profile.services.length === 0) && (
            <button
              type="button"
              onClick={handleAddService}
              className={`col-span-2 sm:col-span-3 p-3 rounded-xl border border-dashed ${theme.cardBorder} text-xs font-bold ${theme.textMuted} hover:${theme.accentText} flex items-center justify-center gap-1.5`}
            >
              <Plus className="w-4 h-4" />
              <span>Add your first service</span>
            </button>
          )}
        </div>
      </div>

      {/* Skills Pills matching Screen 11 & 12 */}
      {hasSkills && (
        <div className="space-y-2.5 pt-1 text-left">
          <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills?.map((skill, idx) => {
              const skillLabel = typeof skill === 'string' ? skill : skill.name;
              return (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 text-xs font-medium text-slate-800 dark:text-zinc-200 shadow-2xs"
                >
                  {skillLabel}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

