'use client';

import React from 'react';
import { 
  ExternalLink, 
  Mail, 
  Phone, 
  FileText, 
  Calendar, 
  Hash, 
  Globe, 
  Sparkles,
  Pencil,
  Plus,
  Trash2
} from 'lucide-react';
import { ProfileData, CustomFieldItem } from '@/types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface CustomFieldsSectionProps {
  profile: ProfileData;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
  theme?: ThemeConfig;
}

export function CustomFieldsSection({
  profile,
  canEdit = false,
  isEditing = false,
  onUpdateField,
  onSelectSection,
  theme = getThemeConfig(profile.theme || 'editorial')
}: CustomFieldsSectionProps) {
  const fields = (profile.customFields || []).filter(
    (f) => isEditing || f.visible !== false
  );

  if (fields.length === 0) {
    if (!canEdit && !isEditing) return null;

    return (
      <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} transition-colors space-y-3 shadow-xs`}>
        <div 
          onClick={() => !isEditing && canEdit && onSelectSection?.('customFields')}
          className={`flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5 ${
            canEdit && !isEditing ? 'cursor-pointer group/cfheader' : ''
          }`}
          title={canEdit && !isEditing ? 'Click to edit Custom Fields in Studio' : undefined}
        >
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-bold tracking-tight ${theme.textPrimary} flex items-center gap-1.5`}>
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Custom Fields</span>
            </h3>
          </div>
          {isEditing ? (
            <button
              type="button"
              onClick={() => {
                const newField: CustomFieldItem = {
                  id: `cf-${Date.now()}`,
                  label: '',
                  value: '',
                  type: 'text',
                  visible: true,
                };
                onUpdateField?.('customFields', [...(profile.customFields || []), newField]);
              }}
              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Custom Field</span>
            </button>
          ) : (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} font-semibold`}>
              0 Fields
            </span>
          )}
        </div>
        <p className={`text-xs ${theme.textSecondary} italic py-1`}>
          {isEditing ? 'No custom fields yet. Click "Add Custom Field" to create one.' : 'No custom fields added yet.'}
        </p>
      </div>
    );
  }

  const renderFieldIcon = (field: CustomFieldItem) => {
    switch (field.type) {
      case 'link':
        return <Globe className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'markdown':
        return <FileText className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const renderFieldValue = (field: CustomFieldItem) => {
    const val = field.value || (field as any).content || '';
    if (field.type === 'link' || val.startsWith('http://') || val.startsWith('https://')) {
      const href = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline break-all ${theme.accentText}`}
        >
          <span>{val}</span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
        </a>
      );
    }

    if (field.type === 'email' || (val.includes('@') && !val.includes(' '))) {
      return (
        <a
          href={`mailto:${val.replace(/^mailto:/, '')}`}
          className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline break-all ${theme.accentText}`}
        >
          <span>{val}</span>
        </a>
      );
    }

    if (field.type === 'phone') {
      return (
        <a
          href={`tel:${val.replace(/[^0-9+]/g, '')}`}
          className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${theme.accentText}`}
        >
          <span>{val}</span>
        </a>
      );
    }

    return (
      <span className={`text-xs font-medium ${theme.textPrimary} break-words whitespace-pre-line leading-relaxed`}>
        {val}
      </span>
    );
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} transition-colors space-y-3 shadow-2xs`}>
      <div 
        onClick={() => !isEditing && canEdit && onSelectSection?.('customFields')}
        className={`flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5 ${
          canEdit && !isEditing ? 'cursor-pointer group/cfheader' : ''
        }`}
        title={canEdit && !isEditing ? 'Click to edit Custom Fields in Studio' : undefined}
      >
        <div className="flex items-center gap-2">
          <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${theme.textMuted} flex items-center gap-1.5`}>
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Custom Fields</span>
          </h3>
          {canEdit && !isEditing && (
            <span className="opacity-0 group-hover/cfheader:opacity-100 transition-opacity text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Pencil className="w-2.5 h-2.5" />
              Edit All
            </span>
          )}
        </div>
        {isEditing ? (
          <button
            type="button"
            onClick={() => {
              const newField: CustomFieldItem = {
                id: `cf-${Date.now()}`,
                label: '',
                value: '',
                type: 'text',
                visible: true,
              };
              onUpdateField?.('customFields', [...(profile.customFields || []), newField]);
            }}
            className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Field</span>
          </button>
        ) : (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} font-semibold`}>
            {fields.length} {fields.length === 1 ? 'Field' : 'Fields'}
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3 pt-1">
          {fields.map((field) => (
            <div
              key={field.id}
              className={`p-3 rounded-xl border border-black/10 dark:border-white/10 ${theme.subCardBg} space-y-2`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={field.label || (field as any).title || ''}
                  onChange={(e) => {
                    const next = (profile.customFields || []).map((f) =>
                      f.id === field.id ? { ...f, label: e.target.value } : f
                    );
                    onUpdateField?.('customFields', next);
                  }}
                  placeholder="Field Label (e.g. Portfolio, Discord, Office Hours)"
                  className={`flex-1 text-xs font-bold p-2 rounded-lg border ${theme.cardBorder} ${theme.subCardBg} ${theme.textPrimary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-purple-400`}
                />
                <select
                  value={field.type || 'text'}
                  onChange={(e) => {
                    const next = (profile.customFields || []).map((f) =>
                      f.id === field.id ? { ...f, type: e.target.value as any } : f
                    );
                    onUpdateField?.('customFields', next);
                  }}
                  className={`text-xs p-2 rounded-lg border ${theme.cardBorder} ${theme.subCardBg} ${theme.textPrimary} bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-purple-400 cursor-pointer`}
                >
                  <option value="text">Text</option>
                  <option value="link">Link</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="markdown">Markdown</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const next = (profile.customFields || []).filter((f) => f.id !== field.id);
                    onUpdateField?.('customFields', next);
                  }}
                  className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Remove field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                value={field.value || (field as any).content || ''}
                onChange={(e) => {
                  const next = (profile.customFields || []).map((f) =>
                    f.id === field.id ? { ...f, value: e.target.value } : f
                  );
                  onUpdateField?.('customFields', next);
                }}
                placeholder="Field Value (e.g. https://... or text)"
                className={`w-full text-xs p-2 rounded-lg border ${theme.cardBorder} ${theme.subCardBg} ${theme.textPrimary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-purple-400`}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const newField: CustomFieldItem = {
                id: `cf-${Date.now()}`,
                label: '',
                value: '',
                type: 'text',
                visible: true,
              };
              onUpdateField?.('customFields', [...(profile.customFields || []), newField]);
            }}
            className="w-full py-2 border border-dashed border-purple-500/30 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Custom Field</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {fields.map((field) => {
            const val = field.value || (field as any).content || '';
            const isMultiLine = field.type === 'markdown' || val.includes('\n') || val.length > 55;
            const title = field.label || (field as any).title || 'Custom Field';

            return (
              <div
                key={field.id}
                onClick={() => canEdit && onSelectSection?.('customFields', field.id)}
                className={`p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex items-start gap-2.5 transition-all hover:border-black/10 dark:hover:border-white/20 ${
                  isMultiLine ? 'sm:col-span-2' : ''
                } ${
                  canEdit ? 'cursor-pointer group/cfitem hover:ring-2 hover:ring-purple-500/40 hover:bg-purple-500/[0.04] dark:hover:bg-purple-500/10' : ''
                }`}
                title={canEdit ? `Click to edit "${title}" in Studio` : undefined}
              >
                <div 
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${theme.badgeBg} ${theme.accentText}`}
                >
                  {renderFieldIcon(field)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${theme.textMuted} truncate`}>
                      {title}
                    </span>
                    {canEdit && (
                      <span className="opacity-0 group-hover/cfitem:opacity-100 transition-opacity text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5">
                        <Pencil className="w-2.5 h-2.5" />
                        Edit
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    {renderFieldValue(field)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
