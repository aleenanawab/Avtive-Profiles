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
  Gem,
  Monitor,
  Smartphone,
  Columns,
  Eye
} from 'lucide-react';
import { 
  ProfileTheme, 
  UserSession, 
  ProfileType, 
  ProfileData,
  DEFAULT_SHARING_SETTINGS,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY 
} from '@/types/profile';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileTypeSelector } from '@/components/profiles/ProfileTypeSelector';
import { PhonePreview } from '@/components/PhonePreview';

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

  // View Mode: 'side-by-side' (Both Form + Live Phone Preview) | 'form' (Form Only) | 'preview' (Mobile Preview Only)
  const [viewMode, setViewMode] = useState<'side-by-side' | 'form' | 'preview'>('side-by-side');

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

  // Active session check
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
      if (document.visibilityState === 'visible') verifyActiveSession();
    };
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) verifyActiveSession();
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

      // Save locally to cache immediately
      if (data.profile) {
        try {
          const targetSlug = data.profile.slug || data.profile.id;
          localStorage.setItem(`avtive_profile_${targetSlug}`, JSON.stringify(data.profile));
          localStorage.setItem('avtive_last_saved_profile', JSON.stringify(data.profile));
        } catch {}
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

  // Live profile preview model constructed in real time
  const previewProfile: ProfileData = {
    id: 'preview-creating',
    userId: user.id,
    name: fullName.trim() || user.name || 'Aleena Nawab',
    slug: (profileName || fullName).toLowerCase().replace(/[^a-z0-9]/g, '-') || 'preview-profile',
    profileName: profileName.trim() || 'Primary Profile',
    profession: professionalTitle.trim() || 'Full Stack Developer',
    designation: professionalTitle.trim() || 'Full Stack Developer',
    company: 'Avtive',
    location: 'Global',
    email: user.email || 'user@avtive.app',
    phone: '+1 (555) 000-0000',
    whatsapp: '+1 (555) 000-0000',
    shortBio: bio.trim() || 'Passionate developer building modern digital solutions.',
    fullBio: bio.trim() || 'Passionate developer building modern digital solutions.',
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    theme: selectedTheme,
    type: profileType,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    experience: [],
    experiences: [],
    education: [],
    projects: [],
    services: [],
    certifications: [],
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
      { platform: 'github', url: 'https://github.com', label: 'GitHub' },
      { platform: 'website', url: 'https://avtive.app', label: 'Website' }
    ],
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
      { platform: 'github', url: 'https://github.com', label: 'GitHub' },
      { platform: 'website', url: 'https://avtive.app', label: 'Website' }
    ],
    sharingSettings: { ...DEFAULT_SHARING_SETTINGS },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },
    customFields: [],
    dynamicSections: []
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex flex-col bg-[#070B14] text-white select-none">
      
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TOP STUDIO CONTROLS & SYNCHRONIZATION BAR                                  */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <header className="w-full bg-[#0A101D]/90 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-30">
        
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Side-by-Side View (Form Left + Mobile Preview Right)"
          >
            <Columns className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Side by Side</span>
            <span className="sm:hidden">Both</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'form'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Form View Only"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Form View</span>
            <span className="sm:hidden">Form</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Live Mobile Card Preview"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Mobile Preview</span>
            <span className="sm:hidden">Preview</span>
          </button>
        </div>

        {/* Center: Live Sync Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Realtime Synchronization (Form ⇄ Mobile Card)</span>
        </div>

        {/* Right: Step Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">
            Step <span className="text-cyan-400">{step}</span> of 3
          </span>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MAIN STUDIO WORKSPACE                                                      */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 w-full flex overflow-hidden">
        
        {/* ======================================================================= */}
        {/* 1. SIDE-BY-SIDE VIEW (Default)                                         */}
        {/* ======================================================================= */}
        {viewMode === 'side-by-side' && (
          <div className="w-full flex flex-col lg:flex-row h-[calc(100vh-108px)] overflow-hidden">
            
            {/* ── LEFT SIDE: CREATION FORM WIZARD (60% width on desktop) ────────── */}
            <div className="flex-1 h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="w-full max-w-lg bg-[#111827]/90 border border-[#1F293D] rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
                <AnimatePresence mode="wait">
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                </AnimatePresence>
              </div>
            </div>

            {/* ── RIGHT SIDE: LIVE MOBILE CARD PREVIEW (40% width on desktop) ────── */}
            <aside className="w-full lg:w-[420px] xl:w-[460px] 2xl:w-[490px] shrink-0 h-full bg-[#050811] flex flex-col items-center justify-center p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              <PhonePreview profile={previewProfile} isDark={true} hideHeaderLabel={false} />
            </aside>

          </div>
        )}

        {/* ======================================================================= */}
        {/* 2. FORM VIEW ONLY                                                      */}
        {/* ======================================================================= */}
        {viewMode === 'form' && (
          <div className="w-full h-[calc(100vh-108px)] flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
            <div className="w-full max-w-lg bg-[#111827]/90 border border-[#1F293D] rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
              <AnimatePresence mode="wait">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 3. MOBILE PREVIEW ONLY                                                 */}
        {/* ======================================================================= */}
        {viewMode === 'preview' && (
          <div className="w-full h-[calc(100vh-108px)] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#050811]">
            <PhonePreview profile={previewProfile} isDark={true} hideHeaderLabel={false} />
          </div>
        )}

      </div>

    </div>
  );

  function renderStep1() {
    return (
      <motion.div
        key="step1"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-cyan-400">
            Step 1 of 3
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Choose Your Theme
          </h1>
          <p className="text-xs text-slate-400">
            Pick a style that matches your vibe. The live preview updates instantly.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {THEME_CARDS.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3.5 cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 shadow-md ring-1 ring-cyan-500/30 bg-[#16253B]'
                    : 'border-white/10 hover:border-white/20 bg-[#0E1726]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-14 h-11 rounded-lg ${theme.thumbnailBg} border ${theme.previewBorder} p-1.5 flex flex-col justify-between shrink-0 shadow-sm overflow-hidden`}>
                    <div className="flex items-center gap-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${theme.previewAccent}`} />
                      <div className="w-5 h-1 rounded-full bg-slate-400/40" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="w-7 h-1 rounded-full bg-slate-400/30" />
                      <div className="w-4 h-1 rounded-full bg-slate-400/20" />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white">
                      {theme.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {theme.subtitle}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pr-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'border-2 border-cyan-400' : 'border border-slate-600'
                    }`}
                  >
                    {isSelected && (
                      <div
                        className="w-2.5 h-2.5 rounded-full bg-cyan-400"
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all active:scale-[0.99] shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Next: Select Profile Type
          </button>
        </div>
      </motion.div>
    );
  }

  function renderStep2() {
    return (
      <motion.div
        key="step2"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Back to theme selection"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-cyan-400">
            Step 2 of 3
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Select Profile Type
          </h1>
          <p className="text-xs text-slate-400">
            Choose the type that best fits your journey.
          </p>
        </div>

        <ProfileTypeSelector
          selectedType={profileType}
          onChange={(t) => setProfileType(t)}
        />

        <div className="pt-4">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all active:scale-[0.99] shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Next: Profile Details
          </button>
        </div>
      </motion.div>
    );
  }

  function renderStep3() {
    return (
      <motion.div
        key="step3"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Back to profile type selection"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-cyan-400">
            Step 3 of 3
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create Your Profile
          </h1>
          <p className="text-xs text-slate-400">
            Add your basic information to get started.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Avatar with Edit Badge */}
        <div className="flex justify-center pt-1 pb-2">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#22354F] shadow-md bg-[#0A101D]">
              <img
                src={avatar}
                alt={fullName}
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#16273C] border border-[#2C4566] shadow-sm flex items-center justify-center text-white hover:scale-105 transition-transform cursor-pointer"
              title="Upload profile photo"
            >
              <Pencil className="w-3.5 h-3.5 text-cyan-400" />
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
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-300">
              Profile Name
            </label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. MERN Developer"
              className="figma-slate-input w-full px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aleena Nawab"
              className="figma-slate-input w-full px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-300">
              Professional Title
            </label>
            <input
              type="text"
              required
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              className="figma-slate-input w-full px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-300">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Passionate developer with a love for building modern web applications..."
              className="figma-slate-input w-full px-3.5 py-2.5 text-xs font-medium resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Profile...</span>
                </>
              ) : (
                <span>Complete Profile Creation</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    );
  }
}
