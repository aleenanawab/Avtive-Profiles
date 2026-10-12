'use client';

import React from 'react';
import { ArrowRight, Users, Plus, X } from 'lucide-react';
import { ProfileData, TeamMemberItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface TeamSectionProps {
  profile: ProfileData;
  onSelectTeamMember?: (member: TeamMemberItem) => void;
  theme?: ThemeConfig;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionId: string) => void;
}

export function TeamSection({ 
  profile, 
  onSelectTeamMember,
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit,
  isEditing = false,
  onUpdateField,
  onSelectSection
}: TeamSectionProps) {
  const teamMembers: TeamMemberItem[] = profile.teamMembers || [];
  const hasMembers = teamMembers.length > 0;

  if (!hasMembers && !canEdit && !isEditing) {
    return null;
  }

  const handleAddMember = () => {
    const newMember: TeamMemberItem = {
      id: `member-${Date.now()}`,
      name: 'Team Member',
      role: 'Role / Title',
      department: 'Department',
      avatar: '/images/default-avatar.png',
      bio: '',
      email: '',
      status: 'ACTIVE'
    };
    const updated = [newMember, ...teamMembers];
    onUpdateField?.('teamMembers', updated);
  };

  const handleUpdateMember = (id: string, updates: Partial<TeamMemberItem>) => {
    const updated = teamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m));
    onUpdateField?.('teamMembers', updated);
  };

  const handleRemoveMember = (id: string) => {
    const updated = teamMembers.filter((m) => m.id !== id);
    onUpdateField?.('teamMembers', updated);
  };

  return (
    <section 
      id="team"
      onClick={() => canEdit && !isEditing && onSelectSection?.('teamMembers')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-4 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && !isEditing && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
      }`}
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
            {teamMembers.length} {teamMembers.length === 1 ? 'Member' : 'Members'}
          </span>
          {isEditing ? (
            <button
              type="button"
              onClick={handleAddMember}
              className={`flex items-center gap-1 text-[11px] font-bold ${theme.accentText} hover:underline cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          ) : (
            canEdit && (
              <button
                type="button"
                onClick={() => onSelectSection?.('teamMembers')}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold border border-cyan-500/20 cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>+ Add Member</span>
              </button>
            )
          )}
        </div>
      </div>

      {hasMembers ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teamMembers.map((member) => {
            const isLinked = Boolean(member.profileId);
            const isPending = member.status === 'PENDING';

            return (
              <div
                key={member.id}
                className={`p-3.5 sm:p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xs`}
              >
                {isEditing ? (
                  /* Editable Team Member Card */
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={member.name || ''}
                              onChange={(e) => handleUpdateMember(member.id, { name: e.target.value })}
                              placeholder="e.g. Alex Morgan"
                              className={`w-full text-xs font-bold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                              Role / Job Title
                            </label>
                            <input
                              type="text"
                              value={member.role || ''}
                              onChange={(e) => handleUpdateMember(member.id, { role: e.target.value })}
                              placeholder="e.g. Chief Technology Officer"
                              className={`w-full text-xs font-medium p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.accentText}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                              Department
                            </label>
                            <input
                              type="text"
                              value={member.department || ''}
                              onChange={(e) => handleUpdateMember(member.id, { department: e.target.value })}
                              placeholder="e.g. Product Engineering"
                              className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                              Email
                            </label>
                            <input
                              type="email"
                              value={member.email || ''}
                              onChange={(e) => handleUpdateMember(member.id, { email: e.target.value })}
                              placeholder="e.g. alex@company.com"
                              className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary}`}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                        title="Remove member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Team Member Card */
                  <div
                    onClick={() => {
                      if (onSelectTeamMember) {
                        onSelectTeamMember(member);
                      } else if (member.profileId) {
                        window.location.href = `/profile/${encodeURIComponent(member.profileId)}`;
                      }
                    }}
                    className={`flex items-center justify-between ${
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
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-center gap-2">
          <p className={`text-xs ${theme.textSecondary}`}>
            No team members added yet. Showcase your staff and colleagues on your company profile.
          </p>
        </div>
      )}
    </section>
  );
}
