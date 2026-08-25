'use client';

import React from 'react';
import { Award } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface CertificationsSectionProps {
  profile: ProfileData;
}

export function CertificationsSection({ profile }: CertificationsSectionProps) {
  if (!profile.certifications || profile.certifications.length === 0) {
    return null;
  }

  return (
    <section className="px-6 sm:px-8 py-5 space-y-3.5 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
        Certifications
      </h2>

      <div className="space-y-2.5">
        {profile.certifications.map((cert) => (
          <div
            key={cert.id}
            className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 flex items-start gap-3.5 shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0A1128]/10 dark:bg-[#152238] text-[#0A1128] dark:text-white flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-white/10 shadow-2xs">
              <Award className="w-4.5 h-4.5 text-[#1E3A8A] dark:text-[#7EC384]" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#0A1128] dark:text-white">
                  {cert.name}
                </h3>
              </div>

              <p className="text-[11px] font-semibold text-[#1E3A8A] dark:text-[#7EC384]">
                {cert.issuer}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-[#475569] dark:text-[#94A3B8] font-mono">
                <span>Issued {cert.issued}</span>
                {cert.expires && <span>• Expires {cert.expires}</span>}
                {cert.credentialId && (
                  <span>• ID: <span className="font-bold text-[#0A1128] dark:text-white">{cert.credentialId}</span></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
