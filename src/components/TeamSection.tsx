'use client';

import React from 'react';
import { ArrowRight, Users, Plus, Trash2 } from 'lucide-react';
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

  const handleAddMember = () => {
    const newMember: TeamMemberItem = {
      id: `tm-${Date.now()}`,
      name: '',
      role: '',
      department: 'Engineering',
      avatar: '/images/default-avatar.png',
      bio: ''
    };
    const updated = [newMember, ...teamMembers];
    onUpdateField?.('teamMembers', updated);
  };

  const handleUpdateItem = (id: string, field: keyof TeamMemberItem, value: string) => {
    const updated = teamMembers.map((m) => 
      m.id === id ? { ...m, [field]: value } : m
    );
    onUpdateField?.('teamMembers', updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = teamMembers.filter((m) => m.id !== id);
    onUpdateField?.('teamMembers', updated);
  };

  return (
    <section 
      className={`px-6 sm:px-8 py-5 space-y-4 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Our Team
          </h2>
        </div>

        {isEditing ? (
          <button
            type="button"
            onClick={handleAddMember}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        ) : (
          <span className={`text-[11px] ${theme.textMuted} font-semibold font-mono`}>
            {teamMembers.length} Members
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3 pt-1">
          {teamMembers.length === 0 ? (
            <div className={`p-4 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No team members added yet.</p>
              <button
                type="button"
                onClick={handleAddMember}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add First Member
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className={`p-3 rounded-xl ${theme.subCardBg} border ${theme.cardBorder} space-y-2 relative group/item shadow-2xs`}
                >
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                    <span className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>
                      Member #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(member.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove team member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={member.name || ''}
                      onChange={(e) => handleUpdateItem(member.id, 'name', e.target.value)}
                      placeholder="Name"
                      className={`p-1.5 rounded-lg text-xs font-bold ${theme.cardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                    <input
                      type="text"
                      value={member.role || ''}
                      onChange={(e) => handleUpdateItem(member.id, 'role', e.target.value)}
                      placeholder="Role / Title"
                      className={`p-1.5 rounded-lg text-xs font-medium ${theme.cardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                    <input
                      type="text"
                      value={member.department || ''}
                      onChange={(e) => handleUpdateItem(member.id, 'department', e.target.value)}
                      placeholder="Department"
                      className={`p-1.5 rounded-lg text-xs ${theme.cardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => onSelectTeamMember && onSelectTeamMember(member)}
              className={`cursor-pointer group flex items-center justify-between p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} transition-all shadow-2xs hover:shadow-md`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={member.avatar || '/images/default-avatar.png'}
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
      ) : (
        <p className={`text-xs ${theme.textSecondary} italic py-1`}>
          No team members listed yet.
        </p>
      )}
    </section>
  );
}
