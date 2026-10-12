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
  LogOut,
  LayoutGrid,
  Save,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ProfileData, ProfileType, UserRole, UserSession } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface HeaderNavProps {
  currentProfile: ProfileData;
  profileType?: ProfileType;
  onSelectProfileType?: (type: ProfileType, origin?: 'company' | 'my_card' | 'direct' | 'team') => void;
  onOpenEdit?: () => void;
  onOpenShare?: () => void;
  canEdit?: boolean;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  onSaveEdits?: () => void;
  isSaving?: boolean;
  userRole?: UserRole;
  onChangeUserRole?: (role: UserRole) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  viewMode?: 'desktop' | 'mobile';
  onToggleViewMode?: (mode: 'desktop' | 'mobile') => void;
  onOpenMyCard?: () => void;
  session?: UserSession | null;
  onLogout?: () => void;
  theme?: ThemeConfig;
  onToggleSections?: () => void;
  onSectionsMouseEnter?: () => void;
  onSectionsMouseLeave?: () => void;
}

export function HeaderNav({
  currentProfile,
  profileType = 'individual',
  onSelectProfileType,
  onOpenEdit,
  onOpenShare,
  canEdit = false,
  isEditing = false,
  onCancelEdit,
  onSaveEdits,
  isSaving = false,
  isDark = false,
  onToggleTheme,
  onOpenMyCard,
  session,
  onLogout,
  theme = getThemeConfig(currentProfile.theme || 'editorial'),
  onToggleSections,
  onSectionsMouseEnter,
  onSectionsMouseLeave
}: HeaderNavProps) {
  const hasTeamOrCompany = Boolean(
    currentProfile.companyId || 
    currentProfile.companyInfo || 
    (currentProfile.teamMembers && currentProfile.teamMembers.length > 0) || 
    profileType === 'team'
  );

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md ${theme.headerBg} border-b ${theme.divider} transition-colors shadow-2xs`}>
      <div className="max-w-6xl mx-auto px-2 sm:px-6 py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
        {/* Left: Avtive Brand */}
        <Link 
          href="/"
          className="flex items-center gap-2 group cursor-pointer shrink-0"
          title="Avtive Digital Identity"
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
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} font-bold font-mono leading-none`}>
                Official
              </span>
            </div>
            <p className={`text-[10px] ${theme.textMuted} font-medium leading-tight`}>
              Digital Identity Platform
            </p>
          </div>
        </Link>

        {/* Center: Navigation Options (Only shown when profile has both Individual and Team profiles) */}
        {hasTeamOrCompany && onSelectProfileType && (
          <div className={`hidden sm:flex items-center p-0.5 sm:p-1 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-xs shrink-0`}>
            {/* 1. Individual */}
            <button
              type="button"
              onClick={onOpenMyCard}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                profileType === 'individual'
                  ? `${theme.btnPrimary} shadow-xs`
                  : `${theme.textMuted} hover:${theme.textPrimary}`
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>Individual</span>
            </button>
            
            {/* 2. Team */}
            <button
              type="button"
              onClick={() => onSelectProfileType('team', 'team')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                profileType === 'team'
                  ? `${theme.btnPrimary} shadow-xs`
                  : `${theme.textMuted} hover:${theme.textPrimary}`
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Team</span>
            </button>
          </div>
        )}

        {/* Right Controls: Edit/Save/Cancel, Sections Icon, Theme Toggle, Share, and Auth Action */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
          {/* Edit Profile Button (Visible only to authenticated profile owner when not editing) */}
          {canEdit && !isEditing && onOpenEdit && (
            <button
              type="button"
              onClick={onOpenEdit}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl ${theme.cardBg} hover:opacity-90 ${theme.textPrimary} text-xs font-bold border ${theme.cardBorder} transition-colors shadow-2xs shrink-0 cursor-pointer h-8 active:scale-95`}
              title="Edit Profile"
              aria-label="Edit Profile"
            >
              <Edit3 className={`w-3.5 h-3.5 ${theme.accentText}`} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {/* Edit Mode Actions: Cancel and Save (Visible when isEditing) */}
          {isEditing && (
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {onCancelEdit && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={isSaving}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl ${theme.cardBg} hover:opacity-90 ${theme.textSecondary} text-xs font-semibold border ${theme.cardBorder} transition-colors shadow-2xs shrink-0 cursor-pointer h-8 active:scale-95 disabled:opacity-50`}
                  title="Cancel and discard unsaved changes"
                  aria-label="Cancel Changes"
                >
                  <X className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              )}
              {onSaveEdits && (
                <button
                  type="button"
                  onClick={onSaveEdits}
                  disabled={isSaving}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl ${theme.btnPrimary} text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer h-8 active:scale-95 disabled:opacity-50`}
                  title="Save profile changes"
                  aria-label="Save Changes"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              )}
            </div>
          )}

          {/* Sections Icon Button (Desktop: Hover opens menu; Mobile: Tap toggles menu) */}
          {(onToggleSections || onSectionsMouseEnter) && (
            <button
              type="button"
              onClick={onToggleSections}
              onMouseEnter={onSectionsMouseEnter}
              onMouseLeave={onSectionsMouseLeave}
              className={`w-8 h-8 rounded-xl ${theme.cardBg} hover:opacity-90 ${theme.textPrimary} border ${theme.cardBorder} transition-colors shadow-2xs shrink-0 cursor-pointer flex items-center justify-center active:scale-95`}
              title="Profile Sections Menu"
              aria-label="Sections Menu"
            >
              <LayoutGrid className={`w-4 h-4 ${theme.accentText}`} />
            </button>
          )}

          {/* Theme Toggle (Light / Dark) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`w-8 h-8 sm:w-auto px-2 sm:px-2.5 py-1.5 rounded-xl ${theme.textPrimary} ${theme.cardBg} border ${theme.cardBorder} hover:opacity-90 transition-colors shadow-2xs font-bold text-xs flex items-center justify-center gap-1 shrink-0 cursor-pointer`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className={`w-4 h-4 ${theme.textSecondary}`} />
                  <span className="hidden md:inline">Dark</span>
                </>
              )}
            </button>
          )}

          {/* Share Button */}
          {onOpenShare && (
            <button
              type="button"
              onClick={onOpenShare}
              className={`w-8 h-8 sm:w-auto px-2 sm:px-3 py-1.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer flex items-center justify-center gap-1.5`}
              title="Share Profile"
              aria-label="Share Profile"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {/* Auth State Button */}
          {session ? (
            <button
              type="button"
              onClick={async () => {
                if (onLogout) {
                  onLogout();
                } else {
                  try {
                    if (session?.email) {
                      localStorage.setItem('avtive_remembered_identifier', session.email);
                    }
                    await fetch('/api/auth/logout', { method: 'POST' });
                  } catch {}
                  try {
                    sessionStorage.removeItem('avtive_active_session');
                  } catch {}
                  window.location.replace('/login');
                }
              }}
              className={`w-8 h-8 sm:w-auto px-2 sm:px-3 py-1.5 rounded-xl ${theme.cardBg} hover:opacity-90 ${theme.textSecondary} border ${theme.cardBorder} text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5`}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className={`w-8 h-8 sm:w-auto px-2 sm:px-3 py-1.5 rounded-xl ${theme.cardBg} hover:opacity-90 ${theme.textPrimary} border ${theme.cardBorder} text-xs font-bold transition-colors shadow-2xs shrink-0 flex items-center justify-center gap-1.5`}
              title="Sign In to Avtive"
              aria-label="Sign In"
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
