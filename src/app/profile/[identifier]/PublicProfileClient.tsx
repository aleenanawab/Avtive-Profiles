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
  Edit3 
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
  const [isEditing, setIsEditing] = useState(false);
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

  const handleSaveEdits = async (updatedData: ProfileData) => {
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          updatedData
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes.');
      }
      setProfile(data.profile || updatedData);
      setIsEditing(false);
      showToast('Profile saved successfully!');
    } catch (err: any) {
      console.error('Update profile error:', err);
      showToast(err.message || 'Failed to save profile changes.');
      throw err;
    }
  };

  const identifier = profile.slug || profile.id;

  return (
    <div 
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-colors duration-200 font-sans`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* FULL-WIDTH APPLICATION HEADER (Desktop & Mobile Responsive) */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-md ${activeThemeConfig.headerBg} border-b ${activeThemeConfig.divider} transition-colors shadow-2xs`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Avtive Brand Logo + Public Profile Indicator Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
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
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-mono tracking-wide">
              Public Profile
            </span>
          </div>

          {/* Middle: Profile Type Switcher (Owner / Employee / Company visibly in header) */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
            <Link
              href="/profile/syedmesumraza"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                profile.slug === 'syedmesumraza'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Owner Profile (Mesum Raza)"
            >
              <span>👑</span>
              <span className="text-[11px]">Owner</span>
            </Link>

            <Link
              href="/profile/hamza-malik"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                profile.slug === 'hamza-malik'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Employee Profile (Hamza Malik)"
            >
              <span>👤</span>
              <span className="text-[11px]">Employee</span>
            </Link>

            <Link
              href="/profile/avtive"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                profile.slug === 'avtive'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Company Profile (Avtive)"
            >
              <span>🏢</span>
              <span className="text-[11px]">Company</span>
            </Link>
          </div>

          {/* Right Controls: Edit, Web View, Share, Theme, Account */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Edit Button (for owner - activates same-page editing) */}
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                  isEditing
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200'
                }`}
                title="Edit Profile"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">{isEditing ? 'Editing' : 'Edit'}</span>
              </button>
            )}

            {/* Web View Presentation Toggle Button */}
            <button
              onClick={() => setViewMode(viewMode === 'web' ? 'standard' : 'web')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
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

            {/* Share Button (in-flow link to /share) */}
            <Link
              href={`/profile/${identifier}/share`}
              className="hidden sm:flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs"
              title="Share Profile"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Share</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            {/* My Profiles Dashboard Button */}
            <Link
              href="/dashboard"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs"
              title="Go to My Profiles Dashboard"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">My Profiles</span>
            </Link>

            {/* Logout / Sign In */}
            {session ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-400 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
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
            isEditing={isEditing}
            isConnected={false}
            onOpenEdit={() => setIsEditing(true)}
            onCancelEdit={() => setIsEditing(false)}
            onSaveEdits={handleSaveEdits}
            onSaveContact={() => showToast('Contact information saved!')}
            onOpenShare={() => router.push(`/profile/${identifier}/share`)}
            onOpenConnect={() => showToast('Connected!')}
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

          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Edit3 className="w-5 h-5" />
              <span className="text-[10px] font-medium">{isEditing ? 'Done' : 'Edit'}</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
