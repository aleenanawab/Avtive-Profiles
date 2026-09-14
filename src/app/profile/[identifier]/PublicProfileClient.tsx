'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ProfileData, 
  ProfileTheme, 
  ProjectItem, 
  ServiceItem, 
  TeamMemberItem,
  UserSession 
} from '@/types/profile';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { getThemeConfig } from '@/components/themeStyles';
import { Sun, Moon, LogIn, Share2, User, Home, Users } from 'lucide-react';

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

  const identifier = profile.slug || profile.id;

  return (
    <div 
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-colors duration-200 font-sans`}
    >
      {/* SECTION 3 RULE: Extremely simple header */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-md ${activeThemeConfig.headerBg} border-b ${activeThemeConfig.divider} transition-colors`}>
        <div className="max-w-md sm:max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Avtive Brand Logo */}
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
              A
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              Avtive
            </span>
          </Link>

          {/* Right: Theme Toggle + Share Button + Account/Sign In */}
          <div className="flex items-center gap-2">
            {/* Theme Light/Dark Toggle */}
            <button
              onClick={handleToggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* In-Flow Share Action (NO POPUPS) -> Direct Navigation to /share */}
            <Link
              href={`/profile/${identifier}/share`}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </Link>

            {/* Auth indicator: Dashboard access if logged in, or Sign In */}
            {session ? (
              <Link
                href="/dashboard"
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 shrink-0"
                title="Go to My Profiles"
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Profile Content Viewport */}
      <main className="flex-1 w-full max-w-md sm:max-w-xl mx-auto px-0 sm:px-4 py-0 sm:py-6 flex justify-center">
        <div className="w-full bg-white dark:bg-[#18181B] sm:rounded-3xl sm:border border-slate-200 dark:border-zinc-800/80 shadow-sm overflow-hidden">
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
          />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Matching Screen 4 & 13) */}
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
