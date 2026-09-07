'use client';

import React, { useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Pencil, 
  UserPlus, 
  CreditCard,
  Camera,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ProfileData, NavigationOrigin } from '../types/profile';
import { DirectContactSection } from './DirectContactSection';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface HeroSectionProps {
  profile: ProfileData;
  navigationOrigin?: NavigationOrigin;
  canEdit?: boolean;
  isEditing?: boolean;
  isConnected?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onOpenEdit?: () => void;
  onOpenShare?: () => void;
  onOpenConnect?: () => void;
  onNavigateToCompany?: (companyId?: string) => void;
  onNavigateBack?: () => void;
  onOpenVirtualCard?: () => void;
  theme?: ThemeConfig;
}

export function HeroSection({
  profile,
  navigationOrigin = 'direct',
  canEdit = false,
  isEditing = false,
  isConnected = false,
  onUpdateField,
  onOpenEdit,
  onOpenShare,
  onOpenConnect,
  onNavigateToCompany,
  onNavigateBack,
  onOpenVirtualCard,
  theme = getThemeConfig(profile.theme || 'elegant')
}: HeroSectionProps) {
  const isCompany = profile.type === 'company';
  const companyName = profile.companyInfo?.name || profile.companyName || profile.company || 'Avtive';

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (
    file: File, 
    field: 'avatar' | 'coverImage', 
    setLoading: (l: boolean) => void
  ) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && onUpdateField) {
        onUpdateField(field, reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url && onUpdateField) {
        onUpdateField(field, data.url);
      } else if (!res.ok) {
        setUploadError(data.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError('Network error uploading image.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (!isCompany && onNavigateToCompany) {
      onNavigateToCompany(profile.companyId || 'avtive-company');
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };

  return (
    <section className={`relative w-full overflow-hidden text-left border-b ${theme.divider} ${theme.cardBg} transition-colors`}>
      {/* Hidden File Inputs for Instant Click / Drag-and-Drop Image Upload */}
      <input
        ref={avatarFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'avatar', setIsUploadingAvatar);
        }}
      />
      <input
        ref={coverFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'coverImage', setIsUploadingCover);
        }}
      />

      {/* ========================================================================= */}
      {/* 1. Cover Banner: Responsive unified asset with in-place change button     */}
      {/* ========================================================================= */}
      <div className={`relative h-32 sm:h-40 w-full overflow-hidden ${theme.coverFallback} group`}>
        {profile.coverImage && (profile.coverImage.startsWith('/uploads/') || profile.coverImage.startsWith('data:') || profile.coverImage.startsWith('blob:')) ? (
          <img
            src={profile.coverImage}
            alt={`${profile.name} Cover`}
            className="w-full h-full object-cover object-center"
          />
        ) : null}

        {/* In Edit Mode: Cover change button */}
        {isEditing && (
          <button
            type="button"
            onClick={() => coverFileRef.current?.click()}
            disabled={isUploadingCover}
            className="absolute bottom-3 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md shadow-sm text-xs font-bold transition-all active:scale-95"
            title="Change Cover Banner"
          >
            {isUploadingCover ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isUploadingCover ? 'Uploading...' : 'Change Cover'}</span>
          </button>
        )}
        
        {/* Top-Right Controls */}
        <div className="absolute top-3 right-3 sm:right-4 z-20 flex items-center gap-2">
          {/* Edit Profile Button (Visible ONLY when not currently editing and user is verified owner) */}
          {canEdit && !isEditing && onOpenEdit && (
            <button
              onClick={onOpenEdit}
              aria-label="Edit Profile"
              title="Edit Profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md shadow-sm text-xs font-bold transition-all active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5 text-white" />
              <span>Edit Profile</span>
            </button>
          )}

          {/* Simple "← Back" button redirecting to Company Profile */}
          {!isCompany && !isEditing && (
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

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="mx-6 sm:mx-8 mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Identity Info with Overlapping Portrait                                */}
      {/* ========================================================================= */}
      <div className="px-6 sm:px-8 pb-6 -mt-14 sm:-mt-16 relative z-10">
        {/* Profile Photo */}
        <div className="flex items-end justify-between gap-4 mb-3.5">
          <div className="relative">
            <div className={`w-28 h-28 sm:w-32 sm:h-32 p-1 ${theme.cardBg} shadow-lg border-2 ${theme.cardBorder} relative overflow-hidden group ${isCompany ? 'rounded-2xl' : 'rounded-full'}`}>
              <img
                src={profile.avatar}
                alt={profile.name}
                className={`w-full h-full object-cover ${isCompany ? 'rounded-xl' : 'rounded-full'}`}
              />

              {/* Instagram-Style Avatar Click-to-Change Overlay in Edit Mode */}
              {isEditing && (
                <div
                  onClick={() => avatarFileRef.current?.click()}
                  className={`absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/70 transition-all ${isCompany ? 'rounded-xl' : 'rounded-full'}`}
                  title="Click to Change Photo"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-white mb-0.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subtle "View Card" button (when not editing) */}
          {!isEditing && onOpenVirtualCard && (
            <button
              onClick={onOpenVirtualCard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${theme.cardBg} ${theme.textPrimary} border ${theme.cardBorder} hover:opacity-90 transition-all shadow-2xs active:scale-95`}
              title="View Digital Business Card"
            >
              <CreditCard className={`w-3.5 h-3.5 ${theme.accentText}`} />
              <span className="hidden sm:inline">View Virtual Card</span>
              <span className="sm:hidden">Card</span>
            </button>
          )}
        </div>

        {/* Name, Company with distinct brand color, and Location */}
        <div className="space-y-1.5">
          {/* Full Name */}
          {isEditing ? (
            <div>
              <label className="block text-[10px] font-bold text-[#94A3B8] uppercase font-mono mb-0.5">
                Full Name *
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onUpdateField?.('name', e.target.value)}
                placeholder="Full Name"
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.textPrimary} bg-transparent border-b-2 border-dashed border-slate-400 dark:border-white/30 focus:border-current focus:outline-none w-full`}
              />
            </div>
          ) : (
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.textPrimary}`}>
              {profile.name}
            </h1>
          )}

          {/* Company & Designation */}
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase font-mono mb-0.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={profile.company || ''}
                  onChange={(e) => onUpdateField?.('company', e.target.value)}
                  placeholder="e.g. Avtive"
                  className={`text-sm sm:text-base font-bold ${theme.accentText} bg-transparent border-b border-dashed border-slate-400 dark:border-white/30 focus:outline-none w-full`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase font-mono mb-0.5">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={profile.designation || ''}
                  onChange={(e) => onUpdateField?.('designation', e.target.value)}
                  placeholder="e.g. Creative Director"
                  className={`text-xs sm:text-sm font-semibold ${theme.textSecondary} bg-transparent border-b border-dashed border-slate-400 dark:border-white/30 focus:outline-none w-full`}
                />
              </div>
            </div>
          ) : (
            <div className="pt-0.5">
              {profile.company && onNavigateToCompany && !isCompany ? (
                <button
                  onClick={() => onNavigateToCompany(profile.companyId || 'avtive-company')}
                  className={`text-sm sm:text-base font-bold ${theme.accentText} hover:underline transition-colors text-left inline-flex items-center gap-1`}
                  title={`Go to ${companyName} Profile`}
                >
                  {profile.company}
                </button>
              ) : (
                <p className={`text-sm sm:text-base font-bold ${theme.accentText}`}>
                  {profile.company || profile.designation}
                </p>
              )}
            </div>
          )}

          {/* Location */}
          {isEditing ? (
            <div className="pt-1">
              <label className="block text-[10px] font-bold text-[#94A3B8] uppercase font-mono mb-0.5">
                Location
              </label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => onUpdateField?.('location', e.target.value)}
                placeholder="e.g. Islamabad, Pakistan"
                className={`text-xs sm:text-sm ${theme.textSecondary} bg-transparent border-b border-dashed border-slate-400 dark:border-white/30 focus:outline-none w-full`}
              />
            </div>
          ) : (
            profile.location && (
              <p className={`text-xs sm:text-sm ${theme.textSecondary} font-normal`}>
                {profile.location}
              </p>
            )
          )}
        </div>

        {/* Short Bio */}
        {isEditing ? (
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase font-mono mb-0.5">
              Elevator Bio / Headline
            </label>
            <textarea
              rows={2}
              value={profile.shortBio || ''}
              onChange={(e) => onUpdateField?.('shortBio', e.target.value)}
              placeholder="A brief 1-2 sentence headline..."
              className={`mt-1 text-xs sm:text-sm leading-relaxed ${theme.textSecondary} bg-transparent border border-dashed border-slate-400 dark:border-white/30 rounded-xl p-2.5 focus:outline-none w-full resize-none`}
            />
          </div>
        ) : (
          profile.shortBio && (
            <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${theme.textSecondary} font-normal`}>
              “{profile.shortBio}”
            </p>
          )
        )}

        {/* ========================================================================= */}
        {/* 3. HERO ACTIONS: Connect + Share (or Edit when owner)                    */}
        {/* ========================================================================= */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-3 pt-4">
            {canEdit ? (
              <button
                onClick={onOpenEdit}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-xs transition-all active:scale-[0.98]`}
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={onOpenConnect}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl ${
                  isConnected
                    ? 'bg-emerald-600 text-white'
                    : theme.btnPrimary
                } font-bold text-xs shadow-xs transition-all active:scale-[0.98]`}
              >
                {isConnected ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onOpenShare}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl ${theme.btnSecondary} font-bold text-xs transition-all active:scale-[0.98]`}
            >
              <Share2 className={`w-4 h-4 ${theme.accentText}`} />
              <span>Share</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DIRECT CONTACT SECTION (Immediately below Connect & Share)             */}
        {/* ========================================================================= */}
        <DirectContactSection 
          profile={profile} 
          isEditing={isEditing} 
          onUpdateField={onUpdateField}
          theme={theme}
        />
      </div>
    </section>
  );
}
