'use client';

import React from 'react';
import { ArrowRight, Building2 } from 'lucide-react';
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
        className="cursor-pointer group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0E1A38] border border-[#E2E8F0] dark:border-white/10 hover:border-[#1E3A8A] dark:hover:border-[#C49A6C]/40 transition-all shadow-2xs hover:shadow-xs text-left"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#152238] p-2 flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-white/10 shadow-2xs">
            <img
              src={companyInfo.logo || '/images/avtive-symbol.png'}
              alt={companyInfo.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-[#60A5FA] group-hover:underline transition-colors truncate">
                {companyInfo.name}
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#1E3A8A]/10 dark:bg-white/10 text-[#1E3A8A] dark:text-white font-mono">
                SaaS Platform
              </span>
            </div>
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] truncate mt-0.5 font-medium">
              {companyInfo.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#0A1128] dark:text-white shrink-0 ml-3">
          <span className="hidden sm:inline">View Company Profile</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#1E3A8A] dark:text-[#60A5FA]" />
        </div>
      </div>
    </section>
  );
}
