'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Globe, Mail, Phone } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';
import { GithubIcon, LinkedInIcon, TwitterXIcon } from './BrandIcons';

interface HeroSectionProps {
  profile: ProfileData;
  canEdit?: boolean;
  theme?: ThemeConfig;
  navigationOrigin?: any;
  isEditing?: boolean;
  isConnected?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onOpenEdit?: () => void;
  onOpenShare?: () => void;
  onOpenConnect?: () => void;
  onNavigateToCompany?: (companyId?: string) => void;
  onNavigateBack?: () => void;
  onOpenVirtualCard?: () => void;
}

export function HeroSection({
  profile,
  canEdit = false,
  theme = getThemeConfig(profile.theme || 'editorial')
}: HeroSectionProps) {
  const router = useRouter();

  const coverUrl = profile.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop';
  const avatarUrl = profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop';
  const sharing = profile.sharingSettings || {};

  // Social Links matching Screen 9
  const socials = profile.socials || [];
  const githubLink = socials.find((s) => s.platform === 'github')?.url;
  const linkedinLink = socials.find((s) => s.platform === 'linkedin')?.url;
  const twitterLink = socials.find((s) => s.platform === 'twitter')?.url;
  const websiteLink = socials.find((s) => s.platform === 'website')?.url || profile.website;

  return (
    <div className="relative w-full text-left font-sans">
      {/* 1. Cover Image Banner */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={coverUrl}
          alt={`${profile.name} Cover`}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* SECTION 4 RULE: Show ONLY the small edit icon on the cover image */}
        {canEdit && (
          <Link
            href={`/edit-profile?id=${profile.id}`}
            className="absolute bottom-3 right-3 sm:right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Edit Profile"
          >
            <Pencil className="w-3.5 h-3.5 text-white" />
          </Link>
        )}
      </div>

      {/* 2. Identity Header */}
      <div className="px-5 sm:px-6 pb-4 -mt-12 sm:-mt-14 relative z-10 space-y-3">
        {/* Profile Photo */}
        {sharing.photo !== false && (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white dark:border-[#18181B] shadow-md bg-slate-100 dark:bg-zinc-800 shrink-0">
            <img
              src={avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Name & Professional Title */}
        {sharing.nameAndTitle !== false && (
          <div className="space-y-0.5 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {profile.name}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">
              {profile.profession || profile.designation || profile.profileName || 'Professional'}
            </p>
          </div>
        )}

        {/* Short Bio */}
        {sharing.bio !== false && profile.shortBio && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed max-w-lg">
            {profile.shortBio}
          </p>
        )}

        {/* Social Icons Row (Screen 9) */}
        {sharing.socialLinks !== false && (
          <div className="flex items-center gap-2.5 pt-1 text-slate-600 dark:text-zinc-400">
            {githubLink ? (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
                title="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center opacity-80">
                <GithubIcon className="w-4 h-4" />
              </div>
            )}

            {linkedinLink ? (
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center opacity-80">
                <LinkedInIcon className="w-4 h-4" />
              </div>
            )}

            {twitterLink ? (
              <a
                href={twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
                title="X (Twitter)"
              >
                <TwitterXIcon className="w-4 h-4" />
              </a>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center opacity-80">
                <TwitterXIcon className="w-4 h-4" />
              </div>
            )}

            {websiteLink && (
              <a
                href={websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
