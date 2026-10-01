'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Layers,
  X,
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  FileText,
  Code,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Link2,
  Phone,
  Building2,
  Award,
  Sparkles,
  Tag,
  Save,
  Loader2,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { ProfileData, SharingSettings, DynamicSection, CustomFieldItem } from '@/types/profile';
import { ALL_PROFILE_SECTIONS, ProfileSectionMeta } from '@/components/sections/DynamicSectionGroups';

export interface SectionsSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onUpdateProfile: (updatedProfile: ProfileData) => void;
  onSaveProfile?: (profileToSave?: ProfileData) => Promise<void>;
  isSaving?: boolean;
  isOwner?: boolean;
}

export function SectionsSidePanel({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onSaveProfile,
  isSaving = false,
  isOwner = true
}: SectionsSidePanelProps) {
  const [activeTab, setActiveTab] = useState<'layout' | 'manage'>('layout');
  const [activeSearch, setActiveSearch] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside detection on the remaining ~20% outside area
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, onClose]);

  // Extract base list of section definitions
  const sectionMetaMap = React.useMemo(() => {
    const map = new Map<string, ProfileSectionMeta>();
    ALL_PROFILE_SECTIONS.forEach((s) => map.set(s.id, s));
    return map;
  }, []);

  // Standard ordered section list
  const currentSectionOrder = React.useMemo(() => {
    const defaultOrder = [
      'company',
      'about',
      'contact',
      'custom-fields',
      'skills',
      'services',
      'projects',
      'experience',
      'education',
      'certifications',
      'volunteer',
      'languages',
      'recommendations',
      'socialLinks',
      'virtual-card'
    ];

    const userOrder = profile.sectionOrder || [];
    const ordered: string[] = [];

    // Add user ordered keys
    for (const key of userOrder) {
      const normalized = (key === 'services' || key === 'skills') ? 'skills' : (key === 'socials' ? 'socialLinks' : key === 'personalDetails' ? 'about' : key === 'contactInfo' ? 'contact' : key);
      if (!ordered.includes(normalized) && (sectionMetaMap.has(normalized) || defaultOrder.includes(normalized))) {
        ordered.push(normalized);
      }
    }

    // Add remaining defined sections
    for (const item of ALL_PROFILE_SECTIONS) {
      if (!ordered.includes(item.id)) {
        ordered.push(item.id);
      }
    }

    return ordered;
  }, [profile.sectionOrder, sectionMetaMap]);

  // Section visibility check
  const isSectionVisible = (id: string): boolean => {
    const visibility = profile.sectionVisibility || {};
    if (typeof visibility[id] === 'boolean') {
      return visibility[id];
    }
    // Check aliases
    if (id === 'about' && typeof visibility['personalDetails'] === 'boolean') return visibility['personalDetails'];
    if (id === 'contact' && typeof visibility['contactInfo'] === 'boolean') return visibility['contactInfo'];
    if (id === 'custom-fields' && typeof visibility['customFields'] === 'boolean') return visibility['customFields'];
    if (id === 'socialLinks' && typeof visibility['socials'] === 'boolean') return visibility['socials'];

    const sharing = profile.sharingSettings || {};
    const meta = sectionMetaMap.get(id);
    if (meta && meta.key && typeof sharing[meta.key] === 'boolean') {
      return Boolean(sharing[meta.key]);
    }
    return true;
  };

  // Derive Visible and Hidden section lists
  const visibleSections = React.useMemo(() => {
    return currentSectionOrder.filter((id) => isSectionVisible(id));
  }, [currentSectionOrder, profile.sectionVisibility, profile.sharingSettings]);

  const hiddenSections = React.useMemo(() => {
    return currentSectionOrder.filter((id) => !isSectionVisible(id));
  }, [currentSectionOrder, profile.sectionVisibility, profile.sharingSettings]);

  // Toggle single section visibility immediately
  const handleToggleVisibility = (id: string, targetVisible?: boolean) => {
    const currentlyVisible = isSectionVisible(id);
    const nextVisible = targetVisible !== undefined ? targetVisible : !currentlyVisible;

    const newVisibility: Record<string, boolean> = {
      ...(profile.sectionVisibility || {}),
      [id]: nextVisible
    };

    // Keep aliases synced
    if (id === 'about') newVisibility['personalDetails'] = nextVisible;
    if (id === 'contact') newVisibility['contactInfo'] = nextVisible;
    if (id === 'custom-fields') newVisibility['customFields'] = nextVisible;
    if (id === 'socialLinks') newVisibility['socials'] = nextVisible;
    if (id === 'skills') newVisibility['services'] = nextVisible;

    const newSharing: SharingSettings = {
      ...(profile.sharingSettings || {})
    };
    const meta = sectionMetaMap.get(id);
    if (meta && meta.key) {
      newSharing[meta.key] = nextVisible;
    }

    // Update sectionOrder if making visible
    let newOrder = [...currentSectionOrder];
    if (nextVisible && !newOrder.includes(id)) {
      newOrder.push(id);
    }

    const updated: ProfileData = {
      ...profile,
      sectionVisibility: newVisibility,
      sharingSettings: newSharing,
      sectionOrder: newOrder
    };

    onUpdateProfile(updated);
  };

  // Reorder Visible Sections via Drag & Drop
  const handleReorderVisible = (newVisibleKeys: string[]) => {
    // Preserve hidden items at the end or in original relative position
    const nonVisibleKeys = currentSectionOrder.filter((k) => !newVisibleKeys.includes(k));
    const merged = [...newVisibleKeys, ...nonVisibleKeys];

    const updated: ProfileData = {
      ...profile,
      sectionOrder: merged
    };

    onUpdateProfile(updated);
  };

  // Move a section up/down
  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    const list = [...visibleSections];
    const index = list.indexOf(id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = list[index - 1];
      list[index - 1] = list[index];
      list[index] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index + 1];
      list[index + 1] = list[index];
      list[index] = temp;
    } else {
      return;
    }

    handleReorderVisible(list);
  };

  // Reset to default order and show all
  const handleResetOrder = () => {
    const defaultOrder = ALL_PROFILE_SECTIONS.map((s) => s.id);
    const newVisibility: Record<string, boolean> = {};
    const newSharing: SharingSettings = { ...(profile.sharingSettings || {}) };

    ALL_PROFILE_SECTIONS.forEach((s) => {
      newVisibility[s.id] = true;
      if (s.key) newSharing[s.key] = true;
    });

    const updated: ProfileData = {
      ...profile,
      sectionOrder: defaultOrder,
      sectionVisibility: newVisibility,
      sharingSettings: newSharing
    };

    onUpdateProfile(updated);
  };

  // Smooth scroll to a section on the visible profile behind the panel
  const handleScrollToSection = (sectionId: string) => {
    const elementIds = [
      `profile-section-${sectionId}`,
      `section-${sectionId}`,
      sectionId,
      sectionId === 'about' ? 'section-about' : '',
      sectionId === 'contact' ? 'section-contact' : '',
      sectionId === 'skills' ? 'section-skills' : '',
      sectionId === 'projects' ? 'section-projects' : '',
      sectionId === 'experience' ? 'section-experience' : '',
      sectionId === 'virtual-card' ? 'virtual-card-section' : ''
    ].filter(Boolean);

    for (const elId of elementIds) {
      const target = document.getElementById(elId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('ring-2', 'ring-cyan-500', 'ring-offset-2', 'transition-all');
        setTimeout(() => {
          target.classList.remove('ring-2', 'ring-cyan-500', 'ring-offset-2');
        }, 1800);
        break;
      }
    }
  };

  // Save handler
  const handleSave = async () => {
    if (onSaveProfile) {
      await onSaveProfile(profile);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    }
  };

  // Filter section items if user searched
  const filteredVisible = visibleSections.filter((id) => {
    if (!activeSearch) return true;
    const meta = sectionMetaMap.get(id);
    const label = meta ? meta.label : id;
    return label.toLowerCase().includes(activeSearch.toLowerCase());
  });

  const filteredHidden = hiddenSections.filter((id) => {
    if (!activeSearch) return true;
    const meta = sectionMetaMap.get(id);
    const label = meta ? meta.label : id;
    return label.toLowerCase().includes(activeSearch.toLowerCase());
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex flex-row">
          
          {/* ──────────────────────────────────────────────────────────────────── */}
          {/* 1. Translucent Backdrop Overlay (Full-screen click listener)         */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          <motion.div
            key="sections-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/35 dark:bg-black/55 backdrop-blur-[2px] cursor-pointer"
          />

          {/* ──────────────────────────────────────────────────────────────────── */}
          {/* 2. Task B3: 80% Panel Layout                                         */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          <motion.aside
            key="sections-panel-drawer"
            ref={panelRef}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            aria-label="Sections Side Panel (80% View)"
            className="relative z-50 w-[80vw] max-w-[80vw] h-full min-h-0 bg-white dark:bg-[#0A0F1D] border-r border-slate-200 dark:border-white/10 shadow-2xl flex flex-col select-none transition-colors"
          >
            
            {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#0E1528]/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Profile Sections
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/25">
                      {visibleSections.length} Visible
                    </span>
                    <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
                      80% Panel View
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Live drag reorder &amp; visibility controls &middot; Click outside or &ldquo;Done&rdquo; to close
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sections panel"
                title="Close panel (Esc or click outside)"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200/60 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300/60 dark:border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── TABS & QUICK SEARCH ─────────────────────────────────────────── */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0F1D] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 max-w-md text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('layout')}
                  className={`flex-1 py-1.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'layout'
                      ? 'bg-white dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 shadow-xs border border-slate-200/80 dark:border-cyan-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Layout &amp; Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  className={`flex-1 py-1.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'manage'
                      ? 'bg-white dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 shadow-xs border border-slate-200/80 dark:border-cyan-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Custom Fields ({profile.customFields?.length || 0})</span>
                </button>
              </div>

              {activeTab === 'layout' && (
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <input
                    type="text"
                    value={activeSearch}
                    onChange={(e) => setActiveSearch(e.target.value)}
                    placeholder="Search sections..."
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleResetOrder}
                    className="p-1.5 px-2.5 rounded-xl text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title="Reset all sections to default arrangement"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── SCROLLABLE SECTIONS BODY ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
              
              {/* TAB 1: LAYOUT & REORDERING (Spacious 80% Grid Layout) */}
              {activeTab === 'layout' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Column 1: Visible Sections with Drag-and-Drop (lg:col-span-8) */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Visible Sections ({filteredVisible.length})</span>
                      </span>
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal lowercase">
                        drag or use arrows
                      </span>
                    </div>

                    {filteredVisible.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.02] text-center text-xs text-slate-500 dark:text-slate-400">
                        {activeSearch ? 'No matching visible sections.' : 'All sections are currently hidden.'}
                      </div>
                    ) : (
                      <Reorder.Group
                        axis="y"
                        values={visibleSections}
                        onReorder={handleReorderVisible}
                        className="space-y-2.5"
                      >
                        {filteredVisible.map((id, index) => {
                          const meta = sectionMetaMap.get(id);
                          const label = meta ? meta.label : id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                          const desc = meta ? meta.description : 'Profile section';
                          const IconComponent = meta?.icon || Tag;

                          return (
                            <Reorder.Item
                              key={id}
                              value={id}
                              className="group relative flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] hover:border-cyan-400/60 dark:hover:border-cyan-500/40 shadow-xs hover:shadow-md transition-all select-none"
                            >
                              {/* Left: Drag Handle */}
                              <div
                                title="Drag to reorder section"
                                className="p-1.5 text-slate-400 hover:text-cyan-600 dark:text-slate-500 dark:hover:text-cyan-400 cursor-grab active:cursor-grabbing shrink-0"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              {/* Center: Icon, Label & Click to Scroll Target */}
                              <button
                                type="button"
                                onClick={() => handleScrollToSection(id)}
                                title={`Scroll to ${label} on profile`}
                                className="flex-1 flex items-center gap-3 min-w-0 px-1 text-left cursor-pointer group/jump"
                              >
                                <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 shadow-2xs">
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover/jump:text-cyan-600 dark:group-hover/jump:text-cyan-400 transition-colors">
                                      {label}
                                    </h3>
                                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 opacity-0 group-hover/jump:opacity-100 transition-opacity bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.2 rounded-md">
                                      jump ↗
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {desc}
                                  </p>
                                </div>
                              </button>

                              {/* Right: Up/Down Arrows + Eye Hide Toggle */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveSection(id, 'up');
                                  }}
                                  disabled={index === 0}
                                  title="Move section up"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveSection(id, 'down');
                                  }}
                                  disabled={index === visibleSections.length - 1}
                                  title="Move section down"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleVisibility(id, false);
                                  }}
                                  title="Hide section from public profile"
                                  className="p-2 rounded-xl text-cyan-600 dark:text-cyan-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </Reorder.Item>
                          );
                        })}
                      </Reorder.Group>
                    )}
                  </div>

                  {/* Column 2: Hidden Sections & Jump Helper (lg:col-span-4) */}
                  <div className="lg:col-span-4 space-y-4">
                    
                    {/* Hidden Sections Box */}
                    <div className="p-4 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span>Hidden Sections ({filteredHidden.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          click show
                        </span>
                      </div>

                      {filteredHidden.length === 0 ? (
                        <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] text-center text-xs text-slate-400 dark:text-slate-500">
                          All sections are active on your profile.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredHidden.map((id) => {
                            const meta = sectionMetaMap.get(id);
                            const label = meta ? meta.label : id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                            const desc = meta ? meta.description : 'Section is currently hidden';
                            const IconComponent = meta?.icon || Tag;

                            return (
                              <div
                                key={id}
                                className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-200/70 dark:border-white/5 bg-white dark:bg-[#111827] opacity-80 hover:opacity-100 transition-all"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 px-1">
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                                    <IconComponent className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-through truncate">
                                      {label}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                      {desc}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleVisibility(id, true)}
                                  title="Show and restore section"
                                  className="p-1.5 px-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 bg-slate-50 hover:bg-emerald-50 dark:bg-white/5 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <EyeOff className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-500" />
                                  <span>Show</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quick Tip Box */}
                    <div className="p-4 rounded-3xl border border-cyan-500/20 bg-cyan-50/40 dark:bg-cyan-950/20 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-cyan-800 dark:text-cyan-300 text-xs">
                        <Info className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Live 80/20 Twin-Screen View</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Changes to visibility and order update the profile card behind this panel immediately. Click the 20% area on the right to close anytime.
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: CUSTOM FIELDS & DYNAMIC SECTIONS MANAGER (Responsive 2-Column Grid) */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Custom Dynamic Fields
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Add customized links, metadata badges or custom fields to your profile.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newFields: CustomFieldItem[] = [
                          ...(profile.customFields || []),
                          {
                            id: `cf-${Date.now()}`,
                            label: 'New Field',
                            value: 'Custom Value',
                            type: 'text',
                            visible: true
                          }
                        ];
                        onUpdateProfile({
                          ...profile,
                          customFields: newFields
                        });
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Field</span>
                    </button>
                  </div>

                  {(!profile.customFields || profile.customFields.length === 0) ? (
                    <div className="p-8 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                      <Tag className="w-8 h-8 text-purple-400 mx-auto" />
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No custom fields added yet.</p>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">Click &ldquo;+ Add Field&rdquo; to insert custom attributes like Calendly links, certificates, or Discord handles.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.customFields.map((field, fIdx) => (
                        <div
                          key={field.id || fIdx}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={field.label || ''}
                              onChange={(e) => {
                                const copy = [...(profile.customFields || [])];
                                copy[fIdx] = { ...copy[fIdx], label: e.target.value };
                                onUpdateProfile({ ...profile, customFields: copy });
                              }}
                              placeholder="Field Title (e.g. Discord, Calendly, Portfolio)"
                              className="flex-1 text-xs font-bold bg-transparent text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 focus:outline-none focus:border-purple-500 pb-0.5"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...(profile.customFields || [])];
                                copy.splice(fIdx, 1);
                                onUpdateProfile({ ...profile, customFields: copy });
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={field.value || ''}
                              onChange={(e) => {
                                const copy = [...(profile.customFields || [])];
                                copy[fIdx] = { ...copy[fIdx], value: e.target.value };
                                onUpdateProfile({ ...profile, customFields: copy });
                              }}
                              placeholder="Value or URL..."
                              className="flex-1 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                            />

                            <select
                              value={field.type || 'text'}
                              onChange={(e) => {
                                const copy = [...(profile.customFields || [])];
                                copy[fIdx] = { ...copy[fIdx], type: e.target.value as any };
                                onUpdateProfile({ ...profile, customFields: copy });
                              }}
                              className="p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none"
                            >
                              <option value="text">Text</option>
                              <option value="link">Link</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* ── BOTTOM STICKY FOOTER ────────────────────────────────────────── */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/95 dark:bg-[#0A0F1D]/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              {saveSuccessNotice ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Changes saved successfully!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Info className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Live preview active &middot; Profile visible in 20% area</span>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                {isOwner && onSaveProfile && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Layout</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </motion.aside>

          {/* ──────────────────────────────────────────────────────────────────── */}
          {/* 3. Task B3: 20% Outside Area (Explicit Clickable Outside Target)     */}
          {/* ──────────────────────────────────────────────────────────────────── */}
          <div
            onClick={onClose}
            aria-label="Click outside area to close panel"
            title="Click outside to close panel"
            className="relative z-50 w-[20vw] h-full cursor-pointer flex items-center justify-center group shrink-0"
          >
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 text-white text-[11px] font-semibold backdrop-blur-md opacity-0 group-hover:opacity-90 transition-opacity pointer-events-none shadow-lg border border-white/20">
              <X className="w-3.5 h-3.5" />
              <span>Click outside to close</span>
            </div>
          </div>

        </div>
      )}
    </AnimatePresence>
  );
}
