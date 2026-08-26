'use client';

import React from 'react';
import { ProfileData, ServiceItem } from '../types/profile';

interface SkillsServicesSectionProps {
  profile: ProfileData;
  onInquireService?: (service: ServiceItem) => void;
}

export function SkillsServicesSection({ profile, onInquireService }: SkillsServicesSectionProps) {
  const hasServices = profile.services && profile.services.length > 0;
  const isIndividual = profile.type === 'individual';
  const hasSkills = !isIndividual && profile.skills && profile.skills.length > 0;

  if (!hasServices && !hasSkills) return null;

  return (
    <section className="px-6 sm:px-8 py-5 space-y-3.5 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      {/* Services Section with strict heading: SERVICES */}
      {hasServices && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
            SERVICES
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {profile.services?.map((service) => (
              <div
                key={service.id}
                className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0E1A38] border border-[#E2E8F0] dark:border-white/10 flex items-center justify-between gap-1 shadow-2xs hover:border-[#1E3A8A] dark:hover:border-[#C49A6C]/40 transition-all"
              >
                <span className="text-xs font-bold text-[#0A1128] dark:text-white">
                  {service.title}
                </span>
                {service.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#1E3A8A]/10 text-[#1E3A8A] dark:text-[#60A5FA] font-mono">
                    {service.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Skills Chips for other profiles if provided */}
      {hasSkills && (
        <div className="space-y-2 pt-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] font-mono">
            Competencies
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills?.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1A38] border border-[#E2E8F0] dark:border-white/10 text-xs font-semibold text-[#0A1128] dark:text-white shadow-2xs"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
