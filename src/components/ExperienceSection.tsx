'use client';

import React from 'react';
import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface ExperienceSectionProps {
  profile: ProfileData;
}

export function ExperienceSection({ profile }: ExperienceSectionProps) {
  if (!profile.experiences || profile.experiences.length === 0) {
    return null;
  }

  return (
    <section className="px-6 sm:px-8 py-5 space-y-3.5 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
        Professional Experience
      </h2>

      <div className="space-y-3">
        {profile.experiences.map((exp) => (
          <div
            key={exp.id}
            className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 space-y-1.5 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#0A1128] dark:text-white">
                  {exp.company}
                </h3>
                {exp.role && (
                  <p className="text-xs font-semibold text-[#1E3A8A] dark:text-[#7EC384] mt-0.5">
                    {exp.role}
                  </p>
                )}
              </div>

              {exp.period && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-[#152238] text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-white/10 shrink-0 font-mono">
                  {exp.period}
                </span>
              )}
            </div>

            {exp.location && (
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
                {exp.location}
              </p>
            )}

            {exp.description && (
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed pt-1">
                {exp.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
