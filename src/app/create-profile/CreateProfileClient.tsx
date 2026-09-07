'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, Building, MapPin, Phone, FileText, Palette, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { ProfileTheme, UserSession } from '@/types/profile';
import { PROFILE_THEMES } from '@/components/themeStyles';

interface CreateProfileClientProps {
  user: UserSession;
}

export function CreateProfileClient({ user }: CreateProfileClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const [name, setName] = useState(user.name || '');
  const [designation, setDesignation] = useState('');
  const [company, setCompany] = useState('Avtive');
  const [location, setLocation] = useState('Islamabad, Pakistan');
  const [phone, setPhone] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ProfileTheme>('elegant');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          designation: designation.trim() || 'Professional',
          company: company.trim() || 'Avtive',
          location: location.trim() || 'Global',
          phone: phone.trim(),
          whatsapp: phone.trim(),
          shortBio: shortBio.trim() || 'Welcome to my digital profile on Avtive.',
          theme: selectedTheme
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create profile. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success: Redirect to their new profile or return destination
      const slug = data.profile?.slug || data.profile?.id;
      if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/register') && !returnUrl.includes('/create-profile')) {
        router.push(returnUrl);
      } else if (slug) {
        router.push(`/profile/${slug}`);
      } else {
        router.push('/my-profile');
      }
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network error while saving profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-left">
      {/* Brand & Heading */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <img src="/images/avtive-symbol.png" alt="Avtive" className="h-8 w-auto object-contain" />
            <span className="font-bold text-lg text-slate-900 dark:text-white">Avtive</span>
          </Link>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create Your Digital Profile
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Complete your profile to generate your verified contactless pass card and identity page.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Syed Mesum Raza Shah"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-medium bg-slate-50 dark:bg-[#18181D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Professional Title & Organization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Professional Title / Role
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-medium bg-slate-50 dark:bg-[#18181D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Company / Organization
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Avtive"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-medium bg-slate-50 dark:bg-[#18181D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Location & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Islamabad, Pakistan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-medium bg-slate-50 dark:bg-[#18181D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Phone / WhatsApp
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +92 312 5175041"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-medium bg-slate-50 dark:bg-[#18181D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Short Bio */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Short Bio
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <textarea
              rows={2}
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="Brief professional intro for your digital card..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-medium bg-slate-50 dark:bg-[#18181D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>Profile Theme</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(PROFILE_THEMES).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTheme(t.id)}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                  selectedTheme === t.id
                    ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-white/10 shadow-xs'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#18181D] hover:opacity-90'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold truncate">{t.name}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-white/10">{t.tag}</span>
                </div>
                <p className="text-[9px] text-slate-500 line-clamp-1">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <span>Create Profile & View Digital Card</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Info notice */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#18181D] border border-slate-200 dark:border-white/10 text-left space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Same-Page Editing & NFC Ready</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          Once created, you can edit your profile inline anytime, change themes, share your QR pass, or link to organizations.
        </p>
      </div>
    </div>
  );
}
