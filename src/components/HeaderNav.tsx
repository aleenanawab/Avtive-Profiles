'use client';

import React, { useState } from 'react';
import { 
  Share2, 
  Sun, 
  Moon, 
  Smartphone, 
  Tv, 
  Edit3, 
  CreditCard,
  Building2,
  Users,
  ChevronDown
} from 'lucide-react';
import { ProfileData, ProfileType, UserRole } from '../types/profile';

interface HeaderNavProps {
  currentProfile: ProfileData;
  profileType: ProfileType;
  onSelectProfileType: (type: ProfileType, origin?: 'company' | 'my_card' | 'direct' | 'team') => void;
  onOpenEdit: () => void;
  onOpenShare: () => void;
  canEdit: boolean;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: (mode: 'desktop' | 'mobile') => void;
  onOpenMyCard: () => void;
}

export function HeaderNav({
  currentProfile,
  profileType,
  onSelectProfileType,
  onOpenEdit,
  onOpenShare,
  canEdit,
  userRole,
  onChangeUserRole,
  isDark,
  onToggleTheme,
  viewMode,
  onToggleViewMode,
  onOpenMyCard
}: HeaderNavProps) {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return { label: 'Owner (Mesum)', icon: '👑' };
      case 'team_member':
        return { label: 'Team (Hamza)', icon: '👤' };
      case 'company_admin':
        return { label: 'Company Admin', icon: '🏢' };
      case 'visitor':
        return { label: 'Public Visitor', icon: '👁️' };
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#0A1128]/90 border-b border-[#E2E8F0] dark:border-white/10 transition-colors shadow-2xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Avtive Brand */}
        <div 
          onClick={() => onSelectProfileType('company', 'direct')}
          className="flex items-center gap-2 cursor-pointer group"
          title="Go to Avtive Company Profile"
        >
          <div className="h-8 flex items-center">
            <img 
              src="/images/avtive-symbol.png" 
              alt="Avtive Logo" 
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#1E3A8A] dark:text-[#60A5FA] tracking-tight">
                Avtive
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#1E3A8A]/10 text-[#1E3A8A] dark:text-[#60A5FA] font-bold font-mono">
                Official
              </span>
            </div>
            <p className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-medium">
              Islamabad, Pakistan
            </p>
          </div>
        </div>

        {/* Center: Navigation Options (My Card + Company Directory) */}
        <div className="flex items-center p-1 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 text-xs">
          {/* 1. My Card */}
          <button
            onClick={onOpenMyCard}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
              profileType === 'individual'
                ? 'bg-[#0A1128] dark:bg-white text-white dark:text-[#0A1128] shadow-xs'
                : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0A1128] dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>My Card</span>
          </button>
          
          {/* 2. Team Member */}
          <button
            onClick={() => onSelectProfileType('team-member', 'team')}
            className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
              profileType === 'team-member'
                ? 'bg-[#0A1128] dark:bg-white text-white dark:text-[#0A1128] shadow-xs'
                : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0A1128] dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Member</span>
          </button>

          {/* 3. Company Profile */}
          <button
            onClick={() => onSelectProfileType('company', 'company')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
              profileType === 'company'
                ? 'bg-[#0A1128] dark:bg-white text-white dark:text-[#0A1128] shadow-xs'
                : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0A1128] dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company</span>
          </button>
        </div>

        {/* Right Controls: Permissions Switcher, Edit Button, Theme & Share */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Permissions / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#152238] text-xs font-bold text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 hover:bg-[#F1F5F9] transition-colors shadow-2xs"
              title="Switch user permission role"
            >
              <span>{getRoleLabel(userRole).icon}</span>
              <span className="hidden lg:inline text-[11px]">{getRoleLabel(userRole).label}</span>
              <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/15 shadow-xl p-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                <p className="px-2.5 py-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
                  Test Permissions
                </p>
                <button
                  onClick={() => {
                    onChangeUserRole('owner');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                    userRole === 'owner' ? 'bg-[#0A1128]/10 dark:bg-white/10 font-bold text-[#0A1128] dark:text-white' : 'text-[#0A1128] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#152238]'
                  }`}
                >
                  <span>👑</span>
                  <span>Owner (Mesum Raza)</span>
                </button>
                <button
                  onClick={() => {
                    onChangeUserRole('team_member');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                    userRole === 'team_member' ? 'bg-[#0A1128]/10 dark:bg-white/10 font-bold text-[#0A1128] dark:text-white' : 'text-[#0A1128] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#152238]'
                  }`}
                >
                  <span>👤</span>
                  <span>Team Member (Hamza)</span>
                </button>
                <button
                  onClick={() => {
                    onChangeUserRole('company_admin');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                    userRole === 'company_admin' ? 'bg-[#0A1128]/10 dark:bg-white/10 font-bold text-[#0A1128] dark:text-white' : 'text-[#0A1128] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#152238]'
                  }`}
                >
                  <span>🏢</span>
                  <span>Company Admin</span>
                </button>
                <button
                  onClick={() => {
                    onChangeUserRole('visitor');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                    userRole === 'visitor' ? 'bg-[#0A1128]/10 dark:bg-white/10 font-bold text-[#0A1128] dark:text-white' : 'text-[#0A1128] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#152238]'
                  }`}
                >
                  <span>👁️</span>
                  <span>Public Visitor (Read-Only)</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Profile Button */}
          {canEdit && (
            <button
              onClick={onOpenEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#152238] hover:bg-[#F1F5F9] text-[#0A1128] dark:text-white text-xs font-bold border border-[#E2E8F0] dark:border-white/10 transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#7EC384]" />
              <span className="hidden sm:inline">Edit ✎</span>
            </button>
          )}

          {/* View Mode (Desktop vs Mobile Preview) */}
          <div className="hidden lg:flex items-center p-0.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10">
            <button
              onClick={() => onToggleViewMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'desktop' ? 'bg-[#0A1128] dark:bg-white text-white dark:text-[#0A1128] shadow-xs' : 'text-[#475569] dark:text-[#94A3B8]'
              }`}
              title="Desktop View"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleViewMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'mobile' ? 'bg-[#0A1128] dark:bg-white text-white dark:text-[#0A1128] shadow-xs' : 'text-[#475569] dark:text-[#94A3B8]'
              }`}
              title="Mobile Card View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle (☀ Light / 🌙 Dark) */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-[#0A1128] dark:text-white bg-white dark:bg-[#152238] border border-[#E2E8F0] dark:border-white/10 hover:bg-[#F1F5F9] transition-colors shadow-2xs font-bold text-xs flex items-center gap-1"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#475569]" />
                <span className="hidden md:inline">Dark</span>
              </>
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A1128] font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </header>
  );
}
