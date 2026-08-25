'use client';

import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface ResumeSectionProps {
  profile: ProfileData;
  onOpenResumeModal?: () => void;
}

export function ResumeSection({ profile, onOpenResumeModal }: ResumeSectionProps) {
  if (!profile.resumeUrl && !profile.resumeFileName) {
    return null;
  }

  return (
    <section className="px-6 sm:px-8 py-5 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono mb-3">
        Credentials & Resume
      </h2>

      <div
        onClick={onOpenResumeModal}
        className="cursor-pointer group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 hover:border-[#1E3A8A] dark:hover:border-white/20 transition-all shadow-2xs hover:shadow-md"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#0A1128]/10 dark:bg-[#152238] text-[#0A1128] dark:text-white flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-white/10 shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#0A1128] dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-white transition-colors">
              Professional Resume
            </h3>
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] truncate font-medium">
              Credentials • Background • Track Record
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#0A1128] dark:text-white shrink-0 ml-3">
          <span>View Resume</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </section>
  );
}
