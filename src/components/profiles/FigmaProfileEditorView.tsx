'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Pencil,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Code,
  FolderGit2,
  GraduationCap,
  Briefcase,
  Share2,
  Lock,
  Settings,
  Sparkles,
  SlidersHorizontal,
  Smartphone,
  Archive,
  Shield,
  Layers,
  Globe,
  Loader2,
  Copy,
  ArrowLeft,
  X,
  PlusCircle,
  Home,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { useProfileEditor, DraggableLinkItem } from '@/context/ProfileEditorContext';
import { ProjectItem, ExperienceItem, EducationItem, CustomFieldItem } from '@/types/profile';
import { GithubIcon, LinkedInIcon, TwitterIcon, WhatsAppIcon } from '@/components/BrandIcons';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { PhonePreview } from '@/components/PhonePreview';

export function FigmaProfileEditorView() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    profile,
    firstName, setFirstName,
    secondName, setSecondName,
    username, setUsername,
    professionalTitle, setProfessionalTitle,
    bio, setBio,
    company, setCompany,
    location, setLocation,
    avatar, setAvatar,
    coverImage, setCoverImage,
    skills, setSkills,
    about, setAbout,
    projects, setProjects,
    experiences, setExperiences,
    education, setEducation,
    socialLinks, setSocialLinks,
    customFields, setCustomFields,
    sectionVisibility, setSectionVisibility,
    sharingSettings, setSharingSettings,
    isUploadingAvatar,
    isUploadingCover,
    isSaving,
    statusMessage,
    fullName,
    currentActiveIdentifier,
    publicProfileUrl,
    handleAvatarUpload,
    handleCoverUpload,
    handleAddLinkItem,
    handleUpdateLink,
    handleDeleteLink,
    handleToggleSectionVisibility,
    toggleVisibilityField,
    handleSaveChanges,
    liveProfile,
    isConfirmed,
    setIsConfirmed
  } = useProfileEditor();

  // Mobile View Tab Switcher: 'editor' | 'sections' | 'preview'
  const [mobileTab, setMobileTab] = useState<'editor' | 'sections' | 'preview'>('editor');

  // Contact inputs local state
  const [emailInput, setEmailInput] = useState(profile.email || '');
  const [phoneInput, setPhoneInput] = useState(profile.phone || '');
  const [bookingUrlInput, setBookingUrlInput] = useState(profile.bookingUrl || '');

  // Skill Search and Add
  const [skillSearch, setSkillSearch] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Password / Security state
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Accordion open states for section rows on the right
  const [expandedRightSection, setExpandedRightSection] = useState<string | null>('personal');

  // Modals for adding/editing items
  const [activeModal, setActiveModal] = useState<'project' | 'education' | 'experience' | 'customField' | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tags: '', link: '', image: '' });
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);
  const [educationForm, setEducationForm] = useState({ institution: '', degree: '', year: '', description: '' });
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [experienceForm, setExperienceForm] = useState({ company: '', role: '', period: '', location: '', description: '' });
  const [customFieldForm, setCustomFieldForm] = useState({ label: '', value: '', type: 'text' as const });

  // Filter skills based on search
  const filteredSkills = useMemo(() => {
    if (!skillSearch.trim()) return skills;
    return skills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()));
  }, [skills, skillSearch]);

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills(prev => [...prev, trimmed]);
    setCustomSkillInput('');
    setIsAddingSkill(false);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const toggleRightSection = (key: string) => {
    setExpandedRightSection(prev => (prev === key ? null : key));
  };

  // ── Project Handlers ──────────────────────────────────────────────────────
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({ title: '', description: '', tags: '', link: '', image: '' });
    setActiveModal('project');
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;
    const tagsArray = projectForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? {
        ...p,
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        tags: tagsArray,
        link: projectForm.link.trim(),
        image: projectForm.image.trim() || p.image
      } : p));
    } else {
      setProjects(prev => [
        {
          id: `proj-${Date.now()}`,
          title: projectForm.title.trim(),
          description: projectForm.description.trim(),
          tags: tagsArray,
          link: projectForm.link.trim(),
          image: projectForm.image.trim() || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop'
        },
        ...prev
      ]);
    }
    setActiveModal(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // ── Education Handlers ────────────────────────────────────────────────────
  const handleOpenAddEducation = () => {
    setEditingEducation(null);
    setEducationForm({ institution: '', degree: '', year: '', description: '' });
    setActiveModal('education');
  };

  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!educationForm.institution.trim()) return;
    if (editingEducation) {
      setEducation(prev => prev.map(ed => ed.id === editingEducation.id ? {
        ...ed,
        institution: educationForm.institution.trim(),
        degree: educationForm.degree.trim(),
        year: educationForm.year.trim(),
        description: educationForm.description.trim()
      } : ed));
    } else {
      setEducation(prev => [
        {
          id: `edu-${Date.now()}`,
          institution: educationForm.institution.trim(),
          degree: educationForm.degree.trim(),
          year: educationForm.year.trim(),
          description: educationForm.description.trim()
        },
        ...prev
      ]);
    }
    setActiveModal(null);
  };

  const handleDeleteEducation = (id: string) => {
    setEducation(prev => prev.filter(ed => ed.id !== id));
  };

  // ── Experience Handlers ───────────────────────────────────────────────────
  const handleOpenAddExperience = () => {
    setEditingExperience(null);
    setExperienceForm({ company: '', role: '', period: '', location: '', description: '' });
    setActiveModal('experience');
  };

  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!experienceForm.company.trim()) return;
    if (editingExperience) {
      setExperiences(prev => prev.map(exp => exp.id === editingExperience.id ? {
        ...exp,
        company: experienceForm.company.trim(),
        role: experienceForm.role.trim(),
        period: experienceForm.period.trim(),
        location: experienceForm.location.trim(),
        description: experienceForm.description.trim()
      } : exp));
    } else {
      setExperiences(prev => [
        {
          id: `exp-${Date.now()}`,
          company: experienceForm.company.trim(),
          role: experienceForm.role.trim(),
          period: experienceForm.period.trim(),
          location: experienceForm.location.trim(),
          description: experienceForm.description.trim()
        },
        ...prev
      ]);
    }
    setActiveModal(null);
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  // ── Custom Field Handlers ─────────────────────────────────────────────────
  const handleOpenAddCustomField = () => {
    setCustomFieldForm({ label: '', value: '', type: 'text' });
    setActiveModal('customField');
  };

  const handleSaveCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFieldForm.label.trim()) return;
    setCustomFields(prev => [
      ...prev,
      {
        id: `cf-${Date.now()}`,
        label: customFieldForm.label.trim(),
        value: customFieldForm.value.trim(),
        type: customFieldForm.type,
        visible: true,
        order: prev.length
      }
    ]);
    setActiveModal(null);
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(cf => cf.id !== id));
  };

  // Check email and phone from profile/customContacts
  const userEmail = profile.email || 'enter your email';
  const userPhone = profile.phone || 'entre your phone number';

  return (
    <div className="w-full min-h-screen figma-editor-bg text-slate-100 font-sans pb-16">
      
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/30'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/30'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Mobile View Segmented Switcher */}
      <div className="lg:hidden sticky top-0 z-30 px-4 py-2.5 bg-[#0B131E]/90 backdrop-blur-md border-b border-[#23354C]/60 flex items-center justify-between gap-2">
        <Link
          href={`/profile/${currentActiveIdentifier}`}
          className="p-2 rounded-xl bg-[#131F2E] border border-[#23354C] text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Profile</span>
        </Link>
        <div className="flex items-center bg-[#0E1724] p-1 rounded-xl border border-[#23354C]">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mobileTab === 'editor'
                ? 'bg-[#131F2E] text-white shadow-xs border border-[#23354C]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('sections')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mobileTab === 'sections'
                ? 'bg-[#131F2E] text-white shadow-xs border border-[#23354C]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sections
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mobileTab === 'preview'
                ? 'bg-[#131F2E] text-white shadow-xs border border-[#23354C]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Preview
          </button>
        </div>
        <Link
          href={`/profile/${currentActiveIdentifier}`}
          target="_blank"
          className="p-2 rounded-xl bg-[#131F2E] border border-[#23354C] text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs font-semibold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Dual-Column Canvas Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* Top Header Banner + User Info Profile Preview Bar */}
        <div className="relative rounded-3xl overflow-hidden bg-[#131F2E] border border-[#23354C] mb-8 shadow-2xl">
          {/* Mountain Cover Image Banner */}
          <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-[#0A1118]">
            <img
              src={coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'}
              alt="Profile Banner"
              className="w-full h-full object-cover opacity-90"
            />
            {/* Moody gradient overlay matching Figma */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#131F2E] via-[#0B131E]/40 to-black/30" />

            {/* Edit Cover Action Button (Top-Left Pencil / Camera Icon) */}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white transition-all shadow-lg cursor-pointer"
              title="Change cover banner"
            >
              {isUploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Pencil className="w-4 h-4 text-white" />
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
            />

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Link
                href={`/profile/${currentActiveIdentifier}`}
                target="_blank"
                className="px-3.5 py-1.5 rounded-xl bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg transition-all"
              >
                <span>View Public</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </Link>
            </div>
          </div>

          {/* Centered Avatar and User Header Info */}
          <div className="relative px-6 pb-6 pt-0 -mt-16 flex flex-col items-center text-center">
            {/* Avatar with Camera/Pencil Edit Trigger */}
            <div className="relative w-28 h-28 rounded-full border-4 border-[#131F2E] shadow-2xl overflow-hidden bg-[#0E1724] group">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                alt={fullName || 'Aleena Nawab'}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change profile avatar"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
              />
            </div>

            {/* Name & Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-3 tracking-tight">
              {fullName || 'Aleena Nawab'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium max-w-md truncate">
              {professionalTitle || 'Full Stack Engineer'}
            </p>

            {/* Small Quick Skill Chips Under Header */}
            {skills.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 max-w-xl">
                {skills.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0E1724] border border-[#23354C] text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP 2-COLUMN / MOBILE TABBED LAYOUT                                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================================= */}
          {/* LEFT COLUMN: THE VISIBLE & HIDDEN FORM EDITOR                           */}
          {/* ======================================================================= */}
          <div className={`lg:col-span-6 space-y-6 ${mobileTab !== 'editor' ? 'hidden lg:block' : 'block'}`}>
            
            {/* ── Group: VISIBLE SECTIONS ────────────────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-4 flex items-center gap-2">
                <span>Visible</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  Live on Card
                </span>
              </h2>

              <div className="space-y-4">
                
                {/* 1. Profile (Name & Bio) Card */}
                <div className="figma-slate-card p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#23354C]/60 pb-2">
                    <span className="tracking-wide">Profile</span>
                    <User className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400">Name</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="figma-slate-input w-full px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        value={secondName}
                        onChange={(e) => setSecondName(e.target.value)}
                        placeholder="Last Name"
                        className="figma-slate-input w-full px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400">Bio</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Full Stack Engineer | Product Enthusiast"
                      className="figma-slate-input w-full px-3 py-2 text-xs resize-none"
                    />
                  </div>
                </div>

                {/* 2. Personal Details (Email & Phone) Card */}
                <div className="figma-slate-card p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#23354C]/60 pb-2">
                    <span className="tracking-wide">Personal Details</span>
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400">Email</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="enter your email"
                      className="figma-slate-input w-full px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="entre your phone number"
                      className="figma-slate-input w-full px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* 3. Skills Card (Search & Interactive Chips) */}
                <div className="figma-slate-card p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#23354C]/60 pb-2">
                    <span className="tracking-wide">Skills</span>
                    <Code className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-400">Add Skills</label>
                      <button
                        type="button"
                        onClick={() => setIsAddingSkill(!isAddingSkill)}
                        className="text-[11px] font-bold text-[#38BDF8] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Custom</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search for your skills here"
                      className="figma-slate-input w-full px-3 py-2 text-xs"
                    />

                    {isAddingSkill && (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={customSkillInput}
                          onChange={(e) => setCustomSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill(customSkillInput);
                            }
                          }}
                          placeholder="Type new skill & press enter..."
                          className="figma-slate-input flex-1 px-3 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSkill(customSkillInput)}
                          className="px-3 py-1.5 bg-[#16273C] border border-[#2C4566] text-xs font-bold rounded-xl text-white hover:bg-[#1F3652]"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Skill Chips matching Figma list */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {filteredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="figma-slate-tag px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 group cursor-default"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={`Remove ${skill}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {/* Quick suggested chips if not added */}
                    {['Supabase', 'NodeJs', 'ExpressJs', 'TypeScript', 'NextJs'].map(suggested => {
                      if (skills.includes(suggested)) return null;
                      return (
                        <button
                          key={suggested}
                          type="button"
                          onClick={() => handleAddSkill(suggested)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-dashed border-[#23354C] text-slate-500 hover:text-[#38BDF8] hover:border-[#38BDF8] transition-colors"
                        >
                          + {suggested}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setIsAddingSkill(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#16273C] border border-[#2C4566] text-xs font-bold text-[#38BDF8] hover:bg-[#1F3652] transition-colors"
                    >
                      Add +
                    </button>
                  </div>
                </div>

                {/* 4. Projects Card */}
                <div className="figma-slate-card p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#23354C]/60 pb-2">
                    <span className="tracking-wide">Projects</span>
                    <button
                      type="button"
                      onClick={handleOpenAddProject}
                      className="text-[11px] font-bold text-[#38BDF8] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {projects.length > 0 ? (
                    <div className="space-y-2">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="figma-slate-card-nested p-3 flex items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{proj.title}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{proj.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProject(proj);
                                setProjectForm({
                                  title: proj.title,
                                  description: proj.description,
                                  tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : '',
                                  link: proj.link || proj.liveUrl || '',
                                  image: proj.image || proj.coverImage || ''
                                });
                                setActiveModal('project');
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Edit project"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={handleOpenAddProject}
                      className="p-4 rounded-xl border border-dashed border-[#23354C] text-center cursor-pointer hover:border-[#38BDF8] transition-colors"
                    >
                      <p className="text-xs text-slate-400">add your projects here</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* ── Group: HIDDEN SECTIONS ────────────────────────────────────────── */}
            <div className="pt-3">
              <h2 className="text-xl font-bold text-white tracking-tight mb-4 flex items-center gap-2">
                <span>Hidden</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Optional / Expandable
                </span>
              </h2>

              <div className="space-y-4">
                
                {/* 5. Education Card */}
                <div className="figma-slate-card p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#23354C]/60 pb-2">
                    <span className="tracking-wide">Education</span>
                    <button
                      type="button"
                      onClick={handleOpenAddEducation}
                      className="text-[11px] font-bold text-[#38BDF8] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Education</span>
                    </button>
                  </div>

                  {education.length > 0 ? (
                    <div className="space-y-2">
                      {education.map((edu) => (
                        <div
                          key={edu.id}
                          className="figma-slate-card-nested p-3 flex items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{edu.degree}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{edu.institution} {edu.year && `• ${edu.year}`}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEducation(edu);
                                setEducationForm({
                                  institution: edu.institution,
                                  degree: edu.degree,
                                  year: edu.year || '',
                                  description: edu.description || ''
                                });
                                setActiveModal('education');
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Edit education"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEducation(edu.id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
                              title="Delete education"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={handleOpenAddEducation}
                      className="p-4 rounded-xl border border-dashed border-[#23354C] text-center cursor-pointer hover:border-[#38BDF8] transition-colors"
                    >
                      <p className="text-xs text-slate-400">add your education details</p>
                    </div>
                  )}
                </div>

                {/* 6. Social Links Card */}
                <div className="figma-slate-card p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#23354C]/60 pb-2">
                    <span className="tracking-wide">Social Links</span>
                    <div className="flex items-center gap-1.5">
                      {(['linkedin', 'github', 'twitter', 'whatsapp'] as const).map(platform => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => handleAddLinkItem(platform)}
                          className="p-1 rounded-md bg-[#0E1724] border border-[#23354C] hover:border-[#38BDF8] text-slate-300 hover:text-white"
                          title={`Add ${platform}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {socialLinks.length > 0 ? (
                    <div className="space-y-2">
                      {socialLinks.map((link) => (
                        <div
                          key={link.id}
                          className="figma-slate-card-nested p-2.5 flex items-center gap-2"
                        >
                          <span className="text-xs font-semibold text-slate-300 w-16 truncate capitalize">
                            {link.platform}
                          </span>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                            placeholder={`https://${link.platform}.com/...`}
                            className="figma-slate-input flex-1 px-2.5 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateLink(link.id, { visible: !link.visible })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              link.visible
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-600/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {link.visible ? 'ON' : 'OFF'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={() => handleAddLinkItem('linkedin')}
                      className="p-4 rounded-xl border border-dashed border-[#23354C] text-center cursor-pointer hover:border-[#38BDF8] transition-colors"
                    >
                      <p className="text-xs text-slate-400">add your social links</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Confirmation Checkbox & Bottom Centered "Save" Button */}
            <div className="pt-4 flex flex-col items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded border-[#23354C] bg-[#0E1724] text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>I confirm that all profile information and updates are accurate.</span>
              </label>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="figma-slate-btn-save w-full sm:w-64 py-3.5 text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: INTERACTIVE SECTION LIST & VISIBILITY CONTROLLERS         */}
          {/* ======================================================================= */}
          <div className={`lg:col-span-6 space-y-3 ${mobileTab !== 'sections' ? 'hidden lg:block' : 'block'}`}>
            
            {/* 1. Profile Section */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('profile')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Profile</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility('hero')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      sectionVisibility['hero'] !== false ? 'bg-[#10B981]' : 'bg-[#1E2D40]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sectionVisibility['hero'] !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('profile')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'profile' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'profile' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Professional Designation</span>
                    <input
                      type="text"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="e.g. Senior Systems Architect"
                      className="figma-slate-input w-full px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Location / Headquarters</span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="figma-slate-input w-full px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Personal Details (Username, Password, LinkedIn) */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('personal')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Personal Details</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleRightSection('personal')}
                    className="p-1 rounded-lg hover:bg-[#0E1724] text-slate-400 hover:text-white transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable subfields matching Figma exact text */}
              {expandedRightSection === 'personal' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-3 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="figma-slate-input w-full px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-400">Password</label>
                      <button
                        type="button"
                        onClick={() => setIsEditingPassword(!isEditingPassword)}
                        className="text-[10px] text-[#38BDF8] hover:underline"
                      >
                        {isEditingPassword ? 'Done' : 'Change'}
                      </button>
                    </div>
                    <input
                      type={isEditingPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="enter your password"
                      className="figma-slate-input w-full px-3 py-2 text-xs"
                      readOnly={!isEditingPassword}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">LinkedIn</label>
                    <input
                      type="url"
                      value={socialLinks.find(s => s.platform === 'linkedin')?.url || ''}
                      onChange={(e) => {
                        const existing = socialLinks.find(s => s.platform === 'linkedin');
                        if (existing) {
                          handleUpdateLink(existing.id, { url: e.target.value });
                        } else {
                          handleAddLinkItem('linkedin');
                        }
                      }}
                      placeholder="entre your LinkedIn"
                      className="figma-slate-input w-full px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Skills Section */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('skills')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Code className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Skills</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility('skills')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      sectionVisibility['skills'] !== false ? 'bg-[#10B981]' : 'bg-[#1E2D40]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sectionVisibility['skills'] !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('skills')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'skills' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'skills' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 flex flex-wrap gap-1.5 text-xs">
                  {skills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-[#0E1724] border border-[#23354C] text-slate-300 text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMobileTab('editor')}
                    className="px-2.5 py-1 rounded-lg bg-[#16273C] text-[#38BDF8] text-[11px] font-bold"
                  >
                    Edit in Panel →
                  </button>
                </div>
              )}
            </div>

            {/* 4. Projects Section */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('projects')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Projects</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility('projects')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      sectionVisibility['projects'] !== false ? 'bg-[#10B981]' : 'bg-[#1E2D40]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sectionVisibility['projects'] !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('projects')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'projects' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'projects' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400">{projects.length} Projects Configured</p>
                  <button
                    type="button"
                    onClick={handleOpenAddProject}
                    className="text-xs text-[#38BDF8] font-bold hover:underline"
                  >
                    + Add New Project
                  </button>
                </div>
              )}
            </div>

            {/* 5. Education Section */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('education')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Education</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility('education')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      sectionVisibility['education'] !== false ? 'bg-[#10B981]' : 'bg-[#1E2D40]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sectionVisibility['education'] !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('education')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'education' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'education' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400">{education.length} Education Credentials Configured</p>
                  <button
                    type="button"
                    onClick={handleOpenAddEducation}
                    className="text-xs text-[#38BDF8] font-bold hover:underline"
                  >
                    + Add Education Credential
                  </button>
                </div>
              )}
            </div>

            {/* 6. Contact Info Section */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('contact')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Contact Info</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility('contact')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      sectionVisibility['contact'] !== false ? 'bg-[#10B981]' : 'bg-[#1E2D40]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sectionVisibility['contact'] !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('contact')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'contact' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'contact' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Direct Booking / Calendar URL</span>
                    <input
                      type="url"
                      value={bookingUrlInput}
                      onChange={(e) => setBookingUrlInput(e.target.value)}
                      placeholder="https://cal.com/..."
                      className="figma-slate-input w-full px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 7. Social Links Section */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('socials')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Social Links</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleVisibilityField('socialLinks')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      sharingSettings.socialLinks !== false ? 'bg-[#10B981]' : 'bg-[#1E2D40]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sharingSettings.socialLinks !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('socials')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'socials' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'socials' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400">{socialLinks.length} Active Social Platforms</p>
                </div>
              )}
            </div>

            {/* 8. Experience Section */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('experience')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Experience</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility('experience')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      sectionVisibility['experience'] !== false ? 'bg-[#10B981]' : 'bg-[#1E2D40]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sectionVisibility['experience'] !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('experience')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'experience' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'experience' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-2 text-xs">
                  {experiences.map(exp => (
                    <div key={exp.id} className="figma-slate-card-nested p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{exp.role || 'Role'}</div>
                        <div className="text-[11px] text-slate-400">{exp.company}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleOpenAddExperience}
                    className="text-xs text-[#38BDF8] font-bold hover:underline"
                  >
                    + Add Work Experience
                  </button>
                </div>
              )}
            </div>

            {/* 9. Enhance Profile */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('enhance')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Enhance Profile</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleVisibilityField('customFields')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      sharingSettings.customFields !== false ? 'bg-[#10B981]' : 'bg-[#1E2D40]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sharingSettings.customFields !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('enhance')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'enhance' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'enhance' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">About / Full Bio</span>
                    <textarea
                      rows={3}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Extended story and detailed background..."
                      className="figma-slate-input w-full px-3 py-1.5 text-xs resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddCustomField}
                    className="text-xs text-[#38BDF8] font-bold hover:underline"
                  >
                    + Add Custom Field
                  </button>
                </div>
              )}
            </div>

            {/* 10. Limitations */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('limitations')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Limitations</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleRightSection('limitations')}
                    className="w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer bg-[#10B981]"
                  >
                    <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('limitations')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'limitations' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'limitations' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400">
                    Set granular privacy limits on which fields appear to anonymous visitors vs verified connections.
                  </p>
                </div>
              )}
            </div>

            {/* 11. Account info */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('account')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Account info</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleRightSection('account')}
                    className="w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer bg-[#10B981]"
                  >
                    <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('account')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'account' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedRightSection === 'account' && (
                <div className="mt-3 pt-3 border-t border-[#23354C]/60 space-y-1 text-xs">
                  <p className="text-[11px] text-slate-400">Profile Identifier: <span className="font-mono text-white">{currentActiveIdentifier}</span></p>
                </div>
              )}
            </div>

            {/* 12. Archive */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('archive')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Archive className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Archive</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleRightSection('archive')}
                    className="w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer bg-[#10B981]"
                  >
                    <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('archive')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'archive' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 13. Security */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('security')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Security</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleRightSection('security')}
                    className="w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer bg-[#10B981]"
                  >
                    <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('security')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'security' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 14. Settings */}
            <div className="figma-slate-card p-3.5 transition-all">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => toggleRightSection('settings')}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0E1724] border border-[#23354C] flex items-center justify-center text-slate-300">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Settings</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleRightSection('settings')}
                    className="w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer bg-[#10B981]"
                  >
                    <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRightSection('settings')}
                    className="text-slate-400 hover:text-white"
                  >
                    {expandedRightSection === 'settings' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Centered "Next" Button */}
            <div className="pt-4 flex justify-center">
              <Link
                href={`/profile/${currentActiveIdentifier}`}
                className="figma-slate-btn-next w-full sm:w-64 py-3.5 text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl text-center"
              >
                <span>Next</span>
              </Link>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* MOBILE PREVIEW TAB (ONLY SHOWN WHEN PREVIEW TAB IS ACTIVE ON MOBILE)   */}
          {/* ======================================================================= */}
          <div className={`lg:hidden col-span-12 ${mobileTab === 'preview' ? 'block' : 'hidden'}`}>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl overflow-hidden shadow-2xl border border-[#23354C]">
                <AvtiveDigitalCard
                  profile={liveProfile}
                  canEdit={true}
                  isEditing={false}
                  isConnected={false}
                  onOpenEdit={() => setMobileTab('editor')}
                  onCancelEdit={() => {}}
                  onSaveEdits={async () => { await handleSaveChanges(); }}
                  onSaveContact={() => {}}
                  onOpenShare={() => {}}
                  onOpenConnect={() => {}}
                  onOpenQRModal={() => {}}
                  onOpenResumeModal={() => {}}
                  onSelectProject={() => {}}
                  onSelectTeamMember={() => {}}
                  onViewCompany={() => {}}
                  isDark={true}
                  viewMode="standard"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT MODALS FOR COMPLETE DATA PRESERVATION                          */}
      {/* ========================================================================= */}

      {/* Project Modal */}
      <AnimatePresence>
        {activeModal === 'project' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md figma-slate-card p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#23354C] pb-3">
                <h3 className="text-base font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Add Project'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Title</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Project Name"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Description</label>
                  <textarea
                    rows={2}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief summary of the project..."
                    className="figma-slate-input w-full px-3 py-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={projectForm.tags}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="React, Next.js, TypeScript"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Live URL / Link</label>
                  <input
                    type="url"
                    value={projectForm.link}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://..."
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0E1724] border border-[#23354C] text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#16273C] border border-[#2C4566] text-white hover:bg-[#1F3652]"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education Modal */}
      <AnimatePresence>
        {activeModal === 'education' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md figma-slate-card p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#23354C] pb-3">
                <h3 className="text-base font-bold text-white">
                  {editingEducation ? 'Edit Education' : 'Add Education'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEducation} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Institution / University</label>
                  <input
                    type="text"
                    required
                    value={educationForm.institution}
                    onChange={(e) => setEducationForm(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="e.g. Stanford University"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Degree / Qualification</label>
                  <input
                    type="text"
                    required
                    value={educationForm.degree}
                    onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="e.g. B.S. in Computer Science"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Year / Period</label>
                  <input
                    type="text"
                    value={educationForm.year}
                    onChange={(e) => setEducationForm(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g. 2020 - 2024"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0E1724] border border-[#23354C] text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#16273C] border border-[#2C4566] text-white hover:bg-[#1F3652]"
                  >
                    Save Education
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Experience Modal */}
      <AnimatePresence>
        {activeModal === 'experience' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md figma-slate-card p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#23354C] pb-3">
                <h3 className="text-base font-bold text-white">
                  {editingExperience ? 'Edit Work Experience' : 'Add Work Experience'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveExperience} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Company / Organization</label>
                  <input
                    type="text"
                    required
                    value={experienceForm.company}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Acme Corp"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Role / Position</label>
                  <input
                    type="text"
                    required
                    value={experienceForm.role}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Senior Software Engineer"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Period</label>
                  <input
                    type="text"
                    value={experienceForm.period}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, period: e.target.value }))}
                    placeholder="e.g. 2022 - Present"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0E1724] border border-[#23354C] text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#16273C] border border-[#2C4566] text-white hover:bg-[#1F3652]"
                  >
                    Save Experience
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Field Modal */}
      <AnimatePresence>
        {activeModal === 'customField' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md figma-slate-card p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#23354C] pb-3">
                <h3 className="text-base font-bold text-white">Add Custom Field</h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomField} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Label</label>
                  <input
                    type="text"
                    required
                    value={customFieldForm.label}
                    onChange={(e) => setCustomFieldForm(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. Portfolio PDF, Discord ID"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Value</label>
                  <input
                    type="text"
                    required
                    value={customFieldForm.value}
                    onChange={(e) => setCustomFieldForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="e.g. username#1234 or URL"
                    className="figma-slate-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0E1724] border border-[#23354C] text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#16273C] border border-[#2C4566] text-white hover:bg-[#1F3652]"
                  >
                    Add Field
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
