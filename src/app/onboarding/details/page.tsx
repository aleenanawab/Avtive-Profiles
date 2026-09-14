'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Camera, Loader2, AlertCircle, Sparkles, User, Briefcase, Building, FileText } from 'lucide-react';
import { ProfileType, ProfileTheme } from '@/types/profile';

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
  const role = (searchParams.get('role') as ProfileType) || 'owner';

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileName, setProfileName] = useState(
    role === 'company' ? 'Company Headquarters' : role === 'employee' ? 'Team Member Profile' : 'MERN Developer'
  );
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState(
    role === 'company' ? 'Technology Company' : 'Full Stack Developer'
  );
  const [company, setCompany] = useState(role === 'company' ? 'Avtive Inc.' : 'Avtive');
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

      // Requirement 1.3: User lands on their own unique dynamic profile edit route
      const slug = data.profile?.slug || data.profile?.id;
      router.push(`/profile/${slug}?welcome=true`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error while saving profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center">
            3
          </span>
          <span className="text-xs font-semibold text-white/80">Step 3 of 3</span>
        </div>
        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
          Profile Details
        </span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Initial Profile Setup
        </h1>
        <p className="text-xs sm:text-sm text-white/60">
          Fill in your basic information. You can add more details and customize sharing later.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleCreateProfile} className="space-y-4 pt-1">
        {/* Avatar Selection */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <label className="text-xs font-semibold text-white/80 block">
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 shrink-0">
              <img
                src={avatar}
                alt="Selected Avatar"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="text-[11px] text-white/60">Choose a preset or upload your photo:</div>
              <div className="flex items-center gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatar === preset ? 'border-white scale-105 ring-2 ring-white/30' : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-medium border border-white/15 transition-all cursor-pointer"
                >
                  Upload Custom
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile / Persona Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-white/80">Profile Persona Name</label>
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. MERN Developer, UI/UX Designer, Company"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
            />
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-white/80">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aleena Nawab"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
            />
          </div>
        </div>

        {/* Professional Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-white/80">Professional Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                required
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="e.g. Lead Engineer"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-white/80">Company / Organization</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Avtive"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-white/80">Professional Bio</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-white/40" />
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what you do and what you specialize in..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 resize-none"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/15 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-white text-zinc-900 font-bold text-xs hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <span>Complete &amp; View Profile</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function OnboardingDetailsPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-sm">Loading details setup...</div>}>
      <DetailsStepContent />
    </Suspense>
  );
}
