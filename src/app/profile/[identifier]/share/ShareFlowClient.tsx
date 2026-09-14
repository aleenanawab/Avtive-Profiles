'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  ArrowLeft, 
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
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { ProfileData, SharingSettings } from '@/types/profile';
import { GithubIcon, LinkedInIcon, TwitterXIcon } from '@/components/BrandIcons';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareFlowClientProps {
  initialProfile: ProfileData;
}

interface SectionItem {
  id: string;
  key: keyof SharingSettings;
  label: string;
  icon: React.ElementType;
}

const SECTION_DEFINITIONS: SectionItem[] = [
  { id: 'photo', key: 'photo', label: 'Profile Photo', icon: User },
  { id: 'nameAndTitle', key: 'nameAndTitle', label: 'Name & Title', icon: User },
  { id: 'bio', key: 'bio', label: 'Bio', icon: FileText },
  { id: 'contactInfo', key: 'contactInfo', label: 'Contact Information', icon: Phone },
  { id: 'socialLinks', key: 'socialLinks', label: 'Social Links', icon: Link2 },
  { id: 'skills', key: 'skills', label: 'Skills', icon: Code },
  { id: 'experience', key: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', key: 'education', label: 'Education', icon: GraduationCap },
  { id: 'projects', key: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'certifications', key: 'certifications', label: 'Certifications', icon: Award }
];

export function ShareFlowClient({ initialProfile }: ShareFlowClientProps) {
  const router = useRouter();

  // Step 1 = Limitation Page (1/2), Step 2 = Drag & Drop Order (2/2), Step 3 = Share Page
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Sharing Settings
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>({
    photo: initialProfile.sharingSettings?.photo ?? true,
    nameAndTitle: initialProfile.sharingSettings?.nameAndTitle ?? true,
    bio: initialProfile.sharingSettings?.bio ?? true,
    contactInfo: initialProfile.sharingSettings?.contactInfo ?? false,
    socialLinks: initialProfile.sharingSettings?.socialLinks ?? true,
    skills: initialProfile.sharingSettings?.skills ?? true,
    experience: initialProfile.sharingSettings?.experience ?? false,
    education: initialProfile.sharingSettings?.education ?? false,
    projects: initialProfile.sharingSettings?.projects ?? true,
    certifications: initialProfile.sharingSettings?.certifications ?? false
  });

  // Reorder State
  const [visibleOrder, setVisibleOrder] = useState<string[]>(() => {
    const existingOrder = initialProfile.sectionOrder || [];
    const validKeys = SECTION_DEFINITIONS.map((s) => s.id);
    const filtered = existingOrder.filter((id) => validKeys.includes(id));
    // Add any missing
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
      [key]: !prev[key]
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

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const currentVisible = [...activeSections];
    const itemToMove = currentVisible[draggedIndex];
    currentVisible.splice(draggedIndex, 1);
    currentVisible.splice(targetIndex, 0, itemToMove);

    // Merge new active order with hidden order
    setVisibleOrder([...currentVisible, ...hiddenSections]);
    setDraggedIndex(null);
  };

  // Up/Down move fallbacks
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentVisible = [...activeSections];
    const temp = currentVisible[index - 1];
    currentVisible[index - 1] = currentVisible[index];
    currentVisible[index] = temp;
    setVisibleOrder([...currentVisible, ...hiddenSections]);
  };

  const handleMoveDown = (index: number) => {
    if (index >= activeSections.length - 1) return;
    const currentVisible = [...activeSections];
    const temp = currentVisible[index + 1];
    currentVisible[index + 1] = currentVisible[index];
    currentVisible[index] = temp;
    setVisibleOrder([...currentVisible, ...hiddenSections]);
  };

  // Public URL
  const publicIdentifier = initialProfile.slug || initialProfile.id;
  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${publicIdentifier}`
    : `https://avtive.app/profile/${publicIdentifier}`;

  // Generate QR Code on mount
  useEffect(() => {
    QRCode.toDataURL(publicUrl, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error(err));
  }, [publicUrl]);

  // Save Settings to Database
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile/share-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: initialProfile.id,
          sharingSettings,
          sectionOrder: visibleOrder
        })
      });

      if (!res.ok) {
        console.error('Failed to persist share settings');
      }

      // Transition to Screen 8 (Share Page)
      setCurrentStep(3);
    } catch (e) {
      console.error(e);
      setCurrentStep(3);
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
    <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm text-slate-900 dark:text-white transition-colors font-sans">
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          /* ========================================================================= */
          /* SCREEN 6: LIMITATION / VISIBILITY PAGE                                    */
          /* ========================================================================= */
          <motion.div
            key="screen6"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Bar: Back & Step Indicator */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Share
              </span>

              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                1/2
              </span>
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                What do you want to show?
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Choose the sections you want to share and hide from your profile.
              </p>
            </div>

            {/* Toggle List (Screen 6) */}
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 pt-1">
              {SECTION_DEFINITIONS.map((sec) => {
                const isChecked = sharingSettings[sec.key] !== false;
                const Icon = sec.icon;

                return (
                  <div
                    key={sec.id}
                    className="py-3 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-900 dark:text-zinc-100">
                        {sec.label}
                      </span>
                    </div>

                    {/* Clean Green Switch Toggle (Screen 6) */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      onClick={() => handleToggle(sec.key)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 ${
                        isChecked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-700'
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

            {/* Bottom Action: Next */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3.5 px-6 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-sm transition-all active:scale-[0.99] shadow-sm"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          /* ========================================================================= */
          /* SCREEN 7: DRAG & DROP ORDER                                               */
          /* ========================================================================= */
          <motion.div
            key="screen7"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Bar: Back & Step Indicator */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Back to visibility selection"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Share
              </span>

              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                2/2
              </span>
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reorder Sections <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">(Drag & Drop)</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Arrange the sections in the order you want them to appear.
              </p>
            </div>

            {/* Active Reorderable List Container (Screen 7) */}
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-zinc-900/40 divide-y divide-slate-100 dark:divide-zinc-800/80">
              {activeSections.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No visible sections selected.
                </div>
              ) : (
                activeSections.map((id, index) => {
                  const sec = SECTION_DEFINITIONS.find((s) => s.id === id);
                  if (!sec) return null;
                  const Icon = sec.icon;

                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`p-2.5 flex items-center justify-between gap-3 text-xs bg-white dark:bg-[#18181B] rounded-xl my-1 transition-all ${
                        draggedIndex === index ? 'opacity-40 border border-dashed border-slate-400' : 'shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {sec.label}
                        </span>
                      </div>

                      {/* Quick Move and Hide Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-20"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === activeSections.length - 1}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-20"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveToHidden(id)}
                          className="text-[11px] text-slate-400 hover:text-rose-600 px-1.5 py-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Hide section"
                        >
                          Hide
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Hidden Sections (Screen 7) */}
            {hiddenSections.length > 0 && (
              <div className="space-y-2 pt-1 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Hidden Sections
                </h3>

                <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-2 bg-slate-50/20 dark:bg-zinc-900/20 space-y-1">
                  {hiddenSections.map((id) => {
                    const sec = SECTION_DEFINITIONS.find((s) => s.id === id);
                    if (!sec) return null;
                    const Icon = sec.icon;

                    return (
                      <div
                        key={id}
                        className="p-2.5 flex items-center justify-between gap-3 text-xs bg-white/70 dark:bg-[#18181B]/70 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-slate-300 dark:text-zinc-600" />
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-slate-500 dark:text-zinc-400">
                            {sec.label}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleMoveToVisible(id)}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                        >
                          + Show
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Actions: Back and Save & Continue */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 px-4 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-center"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex-2 py-3 px-5 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save & Continue</span>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          /* ========================================================================= */
          /* SCREEN 8: SHARE PAGE WITH LIVE PREVIEW                                    */
          /* ========================================================================= */
          <motion.div
            key="screen8"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Back to ordering"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Share
              </span>

              <div className="w-8" />
            </div>

            {/* In-Page Card Showing LIVE PROFILE PREVIEW (Screen 8) */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] overflow-hidden shadow-sm text-left">
              {/* Cover Banner */}
              {sharingSettings.photo !== false && (
                <div className="h-24 w-full bg-slate-900 overflow-hidden relative">
                  <img
                    src={initialProfile.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              )}

              {/* Avatar & Info */}
              <div className="p-4 relative">
                {sharingSettings.photo !== false && (
                  <div className="-mt-10 mb-2">
                    <img
                      src={initialProfile.avatar}
                      alt={initialProfile.name}
                      className="w-14 h-14 rounded-full border-2 border-white dark:border-[#18181B] object-cover shadow-sm bg-slate-100"
                    />
                  </div>
                )}

                {sharingSettings.nameAndTitle !== false && (
                  <div className="space-y-0.5 mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {initialProfile.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {initialProfile.profileName || initialProfile.designation || 'Professional'}
                    </p>
                  </div>
                )}

                {sharingSettings.bio !== false && (
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2 mb-3">
                    {initialProfile.shortBio || 'Passionate developer with a love for building modern web applications...'}
                  </p>
                )}

                {/* Social Icons (Respects visibility!) */}
                {sharingSettings.socialLinks !== false && (
                  <div className="flex items-center gap-2 pt-1 text-slate-600 dark:text-zinc-400">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                      <GithubIcon className="w-3 h-3" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                      <LinkedInIcon className="w-3 h-3" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                      <TwitterXIcon className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Share Profile Link Section (Screen 8) */}
            <div className="space-y-3 text-left">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Share Profile Link
              </label>

              {/* Link Box */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs">
                <span className="truncate text-slate-600 dark:text-zinc-300 font-mono text-[11px] select-all">
                  {publicUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 pl-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Copy Link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Action Buttons: Copy Link & QR Code (Screen 8) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="py-3 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 bg-white dark:bg-[#18181B] text-slate-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>
              </div>

              {/* Success Banner (Screen 8) */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 text-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span>Your profile is live and ready to be shared!</span>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80">
              <Link
                href={`/profile/${publicIdentifier}`}
                className="hover:underline text-slate-800 dark:text-white font-medium"
              >
                View Public Profile →
              </Link>

              <Link
                href="/dashboard"
                className="hover:underline"
              >
                Back to My Profiles
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal / View */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 space-y-4 text-center">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Scan Profile QR Code
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Point any smartphone camera to view this profile instantly.
              </p>
            </div>

            {qrCodeDataUrl ? (
              <div className="p-3 bg-white rounded-2xl border border-slate-200 inline-block mx-auto shadow-xs">
                <img
                  src={qrCodeDataUrl}
                  alt="Profile QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="w-44 h-44 flex items-center justify-center mx-auto text-xs text-slate-400">
                Generating QR...
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
