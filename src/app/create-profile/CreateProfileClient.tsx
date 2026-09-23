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
  ArrowRight,
  User,
  Users,
  Save,
  Upload
} from 'lucide-react';
import { ProfileTheme, UserSession, ProfileType, normalizeProfileType } from '@/types/profile';
import { DualScreenWorkspace } from '@/components/layout/DualScreenWorkspace';

interface CreateProfileClientProps {
  user: UserSession;
}

interface ThemeCardData {
  id: ProfileTheme;
  title: string;
  subtitle: string;
  accent: string;
  thumbnailBg: string;
  previewBorder: string;
}

const THEME_CARDS: ThemeCardData[] = [
  {
    id: 'editorial',
    title: 'Editorial Minimal',
    subtitle: 'Clean · Classy · Professional',
    accent: '#C2410C',
    thumbnailBg: 'bg-[#FAFAF9]',
    previewBorder: 'border-stone-200'
  },
  {
    id: 'cyber',
    title: 'Developer Terminal',
    subtitle: 'Dark · Techy · Modern',
    accent: '#10B981',
    thumbnailBg: 'bg-[#09090B]',
    previewBorder: 'border-emerald-500/30'
  },
  {
    id: 'luxe',
    title: 'Luxe Velvet',
    subtitle: 'Rich · Bold · Premium',
    accent: '#FB7185',
    thumbnailBg: 'bg-[#0D0509]',
    previewBorder: 'border-rose-500/30'
  }
];

