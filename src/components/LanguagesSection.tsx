'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface LanguagesSectionProps {
  profile: ProfileData;
}

export function LanguagesSection({ profile }: LanguagesSectionProps) {
  if (!profile.languages || profile.languages.length === 0) {
    return null;
  }

  return (
    <section className="px-6 sm:px-8 py-5 space-y-3 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
        Languages
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {profile.languages.map((lang, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 flex items-center justify-between gap-2 shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0A1128]/10 dark:bg-[#152238] text-[#0A1128] dark:text-white flex items-center justify-center shrink-0">
                <Languages className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#7EC384]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang.language}
                </h4>
                <p className="text-[10px] text-[#475569] dark:text-[#94A3B8]">
                  {lang.proficiency}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
