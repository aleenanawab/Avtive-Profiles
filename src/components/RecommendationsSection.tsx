'use client';

import React, { useState } from 'react';
import { Quote, ChevronDown, ChevronUp } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface RecommendationsSectionProps {
  profile: ProfileData;
}

export function RecommendationsSection({ profile }: RecommendationsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  if (!profile.recommendations || profile.recommendations.length === 0) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="px-6 sm:px-8 py-5 space-y-3.5 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
        Recommendations
      </h2>

      <div className="space-y-3">
        {profile.recommendations.map((rec) => {
          const isExpanded = !!expandedIds[rec.id];

          return (
            <div
              key={rec.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 space-y-3 shadow-2xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0A1128]/10 dark:bg-[#152238] text-[#0A1128] dark:text-white flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-white/10">
                    <Quote className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#7EC384]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0A1128] dark:text-white">
                      {rec.author}
                    </h4>
                    {rec.designation && (
                      <p className="text-[10px] text-[#475569] dark:text-[#94A3B8]">
                        {rec.designation} {rec.company ? `• ${rec.company}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(rec.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#0A1128] dark:text-white bg-white dark:bg-[#152238] border border-[#E2E8F0] dark:border-white/10 hover:bg-[#F1F5F9] transition-colors shadow-2xs active:scale-95"
                >
                  <span>{isExpanded ? 'Hide' : 'View Recommendation'}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-[#1E3A8A] dark:text-[#7EC384]" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-[#1E3A8A] dark:text-[#7EC384]" />
                  )}
                </button>
              </div>

              {/* Short summary or expanded complete text */}
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed italic">
                “{isExpanded && rec.fullText ? rec.fullText : rec.summary}”
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
