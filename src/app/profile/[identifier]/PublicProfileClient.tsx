'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ProfileData, 
  ProfileTheme, 
  UserSession 
} from '@/types/profile';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { getThemeConfig } from '@/components/themeStyles';
import { 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  Share2, 
  Home, 
  Users, 
  Layout, 
  LayoutGrid, 
  ChevronDown, 
  Edit3, 
  Check 
} from 'lucide-react';

interface PublicProfileClientProps {
  initialProfile: ProfileData;
  session: UserSession | null;
  isOwner: boolean;
}

export function PublicProfileClient({
  initialProfile,
  session,
  isOwner
}: PublicProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme && initialProfile.theme !== 'default' ? initialProfile.theme : 'editorial'
  );
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'web'>('standard');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeThemeConfig = getThemeConfig(activeTheme);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const hasDark = document.documentElement.classList.contains('dark');
    setIsDark(hasDark);
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('avtive_theme_pref', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('avtive_theme_pref', 'light');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const identifier = profile.slug || profile.id;

  const profileLabel = profile.slug === 'avtive' || profile.type === 'company'
    ? 'Company (Avtive)'
    : profile.slug === 'hamza-malik' || profile.type === 'employee'
    ? 'Employee (Hamza)'
    : 'Owner (Mesum)';

  return (
    <div 
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-colors duration-200 font-sans`}
    >
      {/* FULL-WIDTH APPLICATION HEADER (Desktop & Mobile Responsive) */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-md ${activeThemeConfig.headerBg} border-b ${activeThemeConfig.divider} transition-colors shadow-2xs`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Avtive Brand Logo + Public Profile Indicator Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <img
                src="/images/avtive-symbol.png"
                alt="Avtive"
                className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                Avtive
              </span>
            </Link>

            {/* Public Profile Badge (Matching Reference Screenshot) */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-mono tracking-wide">
              Public Profile
            </span>
          </div>

          {/* Right Controls: Theme, Share, Web View, Edit, Profile Selector, My Profiles, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span className="hidden md:inline text-[11px]">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Share Button (in-flow link to /share) */}
            <Link
              href={`/profile/${identifier}/share`}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs"
              title="Share Profile"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Share</span>
            </Link>

            {/* Web View Button (Screen 1 & Requirement 5 & 13) */}
            <button
              onClick={() => setViewMode(viewMode === 'web' ? 'standard' : 'web')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                viewMode === 'web'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                  : 'border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title="Toggle Web View Desktop Presentation"
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="text-[11px]">Web View</span>
              {viewMode === 'web' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </button>

            {/* Edit Button (for owner) */}
            {isOwner && (
              <Link
                href={`/edit-profile?id=${profile.id}`}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs"
                title="Edit Profile"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Edit</span>
              </Link>
            )}

            {/* Profile Selector Dropdown (Owner / Employee / Company) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs"
                title="Switch Profile View"
              >
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 hidden xl:inline">Profile:</span>
                <span className="font-bold text-[11px]">{profileLabel}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 shadow-xl p-1.5 z-50 space-y-1 text-left animate-in fade-in duration-150">
                  <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Avtive Profiles & Roles
                  </p>
                  <Link
                    href="/profile/syedmesumraza"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      profile.slug === 'syedmesumraza'
                        ? 'bg-slate-100 dark:bg-zinc-800 font-bold text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>👑</span>
                      <span>Owner (Mesum Raza)</span>
                    </div>
                    {profile.slug === 'syedmesumraza' && <Check className="w-3.5 h-3.5" />}
                  </Link>

                  <Link
                    href="/profile/hamza-malik"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      profile.slug === 'hamza-malik'
                        ? 'bg-slate-100 dark:bg-zinc-800 font-bold text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>Employee (Hamza Malik)</span>
                    </div>
                    {profile.slug === 'hamza-malik' && <Check className="w-3.5 h-3.5" />}
                  </Link>

                  <Link
                    href="/profile/avtive"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      profile.slug === 'avtive'
                        ? 'bg-slate-100 dark:bg-zinc-800 font-bold text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>🏢</span>
                      <span>Company (Avtive)</span>
                    </div>
                    {profile.slug === 'avtive' && <Check className="w-3.5 h-3.5" />}
                  </Link>
                </div>
              )}
            </div>

            {/* My Profiles Button */}
            <Link
              href="/dashboard"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs"
              title="Go to My Profiles Dashboard"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">My Profiles</span>
            </Link>

            {/* Logout / Sign In */}
            {session ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-400 text-xs font-semibold transition-colors shadow-2xs"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Profile Content Viewport - Responsive Desktop Width (NOT a phone mockup) */}
      <main className={`flex-1 w-full mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 flex justify-center transition-all duration-300 ${
        viewMode === 'web' ? 'max-w-6xl xl:max-w-7xl' : 'max-w-4xl lg:max-w-5xl'
      }`}>
        <div className="w-full bg-white dark:bg-[#18181B] sm:rounded-3xl sm:border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          <AvtiveDigitalCard
            profile={{ ...profile, theme: activeTheme }}
            canEdit={isOwner}
            isEditing={false}
            isConnected={false}
            onOpenEdit={() => router.push(`/edit-profile?id=${profile.id}`)}
            onSaveContact={() => {}}
            onOpenShare={() => router.push(`/profile/${identifier}/share`)}
            onOpenConnect={() => {}}
            onOpenQRModal={() => {}}
            onOpenResumeModal={() => {}}
            onSelectProject={() => {}}
            onSelectTeamMember={(member) => {
              const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
              router.push(`/profile/${slug}`);
            }}
            onViewCompany={() => router.push('/profile/avtive')}
            isDark={isDark}
            viewMode={viewMode}
          />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar - STRICTLY HIDDEN ON TABLET & DESKTOP (sm:hidden) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 transition-colors shadow-lg">
        <div className="max-w-md mx-auto px-6 py-2 flex items-center justify-between">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profiles</span>
          </Link>

          <Link
            href={`/profile/${identifier}/share`}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Share</span>
          </Link>

          <button
            type="button"
            onClick={handleToggleTheme}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Toggle Light / Dark mode"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            <span className="text-[10px] font-medium">Mode</span>
          </button>
        </div>
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium shadow-lg animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
