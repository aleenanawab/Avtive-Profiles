'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Link2, 
  Palette, 
  Share2, 
  User, 
  Save, 
  ExternalLink, 
  Check, 
  Loader2, 
  AlertCircle, 
  Smartphone, 
  Edit3, 
  Eye, 
  ArrowLeft,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  ProfileData, 
  ProfileTheme, 
  ProfileLink, 
  SharingSettings, 
  ensureProfileLinks 
} from '@/types/profile';
import { PhoneMockupFrame } from './PhoneMockupFrame';
import { LiveProfileRenderer } from './LiveProfileRenderer';
import { LinkManager } from './LinkManager';
import { ThemeManager } from './ThemeManager';
import { SharingManager } from './SharingManager';
import { ProfileInfoManager } from './ProfileInfoManager';

interface ProfileBuilderClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

type BuilderTab = 'links' | 'appearance' | 'sharing' | 'profile';

export function ProfileBuilderClient({
  initialProfile,
  userProfiles = []
}: ProfileBuilderClientProps) {
  const router = useRouter();

  // Normalize initial links
  const normalizedInitial: ProfileData = {
    ...initialProfile,
    links: ensureProfileLinks(initialProfile),
    buttonRadius: initialProfile.buttonRadius || 'rounded',
    buttonStyle: initialProfile.buttonStyle || 'solid',
    profileType: initialProfile.profileType || (initialProfile.type === 'company' ? 'team' : 'individual'),
    theme: initialProfile.theme || 'editorial'
  };

  // Profile State (Shared across all editor controls and the live phone preview)
  const [profile, setProfile] = useState<ProfileData>(normalizedInitial);
  const [activeTab, setActiveTab] = useState<BuilderTab>('links');
  const [mobileMode, setMobileMode] = useState<'editor' | 'preview'>('editor');
  
  // Persistence & Save State
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [statusMessage, setStatusMessage] = useState<string>('All changes saved');
  const [toast, setToast] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestProfileRef = useRef<ProfileData>(profile);
  latestProfileRef.current = profile;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Cache to localStorage on every change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && profile.id) {
        localStorage.setItem(`avtive_profile_cache_${profile.id}`, JSON.stringify(profile));
        if (profile.slug) {
          localStorage.setItem(`avtive_profile_cache_${profile.slug}`, JSON.stringify(profile));
        }
      }
    } catch {
      // ignore storage quota errors
    }
  }, [profile]);

  // Backend Persistence Handler
  const persistChanges = useCallback(async (dataToSave: ProfileData) => {
    setSaveStatus('saving');
    setStatusMessage('Saving...');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: dataToSave.id,
          slug: dataToSave.slug,
          updatedData: dataToSave
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes to server.');
      }

      setSaveStatus('saved');
      setStatusMessage('All changes saved');
      if (data.profile) {
        // Sync any server-assigned fields without overwriting active unsaved typing
        setProfile(prev => ({
          ...prev,
          id: data.profile.id || prev.id,
          slug: data.profile.slug || prev.slug
        }));
      }
    } catch (err: any) {
      console.error('Autosave error:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Error saving');
    }
  }, []);

  // Update profile with immediate UI preview update & debounced persistence
  const updateProfile = useCallback((patch: Partial<ProfileData>) => {
    setProfile(prev => {
      const next = { ...prev, ...patch };
      latestProfileRef.current = next;
      return next;
    });

    setSaveStatus('unsaved');
    setStatusMessage('Unsaved changes');

    // Debounce save by 1200ms
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      persistChanges(latestProfileRef.current);
    }, 1200);
  }, [persistChanges]);

  // Explicit Save button
  const handleManualSave = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    await persistChanges(profile);
    showToast('Profile saved successfully!');
  };

  const identifier = profile.slug || profile.id;

  return (
    <div className="min-h-screen w-full bg-[#FAFAF9] dark:bg-[#0B0F17] text-slate-900 dark:text-white flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Top Application Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#121216]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${identifier}`}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title="Return to Public Profile"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm shadow-xs">
                A
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Profile Builder
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-none">
                  @{profile.slug || profile.name}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Tab Navigation Buttons */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
            {[
              { id: 'links' as const, label: 'Links', icon: Link2 },
              { id: 'appearance' as const, label: 'Appearance', icon: Palette },
              { id: 'sharing' as const, label: 'Sharing', icon: Share2 },
              { id: 'profile' as const, label: 'Profile Info', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white dark:bg-[#18181B] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Status Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Status pill */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-zinc-500 px-2">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Saved</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Unsaved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Error</span>
                </>
              )}
            </div>

            {/* View Live Profile Button */}
            <a
              href={`/profile/${identifier}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-slate-200 dark:border-zinc-800"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live</span>
            </a>

            {/* Save Changes Button */}
            <button
              type="button"
              onClick={handleManualSave}
              disabled={saveStatus === 'saving'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {saveStatus === 'saving' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub-Header: Editor / Preview Switcher & Tab Bar */}
        <div className="md:hidden border-t border-slate-100 dark:border-zinc-800/80 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          
          {/* Segmented Control: [ Editor ] vs [ Live Preview ] */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMode('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                mobileMode === 'editor'
                  ? 'bg-white dark:bg-[#18181B] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMode('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                mobileMode === 'preview'
                  ? 'bg-white dark:bg-[#18181B] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>

          {/* Quick tab switcher when in editor mode */}
          {mobileMode === 'editor' && (
            <div className="flex items-center gap-1 shrink-0">
              {[
                { id: 'links' as const, label: 'Links' },
                { id: 'appearance' as const, label: 'Theme' },
                { id: 'sharing' as const, label: 'Share' },
                { id: 'profile' as const, label: 'Info' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === t.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

        </div>
      </header>

      {/* Main Split Body: Left Editor + Right Live Mobile Preview */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start justify-between gap-8 py-6">
        
        {/* Left / Primary Editing Area (Always Visible on Desktop, Toggleable on Mobile) */}
        <div className={`w-full lg:flex-1 lg:max-w-2xl xl:max-w-3xl pb-16 transition-all ${
          mobileMode === 'editor' ? 'block' : 'hidden lg:block'
        }`}>
          <div className="bg-transparent space-y-6">
            
            {/* Active Tab Panel */}
            {activeTab === 'links' && (
              <LinkManager
                links={profile.links || []}
                onChange={(updatedLinks) => updateProfile({ links: updatedLinks })}
              />
            )}

            {activeTab === 'appearance' && (
              <ThemeManager
                activeTheme={(profile.theme || 'editorial') as ProfileTheme}
                buttonRadius={profile.buttonRadius || 'rounded'}
                buttonStyle={profile.buttonStyle || 'solid'}
                onChange={(patch) => updateProfile(patch)}
              />
            )}

            {activeTab === 'sharing' && (
              <SharingManager
                profile={profile}
                onChange={(updatedSharing) => updateProfile({ sharingSettings: updatedSharing })}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileInfoManager
                profile={profile}
                onChange={(patch) => updateProfile(patch)}
              />
            )}

          </div>
        </div>

        {/* Right / Persistent Live Mobile Preview (Sticky on Desktop, Toggleable on Mobile) */}
        <aside className={`w-full lg:w-[380px] xl:w-[410px] shrink-0 lg:sticky lg:top-22 lg:h-[calc(100vh-6.5rem)] flex flex-col items-center justify-center transition-all ${
          mobileMode === 'preview' ? 'block' : 'hidden lg:flex'
        }`}>
          
          <div className="w-full flex flex-col items-center">
            {/* Desktop Preview Header */}
            <div className="hidden lg:flex items-center justify-between w-full max-w-[365px] mb-3 px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Live Preview
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Realtime
              </span>
            </div>

            {/* Realistic iPhone Bezel & Display */}
            <PhoneMockupFrame>
              <LiveProfileRenderer profile={profile} isLiveInteractive={true} />
            </PhoneMockupFrame>
          </div>

        </aside>

      </div>

    </div>
  );
}
