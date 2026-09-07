'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProfileData, TeamMemberItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface TeamSectionProps {
  profile: ProfileData;
  onSelectTeamMember?: (member: TeamMemberItem) => void;
  theme?: ThemeConfig;
}

export function TeamSection({ 
  profile, 
  onSelectTeamMember,
  theme = getThemeConfig(profile.theme || 'elegant') 
}: TeamSectionProps) {
  if (!profile.teamMembers || profile.teamMembers.length === 0) {
    return null;
  }

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-4 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
          Our Team
        </h2>
        <span className={`text-[11px] ${theme.textMuted} font-semibold font-mono`}>
          {profile.teamMembers.length} Members
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {profile.teamMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => onSelectTeamMember && onSelectTeamMember(member)}
            className={`cursor-pointer group flex items-center justify-between p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} transition-all shadow-2xs hover:shadow-md`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={member.avatar}
                alt={member.name}
                className={`w-12 h-12 rounded-full object-cover border-2 ${theme.cardBorder} shadow-xs`}
              />
              <div className="min-w-0">
                <h4 className={`text-xs font-bold ${theme.textPrimary} group-hover:${theme.accentText} transition-colors truncate`}>
                  {member.name}
                </h4>
                <p className={`text-[11px] font-medium ${theme.accentText} truncate`}>
                  {member.role}
                </p>
                <p className={`text-[10px] ${theme.textSecondary} truncate mt-0.5`}>
                  {member.department}
                </p>
              </div>
            </div>

            <div className={`text-xs font-bold ${theme.textPrimary} shrink-0 ml-2 group-hover:translate-x-1 transition-transform flex items-center gap-0.5`}>
              <span className="hidden sm:inline text-[11px]">View Profile</span>
              <ArrowRight className={`w-3.5 h-3.5 ${theme.accentText}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
