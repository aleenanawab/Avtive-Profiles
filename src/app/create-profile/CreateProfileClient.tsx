'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Pencil, 
  Loader2, 
  AlertCircle, 
  Check,
  Camera,
  Sparkles,
  Terminal,
  Gem
} from 'lucide-react';
import { ProfileTheme, UserSession, ProfileType } from '@/types/profile';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileTypeSelector } from '@/components/profiles/ProfileTypeSelector';

interface CreateProfileClientProps {
  user: UserSession;
}

interface ThemeCardData {
  id: ProfileTheme;
  title: string;
  subtitle: string;
  accent: string;
  thumbnailBg: string;
  previewCardBg: string;
  previewBorder: string;
  previewAccent: string;
}

const THEME_CARDS: ThemeCardData[] = [
  {
    id: 'editorial',
    title: 'Editorial Minimal',
    subtitle: 'Clean · Classy · Professional',
    accent: '#C2410C',
    thumbnailBg: 'bg-[#FAFAF9]',
    previewCardBg: 'bg-white',
    previewBorder: 'border-stone-200',
    previewAccent: 'bg-[#C2410C]'
  },
  {
    id: 'cyber',
    title: 'Developer Terminal',
    subtitle: 'Dark · Techy · Modern',
    accent: '#10B981',
    thumbnailBg: 'bg-[#09090B]',
    previewCardBg: 'bg-[#18181B]',
    previewBorder: 'border-zinc-800',
    previewAccent: 'bg-[#10B981]'
  },
  {
    id: 'luxe',
    title: 'Luxe Velvet',
    subtitle: 'Rich · Bold · Premium',
    accent: '#FB7185',
    thumbnailBg: 'bg-[#0D0509]',
    previewCardBg: 'bg-[#1A0C14]',
    previewBorder: 'border-[#4C1D38]',
    previewAccent: 'bg-[#FB7185]'
  }
];

export function CreateProfileClient({ user }: CreateProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Choose Theme (1/3), Step 2: Select Profile Type (2/3), Step 3: Add Profile Details (3/3)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedTheme, setSelectedTheme] = useState<ProfileTheme>('editorial');
  const [profileType, setProfileType] = useState<ProfileType>('individual');
  const [profileName, setProfileName] = useState('MERN Developer');
  const [fullName, setFullName] = useState(user.name || 'Aleena Nawab');
  const [professionalTitle, setProfessionalTitle] = useState('Full Stack Developer');
  const [bio, setBio] = useState('Passionate developer with a love for building modern web applications with clean code and intuitive user experiences.');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop');

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guard: Active session check on mount, focus, visibilitychange, and pageshow (to prevent stale state after logout)
  useEffect(() => {
    const verifyActiveSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!data.user) {
          window.location.replace('/login');
        }
      } catch {
        window.location.replace('/login');
      }
    };

    verifyActiveSession();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        verifyActiveSession();
      }
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        verifyActiveSession();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  // Handle Photo Upload
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file.');
      return;
    }
    setErrorMessage(null);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setAvatar(data.url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Profile Creation
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!profileName.trim() || !fullName.trim()) {
      setErrorMessage('Please provide both a profile name and your full name.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileName: profileName.trim(),
          name: fullName.trim(),
          profession: professionalTitle.trim() || profileName.trim(),
          designation: professionalTitle.trim() || profileName.trim(),
          shortBio: bio.trim(),
          avatar,
          theme: selectedTheme,
          type: profileType
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create profile.');
        setIsLoading(false);
        return;
      }

      // Success: redirect directly to the editing profile page
      const targetSlug = data.profile?.slug || data.profile?.id;
      if (targetSlug) {
        router.push(`/profile/${targetSlug}/edit`);
      } else {
        router.push('/profile/edit');
      }
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network error while creating profile.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm text-slate-900 dark:text-white transition-colors">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          /* ========================================================================= */
          /* SCREEN 2: CHOOSE THEME                                                    */
          /* ========================================================================= */
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Bar: Back & Step Indicator */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                1/3
              </span>
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Choose Your Theme
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Pick a style that matches your vibe. You can change it later.
              </p>
            </div>

            {/* Theme Cards List */}
            <div className="space-y-3 pt-1">
              {THEME_CARDS.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3.5 ${
                      isSelected
                        ? 'border-slate-900 dark:border-white shadow-xs ring-1 ring-slate-900/10 dark:ring-white/20 bg-slate-50/50 dark:bg-zinc-800/30'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-[#18181B]'
                    }`}
                  >
                    {/* Left: Thumbnail Preview & Metadata */}
                    <div className="flex items-center gap-3.5">
                      {/* Mini Preview Thumbnail */}
                      <div className={`w-14 h-11 rounded-lg ${theme.thumbnailBg} border ${theme.previewBorder} p-1.5 flex flex-col justify-between shrink-0 shadow-2xs overflow-hidden`}>
                        <div className="flex items-center gap-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${theme.previewAccent}`} />
                          <div className="w-5 h-1 rounded-full bg-slate-400/40" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-7 h-1 rounded-full bg-slate-400/30" />
                          <div className="w-4 h-1 rounded-full bg-slate-400/20" />
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {theme.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {theme.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Right: Radio Selector */}
                    <div className="shrink-0 pr-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-2'
                            : 'border border-slate-300 dark:border-zinc-600'
                        }`}
                        style={{
                          borderColor: isSelected ? theme.accent : undefined
                        }}
                      >
                        {isSelected && (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: theme.accent }}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Action: Next */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-6 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-sm transition-all active:scale-[0.99] shadow-sm"
              >
                Next
              </button>
            </div>
          </motion.div>
        ) : step === 2 ? (
          /* ========================================================================= */
          /* SCREEN 6: SELECT PROFILE TYPE                                             */
          /* ========================================================================= */
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Bar: Back & Step Indicator */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Back to theme selection"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                2/3
              </span>
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Select Profile Type
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Choose the type that best fits your journey.
              </p>
            </div>

            {/* Profile Type Radio Selector */}
            <ProfileTypeSelector
              selectedType={profileType}
              onChange={(t) => setProfileType(t)}
            />

            {/* Bottom Action: Next */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-3.5 px-6 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-sm transition-all active:scale-[0.99] shadow-sm"
              >
                Next
              </button>
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* SCREEN 3: CREATE YOUR PROFILE                                             */
          /* ========================================================================= */
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Bar: Back & Step Indicator */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Back to profile type selection"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                3/3
              </span>
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create Your Profile
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Add your basic information to get started.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Avatar with Edit Badge */}
            <div className="flex justify-center pt-1 pb-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-zinc-700 shadow-sm bg-slate-100 dark:bg-zinc-800">
                  <img
                    src={avatar}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Edit Pencil Icon Badge */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:scale-105 transition-transform"
                  title="Upload profile photo"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProfile} className="space-y-4">
              {/* Profile Name */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. MERN Developer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-medium bg-slate-50/50 dark:bg-zinc-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-500"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aleena Nawab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-medium bg-slate-50/50 dark:bg-zinc-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-500"
                />
              </div>

              {/* Professional Title */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Professional Title
                </label>
                <input
                  type="text"
                  required
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-medium bg-slate-50/50 dark:bg-zinc-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-500"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Passionate developer with a love for building modern web applications..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-medium bg-slate-50/50 dark:bg-zinc-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-500 resize-none"
                />
              </div>

              {/* Bottom Action: Next / Create */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <span>Next</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