export function CreateProfileClient({ user }: CreateProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared 3-step wizard state between Desktop and Mobile screens
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Shared Form State
  const [selectedTheme, setSelectedTheme] = useState<ProfileTheme>('editorial');
  const [profileType, setProfileType] = useState<ProfileType>('individual');
  const [profileName, setProfileName] = useState('MERN Developer');
  const [fullName, setFullName] = useState(user.name || 'Aleena Nawab');
  const [professionalTitle, setProfessionalTitle] = useState('Full Stack Developer');
  const [bio, setBio] = useState('Passionate developer with a love for building modern web applications with clean code and intuitive user experiences.');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!profileName.trim() || !fullName.trim()) {
      setErrorMessage('Please fill in both your profile persona name and your full name.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          profileName: profileName.trim(),
          profession: professionalTitle.trim(),
          designation: professionalTitle.trim(),
          shortBio: bio.trim(),
          fullBio: bio.trim(),
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

      const targetSlug = data.profile?.slug || data.profile?.id;
      router.push(`/profile/${targetSlug}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error creating profile.');
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // DESKTOP WORKING SCREEN REPRESENTATION
  // ──────────────────────────────────────────────────────────────────────────
  const desktopView = (
    <div className="w-full max-w-5xl mx-auto my-auto py-6 space-y-6 text-left">
      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />

      {/* Header & Step Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <span>Create Profile Studio</span>
            <span>&middot;</span>
            <span>Step {step} of 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {step === 1 && 'Choose Your Theme'}
            {step === 2 && 'Select Profile Type'}
            {step === 3 && 'Add Profile Details'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {step === 1 && 'Select a typography and visual styling foundation.'}
            {step === 2 && 'Choose between individual digital identity or team organization pass.'}
            {step === 3 && 'Configure your name, designation, and bio.'}
          </p>
        </div>

        {/* Step Navigation Pills */}
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Finish &amp; Create Profile</span>
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1 DESKTOP: THEMES */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {THEME_CARDS.map((tc) => {
            const isSel = selectedTheme === tc.id;
            return (
              <div
                key={tc.id}
                onClick={() => setSelectedTheme(tc.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSel ? 'bg-cyan-950/20 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40' : 'bg-[#0E1528] border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className={`w-full h-24 rounded-xl mb-4 p-3 border ${tc.thumbnailBg} ${tc.previewBorder}`}>
                    <div className="w-full h-2 rounded bg-slate-400/40 mb-2" />
                    <div className="w-20 h-2 rounded bg-slate-400/30" />
                  </div>
                  <h3 className="text-base font-bold text-white">{tc.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{tc.subtitle}</p>
                </div>
                <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-400">Accent: {tc.accent}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSel ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-white/20'}`}>
                    {isSel && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 2 DESKTOP: ROLE */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => setProfileType('individual')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
              profileType === 'individual' ? 'bg-cyan-950/20 border-cyan-400 shadow-lg ring-1 ring-cyan-500/40' : 'bg-[#0E1528] border-white/10'
            }`}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 mb-3">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Individual Profile</h3>
              <p className="text-xs text-slate-300 mt-1">Personal verified portfolio pass for professionals and freelancers.</p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex justify-end">
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${profileType === 'individual' ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-white/20'}`}>
                {profileType === 'individual' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          </div>

          <div
            onClick={() => setProfileType('team')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
              profileType === 'team' ? 'bg-cyan-950/20 border-cyan-400 shadow-lg ring-1 ring-cyan-500/40' : 'bg-[#0E1528] border-white/10'
            }`}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Team / Organization</h3>
              <p className="text-xs text-slate-300 mt-1">Collaborative team presence, organization roster, and company services.</p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex justify-end">
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${profileType === 'team' ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-white/20'}`}>
                {profileType === 'team' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 DESKTOP: DETAILS */}
      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 p-5 rounded-3xl bg-[#0E1528] border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400 group">
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 cursor-pointer"
            >
              Upload Photo
            </button>
          </div>

          <div className="md:col-span-8 p-6 rounded-3xl bg-[#0E1528] border border-white/10 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Profile Persona Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. MERN Developer"
                  className="w-full px-3 py-2 rounded-xl bg-[#070D18] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aleena Nawab"
                  className="w-full px-3 py-2 rounded-xl bg-[#070D18] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Professional Title</label>
              <input
                type="text"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="Senior Systems Architect"
                className="w-full px-3 py-2 rounded-xl bg-[#070D18] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Short Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A brief summary..."
                className="w-full px-3 py-2 rounded-xl bg-[#070D18] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>
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
        <div className="flex items-center justify-between text-slate-400 mb-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="p-1 -ml-1 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : <div />}
          <span className="text-xs font-mono font-medium tracking-wider text-slate-400">
            Step {step}/3
          </span>
        </div>

        {/* STEP 1 MOBILE */}
        {step === 1 && (
          <div className="space-y-2.5">
            <h2 className="text-lg font-bold text-white">Choose Theme</h2>
            <div className="space-y-2">
              {THEME_CARDS.map((tc) => (
                <div
                  key={tc.id}
                  onClick={() => setSelectedTheme(tc.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedTheme === tc.id ? 'bg-[#151D30] border-cyan-400 shadow-xs' : 'bg-[#0E1528] border-white/10'
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-bold text-white">{tc.title}</h3>
                    <p className="text-[10px] text-slate-400">{tc.subtitle}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTheme === tc.id ? 'border-white bg-white text-black' : 'border-zinc-700'}`}>
                    {selectedTheme === tc.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 MOBILE */}
        {step === 2 && (
          <div className="space-y-2.5">
            <h2 className="text-lg font-bold text-white">Select Profile Type</h2>
            <div className="space-y-2">
              <div
                onClick={() => setProfileType('individual')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  profileType === 'individual' ? 'bg-[#151D30] border-cyan-400 shadow-xs' : 'bg-[#0E1528] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-cyan-400" />
                  <div>
                    <h3 className="text-xs font-bold text-white">Individual</h3>
                    <p className="text-[10px] text-slate-400">Personal Identity</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${profileType === 'individual' ? 'border-white bg-white text-black' : 'border-zinc-700'}`}>
                  {profileType === 'individual' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>

              <div
                onClick={() => setProfileType('team')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  profileType === 'team' ? 'bg-[#151D30] border-cyan-400 shadow-xs' : 'bg-[#0E1528] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <div>
                    <h3 className="text-xs font-bold text-white">Team</h3>
                    <p className="text-[10px] text-slate-400">Group / Organization</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${profileType === 'team' ? 'border-white bg-white text-black' : 'border-zinc-700'}`}>
                  {profileType === 'team' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 MOBILE */}
        {step === 3 && (
          <div className="space-y-2.5">
            <h2 className="text-lg font-bold text-white">Profile Details</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white">{fullName}</div>
                  <div className="text-[10px] text-slate-400">{professionalTitle}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="figma-input w-full px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Professional Title</label>
                <input
                  type="text"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  className="figma-input w-full px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="figma-input w-full px-2.5 py-1 text-xs text-white resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Action Pill Button */}
      <div className="pt-3">
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s + 1) as any)}
            className="figma-pill-primary w-full py-3 px-5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Continue</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isLoading}
            className="figma-pill-primary w-full py-3 px-5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <span>Finish &amp; View Pass</span>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <DualScreenWorkspace
      workflowTitle="Create Profile"
      workflowSubtitle="Step-by-Step Profile Creator"
      currentUrlPath="/create-profile"
      desktopContent={desktopView}
      mobileContent={mobileView}
    />
  );
}
