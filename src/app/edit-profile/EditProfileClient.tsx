'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Edit3,
  ExternalLink,
  Monitor,
  Smartphone,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  User,
  ChevronUp,
  ChevronDown,
  Code,
  Plus,
  X,
  FileText,
  FolderGit2,
  Pencil,
  Trash2,
  Link2,
  GripVertical,
  Share2,
  Copy,
  Tag,
} from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { ProfileData, ProfileTheme } from '@/types/profile';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { PhonePreview } from '@/components/PhonePreview';
import { DynamicSectionGroups } from '@/components/sections/DynamicSectionGroups';
import { SlidingEditorPanel } from '@/components/profiles/SlidingEditorPanel';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';
import { InlineAvatarPicker } from '@/components/profiles/InlineAvatarPicker';
import { getThemeConfig } from '@/components/themeStyles';
import {
  ProfileEditorProvider,
  useProfileEditor,
  DraggableLinkItem,
} from '@/context/ProfileEditorContext';

// ─── Theme options (presentational only) ─────────────────────────────────────

const THEME_OPTIONS: { id: ProfileTheme; name: string }[] = [
  { id: 'editorial', name: 'Editorial Minimal' },
  { id: 'cyber', name: 'Developer Terminal' },
  { id: 'luxe', name: 'Luxe Velvet' },
];

// ─── DraggableLinkCard (local UI component) ───────────────────────────────────

