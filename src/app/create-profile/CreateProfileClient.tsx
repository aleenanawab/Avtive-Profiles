'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Check, 
  Camera, 
  ArrowRight,
  User,
  Users,
  Save
} from 'lucide-react';
import { ProfileTheme, UserSession, ProfileType } from '@/types/profile';
import { DualScreenWorkspace } from '@/components/layout/DualScreenWorkspace';

interface CreateProfileClientProps {
  user: UserSession;
}

export function CreateProfileClient({ user }: CreateProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Streamlined 2-step wizard state between Desktop and Mobile screens (No repetitive theme prompt)
  const [step, setStep] = useState<1 | 2>(1);

  // Shared Form State
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
          theme: 'editorial',
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
            <span>Step {step} of 2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {step === 1 && 'Select Profile Type'}
            {step === 2 && 'Add Profile Details'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {step === 1 && 'Choose between individual digital identity or team organization pass.'}
            {step === 2 && 'Configure your name, designation, bio, and avatar.'}
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

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
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

      {/* STEP 1 DESKTOP: ROLE */}
      {step === 1 && (
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

      {/* STEP 2 DESKTOP: DETAILS */}
      {step === 2 && (
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
              onClick={() => setStep(1)}
              className="p-1 -ml-1 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : <div />}
          <span className="text-xs font-mono font-medium tracking-wider text-slate-400">
            Step {step}/2
          </span>
        </div>

        {/* STEP 1 MOBILE */}
        {step === 1 && (
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

        {/* STEP 2 MOBILE */}
        {step === 2 && (
          <div className="space-y-2.5">
            <h2 className="text-lg font-bold text-white">Profile Details</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-cyan-400" />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{fullName || 'Your Name'}</div>
                  <div className="text-[10px] text-slate-400">{professionalTitle || 'Professional Title'}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Profile Persona Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. MERN Developer"
                  className="figma-input w-full px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="figma-input w-full px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Professional Title</label>
                <input
                  type="text"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="figma-input w-full px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short bio description..."
                  className="figma-input w-full px-2.5 py-1 text-xs text-white resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Action Pill Button */}
      <div className="pt-3">
        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep(2)}
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
