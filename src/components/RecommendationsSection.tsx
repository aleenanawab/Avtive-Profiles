'use client';

import React, { useState } from 'react';
import { Quote, ChevronDown, ChevronUp } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface RecommendationsSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
}

export function RecommendationsSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant') 
}: RecommendationsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  if (!profile.recommendations || profile.recommendations.length === 0) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
        Recommendations
      </h2>

      <div className="space-y-3">
        {profile.recommendations.map((rec) => {
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
                      {rec.author}
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
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${theme.textPrimary} ${theme.cardBg} border ${theme.subCardBorder} transition-colors shadow-2xs active:scale-95`}
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
    </section>
  );
}
