'use client';

import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Eye, 
  EyeOff, 
  User, 
  FileText, 
  Briefcase, 
  Link2, 
  Mail, 
  Phone, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ProfileData, SharingSettings } from '@/types/profile';

interface SharingManagerProps {
  profile: Partial<ProfileData>;
  onChange: (updatedSharing: SharingSettings) => void;
}

export function SharingManager({ profile, onChange }: SharingManagerProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const identifier = profile.slug || profile.id || 'user';
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/profile/${identifier}` 
    : `https://avtive.app/profile/${identifier}`;

  const sharing = profile.sharingSettings || {};

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const toggleField = (field: keyof SharingSettings) => {
    const current = sharing[field] !== false; // defaults to true
    onChange({
      ...sharing,
      [field]: !current
    });
  };

  const visibilityFields: {
    key: keyof SharingSettings;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      key: 'photo',
      label: 'Profile Photo',
      description: 'Show your avatar on the public profile',
      icon: User
    },
    {
      key: 'nameAndTitle',
      label: 'Name & Professional Role',
      description: 'Display your full name and role badge',
      icon: Briefcase
    },
    {
      key: 'bio',
      label: 'Bio & About Summary',
      description: 'Display your introduction and statement',
      icon: FileText
    },
    {
      key: 'links',
      label: 'Link Cards Section',
      description: 'Show reorderable link showcase buttons',
      icon: Link2
    },
    {
      key: 'socialLinks',
      label: 'Social Profile Icons',
      description: 'Display LinkedIn, GitHub, X, etc. icon row',
      icon: Share2
    },
    {
      key: 'email',
      label: 'Email Contact',
      description: 'Allow visitors to view and email you directly',
      icon: Mail
    },
    {
      key: 'phone',
      label: 'Phone Number',
      description: 'Allow direct phone and WhatsApp contact',
      icon: Phone
    }
  ];

  return (
    <div className="w-full space-y-7">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-zinc-800">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-500" />
          Share & Visibility Controls
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Manage your public URL and toggle exactly what visitors see on your profile.
        </p>
      </div>

      {/* Share Link Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] shadow-xs space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Your Public Profile Link
        </label>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm font-mono text-slate-800 dark:text-zinc-200 truncate">
            {publicUrl}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black shadow-xs'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <a
            href={`/profile/${identifier}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors shrink-0"
            title="Open Public Profile"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Visibility Switches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Field Visibility
          </label>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Changes update preview live
          </span>
        </div>

        <div className="space-y-2">
          {visibilityFields.map((field) => {
            const isVisible = sharing[field.key] !== false;
            const Icon = field.icon;

            return (
              <div
                key={field.key}
                onClick={() => toggleField(field.key)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                  isVisible
                    ? 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] hover:border-slate-300'
                    : 'border-slate-200/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isVisible 
                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white' 
                      : 'bg-slate-200/50 dark:bg-zinc-800/50 text-slate-400 dark:text-zinc-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {field.label}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      {field.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div className="shrink-0">
                  <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    isVisible ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-zinc-700'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-sm transition-transform ${
                      isVisible ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
