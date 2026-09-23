'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Code,
  FolderGit2,
  GraduationCap,
  Link2,
  Briefcase,
  Sparkles,
  EyeOff,
  UserCheck,
  Archive,
  ShieldCheck,
  Settings,
  Pencil,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Camera,
  Loader2,
  ExternalLink,
  Wifi,
  Battery,
  Signal,
  SlidersHorizontal,
  Smartphone,
  Eye,
  Columns
} from 'lucide-react';
import { useProfileEditor } from '@/context/ProfileEditorContext';
import { ProjectItem, ExperienceItem, EducationItem } from '@/types/profile';

export interface MobileSliderProfileViewProps {
  onSave?: () => Promise<void>;
  onNext?: () => void;
  className?: string;
}

export function MobileSliderProfileView({ onSave, onNext, className = '' }: MobileSliderProfileViewProps) {
  const {
    profile,
    firstName, setFirstName,
    secondName, setSecondName,
    username, setUsername,
    professionalTitle, setProfessionalTitle,
    bio, setBio,
    avatar,
    coverImage,
    skills, setSkills,
    projects, setProjects,
    education, setEducation,
    socialLinks, setSocialLinks,
    experiences, setExperiences,
    customFields, setCustomFields,
    sectionVisibility,
    handleToggleSectionVisibility,
    fullName,
    isSaving,
    handleSaveChanges,
    showToast,
    activeSection,
    setActiveSection
  } = useProfileEditor();

  // Slider position (percentage from 0 to 100, default ~50% to show exact PDF split)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local state for skills search & input
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isAddingNewSkill, setIsAddingNewSkill] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Email & Phone input local state
  const [emailValue, setEmailValue] = useState(profile.email || 'user@example.com');
  const [phoneValue, setPhoneValue] = useState(profile.phone || '+1 (555) 000-0000');

  // Expanded cards on the left form
  const [expandedLeftCard, setExpandedLeftCard] = useState<string | null>('profile');

  // Active drawer section for highlight
  const [selectedDrawerSection, setSelectedDrawerSection] = useState<string>('profile');

  // Sync email and phone if profile changes
  useEffect(() => {
    if (profile.email) setEmailValue(profile.email);
    if (profile.phone) setPhoneValue(profile.phone);
  }, [profile.email, profile.phone]);

  // Section items matching the PDF right drawer exactly
  const PDF_DRAWER_SECTIONS = [
    { key: 'profile', label: 'Profile', icon: User, hasToggle: true, hasArrow: true },
    { key: 'personalDetails', label: 'Personal Details', icon: Pencil, hasToggle: false, isEdit: true },
    { key: 'skills', label: 'Skills', icon: Code, hasToggle: true, hasArrow: true },
    { key: 'projects', label: 'Projects', icon: FolderGit2, hasToggle: true, hasArrow: true },
    { key: 'education', label: 'Education', icon: GraduationCap, hasToggle: true, hasArrow: true },
    { key: 'contactInfo', label: 'Contact Info', icon: Phone, hasToggle: true, hasArrow: true },
    { key: 'socialLinks', label: 'Social Links', icon: Link2, hasToggle: true, hasArrow: true },
    { key: 'experience', label: 'Experience', icon: Briefcase, hasToggle: true, hasArrow: true },
    { key: 'enhanceProfile', label: 'Enhance Profile', icon: Sparkles, hasToggle: true, hasArrow: true },
    { key: 'limitations', label: 'Limitations', icon: EyeOff, hasToggle: true, hasArrow: true },
    { key: 'accountInfo', label: 'Account info', icon: UserCheck, hasToggle: true, hasArrow: true },
    { key: 'archive', label: 'Archive', icon: Archive, hasToggle: true, hasArrow: true },
    { key: 'security', label: 'Security', icon: ShieldCheck, hasToggle: true, hasArrow: true },
    { key: 'settings', label: 'Settings', icon: Settings, hasToggle: true, hasArrow: true },
  ];

  // Dragging handler for slider bar
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(10, Math.min(90, (x / rect.width) * 100));
      setSliderPos(percent);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percent = Math.max(10, Math.min(90, (x / rect.width) * 100));
      setSliderPos(percent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleAddSkillTag = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      showToast?.(`Added skill: ${trimmed}`);
    }
    setNewSkillInput('');
    setIsAddingNewSkill(false);
  };

  const handleRemoveSkillTag = (skillName: string) => {
    setSkills(prev => prev.filter(s => s !== skillName));
  };

  const handleSaveTrigger = async () => {
    if (onSave) {
      await onSave();
    } else {
      await handleSaveChanges();
    }
  };

  const isSectionVisible = (key: string): boolean => {
    if (sectionVisibility && typeof sectionVisibility[key] === 'boolean') {
      return sectionVisibility[key];
    }
    return true;
  };

  // Predefined popular skill suggestions
  const defaultSkillChips = ['HTML', 'CSS', 'React', 'NextTs', 'NodeJs', 'TypeScript'];
  const filteredSkills = skills.length > 0 ? skills : defaultSkillChips;

  return (
    <div className={`w-[375px] min-w-[375px] max-w-[375px] h-full flex flex-col select-none overflow-hidden transition-colors ${className}`}>
      
      {/* Top Slider Control Presets Bar */}
      <div className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#0E1528] border-b border-slate-200 dark:border-white/10 shrink-0 transition-colors">
        <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile View</span>
        </span>

        {/* Quick Split Presets */}
        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setSliderPos(50)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
              Math.round(sliderPos) === 50 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Split 50%"
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setSliderPos(85)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
              sliderPos > 70 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Show Form View"
          >
            Form
          </button>
          <button
            type="button"
            onClick={() => setSliderPos(15)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
              sliderPos < 30 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Show Section Drawer"
          >
            Drawer
          </button>
        </div>
      </div>

      {/* Main Inner Display Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 overflow-hidden bg-slate-50 dark:bg-[#0A101D] flex flex-col select-text transition-colors"
      >
        {/* Top Background Cover Header */}
        <div className="relative h-36 w-full shrink-0 overflow-hidden bg-slate-200 dark:bg-[#0D1626]">
          <img
            src={coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop'}
            alt="Mountain Landscape Cover"
            className="w-full h-full object-cover opacity-90"
          />
          {/* Subtle gradient fade into body */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

          {/* User Title & Avatar Overlay */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2.5">
            <div className="relative w-12 h-12 rounded-full border-2 border-white dark:border-[#1E2D44] overflow-hidden bg-slate-200 dark:bg-[#131F33] shrink-0 shadow-lg">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'}
                alt={fullName || 'User Profile'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white tracking-tight truncate">
                {fullName || 'User Profile'}
              </h2>
              <p className="text-[11px] text-slate-200 font-medium truncate">
                {professionalTitle || 'Full Stack Engineer'}
              </p>
              {/* Micro skill tags */}
              <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                {skills.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-black/50 text-slate-200 border border-white/20 shrink-0 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SLIDER VIEWPORT: SPLIT BETWEEN LEFT FORM & RIGHT FROSTED DRAWER       */}
        {/* ===================================================================== */}
        <div className="relative flex-1 w-full overflow-hidden flex">
          
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* LAYER 1: LEFT FORM CONTENT ("Visible" & "Hidden" Groups)            */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div 
            className="h-full overflow-y-auto overflow-x-hidden p-3 space-y-3.5 scrollbar-none overscroll-contain"
            style={{ width: `${sliderPos}%` }}
          >
            {/* ── VISIBLE SECTION ────────────────────────────────────────────── */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">Visible</h3>
              </div>

              {/* 1. Profile (Name & Bio) Card */}
              <div className="rounded-xl bg-white dark:bg-[#111C2C]/90 border border-slate-200 dark:border-[#22354F] p-3 space-y-2 shadow-xs transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-[#22354F]/80 pb-1.5">
                  <span className="tracking-wide">Profile</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSectionVisibility('profile')}
                      title={isSectionVisible('profile') ? "Hide Profile" : "Show Profile"}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
                    >
                      {isSectionVisible('profile') ? <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setExpandedLeftCard(expandedLeftCard === 'profile' ? null : 'profile')}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      {expandedLeftCard === 'profile' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Name</label>
                  <input
                    type="text"
                    value={fullName || 'User Profile'}
                    onChange={(e) => {
                      const parts = e.target.value.split(' ');
                      setFirstName(parts[0] || '');
                      setSecondName(parts.slice(1).join(' '));
                    }}
                    placeholder="Enter your name"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-[#22354F] text-slate-900 dark:text-white text-[11px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Full Stack Engineer | Product Enthusiast"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-[#22354F] text-slate-900 dark:text-white text-[11px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 resize-none"
                  />
                </div>
              </div>

              {/* 2. Personal Details Card */}
              <div className="rounded-xl bg-white dark:bg-[#111C2C]/90 border border-slate-200 dark:border-[#22354F] p-3 space-y-2 shadow-xs transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-[#22354F]/80 pb-1.5">
                  <span className="tracking-wide">Personal Details</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSectionVisibility('personalDetails')}
                      title={isSectionVisible('personalDetails') ? "Hide Personal Details" : "Show Personal Details"}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
                    >
                      {isSectionVisible('personalDetails') ? <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    <Pencil className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Email</label>
                  <input
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    placeholder="enter your email"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-[#22354F] text-slate-900 dark:text-white text-[11px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    placeholder="enter your phone number"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-[#22354F] text-slate-900 dark:text-white text-[11px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                  />
                </div>
              </div>

              {/* 3. Skills Card */}
              <div className="rounded-xl bg-white dark:bg-[#111C2C]/90 border border-slate-200 dark:border-[#22354F] p-3 space-y-2 shadow-xs transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-[#22354F]/80 pb-1.5">
                  <span className="tracking-wide">Skills</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSectionVisibility('skills')}
                      title={isSectionVisible('skills') ? "Hide Skills" : "Show Skills"}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
                    >
                      {isSectionVisible('skills') ? <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    <Code className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Skills Cloud</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewSkill(!isAddingNewSkill)}
                    className="text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                {isAddingNewSkill ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkillTag(newSkillInput);
                        }
                      }}
                      placeholder="Skill name & press Enter"
                      className="flex-1 px-2 py-1 rounded bg-slate-50 dark:bg-[#0A101D] border border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white text-[10px]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkillTag(newSkillInput)}
                      className="px-2 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Search skills..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-[#22354F] text-slate-900 dark:text-white text-[11px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                  />
                )}

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {filteredSkills
                    .filter(s => !skillSearchQuery || s.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                    .map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-[#162438] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#283E5E] group transition-colors"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillTag(skill)}
                          className="opacity-40 group-hover:opacity-100 hover:text-rose-500 transition-opacity cursor-pointer"
                          aria-label={`Remove ${skill}`}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                </div>
              </div>

              {/* 4. Projects Card */}
              <div className="rounded-xl bg-white dark:bg-[#111C2C]/90 border border-slate-200 dark:border-[#22354F] p-3 space-y-1.5 shadow-xs transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-[#22354F]/80 pb-1.5">
                  <span className="tracking-wide">Projects</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSectionVisibility('projects')}
                      title={isSectionVisible('projects') ? "Hide Projects" : "Show Projects"}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
                    >
                      {isSectionVisible('projects') ? <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    <FolderGit2 className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Featured work & repository links</p>
                
                {projects.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {projects.slice(0, 2).map((p) => (
                      <div key={p.id} className="p-1.5 rounded bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-[#22354F] flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">{p.title}</span>
                        <span className="text-slate-500 text-[9px]">{p.tags?.slice(0, 1).join('')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── HIDDEN SECTION ────────────────────────────────────────────── */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">Hidden</h3>
              </div>

              {/* Education Card */}
              <div className="rounded-xl bg-white/70 dark:bg-[#111C2C]/70 border border-slate-200 dark:border-[#22354F]/70 p-3 space-y-1 shadow-xs transition-colors opacity-90">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-[#22354F]/60 pb-1.5">
                  <span className="tracking-wide">Education</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSectionVisibility('education')}
                      title={isSectionVisible('education') ? "Hide Education" : "Show Education"}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
                    >
                      {isSectionVisible('education') ? <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Academic credentials</p>
              </div>

              {/* Social Links Card */}
              <div className="rounded-xl bg-white/70 dark:bg-[#111C2C]/70 border border-slate-200 dark:border-[#22354F]/70 p-3 space-y-1 shadow-xs transition-colors opacity-90">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-[#22354F]/60 pb-1.5">
                  <span className="tracking-wide">Social Links</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSectionVisibility('socialLinks')}
                      title={isSectionVisible('socialLinks') ? "Hide Social Links" : "Show Social Links"}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
                    >
                      {isSectionVisible('socialLinks') ? <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    <Link2 className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">External web profiles</p>
              </div>
            </div>

            <div className="h-12" /> {/* Bottom clearance */}
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* LAYER 2: RIGHT FROSTED GLASS DRAWER (14 Section Toggle List)       */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div 
            className="h-full overflow-y-auto overflow-x-hidden bg-slate-100/95 dark:bg-[#0A1322]/95 backdrop-blur-xl border-l border-slate-200 dark:border-[#2B4060]/70 p-2.5 space-y-1.5 scrollbar-none overscroll-contain transition-colors"
            style={{ width: `${100 - sliderPos}%` }}
          >
            {PDF_DRAWER_SECTIONS.map((sec) => {
              const isVis = isSectionVisible(sec.key);
              const IconComponent = sec.icon;
              const isSelected = selectedDrawerSection === sec.key;

              return (
                <div
                  key={sec.key}
                  onClick={() => {
                    setSelectedDrawerSection(sec.key);
                    setActiveSection(sec.key);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#152338] border-slate-300 dark:border-slate-500 shadow-xs'
                      : 'bg-white/60 hover:bg-white dark:bg-[#0E1B2D]/80 dark:hover:bg-[#132238] border-slate-200 dark:border-[#223754]/80'
                  }`}
                >
                  {/* Left: Icon & Label */}
                  <div className="flex items-center gap-2 min-w-0">
                    <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="text-[11px] font-semibold text-slate-900 dark:text-white truncate">
                      {sec.label}
                    </span>
                  </div>

                  {/* Right: Eye/EyeOff Toggle Switch & Chevron / Edit Pencil */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {sec.hasToggle ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSectionVisibility(sec.key);
                        }}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isVis ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/10'
                        }`}
                        title={isVis ? 'Hide section' : 'Show section'}
                      >
                        {isVis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                    ) : sec.isEdit ? (
                      <span className="p-0.5 text-slate-400">
                        <Pencil className="w-3 h-3" />
                      </span>
                    ) : null}

                    {sec.hasArrow && (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}

            <div className="h-12" /> {/* Bottom clearance */}
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* SLIDER BAR HANDLE & VERTICAL DIVIDER LINE                           */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{ left: `${sliderPos}%` }}
            className="absolute top-0 bottom-0 -ml-2.5 w-5 flex flex-col items-center justify-center z-30 cursor-ew-resize group select-none touch-none"
          >
            {/* Minimalist vertical line */}
            <div className="w-[2px] h-full bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-500 transition-all" />
            
            {/* Minimalist Circular Drag Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-500 flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-transform">
              <Columns className="w-3 h-3 text-slate-600 dark:text-slate-300" />
            </div>
          </div>

        </div>

        {/* ===================================================================== */}
        {/* BOTTOM ACTION BAR: SAVE (LEFT) & NEXT (RIGHT)                         */}
        {/* ===================================================================== */}
        <div className="relative z-40 w-full bg-white/95 dark:bg-[#080E1A]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1F334F] py-2.5 px-4 flex items-center justify-between gap-3 shrink-0 transition-colors">
          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveTrigger}
            disabled={isSaving}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => {
              if (onNext) {
                onNext();
              } else {
                setSliderPos(prev => (prev < 40 ? 80 : prev > 60 ? 50 : 25));
                showToast?.('Switched view perspective');
              }
            }}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
