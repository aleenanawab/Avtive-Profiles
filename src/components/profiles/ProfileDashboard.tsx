'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Share2, 
  Copy, 
  Trash2, 
  Check, 
  Home, 
  Users, 
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ProfileData, UserSession, ProfileTheme } from '@/types/profile';

interface ProfileDashboardProps {
  initialProfiles: ProfileData[];
  user: UserSession;
}

export function ProfileDashboard({ initialProfiles, user }: ProfileDashboardProps) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileData[]>(initialProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(
    initialProfiles[0]?.id || ''
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isCurrentProfileDropdownOpen, setIsCurrentProfileDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getThemeDisplay = (theme?: ProfileTheme | string) => {
    switch (theme) {
      case 'cyber':
      case 'developer':
        return 'Cyber Theme';
      case 'luxe':
        return 'Luxe Theme';
      case 'editorial':
      default:
        return 'Editorial Theme';
    }
  };

  const handleCopyLink = (profile: ProfileData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const identifier = profile.slug || profile.id;
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/profile/${identifier}`
      : `https://www.avtive.app/profile/${identifier}`;

    navigator.clipboard.writeText(url);
    showToast(`✓ Copied link for ${profile.profileName || profile.name}`);
    setOpenMenuId(null);
  };

  const handleDuplicate = async (profile: ProfileData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/profile/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id })
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        setProfiles((prev) => [...prev, data.profile]);
        showToast(`✓ Duplicated profile "${data.profile.profileName}"`);
      } else {
        showToast(`Failed: ${data.error || 'Could not duplicate'}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while duplicating.');
    }
  };

  const handleDeleteProfile = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/profile/${deletingId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== deletingId && p.slug !== deletingId));
        showToast('✓ Profile deleted successfully.');
        setDeletingId(null);
      } else {
        const data = await res.json();
        showToast(`Failed: ${data.error || 'Could not delete'}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleDarkMode = () => {
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('avtive_theme_pref', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('avtive_theme_pref', 'dark');
      }
      showToast(`Switched to ${isDark ? 'Light' : 'Dark'} mode`);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const firstName = (user.name || 'User').split(' ')[0];

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-white transition-colors flex flex-col font-sans pb-24 sm:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Main Container - Mobile First matching Screen 4 */}
      <div className="w-full max-w-md mx-auto px-5 pt-8 sm:pt-10 flex-1 flex flex-col space-y-6">
        {/* Top Header: Greeting & Notification Bell */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hello, {firstName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage your profiles and switch between your identities.
            </p>
          </div>

          <button
            type="button"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#09090B]" />
          </button>
        </div>

        {/* Current Profile Card with Dropdown Selector */}
        {activeProfile && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCurrentProfileDropdownOpen(!isCurrentProfileDropdownOpen)}
              className="w-full p-3 rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between gap-3 text-left hover:border-slate-300 dark:hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 shrink-0">
                  <img
                    src={activeProfile.avatar}
                    alt={activeProfile.profileName || activeProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                    Current Profile
                  </span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    {activeProfile.profileName || activeProfile.name}
                  </span>
                </div>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCurrentProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {isCurrentProfileDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 z-30 space-y-1">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActiveProfileId(p.id);
                      setIsCurrentProfileDropdownOpen(false);
                      showToast(`Switched active profile to ${p.profileName || p.name}`);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                      p.id === activeProfile.id
                        ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span>{p.profileName || p.name}</span>
                    </div>
                    {p.id === activeProfile.id && (
                      <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section: My Profiles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              My Profiles
            </h2>

            <Link
              href="/create-profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-[#18181B] text-xs font-semibold text-slate-900 dark:text-white shadow-2xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New</span>
            </Link>
          </div>

          {/* Profiles List */}
          <div className="space-y-2.5">
            {profiles.map((p) => {
              const isActive = p.id === activeProfile?.id;
              const isMenuOpen = openMenuId === p.id;
              const themeName = getThemeDisplay(p.theme);

              return (
                <div
                  key={p.id}
                  onClick={() => setActiveProfileId(p.id)}
                  className={`w-full p-3.5 rounded-2xl bg-white dark:bg-[#18181B] border transition-all flex items-center justify-between gap-3 text-left cursor-pointer ${
                    isActive
                      ? 'border-slate-300 dark:border-zinc-700 shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 shrink-0">
                      <img
                        src={p.avatar}
                        alt={p.profileName || p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {p.profileName || p.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                        <span>• {themeName}</span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            • Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions Menu */}
                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(isMenuOpen ? null : p.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Profile actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 shadow-xl p-1.5 z-40 space-y-0.5 text-xs text-slate-700 dark:text-zinc-200 animate-in fade-in duration-150">
                        <Link
                          href={`/profile/${p.slug || p.id}`}
                          onClick={() => setOpenMenuId(null)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Public Profile</span>
                        </Link>

                        <Link
                          href={`/edit-profile?id=${p.id}`}
                          onClick={() => setOpenMenuId(null)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit Profile</span>
                        </Link>

                        <Link
                          href={`/profile/${p.slug || p.id}/share`}
                          onClick={() => setOpenMenuId(null)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Share Profile</span>
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(p, e)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDuplicate(p, e)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                          <span>Duplicate</span>
                        </button>

                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingId(p.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Profile</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete this profile?
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                This action cannot be undone. Public links to this profile will no longer resolve.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Screen 4 Standard */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 transition-colors shadow-lg">
        <div className="max-w-md mx-auto px-6 py-2.5 flex items-center justify-between">
          {/* 1. Home */}
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* 2. Profiles (Active) */}
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-slate-900 dark:text-white font-semibold transition-colors"
          >
            <Users className="w-5 h-5 text-slate-900 dark:text-white" />
            <span className="text-[10px]">Profiles</span>
          </Link>

          {/* 3. Share */}
          <Link
            href={activeProfile ? `/profile/${activeProfile.slug || activeProfile.id}/share` : '/dashboard'}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Share</span>
          </Link>

          {/* 4. Settings / Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Toggle Light / Dark mode"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
