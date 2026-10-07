'use client';

import React from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { ProfileData, TeamMemberItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface TeamSectionProps {
  profile: ProfileData;
  onSelectTeamMember?: (member: TeamMemberItem) => void;
  theme?: ThemeConfig;
  canEdit?: boolean;
  onSelectSection?: (sectionId: string) => void;
}

export function TeamSection({ 
  profile, 
  onSelectTeamMember,
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit,
  onSelectSection
}: TeamSectionProps) {
  if (!profile.teamMembers || profile.teamMembers.length === 0) {
    if (!canEdit) return null;

    return (
      <section 
        id="team"
        onClick={() => canEdit && onSelectSection?.('teamMembers')}
        className={`px-4 sm:px-6 md:px-8 py-5 space-y-4 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
          canEdit && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${theme.accentText}`} />
            <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
              Our Team
            </h2>
          </div>
          <span className={`text-[11px] ${theme.textMuted} font-semibold font-mono`}>
            0 Members
          </span>
        </div>
        <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-center gap-2">
          <p className={`text-xs ${theme.textSecondary}`}>
            No team members added yet. Showcase your staff and colleagues on your company profile.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection?.('teamMembers');
              }}
              className="mt-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Add Team Member</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section 
      id="team"
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-4 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
            Our Team
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] ${theme.textMuted} font-semibold font-mono`}>
            {profile.teamMembers.length} {profile.teamMembers.length === 1 ? 'Member' : 'Members'}
          </span>
          {canEdit && (
            <button
              type="button"
              onClick={() => onSelectSection?.('teamMembers')}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold border border-cyan-500/20 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <span>+ Add Member</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {profile.teamMembers.map((member) => {
          const isLinked = Boolean(member.profileId);
          const isPending = member.status === 'PENDING';

          return (
            <div
              key={member.id}
              onClick={() => {
                if (onSelectTeamMember) {
                  onSelectTeamMember(member);
                } else if (member.profileId) {
                  window.location.href = `/profile/${encodeURIComponent(member.profileId)}`;
                }
              }}
              className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} transition-all shadow-2xs hover:shadow-md ${
                isLinked || onSelectTeamMember ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={member.avatar || '/images/default-avatar.png'}
                    alt={member.name}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 ${theme.cardBorder} shadow-xs bg-slate-100 dark:bg-zinc-800`}
                  />
                  {isPending && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-zinc-900" title="Pending invite" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className={`text-xs font-bold ${theme.textPrimary} group-hover:${theme.accentText} transition-colors truncate`}>
                      {member.name}
                    </h4>
                    {isPending && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] font-medium ${theme.accentText} truncate mt-0.5`}>
                    {member.role || 'Team Member'}
                  </p>
                  {member.department && (
                    <p className={`text-[10px] ${theme.textSecondary} truncate`}>
                      {member.department}
                    </p>
                  )}
                </div>
              </div>

              {isLinked && (
                <div className={`text-xs font-bold ${theme.textPrimary} shrink-0 ml-2 group-hover:translate-x-1 transition-transform flex items-center gap-0.5`}>
                  <span className="hidden sm:inline text-[11px]">View Profile</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${theme.accentText}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
