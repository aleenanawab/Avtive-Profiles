'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Camera, Loader2, AlertCircle, Sparkles, User, Briefcase, Building, FileText } from 'lucide-react';
import { ProfileType, ProfileTheme, normalizeProfileType } from '@/types/profile';
import { motion } from 'framer-motion';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop'
];

function DetailsStepContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = (searchParams.get('theme') as ProfileTheme) || 'editorial';
  const role = normalizeProfileType(searchParams.get('role') || 'individual');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileName, setProfileName] = useState(
    role === 'team' ? 'Team Profile' : 'Personal Profile'
  );
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState(
    role === 'team' ? 'Team / Organization' : 'Full Stack Developer'
  );
  const [company, setCompany] = useState(role === 'team' ? 'Avtive Inc.' : 'Avtive');
  const [bio, setBio] = useState(
    'Passionate professional focused on delivering intuitive digital experiences with modern technology and clean architecture.'
  );
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch session to prefill user's name
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.name && !fullName) {
          setFullName(data.user.name);
        }
      })
      .catch(() => {});
  }, [fullName]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setAvatar(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    router.push(`/onboarding/role?theme=${theme}&role=${role}`);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!profileName.trim()) {
      setErrorMessage('Please provide a profile persona name (e.g., MERN Developer).');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
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
          company: company.trim(),
          shortBio: bio.trim(),
          fullBio: bio.trim(),
          avatar,
          theme,
          type: role,
          skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'],
          projects: [
            {
              id: 'proj-1',
              title: 'Avtive Profiles Platform',
              description: 'Digital verified identity cards and granular privacy profiles.',
              technologies: ['Next.js', 'Tailwind CSS', 'TypeScript']
            }
          ]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create profile. Please try again.');
        setIsLoading(false);
        return;
      }

      // Step 5: Route directly to My Profiles dashboard per specification
      router.push('/dashboard?created=true');
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error while saving profile. Please try again.');
      setIsLoading(false);
    }
  };

  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');

  // Sync firstName and secondName to fullName
  useEffect(() => {
    if (fullName && !firstName && !secondName) {
      const parts = fullName.trim().split(' ');
      setFirstName(parts[0] || '');
      setSecondName(parts.slice(1).join(' ') || '');
    }
  }, [fullName, firstName, secondName]);

  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    setFullName(`${val} ${secondName}`.trim());
  };

  const handleSecondNameChange = (val: string) => {
    setSecondName(val);
    setFullName(`${firstName} ${val}`.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="figma-phone-frame w-full max-w-[390px] p-0 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Mobile Top Status Bar inside phone frame */}
      <div className="absolute top-2 left-0 right-0 z-30 px-6 py-1 flex items-center justify-between text-xs font-semibold text-white/90 font-mono drop-shadow">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
          </svg>
          <div className="w-5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
            <div className="w-full h-full bg-current rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Top Banner with Mountain Dusk Photo & Edit Buttons */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop"
          alt="Cover Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Banner Controls matching Screen 5 in Figma */}
        <div className="absolute top-9 left-4 z-20">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-black/70 cursor-pointer"
            title="Upload banner photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute top-9 right-4 z-20">
          <div className="px-2.5 py-1 rounded-full bg-black/50 text-white text-[10px] font-mono backdrop-blur-md border border-white/20">
            {theme}
          </div>
        </div>
      </div>

      {/* Overlapping Centered Circular Avatar */}
      <div className="relative px-6 -mt-12 text-center flex flex-col items-center">
        <div className="relative w-20 h-20 rounded-full border-2 border-white dark:border-zinc-800 shadow-xl overflow-hidden bg-slate-800">
          <img
            src={avatar}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/35 hover:bg-black/50 flex items-center justify-center transition-colors cursor-pointer"
            title="Change Avatar"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />

        <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          {fullName || 'Aleena Nawab'}
        </h2>
        <span className="sr-only">Initial Profile Setup</span>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mx-6 mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Fields: Two Columns (Full Name, Second Name), Title, Bio */}
      <form onSubmit={handleCreateProfile} className="p-6 pt-3 space-y-3.5">
        <div className="sr-only">
          <label htmlFor="profilePersonaName">Profile Persona Name</label>
          <input
            id="profilePersonaName"
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Profile Persona Name"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 ml-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              placeholder="Full Name"
              className="figma-input w-full px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 ml-1">
              Second Name
            </label>
            <input
              type="text"
              value={secondName}
              onChange={(e) => handleSecondNameChange(e.target.value)}
              placeholder="Second Name"
              className="figma-input w-full px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="space-y-1 text-left">
          <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 ml-1">
            Professional Title
          </label>
          <input
            type="text"
            required
            value={professionalTitle}
            onChange={(e) => setProfessionalTitle(e.target.value)}
            placeholder="Professional Title"
            className="figma-input w-full px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-1 text-left">
          <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 ml-1">
            Bio
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
            className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 resize-none placeholder:text-slate-400 dark:placeholder:text-zinc-600"
          />
        </div>

        {/* Action Buttons matching Screen 5 in Figma */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => router.push('/figma')}
            className="figma-pill-secondary py-2.5 text-xs font-semibold cursor-pointer text-center"
          >
            Share
          </button>
          <button
            type="button"
            className="figma-pill-primary py-2.5 text-xs font-semibold cursor-pointer text-center"
          >
            Connect
          </button>
        </div>

        {/* Primary Submit Pill Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="figma-pill-primary w-full py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default function OnboardingDetailsPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-sm">Loading details setup...</div>}>
      <DetailsStepContent />
    </Suspense>
  );
}
