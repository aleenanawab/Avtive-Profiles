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
  { id: 'skills', key: 'skills', label: 'Skills', icon: Code },
  { id: 'projects', key: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'experience', key: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', key: 'education', label: 'Education', icon: GraduationCap },
  { id: 'contactInfo', key: 'contactInfo', label: 'Contact Information', icon: Phone },
  { id: 'socialLinks', key: 'socialLinks', label: 'Social Links', icon: Link2 }
];

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
    <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm text-slate-900 dark:text-white transition-colors font-sans">
      <AnimatePresence mode="wait">

        {/* ========================================================================= */}
        {/* STEP 1: CHOOSE ROLE TO SHARE                                              */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
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
                Share Profile
              </span>

              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                1/4
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Which role profile you want to share?
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Select from your configured role profiles to export and share.
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
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                        alt={r.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold truncate">
                            {r.profileName || r.name}
                          </h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isSelected ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          }`}>
                            {r.type || 'role'}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate ${isSelected ? 'opacity-80' : 'text-slate-500 dark:text-zinc-400'}`}>
                          {r.profession || r.designation || 'Professional Profile'}
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-white bg-white text-black dark:border-black dark:bg-black dark:text-white' : 'border-slate-300 dark:border-zinc-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Visibility Settings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: WHAT DO YOU WANT TO SHOW? (VISIBILITY)                            */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Share
              </span>

              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                2/4
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                What do you want to show?
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Choose the sections you want to share and hide from your profile.
              </p>
            </div>

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

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      onClick={() => handleToggle(sec.key)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 cursor-pointer ${
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

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Next: Reorder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: REORDER SECTIONS                                                  */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Reorder Sections
              </span>

              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                3/4
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reorder Sections
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Drag or arrange visible and hidden modules for your shared pass.
              </p>
            </div>

            {/* Visible Sections */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Visible Sections ({activeSections.length})
              </div>
              <div className="space-y-2">
                {activeSections.map((id, index) => {
                  const def = SECTION_DEFINITIONS.find((s) => s.id === id);
                  if (!def) return null;
                  const Icon = def.icon;

                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-2.5">
                        <GripVertical className="w-4 h-4 text-slate-400 dark:text-zinc-600 shrink-0" />
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {def.label}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMoveToHidden(id)}
                        className="text-xs text-rose-500 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Hide Section"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hidden Sections */}
            {hiddenSections.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Hidden Sections ({hiddenSections.length})
                </div>
                <div className="space-y-2">
                  {hiddenSections.map((id) => {
                    const def = SECTION_DEFINITIONS.find((s) => s.id === id);
                    if (!def) return null;
                    const Icon = def.icon;

                    return (
                      <div
                        key={id}
                        className="p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 bg-slate-50 dark:bg-zinc-900/20 flex items-center justify-between text-slate-400 dark:text-zinc-600 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{def.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMoveToVisible(id)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSaveAndProceedToShare}
                disabled={isSaving}
                className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Share Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SHARE LINK GENERATION                                             */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Share Link
              </span>

              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                4/4
              </span>
            </div>

            {/* Preview Pass Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                  alt={selectedProfile.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedProfile.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 font-mono text-slate-700 dark:text-zinc-300">
                      {selectedProfile.profileName || selectedProfile.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    {selectedProfile.profession || selectedProfile.designation || 'Professional Profile'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                <span>Active Modules: {activeSections.length}</span>
                <span>Theme: {selectedProfile.theme || 'editorial'}</span>
              </div>
            </div>

            {/* Public Profile URL Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block">
                Public Profile URL
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
                <span className="text-xs font-mono text-slate-800 dark:text-zinc-200 truncate flex-1 select-all">
                  {publicUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Action Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">QR Code Pass</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Scan to open digital pass</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(!showQrModal)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
              >
                {showQrModal ? 'Hide QR' : 'Show QR'}
              </button>
            </div>

            {showQrModal && qrCodeDataUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-3 text-center"
              >
                <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 rounded-xl" />
                <a
                  href={qrCodeDataUrl}
                  download={`${selectedProfile.slug || 'profile'}-qr.png`}
                  className="text-xs text-slate-900 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR Image</span>
                </a>
              </motion.div>
            )}

            <div className="pt-2">
              <Link
                href={`/profile/${publicIdentifier}`}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Done &amp; View Profile</span>
                <Check className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
