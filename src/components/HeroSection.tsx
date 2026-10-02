'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Pencil, 
  Camera, 
  Globe, 
  Mail, 
  Phone, 
  UserPlus, 
  Share2, 
  MessageSquare,
  Upload,
  User,
  Users,
  MapPin,
  Sparkles,
  Loader2,
  Check,
  Layers
} from 'lucide-react';
import { ProfileData, normalizeProfileType, SocialLink } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';
import { GithubIcon, LinkedInIcon, TwitterXIcon, WhatsAppIcon } from './BrandIcons';
import { StatsRow } from './profiles/StatsRow';
import { ProfileSwitcher } from './profiles/ProfileSwitcher';
import { SUPABASE_DEFAULT_AVATAR, SUPABASE_DEFAULT_COVER } from '@/lib/supabase';

interface HeroSectionProps {
  profile: ProfileData;
  canEdit?: boolean;
  theme?: ThemeConfig;
  navigationOrigin?: any;
  isEditing?: boolean;
  isConnected?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onOpenEdit?: () => void;
  onOpenSections?: () => void;
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
  isEditing = false,
  theme = getThemeConfig(profile.theme || 'editorial'),
  onUpdateField,
  onOpenEdit,
  onOpenSections,
  onOpenShare,
  onOpenConnect,
  onSelectSection
}: HeroSectionProps) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const coverUrl = profile.coverImage || SUPABASE_DEFAULT_COVER;
  const avatarUrl = profile.avatar || SUPABASE_DEFAULT_AVATAR;
  const sharing = profile.sharingSettings || {};

  const normalizedType = normalizeProfileType(profile.type);
  const typeBadgeLabel = normalizedType === 'team' ? 'Team' : 'Individual';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        onUpdateField?.('avatar', data.url);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'cover');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        onUpdateField?.('coverImage', data.url);
      }
    } catch (err) {
      console.error('Cover upload failed:', err);
    } finally {
      setIsUploadingCover(false);
    }
  };

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
      <input 
        ref={coverInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleCoverUpload} 
      />
      <input 
        ref={avatarInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleAvatarUpload} 
      />

      {/* 1. Cover Image Banner */}
      <div 
        onClick={() => {
          if (isEditing) {
            coverInputRef.current?.click();
          } else if (canEdit) {
            onOpenEdit?.();
          }
        }}
        className={`relative h-44 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden bg-slate-900 ${
          canEdit || isEditing ? 'cursor-pointer group/cover hover:brightness-105 transition-all' : ''
        }`}
        title={isEditing ? 'Click to change Cover Banner' : canEdit ? 'Click to edit profile' : undefined}
      >
        <img
          src={coverUrl}
          alt={`${profile.name} Cover`}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Cover Change Button / Overlay */}
        {(canEdit || isEditing) && (
          <div className={`absolute inset-0 bg-black/30 ${isEditing ? 'opacity-90' : 'opacity-0 group-hover/cover:opacity-100'} transition-opacity flex items-center justify-center`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                coverInputRef.current?.click();
              }}
              disabled={isUploadingCover}
              className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isUploadingCover ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-purple-400" />
              )}
              <span>{isUploadingCover ? 'Uploading Cover...' : 'Change Cover Banner'}</span>
            </button>
          </div>
        )}

        {/* Cover Header Controls: Switcher & Edit Button */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-5 flex items-center gap-2 z-20">
          <ProfileSwitcher currentProfileIdOrSlug={profile.slug || profile.id} />
          {onOpenSections && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSections();
              }}
              className="px-3 py-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-200 border border-cyan-500/40 backdrop-blur-md shadow-md flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Open Profile Sections (80/20 Ratio)"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sections</span>
            </button>
          )}
          {canEdit && !isEditing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenEdit?.();
              }}
              className="px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Edit Profile on this page"
            >
              <Pencil className="w-3.5 h-3.5 text-purple-300" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Identity Header */}
      <div className="px-5 sm:px-8 lg:px-10 pb-6 -mt-12 sm:-mt-16 md:-mt-20 relative z-10 space-y-4">
        
        {/* Profile Photo */}
        <div className="flex items-end justify-between gap-4">
          <div 
            onClick={() => {
              if (isEditing) {
                avatarInputRef.current?.click();
              } else if (canEdit) {
                onOpenEdit?.();
              }
            }}
            className={`relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white dark:border-[#18181B] shadow-lg bg-slate-100 dark:bg-zinc-800 shrink-0 ${
              canEdit || isEditing ? 'cursor-pointer group/avatar hover:ring-4 hover:ring-purple-500/50 transition-all' : ''
            }`}
            title={isEditing ? 'Click to change Profile Avatar' : canEdit ? 'Click to edit profile' : undefined}
          >
            <img
              src={avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            {(canEdit || isEditing) && (
              <div className={`absolute inset-0 bg-black/50 ${isEditing ? 'opacity-80' : 'opacity-0 group-hover/avatar:opacity-100'} transition-opacity flex flex-col items-center justify-center text-white`}>
                {isUploadingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-300" />
                ) : (
                  <Camera className="w-5 h-5 drop-shadow-md text-purple-300" />
                )}
                <span className="text-[10px] font-bold mt-0.5">
                  {isUploadingAvatar ? 'Saving...' : 'Photo'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Persona Type Indicator in Edit Mode */}
          {isEditing && (
            <div className="flex items-center gap-2 pb-2">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase">
                Profile Type:
              </span>
              <div className="inline-flex rounded-xl p-1 bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => onUpdateField?.('type', 'individual')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    normalizedType === 'individual'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Individual</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateField?.('type', 'team')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    normalizedType === 'team'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Team / Org</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Identity Information */}
        {isEditing ? (
          /* ======================================================================= */
          /* INLINE EDITABLE IDENTITY CONTROLS                                       */
          /* ======================================================================= */
          <div className="space-y-3 pt-2 p-4 rounded-2xl bg-slate-500/5 border border-slate-300/40 dark:border-white/10 backdrop-blur-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase font-mono">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => onUpdateField?.('name', e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Title / Profession */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase font-mono">
                  Profession / Role / Designation
                </label>
                <input
                  type="text"
                  value={profile.profession || profile.designation || ''}
                  onChange={(e) => {
                    onUpdateField?.('profession', e.target.value);
                    onUpdateField?.('designation', e.target.value);
                  }}
                  placeholder="e.g. Senior Software Architect"
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tagline / Motto */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase font-mono">
                  Personal Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={profile.tagline || ''}
                  onChange={(e) => onUpdateField?.('tagline', e.target.value)}
                  placeholder="e.g. Building next-generation digital products"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase font-mono">
                  Location / City
                </label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => onUpdateField?.('location', e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Short Bio */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase font-mono">
                Short Bio / Introduction
              </label>
              <textarea
                rows={3}
                value={profile.shortBio || ''}
                onChange={(e) => onUpdateField?.('shortBio', e.target.value)}
                placeholder="Brief introduction that appears at the top of your profile..."
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        ) : (
          /* ======================================================================= */
          /* NORMAL READ VIEW (With Interactive Click-to-Edit Triggers for Owner)    */
          /* ======================================================================= */
          <>
            {sharing.nameAndTitle !== false && (
              <div 
                onClick={() => canEdit && onOpenEdit?.()}
                className={`space-y-1 pt-1 ${
                  canEdit ? 'cursor-pointer group/name rounded-2xl p-2 -ml-2 hover:bg-purple-500/[0.06] dark:hover:bg-purple-500/10 hover:ring-1 hover:ring-purple-500/30 transition-all' : ''
                }`}
                title={canEdit ? 'Click to edit Identity on this page' : undefined}
              >
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 border border-black/5 dark:border-white/10">
                    {typeBadgeLabel}
                  </div>
                  {canEdit && (
                    <span className="opacity-0 group-hover/name:opacity-100 transition-opacity text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Pencil className="w-2.5 h-2.5" />
                      Edit Profile
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
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{profile.location}</span>
                  </p>
                )}
              </div>
            )}

            {/* Short Bio */}
            {sharing.bio !== false && profile.shortBio && (
              <div
                onClick={() => canEdit && onOpenEdit?.()}
                className={`${
                  canEdit ? 'cursor-pointer group/bio rounded-2xl p-2 -ml-2 hover:bg-purple-500/[0.06] dark:hover:bg-purple-500/10 hover:ring-1 hover:ring-purple-500/30 transition-all' : ''
                }`}
                title={canEdit ? 'Click to edit Bio' : undefined}
              >
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                  {profile.shortBio}
                </p>
              </div>
            )}

            {/* Action Buttons Below Avatar */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-2 max-w-md w-full">
              {canEdit ? (
                <>
                  <button
                    type="button"
                    onClick={onOpenEdit}
                    className="flex-1 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs shadow-xs hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700 dark:border-white/20"
                    title="Edit Profile on this page"
                  >
                    <Pencil className="w-3.5 h-3.5 shrink-0 text-purple-400 dark:text-purple-600" />
                    <span className="truncate">Edit Profile</span>
                  </button>

                  {onOpenSections && (
                    <button
                      type="button"
                      onClick={onOpenSections}
                      className="flex-1 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs shadow-cyan-500/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 border border-cyan-500/30"
                      title="Open Profile Sections (80/20 Ratio)"
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0 text-white" />
                      <span className="truncate">Sections</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onOpenShare}
                    className="flex-1 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-full bg-white text-slate-900 dark:bg-zinc-800 dark:text-white font-bold text-xs shadow-xs hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200 dark:border-white/10"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="truncate">Share</span>
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

            {/* Direct Social Icon Bar */}
            {sharing.socialLinks !== false && (
              <div 
                className="flex items-center gap-2.5 pt-2 text-slate-600 dark:text-zinc-300 flex-wrap relative"
              >
                {/* Direct WhatsApp */}
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

                {/* Direct Email */}
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

                {/* Dynamic Social Links */}
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
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
