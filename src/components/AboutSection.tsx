'use client';

import React from 'react';
import { ProfileData } from '../types/profile';

interface AboutSectionProps {
  profile: ProfileData;
}

export function AboutSection({ profile }: AboutSectionProps) {
  if (!profile.fullBio && !profile.shortBio) {
    return null;
  }

  return (
    <section className="px-6 sm:px-8 py-5 space-y-2 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
        About
      </h2>

      <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed font-normal">
        {profile.fullBio || profile.shortBio}
      </p>
    </section>
  );
}
