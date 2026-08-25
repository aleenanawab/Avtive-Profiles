'use client';

import React from 'react';
import { X, Download, FileText, CheckCircle2 } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface ResumeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
}

export function ResumeViewerModal({ isOpen, onClose, profile }: ResumeViewerModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    // Generate text/markdown export of resume
    const content = `AVTIVE EXECUTIVE RESUME\n=======================\nName: ${profile.name}\nTitle: ${profile.designation}\nCompany: ${profile.company || 'Avtive'}\nLocation: ${profile.location}\nEmail: ${profile.email}\nPhone: ${profile.phone}\nWebsite: ${profile.website || 'https://www.avtive.app'}\n\nSUMMARY\n-------\n${profile.fullBio || profile.shortBio}\n\nAREAS OF EXPERTISE\n------------------\n${profile.skills?.map(s => `• ${s.name}`).join('\n') || 'N/A'}\n\nGenerated via Avtive Digital Identity (Islamabad, Pakistan)`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.slug}-executive-resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/10 shadow-2xl p-6 space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0A1128]/10 dark:bg-white/10 text-[#0A1128] dark:text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0A1128] dark:text-white">
                Executive Resume
              </h2>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                {profile.name} • {profile.designation}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#94A3B8] hover:text-[#0A1128] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#152238] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 space-y-1.5">
            <h3 className="text-xs font-bold text-[#0A1128] dark:text-white/80 font-mono uppercase tracking-wider">
              Professional Summary
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              {profile.fullBio || profile.shortBio}
            </p>
          </div>

          {/* Highlights */}
          {profile.skills && (
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 space-y-2">
              <h3 className="text-xs font-bold text-[#0A1128] dark:text-white/80 font-mono uppercase tracking-wider">
                Core Competencies & Leadership
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {profile.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#0A1128] dark:text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7EC384] shrink-0" />
                    <span>{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Action */}
          <div className="pt-2">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A1128] font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Executive Resume (.TXT)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
