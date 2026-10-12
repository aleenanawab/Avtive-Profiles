'use client';

import React, { useState } from 'react';
import { Quote, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
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

  if (!hasRecommendations && !canEdit && !isEditing) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddRec = () => {
    const newRec: RecommendationItem = {
      id: `rec-${Date.now()}`,
      author: 'Recommender Name',
      designation: 'Title / Position',
      company: 'Organization',
      summary: 'Recommendation endorsement or testimonial statement...'
    };
    const updated = [newRec, ...recommendations];
    onUpdateField?.('recommendations', updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<RecommendationItem>) => {
    const updated = recommendations.map((r) => (r.id === id ? { ...r, ...updates } : r));
    onUpdateField?.('recommendations', updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = recommendations.filter((r) => r.id !== id);
    onUpdateField?.('recommendations', updated);
  };

  return (
    <section 
      onClick={() => canEdit && !isEditing && onSelectSection?.('recommendations')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && !isEditing && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Recommendations
        </h2>
        {isEditing ? (
          <button
            type="button"
            onClick={handleAddRec}
            className={`flex items-center gap-1 text-[11px] font-bold ${theme.accentText} hover:underline cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Recommendation</span>
          </button>
        ) : (
          canEdit && onSelectSection && (
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
              Click to edit
            </span>
          )
        )}
      </div>

      {hasRecommendations ? (
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isExpanded = !!expandedIds[rec.id];

            return (
              <div
                key={rec.id}
                className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 shadow-2xs transition-all`}
              >
                {isEditing ? (
                  /* Editable Recommendation Card */
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                            Author / Recommender
                          </label>
                          <input
                            type="text"
                            value={rec.author || (rec as any).authorName || ''}
                            onChange={(e) => handleUpdateItem(rec.id, { author: e.target.value })}
                            placeholder="e.g. Sarah Jenkins"
                            className={`w-full text-xs font-bold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                            Designation / Role
                          </label>
                          <input
                            type="text"
                            value={rec.designation || ''}
                            onChange={(e) => handleUpdateItem(rec.id, { designation: e.target.value })}
                            placeholder="e.g. VP of Product"
                            className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                            Company
                          </label>
                          <input
                            type="text"
                            value={rec.company || ''}
                            onChange={(e) => handleUpdateItem(rec.id, { company: e.target.value })}
                            placeholder="e.g. Acme Tech"
                            className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(rec.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                        title="Remove recommendation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                        Recommendation Statement / Endorsement
                      </label>
                      <textarea
                        rows={3}
                        value={rec.fullText || rec.summary || ''}
                        onChange={(e) => handleUpdateItem(rec.id, { summary: e.target.value, fullText: e.target.value })}
                        placeholder="Write the recommendation or endorsement statement..."
                        className={`w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                      />
                    </div>
                  </div>
                ) : (
                  /* View Recommendation Card */
                  <>
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
                        type="button"
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
                  </>
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
