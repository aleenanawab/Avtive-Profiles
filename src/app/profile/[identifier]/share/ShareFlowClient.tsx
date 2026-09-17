'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  ArrowLeft, 
  ArrowRight,
  GripVertical, 
  Copy, 
  QrCode, 
  Check, 
  Share2, 
  Loader2, 
  User, 
  FileText, 
  Phone, 
  Link2, 
  Code, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Award,
  Eye,
  EyeOff,
  Sparkles,
  Download
} from 'lucide-react';
import { ProfileData, SharingSettings } from '@/types/profile';
import { GithubIcon, LinkedInIcon, TwitterXIcon } from '@/components/BrandIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicSectionGroups, ALL_PROFILE_SECTIONS } from '@/components/sections/DynamicSectionGroups';

interface ShareFlowClientProps {
  initialProfile: ProfileData;
}

const SECTION_DEFINITIONS = ALL_PROFILE_SECTIONS;

export function ShareFlowClient({ initialProfile }: ShareFlowClientProps) {
  const router = useRouter();

  // Step 1: Choose Role to Share
  // Step 2: What do you want to show? (Visibility)
  // Step 3: Reorder Sections (Drag & Drop)
  // Step 4: Share Link Generation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Available roles for user
  const [roles, setRoles] = useState<ProfileData[]>([initialProfile]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData>(initialProfile);

  // Fetch all user profiles for Step 1
  useEffect(() => {
    fetch('/api/profile/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.profiles && data.profiles.length > 0) {
          setRoles(data.profiles);
          const found = data.profiles.find((p: ProfileData) => p.id === initialProfile.id || p.slug === initialProfile.slug);
          if (found) setSelectedProfile(found);
        }
      })
      .catch(() => {});
  }, [initialProfile]);

  // Sharing Settings
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>({
    photo: initialProfile.sharingSettings?.photo ?? true,
    nameAndTitle: initialProfile.sharingSettings?.nameAndTitle ?? true,
    bio: initialProfile.sharingSettings?.bio ?? true,
    contactInfo: initialProfile.sharingSettings?.contactInfo ?? true,
    socialLinks: initialProfile.sharingSettings?.socialLinks ?? true,
    skills: initialProfile.sharingSettings?.skills ?? true,
    experience: initialProfile.sharingSettings?.experience ?? true,
    education: initialProfile.sharingSettings?.education ?? true,
    projects: initialProfile.sharingSettings?.projects ?? true,
    certifications: initialProfile.sharingSettings?.certifications ?? true
  });

  // Reorder State
  const [visibleOrder, setVisibleOrder] = useState<string[]>(() => {
    const existingOrder = initialProfile.sectionOrder || [];
    const validKeys = SECTION_DEFINITIONS.map((s) => s.id);
    const filtered = existingOrder.filter((id) => validKeys.includes(id));
    SECTION_DEFINITIONS.forEach((s) => {
      if (!filtered.includes(s.id)) filtered.push(s.id);
    });
    return filtered;
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Derived visible vs hidden lists based on current sharingSettings
  const activeSections = visibleOrder.filter((id) => {
    const def = SECTION_DEFINITIONS.find((s) => s.id === id);
    return def ? sharingSettings[def.key] !== false : true;
  });

  const hiddenSections = visibleOrder.filter((id) => {
    const def = SECTION_DEFINITIONS.find((s) => s.id === id);
    return def ? sharingSettings[def.key] === false : false;
  });

  // Toggle Visibility for a section
  const handleToggle = (key: keyof SharingSettings) => {
    setSharingSettings((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false
    }));
  };

  // Move section from Hidden to Visible or vice versa
  const handleMoveToVisible = (id: string) => {
    const def = SECTION_DEFINITIONS.find((s) => s.id === id);
    if (def) {
      setSharingSettings((prev) => ({ ...prev, [def.key]: true }));
    }
  };

  const handleMoveToHidden = (id: string) => {
    const def = SECTION_DEFINITIONS.find((s) => s.id === id);
    if (def) {
      setSharingSettings((prev) => ({ ...prev, [def.key]: false }));
    }
  };

  // Drag and Drop reordering logic for visible list
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const currentVisible = [...activeSections];
    const itemToMove = currentVisible[draggedIndex];
    currentVisible.splice(draggedIndex, 1);
    currentVisible.splice(targetIndex, 0, itemToMove);

    setVisibleOrder([...currentVisible, ...hiddenSections]);
    setDraggedIndex(null);
  };

  // Public URL
  const publicIdentifier = selectedProfile.slug || selectedProfile.id;
  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${publicIdentifier}`
    : `https://avtive.app/profile/${publicIdentifier}`;
  const displayUrl = `avtive.profiles/${publicIdentifier}`;

  // Generate QR Code on mount or profile change
  useEffect(() => {
    QRCode.toDataURL(publicUrl, {
      width: 400,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error(err));
  }, [publicUrl]);

  // Save Settings when progressing from Step 3 to Step 4
  const handleSaveAndProceedToShare = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile/share-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedProfile.id,
          sharingSettings,
          sectionOrder: ['hero', ...visibleOrder]
        })
      });

      if (!res.ok) {
        console.error('Failed to persist share settings');
      }

      setCurrentStep(4);
    } catch (e) {
      console.error(e);
      setCurrentStep(4);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="figma-phone-frame w-full max-w-[390px] p-6 sm:p-7 flex flex-col justify-between relative text-slate-900 dark:text-white transition-colors font-sans">
      {/* Mobile Top Status Bar (9:41, Wifi, Battery) */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-4 px-1 font-mono">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
          </svg>
          <div className="w-5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
            <div className="w-full h-full bg-current rounded-2xs" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ========================================================================= */}
        {/* STEP 1 / SCREEN 12 & 13: CHOOSE ROLE PROFILE TO SHARE                      */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-1 -ml-1 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Which role profile you want to share?
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Select from your configured role profiles to share.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {roles.map((r) => {
                const isSelected = selectedProfile.id === r.id || selectedProfile.slug === r.slug;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedProfile(r)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-50 dark:bg-[#1B1E28] border-slate-900 dark:border-white/30 shadow-xs ring-1 ring-slate-900/10 dark:ring-white/20'
                        : 'bg-white dark:bg-[#151821] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                        alt={r.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">
                            {r.profileName || r.name}
                          </h4>
                        </div>
                        <p className="text-[11px] truncate text-slate-500 dark:text-zinc-400">
                          {r.type === 'owner' ? 'Full control of the profile' : r.type === 'employee' ? 'Work at a company' : 'Business / Organization'}
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black' : 'border-slate-300 dark:border-zinc-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="figma-pill-primary w-full py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Next</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2 / SCREEN 8: LIMITATION PAGE (WHAT DO YOU WANT TO SHOW?)            */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="p-1 -ml-1 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                title="Edit preferences"
              >
                <span className="text-sm">✎</span>
              </button>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                What do you want to show?
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                Choose the information you want to make private below:
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 pt-1">
              {SECTION_DEFINITIONS.map((sec) => {
                const isChecked = sharingSettings[sec.key] !== false;
                const Icon = sec.icon;

                return (
                  <div
                    key={sec.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center text-slate-600 dark:text-zinc-300 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-900 dark:text-zinc-100">
                        {sec.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      onClick={() => handleToggle(sec.key)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 cursor-pointer ${
                        isChecked ? 'bg-[#10B981]' : 'bg-slate-200 dark:bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                          isChecked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="figma-pill-primary w-full py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Next</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3 / SCREEN 9: DRAG & DROP HIDER (REORDER SECTIONS)                   */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="p-1 -ml-1 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reorder Sections
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Drag to rearrange your sections in both groups.
              </p>
            </div>

            {/* Dynamic Section Groups: Visible & Hidden */}
            <div className="pt-2">
              <DynamicSectionGroups
                sectionOrder={visibleOrder}
                sharingSettings={sharingSettings}
                onSectionOrderChange={setVisibleOrder}
                onSharingSettingsChange={setSharingSettings}
                onInstantToggle={(sectionId, makeVisible) => {
                  const def = ALL_PROFILE_SECTIONS.find((s) => s.id === sectionId);
                  if (def) {
                    setSharingSettings((prev) => ({ ...prev, [def.key]: makeVisible }));
                    setVisibleOrder((prev) => {
                      const without = prev.filter((id) => id !== sectionId);
                      return [...without, sectionId];
                    });
                  }
                }}
              />
            </div>

            {/* Action Buttons matching Screen 9 */}
            <div className="grid grid-cols-2 gap-2.5 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="figma-pill-secondary py-3 text-xs font-semibold cursor-pointer text-center"
              >
                Next
              </button>

              <button
                type="button"
                onClick={handleSaveAndProceedToShare}
                disabled={isSaving}
                className="figma-pill-primary py-3 px-4 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 text-center"
              >
                {isSaving ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4 / SCREEN 10: SHARE PAGE                                            */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="p-1 -ml-1 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Share
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Your profile is ready to share!
              </p>
            </div>

            {/* Preview Mini Card matching Screen 10 */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/10 space-y-2.5 shadow-2xs">
              <div className="flex items-start gap-3">
                <img
                  src={selectedProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                  alt={selectedProfile.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-white/20 shrink-0"
                />
                <div className="min-w-0 text-left">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {selectedProfile.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                    {selectedProfile.profession || selectedProfile.designation || 'MERN Developer'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
                    {selectedProfile.shortBio || selectedProfile.fullBio || 'Passionate professional'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-center gap-3 text-slate-500 dark:text-zinc-400">
                <GithubIcon className="w-3.5 h-3.5" />
                <LinkedInIcon className="w-3.5 h-3.5" />
                <TwitterXIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Share Profile Link input box with copy button */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block ml-1">
                Share Profile Link
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl figma-input">
                <span className="text-xs font-mono text-slate-800 dark:text-zinc-200 truncate flex-1 select-all px-1">
                  {publicUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Copy Link and QR Code Action Pill Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="figma-pill-secondary py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(!showQrModal)}
                className="figma-pill-secondary py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
            </div>

            {showQrModal && qrCodeDataUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-2.5 text-center"
              >
                <img src={qrCodeDataUrl} alt="QR Code" className="w-40 h-40 rounded-xl" />
                <a
                  href={qrCodeDataUrl}
                  download={`${selectedProfile.slug || 'profile'}-qr.png`}
                  className="text-xs text-slate-900 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR</span>
                </a>
              </motion.div>
            )}

            {/* Primary Share Pill Button matching Screen 10 */}
            <div className="pt-2">
              <Link
                href={`/profile/${publicIdentifier}`}
                className="figma-pill-primary w-full py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-center"
              >
                <span>Share</span>
              </Link>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
