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
  const fields: CustomFieldItem[] = profile.customFields || [];

  const handleAddField = () => {
    const newField: CustomFieldItem = {
      id: `cf-${Date.now()}`,
      label: 'Custom Field',
      value: '',
      type: 'text'
    };
    const updated = [...fields, newField];
    onUpdateField?.('customFields', updated);
  };

  const handleUpdateItem = (id: string, key: keyof CustomFieldItem, value: any) => {
    const updated = fields.map((f) => 
      f.id === id ? { ...f, [key]: value } : f
    );
    onUpdateField?.('customFields', updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = fields.filter((f) => f.id !== id);
    onUpdateField?.('customFields', updated);
  };

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
    <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} transition-colors space-y-3 shadow-2xs text-left`}>
      <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${theme.textPrimary}`}>
            Custom Profile Fields
          </h3>
        </div>

        {isEditing ? (
          <button
            type="button"
            onClick={handleAddField}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
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
          {fields.length === 0 ? (
            <div className={`p-4 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No custom profile fields added yet.</p>
              <button
                type="button"
                onClick={handleAddField}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add Custom Field
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={`p-3 rounded-xl ${theme.subCardBg} border ${theme.cardBorder} space-y-2 relative group/item shadow-2xs`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={field.label || (field as any).title || ''}
                      onChange={(e) => {
                        handleUpdateItem(field.id, 'label', e.target.value);
                        handleUpdateItem(field.id, 'title' as any, e.target.value);
                      }}
                      placeholder="Field Label (e.g. Discord, Portfolio, Favorite Quote)"
                      className={`flex-1 p-1.5 rounded-lg text-xs font-bold uppercase font-mono ${theme.cardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                    <select
                      value={field.type || 'text'}
                      onChange={(e) => handleUpdateItem(field.id, 'type', e.target.value)}
                      className={`p-1.5 rounded-lg text-xs font-semibold ${theme.cardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    >
                      <option value="text">Text</option>
                      <option value="link">Link / URL</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="markdown">Long Text</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(field.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      title="Remove field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    {field.type === 'markdown' ? (
                      <textarea
                        rows={2}
                        value={field.value || (field as any).content || ''}
                        onChange={(e) => {
                          handleUpdateItem(field.id, 'value', e.target.value);
                          handleUpdateItem(field.id, 'content' as any, e.target.value);
                        }}
                        placeholder="Field content..."
                        className={`w-full p-2 rounded-lg text-xs ${theme.cardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={field.value || (field as any).content || ''}
                        onChange={(e) => {
                          handleUpdateItem(field.id, 'value', e.target.value);
                          handleUpdateItem(field.id, 'content' as any, e.target.value);
                        }}
                        placeholder="Field value / content..."
                        className={`w-full p-2 rounded-lg text-xs ${theme.cardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : fields.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {fields.map((field) => {
            const val = field.value || (field as any).content || '';
            const isMultiLine = field.type === 'markdown' || val.includes('\n') || val.length > 55;
            const title = field.label || (field as any).title || 'Custom Field';

            return (
              <div
                key={field.id}
                className={`p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex items-start gap-2.5 transition-all ${
                  isMultiLine ? 'sm:col-span-2' : ''
                }`}
              >
                <div 
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${theme.badgeBg} ${theme.accentText}`}
                >
                  {renderFieldIcon(field)}
                </div>

                <div className="min-w-0 flex-1">
                  <span className={`block text-[10px] font-bold uppercase tracking-wider ${theme.textMuted} truncate`}>
                    {title}
                  </span>
                  <div className="mt-1">
                    {renderFieldValue(field)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={`text-xs ${theme.textSecondary} italic py-1`}>
          No custom fields added yet.
        </p>
      )}
    </div>
  );
}
