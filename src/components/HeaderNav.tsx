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
  ChevronDown,
  LogIn, 
  LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { ProfileData, ProfileType, UserRole, UserSession } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface HeaderNavProps {
  currentProfile: ProfileData;
  profileType: ProfileType;
  onSelectProfileType: (type: ProfileType, origin?: 'company' | 'my_card' | 'direct' | 'team') => void;
  onOpenEdit: () => void;
  onOpenShare: () => void;
  canEdit: boolean;
  isEditing?: boolean;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: (mode: 'desktop' | 'mobile') => void;
  onOpenMyCard: () => void;
  session?: UserSession | null;
  onLogout?: () => void;
  theme?: ThemeConfig;
}

export function HeaderNav({
  currentProfile,
  profileType,
  onSelectProfileType,
  onOpenEdit,
  onOpenShare,
  canEdit,
  isEditing = false,
  userRole,
  onChangeUserRole,
  isDark,
  onToggleTheme,
  viewMode,
  onToggleViewMode,
  onOpenMyCard,
  session,
  onLogout,
  theme = getThemeConfig(currentProfile.theme || 'elegant')
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
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md ${theme.headerBg} border-b ${theme.divider} transition-colors shadow-2xs`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Avtive Brand */}
        <div 
          onClick={() => onSelectProfileType('team', 'direct')}
          className="flex items-center gap-2 cursor-pointer group"
          title="Go to Avtive Team Profile"
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
              <span className={`font-bold text-sm ${theme.accentText} tracking-tight`}>
                Avtive
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${theme.badgeBg} ${theme.badgeText} font-bold font-mono`}>
                Official
              </span>
            </div>
            <p className={`text-[10px] ${theme.textMuted} font-medium`}>
              Islamabad, Pakistan
            </p>
          </div>
        </div>

        {/* Center: Navigation Options (Individual + Team) */}
        <div className={`flex items-center p-0.5 sm:p-1 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-xs shrink-0`}>
          {/* 1. Individual */}
          <button
            onClick={onOpenMyCard}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold transition-all ${
              profileType === 'individual'
                ? `${theme.btnPrimary} shadow-xs`
                : `${theme.textMuted} hover:${theme.textPrimary}`
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline">Individual</span>
            <span className="xs:hidden sm:hidden">Me</span>
          </button>
          
          {/* 2. Company */}
          <button
            onClick={() => onSelectProfileType('team', 'team')}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold transition-all ${
              profileType === 'team'
                ? `${theme.btnPrimary} shadow-xs`
                : `${theme.textMuted} hover:${theme.textPrimary}`
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Company</span>
          </button>
        </div>

        {/* Right Controls: Permissions Switcher, Edit Button, Theme & Share */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Permissions / Role Switcher */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl ${theme.cardBg} text-xs font-bold ${theme.textPrimary} border ${theme.cardBorder} hover:opacity-90 transition-colors shadow-2xs`}
              title="Switch user permission role"
            >
              <span>{getRoleLabel(userRole).icon}</span>
              <span className="hidden lg:inline text-[11px]">{getRoleLabel(userRole).label}</span>
              <ChevronDown className={`w-3 h-3 ${theme.textMuted}`} />
            </button>

            {isRoleDropdownOpen && (
              <div className={`absolute right-0 top-full mt-1.5 w-48 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl p-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150`}>
                <p className={`px-2.5 py-1 text-[10px] font-bold ${theme.textMuted} uppercase tracking-wider font-mono`}>
                  Test Permissions
                </p>
                <button
                  onClick={() => {
                    onChangeUserRole('owner');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                    userRole === 'owner' ? `${theme.badgeBg} font-bold ${theme.accentText}` : `${theme.textPrimary} hover:${theme.badgeBg}`
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
                    userRole === 'team_member' ? `${theme.badgeBg} font-bold ${theme.accentText}` : `${theme.textPrimary} hover:${theme.badgeBg}`
                  }`}
                >
                  <span>👤</span>
                  <span>Member (Hamza Malik)</span>
                </button>
                <button
                  onClick={() => {
                    onChangeUserRole('company_admin');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                    userRole === 'company_admin' ? `${theme.badgeBg} font-bold ${theme.accentText}` : `${theme.textPrimary} hover:${theme.badgeBg}`
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
                    userRole === 'visitor' ? `${theme.badgeBg} font-bold ${theme.accentText}` : `${theme.textPrimary} hover:${theme.badgeBg}`
                  }`}
                >
                  <span>👁️</span>
                  <span>Public Visitor</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Profile Button (Header Action) */}
          {canEdit && !isEditing && (
            <button
              onClick={onOpenEdit}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl ${theme.cardBg} hover:opacity-90 ${theme.textPrimary} text-xs font-bold border ${theme.cardBorder} transition-colors shadow-2xs shrink-0`}
            >
              <Edit3 className={`w-3.5 h-3.5 ${theme.accentText}`} />
              <span className="hidden sm:inline">Edit ✎</span>
            </button>
          )}

          {/* View Mode (Desktop vs Mobile Preview) */}
          <div className={`hidden lg:flex items-center p-0.5 rounded-xl ${theme.cardBg} border ${theme.cardBorder} shrink-0`}>
            <button
              onClick={() => onToggleViewMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'desktop' ? `${theme.btnPrimary} shadow-xs` : `${theme.textMuted}`
              }`}
              title="Desktop View"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleViewMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'mobile' ? `${theme.btnPrimary} shadow-xs` : `${theme.textMuted}`
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
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl ${theme.textPrimary} ${theme.cardBg} border ${theme.cardBorder} hover:opacity-90 transition-colors shadow-2xs font-bold text-xs flex items-center gap-1 shrink-0`}
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
            className={`flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Auth State Button (Sign In or Logout) */}
          {session ? (
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <Link
                href="/my-profile"
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl ${theme.badgeBg} ${theme.badgeText} text-xs font-bold transition-colors shadow-2xs hover:opacity-90 shrink-0`}
                title="View My Profile"
              >
                <span>My Profile</span>
              </Link>
              <button
                onClick={async () => {
                  if (onLogout) {
                    onLogout();
                  } else {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                    } catch {}
                    window.location.replace('/login');
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl ${theme.cardBg} hover:opacity-90 ${theme.textSecondary} border ${theme.cardBorder} text-xs font-bold transition-colors`}
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl ${theme.cardBg} hover:opacity-90 ${theme.textPrimary} border ${theme.cardBorder} text-xs font-bold transition-colors shadow-2xs shrink-0`}
              title="Sign In"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
