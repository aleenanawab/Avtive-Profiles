'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Shield,
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
  Columns,
  Layers,
  Globe,
  MapPin,
  Calendar,
  Lock,
  Tag,
  Sun,
  Moon,
  Upload,
  CheckCircle2,
  RotateCcw,
  Save,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useProfileEditor } from '@/context/ProfileEditorContext';
import { usePortfolioTheme } from '@/context/ThemeContext';
import { 
  ProjectItem, 
  ExperienceItem, 
  EducationItem, 
  CustomFieldItem,
  ProfileTheme,
  SocialLink
} from '@/types/profile';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { LinkedInIcon, GithubIcon, TwitterIcon, WhatsAppIcon } from '@/components/BrandIcons';

export interface MobileSliderProfileViewProps {
  onSave?: () => Promise<void>;
  onNext?: () => void;
  className?: string;
}

export function MobileSliderProfileView({ onSave, onNext, className = '' }: MobileSliderProfileViewProps) {
  const {
    profile,
    liveProfile,
    firstName, setFirstName,
    secondName, setSecondName,
    username, setUsername,
    professionalTitle, setProfessionalTitle,
    bio, setBio,
    about, setAbout,
    location, setLocation,
    avatar, setAvatar,
    coverImage, setCoverImage,
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
    saveProfile,
    showToast,
    activeSection,
    setActiveSection,
    activeTheme,
    setActiveTheme,
    sharingSettings,
    toggleVisibilityField,
    updateField,
    handleAvatarUpload,
    handleCoverUpload,
    isUploadingAvatar,
    isUploadingCover
  } = useProfileEditor();

  const { isDark, toggleDarkMode } = usePortfolioTheme();

  // Mode: 'split' (slider), 'form' (full editor), 'drawer' (sections drawer), 'card' (live card preview)
  const [viewMode, setViewMode] = useState<'split' | 'form' | 'drawer' | 'card'>('form');

  // Slider position for split mode (percentage 0 to 100)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hidden file input refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Skills input state
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isAddingNewSkill, setIsAddingNewSkill] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Add Project sub-form state
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', tags: '', link: '', image: '' });

  // Add Experience sub-form state
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({ role: '', company: '', period: '', location: '', description: '' });

  // Add Education sub-form state
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', period: '', description: '' });

  // Add Custom Field sub-form state
  const [isAddingCustomField, setIsAddingCustomField] = useState(false);
  const [newCustomField, setNewCustomField] = useState<{ label: string; value: string; type: 'text' | 'link' | 'markdown' }>({
    label: '',
    value: '',
    type: 'text'
  });

  // 14 sections matching DESKTOP_SIDEBAR_SECTIONS exactly in order and keys
  const DRAWER_SECTIONS = [
    { key: 'profile', label: 'Profile & Identity', icon: User, hasToggle: true },
    { key: 'personalDetails', label: 'Personal Details', icon: FileText, hasToggle: true },
    { key: 'skills', label: 'Skills & Tech Stack', icon: Code, hasToggle: true },
    { key: 'projects', label: 'Projects & Portfolio', icon: FolderGit2, hasToggle: true },
    { key: 'education', label: 'Education & Degrees', icon: GraduationCap, hasToggle: true },
    { key: 'contactInfo', label: 'Contact Info', icon: Phone, hasToggle: true },
    { key: 'socialLinks', label: 'Social Links & Media', icon: Link2, hasToggle: true },
    { key: 'experience', label: 'Work Experience', icon: Briefcase, hasToggle: true },
    { key: 'enhanceProfile', label: 'Enhance Profile', icon: Sparkles, hasToggle: true },
    { key: 'limitations', label: 'Limitations', icon: EyeOff, hasToggle: false },
    { key: 'accountInfo', label: 'Account Info', icon: UserCheck, hasToggle: false },
    { key: 'archive', label: 'Archive', icon: Archive, hasToggle: false },
    { key: 'security', label: 'Security', icon: ShieldCheck, hasToggle: false },
    { key: 'settings', label: 'Settings', icon: Settings, hasToggle: false },
  ];

  // Dragging handler for slider bar
  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(15, Math.min(85, (x / rect.width) * 100));
      setSliderPos(percent);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percent = Math.max(15, Math.min(85, (x / rect.width) * 100));
      setSliderPos(percent);
    };

    const handleMouseUp = () => setIsDragging(false);

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

  // Unified Save Trigger
  const handleSaveTrigger = async () => {
    try {
      if (onSave) {
        await onSave();
      } else {
        await saveProfile();
      }
      showToast?.('✓ Profile saved successfully!');
    } catch {
      await saveProfile();
    }
  };

  const handleNextTrigger = async () => {
    try {
      await handleSaveTrigger();
    } catch (e) {
      console.error(e);
    }
    if (onNext) {
      onNext();
    } else {
      const currentIndex = DRAWER_SECTIONS.findIndex(s => s.key === activeSection);
      const nextIndex = (currentIndex + 1) % DRAWER_SECTIONS.length;
      setActiveSection(DRAWER_SECTIONS[nextIndex].key);
      setViewMode('form');
    }
  };

  // Skill Handlers
  const handleAddSkillTag = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const currentSkills = Array.isArray(skills) ? skills : [];
    if (!currentSkills.includes(trimmed)) {
      const updated = [...currentSkills, trimmed];
      setSkills(updated);
      updateField('skills', updated);
      showToast?.(`Added skill: ${trimmed}`);
    }
    setNewSkillInput('');
    setIsAddingNewSkill(false);
  };

  const handleRemoveSkillTag = (skillName: string) => {
    const currentSkills = Array.isArray(skills) ? skills : [];
    const updated = currentSkills.filter(s => s !== skillName);
    setSkills(updated);
    updateField('skills', updated);
    showToast?.(`Removed skill: ${skillName}`);
  };

  // Project Handlers
  const handleSaveProject = () => {
    if (!newProject.title.trim()) {
      showToast?.('Project title is required.');
      return;
    }
    const tagsArr = newProject.tags ? newProject.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const item: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      tags: tagsArr,
      technology: tagsArr.join(', '),
      link: newProject.link.trim() || undefined,
      liveUrl: newProject.link.trim() || undefined,
      image: newProject.image.trim() || undefined,
      coverImage: newProject.image.trim() || undefined
    };
    const updated = [item, ...(Array.isArray(projects) ? projects : [])];
    setProjects(updated);
    updateField('projects', updated);
    setNewProject({ title: '', description: '', tags: '', link: '', image: '' });
    setIsAddingProject(false);
    showToast?.('✓ Project added with Supabase storage sync!');
  };

  const handleDeleteProject = (id: string) => {
    const current = Array.isArray(projects) ? projects : [];
    const updated = current.filter(p => p.id !== id);
    setProjects(updated);
    updateField('projects', updated);
    showToast?.('Project removed.');
  };

  // Experience Handlers
  const handleSaveExperience = () => {
    if (!newExperience.role.trim() || !newExperience.company.trim()) {
      showToast?.('Role and Company are required.');
      return;
    }
    const item: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: newExperience.role.trim(),
      company: newExperience.company.trim(),
      period: newExperience.period.trim() || undefined,
      location: newExperience.location.trim() || undefined,
      description: newExperience.description.trim() || undefined
    };
    const updated = [item, ...(Array.isArray(experiences) ? experiences : [])];
    setExperiences(updated);
    updateField('experiences', updated);
    updateField('experience', updated);
    setNewExperience({ role: '', company: '', period: '', location: '', description: '' });
    setIsAddingExperience(false);
    showToast?.('✓ Experience added!');
  };

  const handleDeleteExperience = (id: string) => {
    const current = Array.isArray(experiences) ? experiences : [];
    const updated = current.filter(e => e.id !== id);
    setExperiences(updated);
    updateField('experiences', updated);
    updateField('experience', updated);
    showToast?.('Experience record removed.');
  };

  // Education Handlers
  const handleSaveEducation = () => {
    if (!newEducation.degree.trim() || !newEducation.institution.trim()) {
      showToast?.('Degree and Institution are required.');
      return;
    }
    const item: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: newEducation.degree.trim(),
      institution: newEducation.institution.trim(),
      period: newEducation.period.trim() || undefined,
      description: newEducation.description.trim() || undefined
    };
    const updated = [item, ...(Array.isArray(education) ? education : [])];
    setEducation(updated);
    updateField('education', updated);
    setNewEducation({ degree: '', institution: '', period: '', description: '' });
    setIsAddingEducation(false);
    showToast?.('✓ Education record added!');
  };

  const handleDeleteEducation = (id: string) => {
    const current = Array.isArray(education) ? education : [];
    const updated = current.filter(e => e.id !== id);
    setEducation(updated);
    updateField('education', updated);
    showToast?.('Education record removed.');
  };

  // Custom Field Handlers
  const handleSaveCustomField = () => {
    if (!newCustomField.label.trim() || !newCustomField.value.trim()) {
      showToast?.('Field label and content are required.');
      return;
    }
    const item: CustomFieldItem = {
      id: `cf-${Date.now()}`,
      label: newCustomField.label.trim(),
      value: newCustomField.value.trim(),
      type: newCustomField.type,
      visible: true
    };
    const updated = [...(Array.isArray(customFields) ? customFields : []), item];
    setCustomFields(updated);
    updateField('customFields', updated);
    setNewCustomField({ label: '', value: '', type: 'text' });
    setIsAddingCustomField(false);
    showToast?.('✓ Custom field added!');
  };

  const handleToggleCustomField = (id: string) => {
    const current = Array.isArray(customFields) ? customFields : [];
    const updated = current.map(f => f.id === id ? { ...f, visible: f.visible === false ? true : false } : f);
    setCustomFields(updated);
    updateField('customFields', updated);
  };

  const handleDeleteCustomField = (id: string) => {
    const current = Array.isArray(customFields) ? customFields : [];
    const updated = current.filter(f => f.id !== id);
    setCustomFields(updated);
    updateField('customFields', updated);
    showToast?.('Custom field removed.');
  };

  // Social Links Handler
  const updateSocialUrl = (platform: string, url: string) => {
    const current = Array.isArray(socialLinks) ? socialLinks : [];
    const index = current.findIndex(l => l.platform === platform);
    if (index >= 0) {
      const copy = [...current];
      copy[index] = { ...copy[index], url };
      setSocialLinks(copy);
      updateField('socialLinks', copy as any);
      updateField('socials', copy as any);
    } else {
      const updated = [...current, { id: `link-${platform}-${Date.now()}`, platform: platform as any, title: platform.charAt(0).toUpperCase() + platform.slice(1), url, visible: true }];
      setSocialLinks(updated);
      updateField('socialLinks', updated as any);
      updateField('socials', updated as any);
    }
  };

  const getSocialUrl = (platform: string) => {
    const current = Array.isArray(socialLinks) ? socialLinks : [];
    const found = current.find(l => l.platform === platform);
    return found ? found.url : '';
  };

  const isSocialVisible = (platform: string) => {
    const current = Array.isArray(socialLinks) ? socialLinks : [];
    const found = current.find(l => l.platform === platform);
    return found ? found.visible !== false : true;
  };

  const toggleSocialVisibility = (platform: string) => {
    const current = Array.isArray(socialLinks) ? socialLinks : [];
    const index = current.findIndex(l => l.platform === platform);
    if (index >= 0) {
      const copy = [...current];
      copy[index] = { ...copy[index], visible: !copy[index].visible };
      setSocialLinks(copy);
      updateField('socialLinks', copy as any);
      updateField('socials', copy as any);
      showToast?.(`${platform} is now ${copy[index].visible ? 'Visible' : 'Hidden'}`);
    } else {
      const updated = [...current, { id: `link-${platform}-${Date.now()}`, platform: platform as any, title: platform.charAt(0).toUpperCase() + platform.slice(1), url: '', visible: false }];
      setSocialLinks(updated);
      updateField('socialLinks', updated as any);
      updateField('socials', updated as any);
      showToast?.(`${platform} is now Hidden`);
    }
  };

  // Toggle Sharing Settings
  const toggleSharingSetting = (key: keyof NonNullable<typeof profile.sharingSettings>) => {
    const current = profile.sharingSettings || {};
    const updated = {
      ...current,
      [key]: current[key] === false ? true : false
    };
    updateField('sharingSettings', updated);
  };

  // Toggle Section Visibility
  const toggleSectionVisibility = (key: string) => {
    const current = profile.sectionVisibility || {};
    const updated = {
      ...current,
      [key]: current[key] === false ? true : false
    };
    updateField('sectionVisibility', updated);
    showToast?.(`Section "${key}" is now ${updated[key] ? 'Visible' : 'Hidden'}`);
  };

  const isSectionVisible = (key: string): boolean => {
    if (profile.sectionVisibility && typeof profile.sectionVisibility[key] === 'boolean') {
      return profile.sectionVisibility[key];
    }
    return true;
  };

  const popularSkills = ['React', 'Next.js', 'TypeScript', 'Node.js', 'TailwindCSS', 'Python', 'UI/UX', 'Cloud', 'GraphQL', 'Figma', 'PostgreSQL', 'Docker'];

  // Helper Header for every section form inside Mobile Preview
  const renderSectionHeader = (title: string, secKey?: string, extraActions?: React.ReactNode) => {
    const isVis = secKey ? isSectionVisible(secKey) : true;
    return (
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10 gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {secKey && ['profile', 'personalDetails', 'skills', 'projects', 'education', 'contactInfo', 'socialLinks', 'experience', 'enhanceProfile'].includes(secKey) && (
            <button
              type="button"
              onClick={() => toggleSectionVisibility(secKey)}
              title={isVis ? "Section is visible (Click to hide)" : "Section is hidden (Click to show)"}
              className={`p-1 px-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                isVis
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 border-slate-200 dark:border-white/10'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
              }`}
            >
              {isVis ? <Eye className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> : <EyeOff className="w-3 h-3 text-amber-500" />}
              <span className="hidden xs:inline">{isVis ? 'Visible' : 'Hidden'}</span>
            </button>
          )}

          {extraActions}

          <button
            type="button"
            onClick={handleSaveTrigger}
            disabled={isSaving}
            className="p-1 px-2 rounded-lg text-[10px] font-bold bg-cyan-600 hover:bg-cyan-500 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 text-white flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
            title="Save changes"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            <span>Save</span>
          </button>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER ACTIVE SECTION FORM CONTENT (Synchronized 1:1 with Desktop Reference)
  // ──────────────────────────────────────────────────────────────────────────
  const renderActiveSectionForm = () => {
    switch (activeSection) {
      // 1. PROFILE & IDENTITY
      case 'profile':
        return (
          <div className="space-y-3">
            {renderSectionHeader('Profile & Identity', 'profile')}

            {/* Profile Photo & Cover Banner Upload Controls */}
            <div className="rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
              <div className="relative h-24 w-full bg-slate-200 dark:bg-slate-800">
                <img 
                  src={profile.coverImage || coverImage || ''} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[9px] font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1 cursor-pointer"
                  title="Change Cover Banner"
                >
                  {isUploadingCover ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Camera className="w-2.5 h-2.5 text-cyan-400" />}
                  <span>Change Cover</span>
                </button>
              </div>

              <div className="p-3 relative -mt-8 flex items-end justify-between gap-2">
                <div className="flex items-end gap-2.5">
                  <div className="relative w-14 h-14 rounded-full border-2 border-white dark:border-[#0E1526] overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-md shrink-0 group">
                    <img 
                      src={profile.avatar || avatar || ''} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Upload Photo"
                    >
                      {isUploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 text-cyan-400" />}
                    </button>
                  </div>

                  <div className="pb-0.5 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{profile.name || fullName}</h3>
                    <p className="text-[10px] text-cyan-600 dark:text-cyan-400 truncate">@{profile.username || username || profile.slug}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 cursor-pointer shrink-0"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-2.5 shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      updateField('firstName', e.target.value);
                      updateField('name', `${e.target.value} ${secondName}`.trim());
                    }}
                    placeholder="First Name"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                  <input
                    type="text"
                    value={secondName}
                    onChange={(e) => {
                      setSecondName(e.target.value);
                      updateField('secondName', e.target.value);
                      updateField('name', `${firstName} ${e.target.value}`.trim());
                    }}
                    placeholder="Last Name"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Username</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">@</span>
                  <input
                    type="text"
                    value={profile.username || username || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^@/, '');
                      setUsername(val);
                      updateField('username', val);
                      updateField('slug', val);
                    }}
                    placeholder="username"
                    className="w-full pl-6 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Professional Title</label>
                <input
                  type="text"
                  value={profile.professionalTitle || professionalTitle || ''}
                  onChange={(e) => {
                    setProfessionalTitle(e.target.value);
                    updateField('professionalTitle', e.target.value);
                    updateField('designation', e.target.value);
                  }}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Bio / Summary</label>
                <textarea
                  rows={2}
                  value={profile.bio || bio || ''}
                  onChange={(e) => {
                    setBio(e.target.value);
                    updateField('bio', e.target.value);
                    updateField('shortBio', e.target.value);
                  }}
                  placeholder="Brief summary..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">About Background</label>
                <textarea
                  rows={3}
                  value={profile.about || about || ''}
                  onChange={(e) => {
                    setAbout(e.target.value);
                    updateField('about', e.target.value);
                    updateField('fullBio', e.target.value);
                  }}
                  placeholder="Detailed background..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Location</label>
                <div className="relative">
                  <MapPin className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.location || location || ''}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      updateField('location', e.target.value);
                    }}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      // 2. PERSONAL DETAILS
      case 'personalDetails':
        return (
          <div className="space-y-3">
            {renderSectionHeader('Personal Details', 'personalDetails')}

            <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-2.5 shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName || firstName || ''}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      updateField('firstName', e.target.value);
                      updateField('name', `${e.target.value} ${secondName}`.trim());
                    }}
                    placeholder="e.g. Syed"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Last Name / Surname</label>
                  <input
                    type="text"
                    value={profile.secondName || profile.lastName || secondName || ''}
                    onChange={(e) => {
                      setSecondName(e.target.value);
                      updateField('secondName', e.target.value);
                      updateField('lastName', e.target.value);
                      updateField('name', `${firstName} ${e.target.value}`.trim());
                    }}
                    placeholder="e.g. Raza"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Pronouns</label>
                  <input
                    type="text"
                    value={profile.pronouns || ''}
                    onChange={(e) => updateField('pronouns', e.target.value)}
                    placeholder="e.g. He/Him, They/Them"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Birthdate</label>
                  <input
                    type="text"
                    value={profile.birthday || ''}
                    onChange={(e) => updateField('birthday', e.target.value)}
                    placeholder="e.g. September 18"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Direct Email</label>
                <div className="relative">
                  <Mail className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Direct Phone</label>
                <div className="relative">
                  <Phone className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Location</label>
                <div className="relative">
                  <MapPin className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.location || location || ''}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      updateField('location', e.target.value);
                    }}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Company / Organization</label>
                <div className="relative">
                  <Briefcase className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.company || ''}
                    onChange={(e) => updateField('company', e.target.value)}
                    placeholder="e.g. Avtive Inc."
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      // 3. SKILLS & TECH STACK
      case 'skills':
        return (
          <div className="space-y-3">
            {renderSectionHeader(
              `Skills & Tech Stack (${(Array.isArray(skills) ? skills : []).length})`,
              'skills',
              <button
                type="button"
                onClick={() => setIsAddingNewSkill(!isAddingNewSkill)}
                className="p-1 px-2 rounded-lg text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}

            {isAddingNewSkill && (
              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-500/30 space-y-2 animate-in fade-in">
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
                    placeholder="Skill name (e.g. Next.js)"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-cyan-500/50 text-slate-900 dark:text-white text-xs focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillTag(newSkillInput)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <input
              type="text"
              value={skillSearchQuery}
              onChange={(e) => setSkillSearchQuery(e.target.value)}
              placeholder="Filter active skills..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-400">Active Skills</label>
              <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 rounded-xl bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 transition-colors">
                {(!skills || skills.length === 0) ? (
                  <span className="text-[10px] text-slate-500 italic">No skills added yet. Tap suggestions below.</span>
                ) : (
                  skills
                    .filter(s => !skillSearchQuery || s.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                    .map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-cyan-50 dark:bg-[#142236] text-cyan-800 dark:text-cyan-200 border border-cyan-500/30"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillTag(s)}
                          className="text-slate-400 hover:text-rose-500 ml-0.5 cursor-pointer font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                )}
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-400">Popular Suggestions</label>
              <div className="flex flex-wrap gap-1.5">
                {popularSkills
                  .filter(s => !skills?.includes(s))
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkillTag(s)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
                      <span>{s}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );

      // 4. PROJECTS & PORTFOLIO
      case 'projects':
        return (
          <div className="space-y-3">
            {renderSectionHeader(
              `Projects & Portfolio (${(Array.isArray(projects) ? projects : []).length})`,
              'projects',
              <button
                type="button"
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="p-1 px-2 rounded-lg text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingProject ? 'Cancel' : 'New Project'}</span>
              </button>
            )}

            {isAddingProject && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0E1728] border border-cyan-500/40 space-y-2 shadow-lg animate-in fade-in">
                <div className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300">Add New Project</div>
                
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="Project Title"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <textarea
                  rows={2}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />

                <input
                  type="text"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  placeholder="Tags (e.g. Next.js, Stripe)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="url"
                  value={newProject.link}
                  onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  placeholder="Live URL / GitHub link"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newProject.image}
                    onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                    placeholder="Project Image (Supabase / URL)"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <label className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('bucket', 'profiles');
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (data.url) {
                            setNewProject(prev => ({ ...prev, image: data.url }));
                            showToast?.('✓ Project image uploaded to Supabase Storage!');
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProject}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            )}

            <div className="space-y-2">
              {(!projects || projects.length === 0) ? (
                <div className="p-4 rounded-xl bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No projects added yet. Click &quot;New Project&quot; above.
                </div>
              ) : (
                projects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-white/10 space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {(p.image || p.coverImage) ? (
                          <img
                            src={p.image || p.coverImage}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0 bg-slate-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                            <FolderGit2 className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.title}</div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">{p.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer shrink-0"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {p.tags?.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 truncate">
                            {t}
                          </span>
                        ))}
                      </div>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 shrink-0"
                        >
                          <span>Live</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // 5. EDUCATION & DEGREES
      case 'education':
        return (
          <div className="space-y-3">
            {renderSectionHeader(
              `Education & Degrees (${(Array.isArray(education) ? education : []).length})`,
              'education',
              <button
                type="button"
                onClick={() => setIsAddingEducation(!isAddingEducation)}
                className="p-1 px-2 rounded-lg text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingEducation ? 'Cancel' : 'New Degree'}</span>
              </button>
            )}

            {isAddingEducation && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0E1728] border border-cyan-500/40 space-y-2 shadow-lg animate-in fade-in">
                <div className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300">Add Academic Record</div>

                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  placeholder="Degree (e.g. BS in Computer Science)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  placeholder="Institution (e.g. Stanford University)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="text"
                  value={newEducation.period}
                  onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })}
                  placeholder="Graduation Year / Period (e.g. 2018 - 2022)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <textarea
                  rows={2}
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                  placeholder="Honors, coursework, thesis..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />

                <button
                  type="button"
                  onClick={handleSaveEducation}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Education
                </button>
              </div>
            )}

            <div className="space-y-2">
              {(!education || education.length === 0) ? (
                <div className="p-4 rounded-xl bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No education records yet. Tap &quot;New Degree&quot; above.
                </div>
              ) : (
                education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-white/10 space-y-1 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{edu.degree}</div>
                        <div className="text-[11px] text-cyan-600 dark:text-cyan-300">{edu.institution}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {edu.period && <div className="text-[10px] text-slate-500 dark:text-slate-400">{edu.period}</div>}
                    {edu.description && <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-0.5">{edu.description}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // 6. CONTACT INFO
      case 'contactInfo':
        return (
          <div className="space-y-3">
            {renderSectionHeader('Contact Information', 'contactInfo')}

            <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-2.5 shadow-xs">
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Business Email</label>
                <div className="relative">
                  <Mail className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Direct Telephone</label>
                <div className="relative">
                  <Phone className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">WhatsApp Number / Direct Chat</label>
                <div className="relative">
                  <WhatsAppIcon className="w-3 h-3 text-emerald-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.whatsapp || ''}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    placeholder="+15551234567"
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Primary Office Location</label>
                <div className="relative">
                  <MapPin className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.location || location || ''}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      updateField('location', e.target.value);
                    }}
                    placeholder="New York, NY"
                    className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      // 7. SOCIAL LINKS & MEDIA
      case 'socialLinks':
        return (
          <div className="space-y-3">
            {renderSectionHeader('Social Links & Handles', 'socialLinks')}

            <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-2.5 shadow-xs">
              {[
                { platform: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon, placeholder: 'https://linkedin.com/in/username' },
                { platform: 'github', label: 'GitHub', icon: GithubIcon, placeholder: 'https://github.com/username' },
                { platform: 'twitter', label: 'Twitter / X', icon: TwitterIcon, placeholder: 'https://x.com/username' },
                { platform: 'website', label: 'Personal Website', icon: Globe, placeholder: 'https://yourwebsite.com' }
              ].map((item) => {
                const Icon = item.icon;
                const isVis = isSocialVisible(item.platform);
                return (
                  <div key={item.platform} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        <span>{item.label}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSocialVisibility(item.platform)}
                        className={`p-0.5 px-1.5 rounded text-[9px] font-semibold border flex items-center gap-0.5 cursor-pointer ${
                          isVis ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500/30' : 'text-amber-500 border-amber-500/30'
                        }`}
                      >
                        {isVis ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        <span>{isVis ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                    <input
                      type="url"
                      value={getSocialUrl(item.platform)}
                      onChange={(e) => updateSocialUrl(item.platform, e.target.value)}
                      placeholder={item.placeholder}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );

      // 8. WORK EXPERIENCE
      case 'experience':
        return (
          <div className="space-y-3">
            {renderSectionHeader(
              `Work Experience (${(Array.isArray(experiences) ? experiences : []).length})`,
              'experience',
              <button
                type="button"
                onClick={() => setIsAddingExperience(!isAddingExperience)}
                className="p-1 px-2 rounded-lg text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingExperience ? 'Cancel' : 'New Role'}</span>
              </button>
            )}

            {isAddingExperience && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0E1728] border border-cyan-500/40 space-y-2 shadow-lg animate-in fade-in">
                <div className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300">Add Career Experience</div>

                <input
                  type="text"
                  value={newExperience.role}
                  onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                  placeholder="Job Role (e.g. Lead Frontend Architect)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  placeholder="Company Name (e.g. Google, Startup)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newExperience.period}
                    onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                    placeholder="Period (e.g. 2022 - Present)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={newExperience.location}
                    onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                    placeholder="Location (e.g. Remote)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <textarea
                  rows={2}
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  placeholder="Key responsibilities & accomplishments..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />

                <button
                  type="button"
                  onClick={handleSaveExperience}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Experience
                </button>
              </div>
            )}

            <div className="space-y-2">
              {(!experiences || experiences.length === 0) ? (
                <div className="p-4 rounded-xl bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No work experience added yet. Tap &quot;New Role&quot; above.
                </div>
              ) : (
                experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-white/10 space-y-1 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{exp.role}</div>
                        <div className="text-[11px] text-cyan-600 dark:text-cyan-300 font-medium">{exp.company}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      {exp.period && <span>{exp.period}</span>}
                      {exp.location && <span>&middot; {exp.location}</span>}
                    </div>

                    {exp.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-0.5">{exp.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // 9. ENHANCE PROFILE & CUSTOM FIELDS
      case 'enhanceProfile':
        return (
          <div className="space-y-3">
            {renderSectionHeader(
              `Custom Fields & Badges (${(Array.isArray(customFields) ? customFields : []).length})`,
              'enhanceProfile',
              <button
                type="button"
                onClick={() => setIsAddingCustomField(!isAddingCustomField)}
                className="p-1 px-2 rounded-lg text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingCustomField ? 'Cancel' : 'Add Field'}</span>
              </button>
            )}

            {isAddingCustomField && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0E1728] border border-cyan-500/40 space-y-2 shadow-lg animate-in fade-in">
                <div className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300">New Custom Metric / Field</div>

                <input
                  type="text"
                  value={newCustomField.label}
                  onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value })}
                  placeholder="Field Title (e.g. Publications, Patents, Rate)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <select
                  value={newCustomField.type}
                  onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="text">Plain Text</option>
                  <option value="markdown">Markdown / Rich</option>
                  <option value="link">Hyperlink</option>
                </select>

                <textarea
                  rows={2}
                  value={newCustomField.value}
                  onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
                  placeholder="Field content or value..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />

                <button
                  type="button"
                  onClick={handleSaveCustomField}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Add Custom Field
                </button>
              </div>
            )}

            <div className="space-y-2">
              {(!customFields || customFields.length === 0) ? (
                <div className="p-4 rounded-xl bg-white dark:bg-[#070D18] border border-slate-200 dark:border-white/10 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No custom fields added yet. Add custom credentials above.
                </div>
              ) : (
                customFields.map((field) => (
                  <div
                    key={field.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{field.label}</span>
                        <span className="text-[8px] px-1 py-0.2 rounded bg-slate-100 dark:bg-white/5 text-slate-500 uppercase font-mono">{field.type || 'text'}</span>
                      </div>
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-300 truncate mt-0.5">{field.value}</div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCustomField(field.id)}
                        className={`p-1 rounded-lg text-[9px] font-semibold border cursor-pointer ${
                          field.visible !== false ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500/30' : 'text-amber-500 border-amber-500/30'
                        }`}
                        title={field.visible !== false ? "Visible" : "Hidden"}
                      >
                        {field.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomField(field.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        title="Delete field"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // 10. PRIVACY & LIMITATIONS
      case 'limitations':
        return (
          <div className="space-y-3">
            {renderSectionHeader('Privacy & Limitations')}

            <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-2 shadow-xs">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pb-1">
                Configure what non-connected public visitors can see on your live digital pass:
              </p>
              {[
                { key: 'phone' as const, label: 'Show Phone Number' },
                { key: 'email' as const, label: 'Show Direct Email' },
                { key: 'bio' as const, label: 'Show Bio & Summary' },
                { key: 'skills' as const, label: 'Show Skills Badges' },
                { key: 'projects' as const, label: 'Show Portfolio Projects' },
                { key: 'experience' as const, label: 'Show Work Experience' }
              ].map((item) => {
                const isEnabled = profile.sharingSettings?.[item.key] !== false;
                return (
                  <div key={item.key} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleSharingSetting(item.key)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        isEnabled
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isEnabled ? 'Enabled' : 'Restricted'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      // 11. ACCOUNT INFO
      case 'accountInfo':
        return (
          <div className="space-y-3">
            {renderSectionHeader('Account Overview')}

            <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-2 shadow-xs text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Profile Identifier</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{profile.slug || profile.id}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">User ID</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{profile.userId || 'Primary Account'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Profile Type</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{profile.type || 'Individual'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Identity</span>
                </span>
              </div>
            </div>
          </div>
        );

      // 12. ARCHIVE & HIDDEN SECTIONS
      case 'archive':
        const hiddenEntries = Object.entries(profile.sectionVisibility || {}).filter(([, isVis]) => isVis === false);
        return (
          <div className="space-y-3">
            {renderSectionHeader('Archived & Hidden Sections')}

            <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-2 shadow-xs">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pb-1">
                Restore any sections you previously hid from public view:
              </p>

              {hiddenEntries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">
                  No hidden sections. All profile sections are currently active.
                </div>
              ) : (
                hiddenEntries.map(([secKey]) => (
                  <div key={secKey} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">{secKey}</span>
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(secKey)}
                      className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // 13. SECURITY
      case 'security':
        return (
          <div className="space-y-3">
            {renderSectionHeader('Card Security & Privacy')}

            <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-2.5 shadow-xs text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">SSL Encrypted Profile</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">Your public profile card is delivered over HTTPS with anti-tamper protections.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Visitor Sanitization</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">Restricted details are stripped server-side before delivery to unauthorized visitors.</p>
                </div>
              </div>
            </div>
          </div>
        );

      // 14. SETTINGS & THEME
      case 'settings':
        return (
          <div className="space-y-3">
            {renderSectionHeader('General Settings & Theme Style')}

            <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Profile URL Slug</label>
                <input
                  type="text"
                  value={profile.slug || ''}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="custom-slug"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Theme & Card Styling</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'editorial', label: 'Editorial Minimal', desc: 'High-contrast typography with crisp borders' },
                    { id: 'cyber', label: 'Developer Terminal', desc: 'Monospace code highlights & neon emerald' },
                    { id: 'luxe', label: 'Luxe Velvet', desc: 'Royal plum tones & glowing finishes' },
                  ].map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => {
                        setActiveTheme(theme.id as ProfileTheme);
                        updateField('theme', theme.id as ProfileTheme);
                        showToast?.(`Switched to ${theme.label}`);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        activeTheme === theme.id
                          ? 'bg-cyan-50 dark:bg-[#142338] border-cyan-500 dark:border-cyan-400 shadow-xs ring-1 ring-cyan-500/30'
                          : 'bg-slate-50 dark:bg-[#080D1A] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{theme.label}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400">{theme.desc}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeTheme === theme.id ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                        {activeTheme === theme.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                <h4 className="text-[10px] font-bold text-rose-500 dark:text-rose-400 mb-1.5">Danger Zone</h4>
                <button
                  type="button"
                  onClick={() => showToast?.('Profile reset is disabled on production accounts.')}
                  className="w-full py-1.5 px-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Reset Profile to Default
                </button>
              </div>
            </div>
          </div>
        );

      // DEFAULT FALLBACK
      default:
        return (
          <div className="space-y-3">
            {renderSectionHeader(activeSection)}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 shadow-xs">
              Editing <strong className="text-slate-900 dark:text-white capitalize">{activeSection}</strong>. All updates synchronize with Desktop and live pass in real time.
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`w-full max-w-[375px] min-w-0 h-full flex flex-col select-none overflow-hidden ${className}`}>
      
      {/* Hidden File Upload Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleAvatarUpload(f);
        }}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleCoverUpload(f);
        }}
        accept="image/*"
        className="hidden"
      />

      {/* Top Mobile Mode Switcher Bar */}
      <div className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 bg-white/95 dark:bg-[#0C1424]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shrink-0 transition-colors">
        <span className="flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
          <Smartphone className="w-3.5 h-3.5" />
          <span className="capitalize">{activeSection}</span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 4 View Presets: Form, Split, Drawer, Live Card */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#070D18]/80 backdrop-blur-md border border-slate-200 dark:border-cyan-500/30 rounded-lg p-0.5 shadow-inner transition-colors">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'form'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Full Edit Form"
            >
              <Pencil className="w-2.5 h-2.5" />
              <span>Form</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'split'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Split Slider View"
            >
              <Columns className="w-2.5 h-2.5" />
              <span>Split</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('drawer')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'drawer'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Sections Menu"
            >
              <Layers className="w-2.5 h-2.5" />
              <span>Menu</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'card'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Live Pass Preview"
            >
              <Eye className="w-2.5 h-2.5" />
              <span>Pass</span>
            </button>
          </div>

          {/* Minimal Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#070D18]/80 dark:hover:bg-[#132238] border border-slate-200 dark:border-cyan-500/30 transition-colors cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Main Inner Display Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 overflow-hidden bg-slate-50 dark:bg-[#0A101D] text-slate-900 dark:text-white flex flex-col select-text transition-colors"
      >
        {/* LIVE CARD PREVIEW MODE */}
        {viewMode === 'card' ? (
          <div className="w-full flex-1 overflow-y-auto p-3 bg-slate-100 dark:bg-[#070D18] transition-colors">
            <AvtiveDigitalCard
              profile={liveProfile}
              canEdit={true}
              onOpenEdit={() => setViewMode('form')}
              onSaveContact={() => showToast?.('Contact information saved!')}
              onOpenShare={() => showToast?.('Share modal opened')}
              onOpenConnect={() => showToast?.('Connection requested!')}
              onOpenQRModal={() => {}}
              onOpenResumeModal={() => {}}
              onSelectProject={() => {}}
              isDark={isDark}
              viewMode="standard"
              onSelectSection={(secKey) => {
                const map: Record<string, string> = {
                  hero: 'profile',
                  basicInfo: 'profile',
                  about: 'profile',
                  personal: 'personalDetails',
                  personalDetails: 'personalDetails',
                  skills: 'skills',
                  services: 'skills',
                  projects: 'projects',
                  education: 'education',
                  contact: 'contactInfo',
                  contactInfo: 'contactInfo',
                  socials: 'socialLinks',
                  socialLinks: 'socialLinks',
                  experience: 'experience',
                  customFields: 'enhanceProfile',
                  'custom-fields': 'enhanceProfile'
                };
                const target = map[secKey] || secKey;
                setActiveSection(target);
                setViewMode('form');
              }}
            />
          </div>
        ) : (
          <>
            {/* Top Interactive Banner Header */}
            <div className="relative h-28 w-full shrink-0 overflow-hidden bg-slate-200 dark:bg-[#0D1626] transition-colors">
              <img
                src={coverImage || ''}
                alt="Profile Cover"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-slate-900/30 dark:via-[#0A101D]/50 to-slate-50 dark:to-[#0A101D]" />

              {/* Cover Upload Button */}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[9px] font-medium border border-white/20 flex items-center gap-1 cursor-pointer"
                title="Change Cover Banner"
              >
                {isUploadingCover ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Upload className="w-2.5 h-2.5" />}
                <span>Cover</span>
              </button>

              {/* User Avatar & Title Overlay */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2.5">
                <div 
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-12 h-12 rounded-full border-2 border-cyan-400 overflow-hidden bg-slate-100 dark:bg-[#131F33] shrink-0 shadow-lg cursor-pointer group"
                  title="Change Profile Photo"
                >
                  <img
                    src={avatar || ''}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    {isUploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-white tracking-tight truncate">
                    {fullName || 'Aleena Nawab'}
                  </h2>
                  <p className="text-[11px] text-cyan-300 font-medium truncate">
                    {professionalTitle || 'Full Stack Engineer'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                    {(skills || []).slice(0, 3).map((s, idx) => (
                      <span key={idx} className="text-[8px] px-1.5 py-0.2 rounded bg-black/50 text-slate-200 border border-white/10 shrink-0">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SPLIT / FORM / DRAWER VIEW CONTAINER */}
            <div className="relative flex-1 w-full overflow-hidden flex">
              
              {/* LAYER 1: FORM VIEW (Active section full editor) */}
              {(viewMode === 'form' || viewMode === 'split') && (
                <div 
                  className="h-full overflow-y-auto p-3 space-y-3 scrollbar-none overscroll-contain"
                  style={{ width: viewMode === 'split' ? `${sliderPos}%` : '100%' }}
                >
                  {renderActiveSectionForm()}
                  <div className="h-10" />
                </div>
              )}

              {/* LAYER 2: DRAWER VIEW (14-section quick toggle list) */}
              {(viewMode === 'drawer' || viewMode === 'split') && (
                <div 
                  className="h-full overflow-y-auto bg-slate-100/95 dark:bg-[#0A1322]/90 backdrop-blur-2xl border-l border-slate-200 dark:border-[#2B4060]/50 p-2.5 space-y-1.5 scrollbar-none overscroll-contain transition-colors"
                  style={{ width: viewMode === 'split' ? `${100 - sliderPos}%` : '100%' }}
                >
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pb-1">
                    Sections &amp; Controls (14)
                  </div>

                  {DRAWER_SECTIONS.map((sec) => {
                    const isVis = isSectionVisible(sec.key);
                    const IconComponent = sec.icon;
                    const isSelected = activeSection === sec.key;

                    return (
                      <div
                        key={sec.key}
                        onClick={() => {
                          setActiveSection(sec.key);
                          if (viewMode === 'drawer') setViewMode('form');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
                          isSelected
                            ? 'bg-cyan-50 dark:bg-[#152338] border-cyan-500 dark:border-cyan-400 shadow-md shadow-cyan-500/15 ring-1 ring-cyan-500/40 dark:ring-cyan-400/40'
                            : 'bg-white/80 dark:bg-[#0E1B2D]/60 hover:bg-slate-50 dark:hover:bg-[#132238] border-slate-200 dark:border-[#223754]/60'
                        }`}
                      >
                        {/* Left: Icon & Label */}
                        <div className="flex items-center gap-2 min-w-0">
                          <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300'}`} />
                          <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                            {sec.label}
                          </span>
                        </div>

                        {/* Right: Visibility Toggle Button */}
                        <div className="flex items-center gap-1 shrink-0">
                          {sec.hasToggle && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectionVisibility(sec.key);
                              }}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                isVis ? 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/20'
                              }`}
                              title={isVis ? 'Hide section' : 'Show section'}
                            >
                              {isVis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                            </button>
                          )}
                          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                  <div className="h-10" />
                </div>
              )}

              {/* SLIDER HANDLE (Split mode only) */}
              {viewMode === 'split' && (
                <div
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  style={{ left: `${sliderPos}%` }}
                  className="absolute top-0 bottom-0 -ml-3 w-6 flex flex-col items-center justify-center z-40 cursor-ew-resize group select-none touch-none"
                >
                  <div className="w-[2px] h-full bg-gradient-to-b from-cyan-400/30 via-cyan-300 to-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#081120] border border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/25 flex items-center justify-center shadow-lg">
                    <div className="w-2.5 h-[2px] bg-cyan-500 dark:cyan-300 rounded-full" />
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* BOTTOM ACTION BAR - CONFIGURED SAVE OPTION */}
        <div className="relative z-40 w-full bg-white/95 dark:bg-[#080E1A]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1F334F] py-2 px-3 flex items-center justify-between gap-2 shrink-0 transition-colors">
          <button
            type="button"
            onClick={handleSaveTrigger}
            disabled={isSaving}
            aria-label="Save Profile Changes"
            title="Save Profile Changes"
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Pass</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNextTrigger}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#142338] dark:hover:bg-[#1C3250] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#274164] transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
            title="Go to next section"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          </button>

          {/* Minimal Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#142338] dark:hover:bg-[#1C3250] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#274164] transition-all flex items-center justify-center cursor-pointer shrink-0"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
