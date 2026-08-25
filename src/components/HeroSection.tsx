'use client';

import React from 'react';
import { 
  ChevronLeft, 
  Share2, 
  Pencil,
  UserPlus
} from 'lucide-react';
import { ProfileData, NavigationOrigin } from '../types/profile';
import { DirectContactSection } from './DirectContactSection';

interface HeroSectionProps {
  profile: ProfileData;
  navigationOrigin?: NavigationOrigin;
  canEdit?: boolean;
  onOpenEdit?: () => void;
  onOpenShare?: () => void;
  onOpenConnect?: () => void;
  onNavigateToCompany?: (companyId?: string) => void;
  onNavigateBack?: () => void;
}

export function HeroSection({
  profile,
  navigationOrigin = 'direct',
  canEdit = false,
  onOpenEdit,
  onOpenShare,
  onOpenConnect,
  onNavigateToCompany,
  onNavigateBack
}: HeroSectionProps) {
  const isCompany = profile.type === 'company';
  const hasCompany = Boolean(profile.companyInfo || profile.companyId || (profile.company && !isCompany));
  const companyName = profile.companyInfo?.name || profile.companyName || profile.company || 'Avtive';

  return (
    <section className="relative w-full overflow-hidden text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      {/* ========================================================================= */}
      {/* 1. Cover Banner with Instagram-Style Edit Icon                            */}
      {/* ========================================================================= */}
      <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#101F42] to-[#1E3A8A]">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-50 dark:opacity-40"
          />
        ) : null}
        
        {/* Top-Left: Context-Aware Return to Company Profile or Back */}
        <div className="absolute top-3 left-3 sm:left-4 z-20">
          {!isCompany && hasCompany && onNavigateToCompany ? (
            <button
              onClick={() => onNavigateToCompany(profile.companyId || 'avtive-company')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md text-xs font-semibold border border-white/15 transition-all shadow-sm active:scale-95"
              title={`Return to ${companyName}`}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#7EC384]" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{companyName}</span>
            </button>
          ) : onNavigateBack ? (
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md text-xs font-semibold border border-white/15 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : null}
        </div>

        {/* Top-Right: Instagram-Style Small Edit Icon directly on Cover Image */}
        {canEdit && onOpenEdit && (
          <button
            onClick={onOpenEdit}
            aria-label="Edit Profile"
            title="Edit Profile"
            className="absolute top-3 right-3 sm:right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md shadow-sm transition-all active:scale-95 hover:scale-105"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Cover Slogan */}
        {profile.coverSlogan && (
          <div className="absolute bottom-2 left-0 right-0 px-4 text-center">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-white/80 font-mono drop-shadow-2xs">
              {profile.coverSlogan}
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. Identity Info with Overlapping Portrait                                */}
      {/* ========================================================================= */}
      <div className="px-6 sm:px-8 pb-6 -mt-14 sm:-mt-16 relative z-10">
        {/* Profile Photo */}
        <div className="flex items-end justify-between gap-4 mb-3.5">
          <div className="relative">
            <div className={`w-28 h-28 sm:w-32 sm:h-32 p-1 bg-white dark:bg-[#0A1128] shadow-md border-2 border-[#E2E8F0] dark:border-white/15 ${isCompany ? 'rounded-2xl' : 'rounded-full'}`}>
              <img
                src={profile.avatar}
                alt={profile.name}
                className={`w-full h-full object-cover ${isCompany ? 'rounded-xl' : 'rounded-full'}`}
              />
            </div>
          </div>
        </div>

        {/* Name & Two Simple Clean Text Lines (Company & Location - No Icons) */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1128] dark:text-white">
            {profile.name}
          </h1>

          {/* Line 1: Company (No Icon) */}
          <div className="pt-0.5">
            {profile.company && onNavigateToCompany && !isCompany ? (
              <button
                onClick={() => onNavigateToCompany(profile.companyId || 'avtive-company')}
                className="text-sm sm:text-base font-bold text-[#0A1128] dark:text-white hover:text-[#1E3A8A] dark:hover:text-[#7EC384] transition-colors text-left block"
              >
                {profile.company}
              </button>
            ) : (
              <p className="text-sm sm:text-base font-bold text-[#0A1128] dark:text-white">
                {profile.company || profile.designation}
              </p>
            )}
          </div>

          {/* Line 2: Location on the next line (No Icon) */}
          {profile.location && (
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] font-normal">
              {profile.location}
            </p>
          )}

          {/* Subtle Real Network Stats */}
          {(profile.followersCount || profile.connectionsCount) && (
            <p className="text-[11px] text-[#94A3B8] font-medium pt-0.5">
              {profile.followersCount ? `${profile.followersCount} followers` : ''}
              {profile.followersCount && profile.connectionsCount ? ' • ' : ''}
              {profile.connectionsCount ? `${profile.connectionsCount} connections` : ''}
            </p>
          )}
        </div>

        {/* Short Bio */}
        {profile.shortBio && (
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#475569] dark:text-[#94A3B8] font-normal">
            “{profile.shortBio}”
          </p>
        )}

        {/* ========================================================================= */}
        {/* 3. HERO ACTIONS — ONLY TWO CLEAN OPTIONS: Connect + Share                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={onOpenConnect}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A1128] font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 text-[#7EC384]" />
            <span>Connect</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-[#152238] dark:hover:bg-[#1E3050] text-[#0A1128] dark:text-white font-bold text-xs border border-[#E2E8F0] dark:border-white/10 transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4 text-[#6366F1]" />
            <span>Share</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 4. DIRECT CONTACT SECTION (Immediately below Connect & Share)              */}
        {/* ========================================================================= */}
        <DirectContactSection profile={profile} />
      </div>
    </section>
  );
}
