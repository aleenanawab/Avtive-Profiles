'use client';

import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { CompanyInfo } from '../types/profile';

interface CompanyCardProps {
  companyInfo: CompanyInfo;
  onViewCompany: () => void;
}

export function CompanyCard({ companyInfo, onViewCompany }: CompanyCardProps) {
  return (
    <section className="px-6 sm:px-8 py-3.5 bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <div
        onClick={onViewCompany}
        className="cursor-pointer group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 hover:border-[#1E3A8A] dark:hover:border-white/20 transition-all shadow-2xs hover:shadow-md text-left"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#0A1128]/10 dark:bg-[#152238] text-[#0A1128] dark:text-white flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-white/10 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-[#0A1128] dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-white transition-colors truncate">
                {companyInfo.name}
              </h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#0A1128]/10 dark:bg-white/10 text-[#0A1128] dark:text-white font-mono">
                Organization
              </span>
            </div>
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] truncate mt-0.5 font-medium">
              {companyInfo.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#0A1128] dark:text-white shrink-0 ml-3">
          <span className="hidden sm:inline">View Company Profile</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </section>
  );
}
