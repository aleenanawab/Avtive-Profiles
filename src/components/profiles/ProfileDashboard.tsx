'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Sparkles,
  ExternalLink,
  Layers,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { ProfileData, UserSession, ProfileTheme } from '@/types/profile';
import { DualScreenWorkspace } from '@/components/layout/DualScreenWorkspace';

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

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || initialProfiles[0];

  useEffect(() => {
    if (profiles.length === 0) {
      try {
        const lastSaved = localStorage.getItem('avtive_last_saved_profile');
        if (lastSaved) {
          const parsed = JSON.parse(lastSaved);
          if (parsed && parsed.id) {
            setProfiles([parsed]);
            setActiveProfileId(parsed.id);
          }
        }
      } catch {}
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.profiles && data.profiles.length > 0) {
            setProfiles(data.profiles);
            setActiveProfileId(data.profiles[0].id);
          } else if (data.profile) {
            setProfiles([data.profile]);
            setActiveProfileId(data.profile.id);
          }
        })
        .catch(() => {});
    }
  }, [profiles.length]);

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

  // ──────────────────────────────────────────────────────────────────────────
  // DESKTOP WORKING SCREEN REPRESENTATION
  // ──────────────────────────────────────────────────────────────────────────
  const desktopView = (
    <div className="w-full max-w-5xl mx-auto my-auto py-6 space-y-6 text-left">
      
      {/* Dashboard Top Stats & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
            <span>Workspaces Dashboard</span>
            <span>&middot;</span>
            <span>{profiles.length} Active Identity Passes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Profile Cards &amp; Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your verified personas, launch profile editor studios, and share custom passes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/create-profile"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create New Profile</span>
          </Link>
        </div>
      </div>

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="p-10 text-center border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#0E1528] space-y-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No profiles found in your workspace yet.</p>
          <Link
            href="/create-profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Your First Profile</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((p) => {
          const isActive = p.id === activeProfile?.id;

          return (
            <div
              key={p.id}
              onClick={() => setActiveProfileId(p.id)}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-cyan-50/60 dark:bg-cyan-950/20 border-cyan-500 dark:border-cyan-400 shadow-xl ring-1 ring-cyan-500/40'
                  : 'bg-white dark:bg-[#0E1528] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
                      alt={p.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-white/10"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {p.profileName || p.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.designation || 'Professional'}</p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500 dark:bg-cyan-400 text-white dark:text-slate-950 font-mono text-[10px] font-extrabold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 py-3 border-y border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Type</span>
                    <span className="font-semibold capitalize text-cyan-600 dark:text-cyan-300">{p.type || 'Individual'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Organization</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{p.company || 'Personal'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-2 flex items-center justify-between gap-2">
                <Link
                  href={`/profile/${p.slug || p.id}/edit`}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 dark:text-cyan-300 text-xs font-bold text-center border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Studio</span>
                </Link>

                <Link
                  href={`/profile/${p.slug || p.id}`}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3 h-3" />
                  <span>Live Pass</span>
                </Link>

                <button
                  type="button"
                  onClick={(e) => handleCopyLink(p, e)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-white/10 cursor-pointer"
                  title="Copy link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // MOBILE WORKING SCREEN REPRESENTATION
  // ──────────────────────────────────────────────────────────────────────────
  const mobileView = (
    <div className="w-full flex-1 flex flex-col justify-between py-1 text-left">
      <div>
        <div className="flex items-center justify-between mb-3 text-slate-500 dark:text-slate-400">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">My Profiles ({profiles.length})</h2>
          <Link href="/create-profile" className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
            + New
          </Link>
        </div>

        {/* Mobile Profiles List */}
        {profiles.length === 0 ? (
          <div className="p-6 text-center border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0E1528] space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">No profile cards found.</p>
            <Link
              href="/create-profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 dark:bg-cyan-500 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Profile</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {profiles.map((p) => {
            const isActive = p.id === activeProfile?.id;
            return (
              <div
                key={p.id}
                onClick={() => setActiveProfileId(p.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isActive ? 'bg-cyan-50/60 dark:bg-[#151D30] border-cyan-500 dark:border-cyan-400 shadow-xs' : 'bg-white dark:bg-[#0E1528] border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{p.profileName || p.name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.designation}</p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-white/5">
                  <Link
                    href={`/profile/${p.slug || p.id}/edit`}
                    className="flex-1 py-1 text-[11px] font-bold text-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/profile/${p.slug || p.id}`}
                    className="flex-1 py-1 text-[11px] font-semibold text-center rounded-lg bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-200"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(p, e)}
                    className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between px-2 text-slate-500 dark:text-slate-400">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <Home className="w-4 h-4" />
          <span className="text-[9px]">Home</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-bold">
          <Users className="w-4 h-4" />
          <span className="text-[9px]">Profiles</span>
        </Link>
        <Link href={`/profile/${activeProfile?.slug || activeProfile?.id || ''}/share`} className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <Share2 className="w-4 h-4" />
          <span className="text-[9px]">Share</span>
        </Link>
      </div>
    </div>
  );

  return (
    <DualScreenWorkspace
      workflowTitle="Workspaces Dashboard"
      workflowSubtitle="Manage Multiple Digital Pass Identities"
      currentUrlPath="/dashboard"
      desktopContent={desktopView}
      mobileContent={mobileView}
    />
  );
}