function DraggableLinkCard({
  link,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  link: DraggableLinkItem;
  index: number;
  total: number;
  onUpdate: (patch: Partial<DraggableLinkItem>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item
      value={link}
      id={link.id}
      dragListener={false}
      dragControls={dragControls}
      className={`p-3 rounded-xl bg-white dark:bg-white/5 border transition-all flex items-center gap-2.5 shadow-2xs ${
        link.visible
          ? 'border-slate-200 dark:border-white/10'
          : 'border-slate-200/50 dark:border-white/5 opacity-60 bg-slate-50/50 dark:bg-black/20'
      }`}
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-grab active:cursor-grabbing shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex flex-col gap-0.5 shrink-0">
        <button type="button" onClick={onMoveUp} disabled={index === 0}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer" title="Move up">
          <ArrowUp className="w-3 h-3" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={index === total - 1}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer" title="Move down">
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <input
          type="url"
          value={link.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder={`https://${link.platform}.com/...`}
          className="figma-input w-full px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
        />
      </div>
      <button
        type="button"
        onClick={() => onUpdate({ visible: !link.visible })}
        className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
          link.visible
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/40'
        }`}
        title={link.visible ? 'Visible on profile' : 'Hidden from profile'}
      >
        {link.visible ? 'ON' : 'OFF'}
      </button>
      <button type="button" onClick={onDelete}
        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0 cursor-pointer" title="Remove link">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </Reorder.Item>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

// ─── Inner component — consumes the shared context ────────────────────────────

function EditProfileInner({ initialProfile, userProfiles }: EditProfileClientProps) {
  const router = useRouter();

  // All shared profile state comes from context — single source of truth
  const {
    profile,
    liveProfile,
    activeTheme, setActiveTheme,
    firstName, setFirstName,
    secondName, setSecondName,
    professionalTitle, setProfessionalTitle,
    bio, setBio,
    tagline, setTagline,
    company, setCompany,
    location, setLocation,
    avatar, setAvatar,
    coverImage,
    skills, setSkills,
    about, setAbout,
    projects, setProjects,
    socialLinks, setSocialLinks,
    customFields,
    sharingSettings, setSharingSettings,
    sectionOrder, setSectionOrder,
    isUploadingAvatar,
    isUploadingCover,
    statusMessage,
    copySuccess,
    fullName,
    currentActiveIdentifier,
    publicProfileUrl,
    handleAvatarUpload,
    handleCoverUpload,
    handleAddLinkItem,
    handleUpdateLink,
    handleDeleteLink,
    handleMoveLink,
    handleAddCustomField,
    handleUpdateCustomField,
    handleDeleteCustomField,
    handleMoveCustomField,
    handleInstantToggleSection,
    handleCopyLink,
    handleSwitchToProfile,
  } = useProfileEditor();

  // ── Layout-only local state ────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileViewTab] = useState<'editor' | 'preview'>('preview');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeThemeConfig = getThemeConfig(activeTheme);
  const identifier = profile.slug || profile.id || initialProfile.slug || initialProfile.id;
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── Project inline form (UI-only) ──────────────────────────────────────────
  const [isInlineProjectOpen, setIsInlineProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<typeof projects[0] | null>(null);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tags: '', link: '', image: '' });

  // ── Skill input ────────────────────────────────────────────────────────────
  const [newSkillInput, setNewSkillInput] = useState('');

  // ── Accordion expand state ────────────────────────────────────────────────
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true, skills: true, about: true, projects: true,
    experience: false, education: false, socials: true, customFields: true, share: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Session guard
  useEffect(() => {
    const verifyActiveSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!data.user) window.location.replace('/login');
      } catch {
        window.location.replace('/login');
      }
    };
    verifyActiveSession();
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') verifyActiveSession();
    };
    const handlePageShow = (e: PageTransitionEvent) => { if (e.persisted) verifyActiveSession(); };
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleVisibilityOrFocus);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  // ── Skills ─────────────────────────────────────────────────────────────────
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills((prev) => [...prev, trimmed]);
    setNewSkillInput('');
  };
  const handleRemoveSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

  // ── Projects ───────────────────────────────────────────────────────────────
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({ title: '', description: '', tags: '', link: '', image: '' });
    setIsInlineProjectOpen(true);
  };
  const handleOpenEditProject = (p: typeof projects[0]) => {
    setEditingProject(p);
    setProjectForm({
      title: p.title, description: p.description,
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      link: p.link || p.liveUrl || '',
      image: p.image || p.coverImage || '',
    });
    setIsInlineProjectOpen(true);
  };
  const handleSaveInlineProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;
    const tagsArray = projectForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (editingProject) {
      setProjects((prev) => prev.map((p) =>
        p.id === editingProject.id
          ? { ...p, title: projectForm.title.trim(), description: projectForm.description.trim(), tags: tagsArray, link: projectForm.link.trim(), image: projectForm.image.trim() || p.image, coverImage: projectForm.image.trim() || p.coverImage }
          : p
      ));
    } else {
      setProjects((prev) => [{
        id: `proj-${Date.now()}`,
        title: projectForm.title.trim(), description: projectForm.description.trim(),
        tags: tagsArray, link: projectForm.link.trim(),
        image: projectForm.image.trim() || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
        coverImage: projectForm.image.trim(), category: 'Project',
      }, ...prev]);
    }
    setIsInlineProjectOpen(false);
  };
  const handleDeleteProject = (id: string) => setProjects((prev) => prev.filter((p) => p.id !== id));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-all duration-300 font-sans ${isEditorOpen ? 'lg:pl-[540px] xl:pl-[580px]' : ''}`}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Studio Bar */}
      <header className="sticky top-[53px] z-30 w-full bg-white/85 dark:bg-[#0B0D13]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors py-2 px-2.5 sm:px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/profile/${identifier}`}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Profile</span>
            </Link>
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700">
              {(['desktop', 'mobile'] as const).map((v) => (
                <button key={v} type="button" onClick={() => setDeviceView(v)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${deviceView === v ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}`}>
                  {v === 'desktop' ? <Monitor className="w-3.5 h-3.5 shrink-0" /> : <Smartphone className="w-3.5 h-3.5 shrink-0" />}
                  <span className="hidden sm:inline capitalize">{v}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Interactive Canvas
            </span>
            <button type="button" onClick={() => setIsEditorOpen(!isEditorOpen)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs cursor-pointer shrink-0 ${isEditorOpen ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm' : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700'}`}>
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span>{isEditorOpen ? 'Editor Open' : 'Edit Profile'}</span>
            </button>
            <Link href={`/profile/${identifier}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs shrink-0">
              <ExternalLink className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">View Live</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Split layout */}
      <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-8 xl:gap-12">

        {/* ── LEFT: Inline editor card ── */}
        <div className={`w-full lg:flex-1 lg:max-w-[580px] xl:max-w-[620px] transition-all ${mobileViewTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
          <div className="w-full bg-white dark:bg-[#111319] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl text-slate-900 dark:text-white font-sans transition-all pb-10 relative">

            {/* Cover */}
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img src={coverImage} alt="Cover Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#111319] via-transparent to-black/30" />
              <div className="absolute top-2 left-0 right-0 z-30 px-5 py-1 flex items-center justify-between text-xs font-semibold text-white/90 font-mono drop-shadow">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
                    <div className="w-full h-full bg-current rounded-2xs" />
                  </div>
                </div>
              </div>
              <div className="absolute top-8 left-4 z-20">
                <Link href={`/profile/${currentActiveIdentifier}`}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute top-8 right-4 z-20 flex items-center gap-2">
                <ProfileSwitcher
                  currentProfileIdOrSlug={profile.slug || profile.id || initialProfile.slug || initialProfile.id}
                  initialProfiles={userProfiles}
                  onSelectProfile={handleSwitchToProfile}
                />
                <button type="button" onClick={() => coverInputRef.current?.click()} disabled={isUploadingCover}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer">
                  {isUploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} />
            </div>

            {/* Avatar */}
            <div className="px-6 relative -mt-12 text-center flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full border-4 border-white dark:border-[#111319] shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 group">
                <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setIsAvatarPickerOpen((p) => !p)} disabled={isUploadingAvatar}
                  className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer">
                  {isUploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{fullName || 'Your Name'}</h2>
                <button type="button" onClick={() => setIsAvatarPickerOpen((p) => !p)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${isAvatarPickerOpen ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900'}`}>
                  <Camera className="w-3 h-3" />
                  <span>{isAvatarPickerOpen ? 'Hide Choices' : 'Change Photo'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-white/60 font-medium pb-2">{professionalTitle || 'Full Stack Engineer'}</p>
              <InlineAvatarPicker currentAvatar={avatar} onSelectAvatar={(url) => setAvatar(url)} isOpen={isAvatarPickerOpen}
                onToggleOpen={() => setIsAvatarPickerOpen((p) => !p)} onClose={() => setIsAvatarPickerOpen(false)}
                isUploading={isUploadingAvatar} onUploadFile={handleAvatarUpload} className="w-full max-w-lg mb-4 text-left" />
            </div>

            {/* Status Messages */}
            {statusMessage && (
              <div className="px-5 mb-3">
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'}`}>
                  {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{statusMessage.text}</span>
                </div>
              </div>
            )}

            {/* Accordion Sections */}
            <div className="px-5 space-y-4">

              {/* 1. Basic Info */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button type="button" onClick={() => toggleSection('basicInfo')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-600 dark:text-white/70" /><span>1. Basic Information</span></div>
                  {expandedSections.basicInfo ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>
                {expandedSections.basicInfo && (
                  <div className="p-4 pt-1 space-y-3 border-t border-slate-200 dark:border-white/5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">First Name</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name"
                          className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">Last Name</label>
                        <input type="text" value={secondName} onChange={(e) => setSecondName(e.target.value)} placeholder="Last Name"
                          className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">Professional Title</label>
                      <input type="text" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} placeholder="e.g. Full Stack Engineer"
                        className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">Short Bio</label>
                      <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A concise overview…"
                        className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">Company</label>
                        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company"
                          className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">Location</label>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location"
                          className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">Describe yourself best</label>
                      <textarea rows={2} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="A punchy phrase, personal tagline, or motto that describes you best…"
                        className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 resize-none" />
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1.5">Card Theme Preset</label>
                      <div className="grid grid-cols-3 gap-2">
                        {THEME_OPTIONS.map((t) => (
                          <button key={t.id} type="button" onClick={() => setActiveTheme(t.id)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${activeTheme === t.id ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white shadow-xs font-bold' : 'bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30'}`}>
                            <div className="text-xs truncate">{t.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Skills */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button type="button" onClick={() => toggleSection('skills')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2"><Code className="w-4 h-4 text-slate-600 dark:text-white/70" /><span>2. Skills &amp; Badges ({skills.length})</span></div>
                  {expandedSections.skills ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>
                {expandedSections.skills && (
                  <div className="p-4 pt-1 space-y-3 border-t border-slate-200 dark:border-white/5">
                    <form onSubmit={handleAddSkill} className="flex gap-2">
                      <input type="text" value={newSkillInput} onChange={(e) => setNewSkillInput(e.target.value)} placeholder="Add skill…"
                        className="figma-input flex-1 px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40" />
                      <button type="submit" className="figma-pill-primary px-3 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                        <Plus className="w-3.5 h-3.5" /><span>Add</span>
                      </button>
                    </form>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 text-xs font-medium text-slate-800 dark:text-white shadow-2xs">
                          <span>{skill}</span>
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. About */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button type="button" onClick={() => toggleSection('about')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600 dark:text-white/70" /><span>3. About &amp; Philosophy</span></div>
                  {expandedSections.about ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>
                {expandedSections.about && (
                  <div className="p-4 pt-1 border-t border-slate-200 dark:border-white/5">
                    <textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Share your career journey…"
                      className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 leading-relaxed resize-none" />
                  </div>
                )}
              </div>

              {/* 4. Projects */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <div className="w-full p-4 flex items-center justify-between">
                  <button type="button" onClick={() => toggleSection('projects')}
                    className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 transition-colors cursor-pointer">
                    <FolderGit2 className="w-4 h-4 text-slate-600 dark:text-white/70" />
                    <span>4. Projects ({projects.length})</span>
                    {expandedSections.projects ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" />}
                  </button>
                  <button type="button" onClick={handleOpenAddProject} className="figma-pill-primary px-3 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3 h-3" /><span>Add Project</span>
                  </button>
                </div>
                {expandedSections.projects && (
                  <div className="p-4 pt-0 space-y-3 border-t border-slate-200 dark:border-white/5">
                    {isInlineProjectOpen && (
                      <form onSubmit={handleSaveInlineProject} className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/20 space-y-2.5 shadow-sm">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{editingProject ? 'Edit Project' : 'New Project'}</span>
                          <button type="button" onClick={() => setIsInlineProjectOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <input type="text" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="Project Title" className="figma-input w-full px-2.5 py-1.5 text-xs font-semibold" required />
                        <textarea rows={2} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Project Description" className="figma-input w-full px-2.5 py-1.5 text-xs resize-none" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="url" value={projectForm.link} onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })} placeholder="Live URL" className="figma-input w-full px-2.5 py-1.5 text-xs" />
                          <input type="text" value={projectForm.tags} onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })} placeholder="Tags (comma separated)" className="figma-input w-full px-2.5 py-1.5 text-xs" />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button type="button" onClick={() => setIsInlineProjectOpen(false)} className="px-3 py-1 text-xs text-slate-600 dark:text-white/60 hover:text-slate-900">Cancel</button>
                          <button type="submit" className="figma-pill-primary px-3 py-1 text-xs font-bold">Save Project</button>
                        </div>
                      </form>
                    )}
                    {projects.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400 dark:text-white/40">No projects yet. Click &quot;Add Project&quot; above.</div>
                    ) : (
                      projects.map((proj) => (
                        <div key={proj.id} className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 hover:bg-slate-100/80 dark:hover:bg-white/[0.08] transition-colors shadow-2xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={proj.image || proj.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop'} alt={proj.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-900" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{proj.title}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-white/60 line-clamp-1">{proj.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => handleOpenEditProject(proj)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleDeleteProject(proj.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-500/15 dark:bg-white/10 dark:hover:bg-rose-500/20 text-slate-700 hover:text-rose-600 dark:text-white/80 dark:hover:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 5. Social Links */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <div className="w-full p-4 flex items-center justify-between">
                  <button type="button" onClick={() => toggleSection('socials')}
                    className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 transition-colors cursor-pointer">
                    <Link2 className="w-4 h-4 text-slate-600 dark:text-white/70" />
                    <span>5. Social Links ({socialLinks.length})</span>
                    {expandedSections.socials ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" />}
                  </button>
                  <div className="flex items-center gap-1">
                    {(['twitter', 'whatsapp'] as const).map((p) => (
                      <button key={p} type="button" onClick={() => handleAddLinkItem(p)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors capitalize">
                        + {p === 'twitter' ? 'X' : 'WhatsApp'}
                      </button>
                    ))}
                  </div>
                </div>
                {expandedSections.socials && (
                  <div className="p-4 pt-0 space-y-2 border-t border-slate-200 dark:border-white/5">
                    <p className="text-[11px] text-slate-500 dark:text-white/50 mb-2 flex items-center gap-1">
                      <GripVertical className="w-3 h-3" /> Drag or click arrows to reorder.
                    </p>
                    <Reorder.Group axis="y" values={socialLinks} onReorder={setSocialLinks} className="space-y-2">
                      {socialLinks.map((link, idx) => (
                        <DraggableLinkCard key={link.id} link={link} index={idx} total={socialLinks.length}
                          onUpdate={(patch) => handleUpdateLink(link.id, patch)}
                          onDelete={() => handleDeleteLink(link.id)}
                          onMoveUp={() => handleMoveLink(idx, 'up')}
                          onMoveDown={() => handleMoveLink(idx, 'down')}
                        />
                      ))}
                    </Reorder.Group>
                  </div>
                )}
              </div>

              {/* 5b. Custom Fields */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button type="button" onClick={() => setExpandedSections((prev) => ({ ...prev, customFields: !prev.customFields }))}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-violet-500" /><span>5b. Custom Fields</span>
                    {customFields.length > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">{customFields.length}</span>}
                  </div>
                  {expandedSections.customFields ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>
                {expandedSections.customFields && (
                  <div className="p-4 pt-0 space-y-3 border-t border-slate-200 dark:border-white/5">
                    <p className="text-[11px] text-slate-500 dark:text-white/50 pt-3">Add awards, pronouns, availability, languages, etc.</p>
                    <div className="space-y-2">
                      {customFields.map((field, idx) => (
                        <div key={field.id} className={`p-3 rounded-xl border transition-all ${field.visible ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10' : 'bg-slate-50/50 dark:bg-black/20 border-slate-200/50 dark:border-white/5 opacity-60'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <button type="button" onClick={() => handleMoveCustomField(idx, 'up')} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"><ArrowUp className="w-3 h-3" /></button>
                              <button type="button" onClick={() => handleMoveCustomField(idx, 'down')} disabled={idx === customFields.length - 1} className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"><ArrowDown className="w-3 h-3" /></button>
                            </div>
                            <input type="text" value={field.label} onChange={(e) => handleUpdateCustomField(field.id, { label: e.target.value })} placeholder="Field label…"
                              className="figma-input flex-1 min-w-0 px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-violet-400 dark:focus:ring-violet-500" />
                            <button type="button" onClick={() => handleUpdateCustomField(field.id, { visible: !field.visible })}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${field.visible ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/40'}`}>
                              {field.visible ? 'ON' : 'OFF'}
                            </button>
                            <button type="button" onClick={() => handleDeleteCustomField(field.id)} className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          <input type="text" value={field.value} onChange={(e) => handleUpdateCustomField(field.id, { value: e.target.value })} placeholder="Field content…"
                            className="figma-input w-full px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-violet-400 dark:focus:ring-violet-500" />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={handleAddCustomField}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border-2 border-dashed border-violet-300 dark:border-violet-800/60 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add Custom Field
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Section Layout */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button type="button" onClick={() => toggleSection('share')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2"><Share2 className="w-4 h-4 text-amber-500" /><span>6. Section Layout &amp; Visibility</span></div>
                  {expandedSections.share ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>
                {expandedSections.share && (
                  <div className="p-4 pt-1 space-y-5 border-t border-slate-200 dark:border-white/5">
                    <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-white/40 mb-0.5 font-mono">Public Profile Link</span>
                        <span className="text-xs font-mono text-slate-700 dark:text-white/80 truncate block">{publicProfileUrl}</span>
                      </div>
                      <button type="button" onClick={handleCopyLink}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 shrink-0 transition-all cursor-pointer ${copySuccess ? 'bg-emerald-600 text-white' : 'figma-pill-primary'}`}>
                        {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                    <DynamicSectionGroups
                      sectionOrder={sectionOrder}
                      sharingSettings={sharingSettings}
                      onSectionOrderChange={setSectionOrder}
                      onSharingSettingsChange={setSharingSettings}
                      onInstantToggle={handleInstantToggleSection}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        {deviceView === 'mobile' ? (
          <main className="flex-1 w-full mx-auto px-4 py-6 sm:py-8 flex justify-center items-start transition-all duration-300">
            <div className="hidden sm:block">
              <PhonePreview
                profile={liveProfile}
                isDark={isDark}
                canEdit={true}
                onOpenEdit={() => setIsEditorOpen(true)}
                onOpenShare={() => showToast('Share settings accessible in editor panel')}
                onOpenConnect={() => showToast('Connected!')}
                onSaveContact={() => showToast('Contact information saved!')}
                onSaveEdits={async () => { showToast('Changes updated!'); }}
                onSelectTeamMember={(member) => {
                  const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                  router.push(`/profile/${slug}`);
                }}
                onViewCompany={() => { if (liveProfile.companyId) router.push(`/profile/${liveProfile.companyId}`); }}
                hideHeaderLabel={true}
              />
            </div>
            <div className="sm:hidden w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
              <AvtiveDigitalCard
                profile={liveProfile} canEdit={true} isEditing={false} isConnected={false}
                onOpenEdit={() => setIsEditorOpen(true)} onCancelEdit={() => {}}
                onSaveEdits={async () => { showToast('Changes updated!'); }}
                onSaveContact={() => showToast('Contact information saved!')}
                onOpenShare={() => showToast('Share settings accessible in editor panel')}
                onOpenConnect={() => showToast('Connected!')}
                onOpenQRModal={() => {}} onOpenResumeModal={() => {}} onSelectProject={() => {}}
                onSelectTeamMember={(member) => {
                  const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                  router.push(`/profile/${slug}`);
                }}
                onViewCompany={() => { if (liveProfile.companyId) router.push(`/profile/${liveProfile.companyId}`); }}
                isDark={isDark} viewMode="standard"
              />
            </div>
          </main>
        ) : (
          <main className="flex-1 w-full mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 flex justify-center transition-all duration-300 max-w-4xl lg:max-w-5xl">
            <div className="w-full bg-white dark:bg-[#18181B] sm:rounded-3xl sm:border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
              <AvtiveDigitalCard
                profile={liveProfile} canEdit={true} isEditing={false} isConnected={false}
                onOpenEdit={() => setIsEditorOpen(true)} onCancelEdit={() => {}}
                onSaveEdits={async () => { showToast('Changes updated!'); }}
                onSaveContact={() => showToast('Contact information saved!')}
                onOpenShare={() => showToast('Share settings accessible in editor panel')}
                onOpenConnect={() => showToast('Connected!')}
                onOpenQRModal={() => {}} onOpenResumeModal={() => {}} onSelectProject={() => {}}
                onSelectTeamMember={(member) => {
                  const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                  router.push(`/profile/${slug}`);
                }}
                onViewCompany={() => { if (liveProfile.companyId) router.push(`/profile/${liveProfile.companyId}`); }}
                isDark={isDark} viewMode="standard"
              />
            </div>
          </main>
        )}
      </div>

      {/* Floating edit pill */}
      {!isEditorOpen && (
        <button type="button" onClick={() => setIsEditorOpen(true)}
          className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 backdrop-blur-md shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-bold border border-white/20 dark:border-slate-300/40 cursor-pointer group">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse group-hover:scale-125 transition-transform" />
          <Edit3 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>Edit Profile</span>
        </button>
      )}

      {/* Sliding Editor Panel — shares state via context */}
      <SlidingEditorPanel
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialProfile={initialProfile}
        userProfiles={userProfiles}
      />
    </div>
  );
}

// ─── Outer component — provides shared context ────────────────────────────────
export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  return (
    <ProfileEditorProvider initialProfile={initialProfile} userProfiles={userProfiles}>
      <EditProfileInner initialProfile={initialProfile} userProfiles={userProfiles} />
    </ProfileEditorProvider>
  );
}
