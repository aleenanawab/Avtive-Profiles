'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Pencil, 
  Camera, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Check,
  Sparkles,
  Terminal,
  Gem
} from 'lucide-react';
import { ProfileData, ProfileTheme } from '@/types/profile';

interface EditProfileClientProps {
  initialProfile: ProfileData;
}

const THEME_OPTIONS: { id: ProfileTheme; name: string; thumbnailBg: string; border: string; accent: string }[] = [
  {
    id: 'cyber',
    name: 'Cyber Theme',
    thumbnailBg: 'bg-[#09090B]',
    border: 'border-zinc-800',
    accent: 'bg-[#10B981]'
  },
  {
    id: 'editorial',
    name: 'Editorial Theme',
    thumbnailBg: 'bg-[#FAFAF9]',
    border: 'border-stone-200',
    accent: 'bg-[#C2410C]'
  },
  {
    id: 'luxe',
    name: 'Luxe Theme',
    thumbnailBg: 'bg-[#0D0509]',
    border: 'border-[#4C1D38]',
    accent: 'bg-[#FB7185]'
  }
];

export function EditProfileClient({ initialProfile }: EditProfileClientProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [profileName, setProfileName] = useState(initialProfile.profileName || initialProfile.name || '');
  const [professionalTitle, setProfessionalTitle] = useState(initialProfile.designation || initialProfile.profession || '');
  const [bio, setBio] = useState(initialProfile.shortBio || initialProfile.fullBio || '');
  const [theme, setTheme] = useState<ProfileTheme>(
    initialProfile.theme === 'default' ? 'editorial' : (initialProfile.theme || 'editorial')
  );
  const [avatar, setAvatar] = useState(initialProfile.avatar || '');
  const [coverImage, setCoverImage] = useState(
    initialProfile.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'
  );

  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentThemeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  // Handle Cover Upload
  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Handle Avatar Upload
  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setAvatar(data.url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Save Changes
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: initialProfile.id,
          profileName: profileName.trim(),
          name: initialProfile.name,
          designation: professionalTitle.trim(),
          profession: professionalTitle.trim(),
          shortBio: bio.trim(),
          theme,
          avatar,
          coverImage
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save profile changes.' });
        setIsSaving(false);
        return;
      }

      setStatusMessage({ type: 'success', text: '✓ Changes saved successfully!' });
      setTimeout(() => {
        router.push(`/profile/${initialProfile.slug || initialProfile.id}`);
        router.refresh();
      }, 800);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Network error while saving changes.' });
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm text-slate-900 dark:text-white transition-colors">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h1 className="text-base font-bold text-slate-900 dark:text-white">
          Edit Profile
        </h1>

        <div className="w-8" />
      </div>

      {/* Cover Image Banner with "Edit Cover" Button (Screen 5) */}
      <div className="relative h-32 sm:h-36 w-full bg-slate-900 overflow-hidden">
        <img
          src={coverImage}
          alt="Cover Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />

        {/* Small "Edit Cover" button on bottom right of cover */}
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          disabled={isUploadingCover}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium backdrop-blur-md border border-white/20 shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
        >
          {isUploadingCover ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Camera className="w-3 h-3" />
          )}
          <span>Edit Cover</span>
        </button>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCoverUpload(file);
          }}
        />
      </div>

      {/* Profile Photo with Overlapping Badge (Screen 5) */}
      <div className="px-6 relative -mt-10 sm:-mt-12 flex justify-start">
        <div className="relative">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-white dark:border-[#18181B] shadow-md bg-slate-100 dark:bg-zinc-800">
            <img
              src={avatar}
              alt={profileName}
              className="w-full h-full object-cover"
            />
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>

          {/* Pencil Badge */}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xs flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:scale-105 transition-transform"
            title="Upload photo"
          >
            <Pencil className="w-3 h-3" />
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarUpload(file);
            }}
          />
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSaveChanges} className="p-6 space-y-4">
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

        {/* Theme Selector Row (Screen 5) */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Theme
          </label>

          <button
            type="button"
            onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/60 flex items-center justify-between gap-3 text-left hover:border-slate-300 dark:hover:border-zinc-600 transition-all"
          >
            <div className="flex items-center gap-3">
              {/* Theme mini thumbnail */}
              <div className={`w-10 h-7 rounded-md ${currentThemeOption.thumbnailBg} border ${currentThemeOption.border} p-1 flex flex-col justify-between shrink-0`}>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${currentThemeOption.accent}`} />
                  <div className="w-3 h-0.5 rounded-full bg-slate-400/40" />
                </div>
                <div className="w-4 h-0.5 rounded-full bg-slate-400/30" />
              </div>

              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {currentThemeOption.name}
              </span>
            </div>

            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isThemePickerOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* Theme Dropdown Options */}
          {isThemePickerOpen && (
            <div className="pt-1.5 space-y-1.5">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setIsThemePickerOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left text-xs transition-all ${
                    theme === t.id
                      ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                      : 'border-slate-200 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-4 rounded-xs ${t.thumbnailBg} border ${t.border}`} />
                    <span>{t.name}</span>
                  </div>
                  {theme === t.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA: Save Changes (Screen 5) */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 px-6 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
