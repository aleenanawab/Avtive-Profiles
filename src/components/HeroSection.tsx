'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Camera, Globe, Mail, Phone, UserPlus, Share2, MessageSquare } from 'lucide-react';
import { ProfileData, normalizeProfileType, SocialLink } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';
import { GithubIcon, LinkedInIcon, TwitterXIcon } from './BrandIcons';
import { StatsRow } from './profiles/StatsRow';
import { ProfileSwitcher } from './profiles/ProfileSwitcher';

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
  theme = getThemeConfig(profile.theme || 'editorial'),
  onOpenEdit,
  onOpenShare,
  onOpenConnect
}: HeroSectionProps) {
  const router = useRouter();

  const coverUrl = profile.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop';
  const avatarUrl = profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop';
  const sharing = profile.sharingSettings || {};

  const normalizedType = normalizeProfileType(profile.type);
  const typeBadgeLabel = normalizedType === 'owner' ? 'Owner' : normalizedType === 'employee' ? 'Employee' : 'Company';

  const defaultStats = normalizedType === 'owner'
    ? [
        { value: profile.highlights?.[0]?.value || '5', label: profile.highlights?.[0]?.label || 'Team Members' },
        { value: profile.highlights?.[1]?.value || '3', label: profile.highlights?.[1]?.label || 'Company Projects' },
        { value: profile.highlights?.[2]?.value || '2', label: profile.highlights?.[2]?.label || 'Years' }
      ]
    : normalizedType === 'employee'
    ? [
        { value: profile.highlights?.[0]?.value || '12', label: profile.highlights?.[0]?.label || 'Team Members' },
        { value: profile.highlights?.[1]?.value || '8', label: profile.highlights?.[1]?.label || 'Projects' },
        { value: profile.highlights?.[2]?.value || '5', label: profile.highlights?.[2]?.label || 'Years' }
      ]
    : [
        { value: profile.highlights?.[0]?.value || '15+', label: profile.highlights?.[0]?.label || 'Team' },
        { value: profile.highlights?.[1]?.value || '25+', label: profile.highlights?.[1]?.label || 'Projects' },
        { value: profile.highlights?.[2]?.value || '4+', label: profile.highlights?.[2]?.label || 'Years' }
      ];

  // Social Links matching Screen 9
  const rawSocials = profile.socials;
  const socials: SocialLink[] = Array.isArray(rawSocials)
    ? rawSocials
    : rawSocials && typeof rawSocials === 'object'
    ? Object.entries(rawSocials).map(([platform, url]) => ({ platform: platform as any, url: String(url) }))
    : [];
  const githubLink = socials.find((s) => s.platform === 'github')?.url;
  const linkedinLink = socials.find((s) => s.platform === 'linkedin')?.url;
  const twitterLink = socials.find((s) => s.platform === 'twitter')?.url;
  const websiteLink = socials.find((s) => s.platform === 'website')?.url || profile.website;

  return (
    <div className="relative w-full text-left font-sans">
      {/* 1. Cover Image Banner */}
      <div className="relative h-44 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden bg-slate-900">
        <img
          src={coverUrl}
          alt={`${profile.name} Cover`}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Cover Header Controls: Multi-Role Persona Switcher & Edit Icon */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-5 flex items-center gap-2 z-20">
          <ProfileSwitcher currentProfileIdOrSlug={profile.slug || profile.id} />
          {canEdit && (
            <button
              type="button"
              onClick={onOpenEdit}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Edit Profile & Cover"
            >
              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Identity Header */}
      <div className="px-5 sm:px-8 lg:px-10 pb-6 -mt-12 sm:-mt-16 md:-mt-20 relative z-10 space-y-4">
        {/* Profile Photo */}
        {sharing.photo !== false && (
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white dark:border-[#18181B] shadow-md bg-slate-100 dark:bg-zinc-800 shrink-0">
            <img
              src={avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Profile Role Badge & Name */}
        {sharing.nameAndTitle !== false && (
          <div className="space-y-1 pt-1">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 border border-black/5 dark:border-white/10">
              {typeBadgeLabel}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {profile.name}
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-medium text-slate-500 dark:text-zinc-400">
              {profile.profession || profile.designation || profile.profileName || 'Professional'}
            </p>
            {profile.location && (
              <p className="text-xs sm:text-sm text-slate-400 dark:text-zinc-500">
                {profile.location}
              </p>
            )}
          </div>
        )}

        {/* Short Bio */}
        {sharing.bio !== false && profile.shortBio && (
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
            {profile.shortBio}
          </p>
        )}

        {/* Action Buttons Below Avatar: [ Connect ] [ Share ] with Equal Visual Importance */}
        <div className="flex items-center gap-3 pt-2 max-w-md">
          <button
            type="button"
            onClick={onOpenConnect}
            className="flex-1 py-2.5 px-5 rounded-full bg-white text-slate-950 dark:bg-white dark:text-black font-bold text-xs shadow-xs hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-white/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Connect</span>
          </button>

          <button
            type="button"
            onClick={onOpenShare}
            className="flex-1 py-2.5 px-5 rounded-full bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold text-xs shadow-xs hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-slate-700 dark:border-white/10"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>Share</span>
          </button>
        </div>

        {/* Direct Social Icon Bar: WhatsApp, Gmail, GitHub, Twitter/X, LinkedIn, Portfolio */}
        {sharing.socialLinks !== false && (
          <div className="flex items-center gap-2.5 pt-2 text-slate-600 dark:text-zinc-300">
            {profile.whatsapp && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-105"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4 text-emerald-500" />
              </a>
            )}

            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-105"
                title="Email"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-rose-500" />
              </a>
            )}

            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-105"
                title="GitHub"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4 text-zinc-900 dark:text-white" />
              </a>
            )}

            {linkedinLink && (
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-105"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4 text-blue-500" />
              </a>
            )}

            {twitterLink && (
              <a
                href={twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-105"
                title="Twitter / X"
                aria-label="Twitter / X"
              >
                <TwitterXIcon className="w-4 h-4 text-zinc-900 dark:text-white" />
              </a>
            )}

            {websiteLink && (
              <a
                href={websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-105"
                title="Portfolio"
                aria-label="Portfolio"
              >
                <Globe className="w-4 h-4 text-amber-500" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
