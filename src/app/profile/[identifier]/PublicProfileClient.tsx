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
import { Sun, Moon, LogIn, Share2, User } from 'lucide-react';

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
            isDark={isDark}
          />
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium shadow-lg animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
