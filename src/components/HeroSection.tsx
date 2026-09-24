'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Camera, Globe, Mail, Phone, UserPlus, Share2, MessageSquare } from 'lucide-react';
import { ProfileData, normalizeProfileType, SocialLink } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';
import { GithubIcon, LinkedInIcon, TwitterXIcon, WhatsAppIcon } from './BrandIcons';
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
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function HeroSection({
  profile,
  canEdit = false,
  theme = getThemeConfig(profile.theme || 'editorial'),
  onOpenEdit,
  onOpenShare,
  onOpenConnect,
  onSelectSection
}: HeroSectionProps) {
  const router = useRouter();

  const coverUrl = profile.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop';
  const avatarUrl = profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop';
  const sharing = profile.sharingSettings || {};

  const normalizedType = normalizeProfileType(profile.type);
  const typeBadgeLabel = normalizedType === 'team' ? 'Team' : 'Individual';

  const defaultStats = normalizedType === 'team'
    ? [
        { value: profile.highlights?.[0]?.value || '15+', label: profile.highlights?.[0]?.label || 'Team' },
        { value: profile.highlights?.[1]?.value || '25+', label: profile.highlights?.[1]?.label || 'Projects' },
        { value: profile.highlights?.[2]?.value || '4+', label: profile.highlights?.[2]?.label || 'Years' }
      ]
    : [
        { value: profile.highlights?.[0]?.value || '5', label: profile.highlights?.[0]?.label || 'Projects' },
        { value: profile.highlights?.[1]?.value || '3', label: profile.highlights?.[1]?.label || 'Credentials' },
        { value: profile.highlights?.[2]?.value || '2+', label: profile.highlights?.[2]?.label || 'Years' }
      ];

  // Dynamic Social Links strictly preserving user dragged & saved order
  const rawSocials = (Array.isArray(profile.socials) && profile.socials.length > 0)
    ? profile.socials
    : (Array.isArray(profile.socialLinks) && profile.socialLinks.length > 0)
    ? profile.socialLinks
    : (profile.socials && typeof profile.socials === 'object')
    ? Object.entries(profile.socials).map(([platform, url]) => ({ platform: platform as any, url: String(url) }))
    : [];

  const socials: SocialLink[] = rawSocials.filter((s: any) => s && s.url && typeof s.url === 'string' && s.url.trim() !== '');

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <GithubIcon className="w-4 h-4 text-zinc-900 dark:text-white" />;
      case 'linkedin':
        return <LinkedInIcon className="w-4 h-4 text-blue-500" />;
      case 'twitter':
      case 'x':
        return <TwitterXIcon className="w-4 h-4 text-zinc-900 dark:text-white" />;
      case 'whatsapp':
        return <WhatsAppIcon className="w-4 h-4 text-emerald-500" />;
      case 'email':
      case 'mail':
        return <Mail className="w-4 h-4 text-rose-500" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'website':
      default:
        return <Globe className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative w-full text-left font-sans">
      {/* 1. Cover Image Banner */}
      <div 
        onClick={() => canEdit && (onSelectSection ? onSelectSection('basicInfo', 'cover') : onOpenEdit?.())}
        className={`relative h-44 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden bg-slate-900 ${
          canEdit ? 'cursor-pointer group/cover hover:brightness-105 transition-all' : ''
        }`}
        title={canEdit ? 'Click to edit Cover Banner in Studio' : undefined}
      >
        <img
          src={coverUrl}
          alt={`${profile.name} Cover`}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Cover Edit Overlay Badge on Hover */}
        {canEdit && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl border border-white/20 scale-95 group-hover/cover:scale-100 transition-transform">
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span>Click to Edit Cover Banner</span>
            </div>
          </div>
        )}

        {/* Cover Header Controls: Multi-Role Persona Switcher & Edit Icon */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-5 flex items-center gap-2 z-20">
          <ProfileSwitcher currentProfileIdOrSlug={profile.slug || profile.id} />
          {canEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection ? onSelectSection('basicInfo', 'cover') : onOpenEdit?.();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Edit Cover in Studio"
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
          <div 
            onClick={() => canEdit && (onSelectSection ? onSelectSection('basicInfo', 'avatar') : onOpenEdit?.())}
            className={`relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white dark:border-[#18181B] shadow-md bg-slate-100 dark:bg-zinc-800 shrink-0 ${
              canEdit ? 'cursor-pointer group/avatar hover:ring-4 hover:ring-purple-500/50 transition-all' : ''
            }`}
            title={canEdit ? 'Click to edit Profile Photo in Studio' : undefined}
          >
            <img
              src={avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            {canEdit && (
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Camera className="w-5 h-5 drop-shadow-md text-purple-300" />
                <span className="text-[10px] font-bold mt-0.5">Edit</span>
              </div>
            )}
          </div>
        )}

        {/* Profile Role Badge & Name */}
        {sharing.nameAndTitle !== false && (
          <div 
            onClick={() => canEdit && (onSelectSection ? onSelectSection('basicInfo', 'name') : onOpenEdit?.())}
            className={`space-y-1 pt-1 ${
              canEdit ? 'cursor-pointer group/name rounded-2xl p-2 -ml-2 hover:bg-purple-500/[0.06] dark:hover:bg-purple-500/10 hover:ring-1 hover:ring-purple-500/30 transition-all' : ''
            }`}
            title={canEdit ? 'Click to edit Identity in Studio' : undefined}
          >
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 border border-black/5 dark:border-white/10">
                {typeBadgeLabel}
              </div>
              {canEdit && (
                <span className="opacity-0 group-hover/name:opacity-100 transition-opacity text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Pencil className="w-2.5 h-2.5" />
                  Edit Identity
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{profile.name}</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-medium text-slate-500 dark:text-zinc-400">
              {profile.profession || profile.designation || profile.profileName || 'Professional'}
            </p>
            {profile.tagline && (
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300 italic pt-0.5">
                &ldquo;{profile.tagline}&rdquo;
              </p>
            )}
            {profile.location && (
              <p className="text-xs sm:text-sm text-slate-400 dark:text-zinc-500">
                {profile.location}
              </p>
            )}
          </div>
        )}

        {/* Short Bio */}
        {sharing.bio !== false && profile.shortBio && (
          <div
            onClick={() => canEdit && (onSelectSection ? onSelectSection('about', 'about') : onOpenEdit?.())}
            className={`${
              canEdit ? 'cursor-pointer group/bio rounded-2xl p-2 -ml-2 hover:bg-purple-500/[0.06] dark:hover:bg-purple-500/10 hover:ring-1 hover:ring-purple-500/30 transition-all' : ''
            }`}
            title={canEdit ? 'Click to edit Bio in Studio' : undefined}
          >
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              {profile.shortBio}
            </p>
            {canEdit && (
              <span className="opacity-0 group-hover/bio:opacity-100 transition-opacity text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                <Pencil className="w-2.5 h-2.5" />
                Edit Bio
              </span>
            )}
          </div>
        )}

        {/* Action Buttons Below Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 pt-2 max-w-md w-full">
          {canEdit ? (
            <>
              <button
                type="button"
                onClick={() => onSelectSection ? onSelectSection('basicInfo') : onOpenEdit?.()}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs shadow-xs hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-700 dark:border-white/20"
                title="Edit Profile in Studio"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-purple-400" />
                <span className="truncate">Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={onOpenShare}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-5 rounded-full bg-white text-slate-900 dark:bg-zinc-800 dark:text-white font-bold text-xs shadow-xs hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-200 dark:border-white/10"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="truncate">Share Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenConnect}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-5 rounded-full bg-white text-slate-950 dark:bg-white dark:text-black font-bold text-xs shadow-xs hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-200 dark:border-white/20"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Connect</span>
              </button>

              <button
                type="button"
                onClick={onOpenShare}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-5 rounded-full bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold text-xs shadow-xs hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-700 dark:border-white/10"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="truncate">Share</span>
              </button>
            </>
          )}
        </div>

        {/* Direct Social Icon Bar: Respects exact drag-and-drop order from socials */}
        {sharing.socialLinks !== false && (
          <div 
            onClick={(e) => {
              if (canEdit && onSelectSection && (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('edit-socials-trigger'))) {
                onSelectSection('socials');
              }
            }}
            className={`flex items-center gap-2.5 pt-2 text-slate-600 dark:text-zinc-300 flex-wrap relative ${
              canEdit ? 'group/socials rounded-xl p-1.5 -ml-1.5 hover:bg-purple-500/[0.06] dark:hover:bg-purple-500/10 hover:ring-1 hover:ring-purple-500/30 transition-all' : ''
            }`}
            title={canEdit ? 'Click to edit Socials & Links in Studio' : undefined}
          >
            {/* Direct WhatsApp (if sharing enabled and not duplicate) */}
            {profile.whatsapp && sharing.phone !== false && !socials.some((s) => s.platform === 'whatsapp') && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-105"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-500" />
              </a>
            )}

            {/* Direct Email (if sharing enabled and not duplicate) */}
            {profile.email && sharing.email !== false && !socials.some((s) => s.platform === 'email') && (
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

            {/* Dynamic Social Links In Dragged Order */}
            {socials.map((s, idx) => {
              const url = s.url?.trim() || '';
              if (!url) return null;
              const formattedUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')
                ? url
                : `https://${url}`;

              return (
                <a
                  key={`${s.platform}-${idx}-${url}`}
                  href={formattedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-105"
                  title={s.label || s.platform}
                  aria-label={s.label || s.platform}
                >
                  {renderSocialIcon(s.platform)}
                </a>
              );
            })}

            {canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSection?.('socials');
                }}
                className="edit-socials-trigger opacity-0 group-hover/socials:opacity-100 transition-opacity ml-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-2.5 h-2.5" />
                <span>Edit Links</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
