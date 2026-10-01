'use client';

import React, { useState } from 'react';
import { Quote, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { ProfileData, RecommendationItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface RecommendationsSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function RecommendationsSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  isEditing = false,
  onUpdateField,
  onSelectSection
}: RecommendationsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const recommendations: RecommendationItem[] = profile.recommendations || [];
  const hasRecommendations = recommendations.length > 0;

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddRecommendation = () => {
    const newRec: RecommendationItem = {
      id: `rec-${Date.now()}`,
      author: '',
      designation: '',
      company: '',
      summary: '',
      fullText: ''
    };
    const updated = [newRec, ...recommendations];
    onUpdateField?.('recommendations', updated);
  };

  const handleUpdateItem = (id: string, field: keyof RecommendationItem, value: string) => {
    const updated = recommendations.map((r) => 
      r.id === id ? { ...r, [field]: value } : r
    );
    onUpdateField?.('recommendations', updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = recommendations.filter((r) => r.id !== id);
    onUpdateField?.('recommendations', updated);
  };

  return (
    <section 
      className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Quote className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Recommendations
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleAddRecommendation}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Recommendation</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 pt-1">
          {recommendations.length === 0 ? (
            <div className={`p-5 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No recommendations listed yet.</p>
              <button
                type="button"
                onClick={handleAddRecommendation}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add Recommendation
              </button>
            </div>
          ) : (
            recommendations.map((rec, idx) => (
              <div
                key={rec.id || idx}
                className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 relative group/item shadow-2xs`}
              >
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>
                    Recommendation #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(rec.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove recommendation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Recommender Name
                    </label>
                    <input
                      type="text"
                      value={rec.author || (rec as any).authorName || ''}
                      onChange={(e) => {
                        handleUpdateItem(rec.id, 'author', e.target.value);
                        handleUpdateItem(rec.id, 'authorName' as any, e.target.value);
                      }}
                      placeholder="e.g. Sarah Connor"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      value={rec.designation || ''}
                      onChange={(e) => handleUpdateItem(rec.id, 'designation', e.target.value)}
                      placeholder="e.g. VP of Engineering"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={rec.company || ''}
                      onChange={(e) => handleUpdateItem(rec.id, 'company', e.target.value)}
                      placeholder="e.g. Acme Tech"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                    Recommendation Statement
                  </label>
                  <textarea
                    rows={3}
                    value={rec.fullText || rec.summary || ''}
                    onChange={(e) => {
                      handleUpdateItem(rec.id, 'fullText', e.target.value);
                      handleUpdateItem(rec.id, 'summary' as any, e.target.value);
                    }}
                    placeholder="Enter what they said about working with you..."
                    className={`w-full p-2 rounded-xl text-xs ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      ) : hasRecommendations ? (
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isExpanded = !!expandedIds[rec.id];

            return (
              <div
                key={rec.id}
                className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 shadow-2xs transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${theme.badgeBg} ${theme.accentText} flex items-center justify-center shrink-0 border ${theme.cardBorder}`}>
                      <Quote className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${theme.textPrimary}`}>
                        {rec.author || (rec as any).authorName}
                      </h4>
                      {rec.designation && (
                        <p className={`text-[10px] ${theme.textSecondary}`}>
                          {rec.designation} {rec.company ? `• ${rec.company}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(rec.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${theme.textPrimary} ${theme.cardBg} border ${theme.subCardBorder} transition-colors shadow-2xs active:scale-95 cursor-pointer`}
                  >
                    <span>{isExpanded ? 'Hide' : 'View Recommendation'}</span>
                    {isExpanded ? (
                      <ChevronUp className={`w-3 h-3 ${theme.accentText}`} />
                    ) : (
                      <ChevronDown className={`w-3 h-3 ${theme.accentText}`} />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className={`pt-2 border-t ${theme.divider} space-y-2 text-xs leading-relaxed ${theme.textSecondary}`}>
                    <p className="italic font-serif">
                      &ldquo;{rec.fullText || rec.summary}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No recommendations added yet.
          </p>
        </div>
      )}
    </section>
  );
}
