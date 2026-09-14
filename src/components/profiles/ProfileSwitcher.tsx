'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronDown, 
  Check, 
  Plus, 
  LayoutGrid, 
  Sparkles, 
  Terminal, 
  Gem, 
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { ProfileData, ProfileTheme } from '@/types/profile';

interface ProfileSwitcherProps {
  currentProfileIdOrSlug?: string;
  initialProfiles?: ProfileData[];
  onSelectProfile?: (profile: ProfileData) => void;
  className?: string;
}

export function ProfileSwitcher({
  currentProfileIdOrSlug,
  initialProfiles,
  onSelectProfile,
  className = ''
}: ProfileSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [profiles, setProfiles] = useState<ProfileData[]>(initialProfiles || []);
  const [loading, setLoading] = useState(!initialProfiles);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch profiles if not supplied
  useEffect(() => {
    if (!initialProfiles) {
      fetch('/api/profile/list')
        .then((res) => res.json())
        .then((data) => {
          if (data.profiles) {
            setProfiles(data.profiles);
          }
        })
        .catch((err) => console.error('Failed to load profiles for switcher', err))
        .finally(() => setLoading(false));
    }
  }, [initialProfiles]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading || profiles.length === 0) {
    return null;
  }

  // Active profile
  const activeProfile = profiles.find(
    (p) => p.id === currentProfileIdOrSlug || p.slug === currentProfileIdOrSlug
  ) || profiles[0];

  const getThemeBadge = (theme?: ProfileTheme) => {
    switch (theme) {
      case 'cyber':
        return {
          label: 'Cyber',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <Terminal className="w-3 h-3 text-emerald-400" />
        };
      case 'luxe':
        return {
          label: 'Luxe',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <Gem className="w-3 h-3 text-rose-400" />
        };
      case 'editorial':
        return {
          label: 'Editorial',
          bg: 'bg-amber-600/10 border-amber-600/30 text-amber-600 dark:text-amber-400',
          icon: <Sparkles className="w-3 h-3 text-amber-500" />
        };
      default:
        return {
          label: theme || 'Classic',
          bg: 'bg-stone-500/10 border-stone-500/20 text-stone-600 dark:text-stone-300',
          icon: <Briefcase className="w-3 h-3" />
        };
    }
  };

  const handleSwitch = (profile: ProfileData) => {
    setIsOpen(false);
    if (onSelectProfile) {
      onSelectProfile(profile);
    } else {
      router.push(`/profile/${profile.slug || profile.id}`);
    }
  };

  const activeThemeBadge = getThemeBadge(activeProfile?.theme);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 transition-all text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-2xs group"
        aria-expanded={isOpen}
        title="Switch active professional profile"
      >
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal hidden md:inline">
          Profile:
        </span>
        <span className="font-bold truncate max-w-[130px] sm:max-w-[180px]">
          {activeProfile?.profileName || activeProfile?.name || 'My Profile'}
        </span>
        <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-md border font-mono ${activeThemeBadge.bg}`}>
          {activeThemeBadge.label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          {/* Menu Header */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800/80 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
              Switch Profile
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono">
              {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'}
            </span>
          </div>

          {/* Profile List */}
          <div className="max-h-64 overflow-y-auto space-y-1 py-1">
            {profiles.map((p) => {
              const isSelected = p.id === activeProfile?.id;
              const badge = getThemeBadge(p.theme);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSwitch(p)}
                  className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl transition-all text-left ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                      alt={p.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs truncate font-bold leading-snug">
                        {p.profileName || p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {p.designation || p.profession || 'Professional'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border font-mono ${badge.bg}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-2 mt-1 border-t border-slate-100 dark:border-zinc-800/80 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span>All Profiles Dashboard</span>
            </Link>
            <Link
              href="/create-profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create New Profile</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
