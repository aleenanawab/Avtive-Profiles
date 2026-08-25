'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProfileData, TeamMemberItem } from '../types/profile';

interface TeamSectionProps {
  profile: ProfileData;
  onSelectTeamMember?: (member: TeamMemberItem) => void;
}

export function TeamSection({ profile, onSelectTeamMember }: TeamSectionProps) {
  if (!profile.teamMembers || profile.teamMembers.length === 0) {
    return null;
  }

  return (
    <section className="px-6 sm:px-8 py-5 space-y-4 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
          Our Team
        </h2>
        <span className="text-[11px] text-[#94A3B8] font-semibold">
          {profile.teamMembers.length} Members
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {profile.teamMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => onSelectTeamMember && onSelectTeamMember(member)}
            className="cursor-pointer group flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 hover:border-[#1E3A8A] dark:hover:border-white/20 transition-all shadow-2xs hover:shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-[#152238] shadow-xs"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#0A1128] dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-[#7EC384] transition-colors truncate">
                  {member.name}
                </h4>
                <p className="text-[11px] text-[#1E3A8A] dark:text-[#7EC384] truncate font-medium">
                  {member.role}
                </p>
                <p className="text-[10px] text-[#475569] dark:text-[#94A3B8] truncate mt-0.5">
                  {member.department}
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-[#0A1128] dark:text-white shrink-0 ml-2 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              <span className="hidden sm:inline text-[11px]">View Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
