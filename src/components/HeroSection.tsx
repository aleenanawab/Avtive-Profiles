'use client';

import React from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Pencil,
  UserPlus,
  CreditCard
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
  onOpenVirtualCard?: () => void;
}

export function HeroSection({
  profile,
  navigationOrigin = 'direct',
  canEdit = false,
  onOpenEdit,
  onOpenShare,
  onOpenConnect,
  onNavigateToCompany,
  onNavigateBack,
  onOpenVirtualCard
}: HeroSectionProps) {
  const isCompany = profile.type === 'company';
  const hasCompany = Boolean(profile.companyInfo || profile.companyId || (profile.company && !isCompany));
  const companyName = profile.companyInfo?.name || profile.companyName || profile.company || 'Avtive';

  const handleBackClick = () => {
    if (!isCompany && onNavigateToCompany) {
      onNavigateToCompany(profile.companyId || 'avtive-company');
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };

  return (
    <section className="relative w-full overflow-hidden text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      {/* ========================================================================= */}
      {/* 1. Cover Banner: Real asset, no AI filters, responsive cropping           */}
      {/* ========================================================================= */}
      <div className="relative h-40 sm:h-52 w-full overflow-hidden bg-[#040814]">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt={`${profile.name} Cover`}
            className="w-full h-full object-cover object-center"
          />
        ) : null}
        
        {/* Top-Right Controls: Edit Icon + Clean "← Back" to Avtive Company Profile */}
        <div className="absolute top-3 right-3 sm:right-4 z-20 flex items-center gap-2">
          {/* Small Edit Icon (Only for authorized users) */}
          {canEdit && onOpenEdit && (
            <button
              onClick={onOpenEdit}
              aria-label="Edit Profile"
              title="Edit Profile"
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md shadow-sm transition-all active:scale-95 hover:scale-105"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Simple "← Back" button redirecting to Avtive Company Profile */}
          {!isCompany && (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md text-xs font-semibold border border-white/20 transition-all shadow-sm active:scale-95"
              title={`Return to ${companyName} Company Profile`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Identity Info with Overlapping Portrait                                */}
      {/* ========================================================================= */}
      <div className="px-6 sm:px-8 pb-6 -mt-14 sm:-mt-16 relative z-10">
        {/* Profile Photo */}
        <div className="flex items-end justify-between gap-4 mb-3.5">
          <div className="relative">
            <div className={`w-28 h-28 sm:w-32 sm:h-32 p-1 bg-white dark:bg-[#0A1128] shadow-lg border-2 border-[#E2E8F0] dark:border-white/15 ${isCompany ? 'rounded-2xl' : 'rounded-full'}`}>
              <img
                src={profile.avatar}
                alt={profile.name}
                className={`w-full h-full object-cover ${isCompany ? 'rounded-xl' : 'rounded-full'}`}
              />
            </div>
          </div>

          {/* Subtle "View Card" button (Requirement #16) */}
          {onOpenVirtualCard && (
            <button
              onClick={onOpenVirtualCard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#152238] dark:hover:bg-[#1E3050] text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 transition-all shadow-2xs active:scale-95"
              title="View Digital Business Card"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#60A5FA]" />
              <span className="hidden sm:inline">View Virtual Card</span>
              <span className="sm:hidden">Card</span>
            </button>
          )}
        </div>

        {/* Name, Company with distinct brand color, and Location */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1128] dark:text-white">
            {profile.name}
          </h1>

          {/* Company Name with Visually Distinguishable Brand Color */}
          <div className="pt-0.5">
            {profile.company && onNavigateToCompany && !isCompany ? (
              <button
                onClick={() => onNavigateToCompany(profile.companyId || 'avtive-company')}
                className="text-sm sm:text-base font-bold text-[#1E3A8A] dark:text-[#60A5FA] hover:underline transition-colors text-left inline-flex items-center gap-1"
                title={`Go to ${companyName} Profile`}
              >
                {profile.company}
              </button>
            ) : (
              <p className="text-sm sm:text-base font-bold text-[#1E3A8A] dark:text-[#60A5FA]">
                {profile.company || profile.designation}
              </p>
            )}
          </div>

          {/* Location */}
          {profile.location && (
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] font-normal">
              {profile.location}
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
            <UserPlus className="w-4 h-4 text-[#C49A6C] dark:text-[#B88746]" />
            <span>Connect</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#152238] dark:hover:bg-[#1E3050] text-[#0A1128] dark:text-white font-bold text-xs border border-[#E2E8F0] dark:border-white/10 transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4 text-[#1E3A8A] dark:text-[#60A5FA]" />
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
