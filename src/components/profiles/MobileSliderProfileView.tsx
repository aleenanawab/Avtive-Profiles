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
  MessageSquare
} from 'lucide-react';
import { useProfileEditor } from '@/context/ProfileEditorContext';
import { usePortfolioTheme } from '@/context/ThemeContext';
import { 
  ProjectItem, 
  ExperienceItem, 
  EducationItem, 
  CustomFieldItem,
  ProfileTheme 
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

  // Section list matching 14 items
  const DRAWER_SECTIONS = [
    { key: 'profile', label: 'Profile & Identity', icon: User, hasToggle: true },
    { key: 'personalDetails', label: 'Personal & Contact', icon: Pencil, hasToggle: true },
    { key: 'skills', label: 'Skills & Tech Stack', icon: Code, hasToggle: true },
    { key: 'projects', label: 'Projects & Portfolio', icon: FolderGit2, hasToggle: true },
    { key: 'experience', label: 'Work Experience', icon: Briefcase, hasToggle: true },
    { key: 'education', label: 'Education & Degrees', icon: GraduationCap, hasToggle: true },
    { key: 'socialLinks', label: 'Social Links & Media', icon: Link2, hasToggle: true },
    { key: 'contactInfo', label: 'Direct Messaging & Booking', icon: Phone, hasToggle: true },
    { key: 'enhanceProfile', label: 'Enhance & Custom Fields', icon: Sparkles, hasToggle: true },
    { key: 'limitations', label: 'Privacy & Sharing Limits', icon: EyeOff, hasToggle: false },
    { key: 'accountInfo', label: 'Account & Pass Identifier', icon: UserCheck, hasToggle: false },
    { key: 'archive', label: 'Archive & Hidden Blocks', icon: Archive, hasToggle: false },
    { key: 'security', label: 'Security & Verification', icon: ShieldCheck, hasToggle: false },
    { key: 'settings', label: 'Settings & Theme Style', icon: Settings, hasToggle: false },
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

  // Skill Handlers
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
    showToast?.(`Removed skill: ${skillName}`);
  };

  // Project Handlers
  const handleSaveProject = () => {
    if (!newProject.title.trim()) {
      showToast?.('Project title is required.');
      return;
    }
    const tagsArr = newProject.tags.split(',').map(t => t.trim()).filter(Boolean);
    const item: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      tags: tagsArr,
      technology: tagsArr.join(', '),
      link: newProject.link.trim() || undefined,
      liveUrl: newProject.link.trim() || undefined,
      image: newProject.image.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
      coverImage: newProject.image.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop'
    };
    setProjects(prev => [item, ...prev]);
    setNewProject({ title: '', description: '', tags: '', link: '', image: '' });
    setIsAddingProject(false);
    showToast?.('✓ Project added!');
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
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
    setExperiences(prev => [item, ...prev]);
    setNewExperience({ role: '', company: '', period: '', location: '', description: '' });
    setIsAddingExperience(false);
    showToast?.('✓ Experience added!');
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
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
    setEducation(prev => [item, ...prev]);
    setNewEducation({ degree: '', institution: '', period: '', description: '' });
    setIsAddingEducation(false);
    showToast?.('✓ Education record added!');
  };

  const handleDeleteEducation = (id: string) => {
    setEducation(prev => prev.filter(e => e.id !== id));
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
    setCustomFields(prev => [...prev, item]);
    setNewCustomField({ label: '', value: '', type: 'text' });
    setIsAddingCustomField(false);
    showToast?.('✓ Custom field added!');
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
    showToast?.('Custom field removed.');
  };

  // Social Links Handler
  const updateSocialUrl = (platform: string, url: string) => {
    const current = Array.isArray(socialLinks) ? socialLinks : [];
    const index = current.findIndex(l => l.platform === platform);
    if (index >= 0) {
      const copy = [...current];
      copy[index] = { ...copy[index], url };
      setSocialLinks(copy as any);
    } else {
      setSocialLinks([...current, { id: `link-${platform}-${Date.now()}`, platform: platform as any, title: platform, url, visible: true }] as any);
    }
  };

  const getSocialUrl = (platform: string) => {
    const found = socialLinks.find(l => l.platform === platform);
    return found ? found.url : '';
  };

  const toggleSocialVisibility = (platform: string) => {
    const current = Array.isArray(socialLinks) ? socialLinks : [];
    const index = current.findIndex(l => l.platform === platform);
    if (index >= 0) {
      const copy = [...current];
      copy[index] = { ...copy[index], visible: !copy[index].visible };
      setSocialLinks(copy as any);
      showToast?.(`${platform} is now ${copy[index].visible ? 'Visible' : 'Hidden'}`);
    }
  };

  const isSectionVisible = (key: string): boolean => {
    if (sectionVisibility && typeof sectionVisibility[key] === 'boolean') {
      return sectionVisibility[key];
    }
    return true;
  };

  const handleSaveTrigger = async () => {
    if (onSave) {
      await onSave();
    } else if (handleSaveChanges) {
      await handleSaveChanges();
    } else {
      await saveProfile();
    }
  };

  const popularSkills = ['React', 'Next.js', 'TypeScript', 'Node.js', 'TailwindCSS', 'Python', 'UI/UX', 'Cloud', 'GraphQL', 'Figma'];

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER ACTIVE SECTION FORM CONTENT
  // ──────────────────────────────────────────────────────────────────────────
  const renderActiveSectionForm = () => {
    switch (activeSection) {
      // 1. PROFILE & IDENTITY
      case 'profile':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Profile &amp; Identity</span>
              </span>
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="p-1 rounded-md text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-300" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300">Last Name</label>
                <input
                  type="text"
                  value={secondName}
                  onChange={(e) => setSecondName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300">Professional Title</label>
              <input
                type="text"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300">Location</label>
              <div className="relative">
                <MapPin className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300">Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300">About</label>
              <textarea
                rows={3}
                value={about || ''}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Detailed background..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>
        );

      // 2. PERSONAL DETAILS & CONTACT
      case 'personalDetails':
      case 'contactInfo':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Contact &amp; Personal Info</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Direct Communication</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300">Phone Number</label>
              <div className="relative">
                <Phone className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300">Website / Portfolio URL</label>
              <div className="relative">
                <Globe className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://yourdomain.com"
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300">Direct WhatsApp Number / Link</label>
              <div className="relative">
                <WhatsAppIcon className="w-3 h-3 text-emerald-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profile.whatsapp || ''}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        );

      // 3. SKILLS & EXPERTISE
      case 'skills':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Skills &amp; Tech Stack ({skills.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNewSkill(!isAddingNewSkill)}
                className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Quick Add Custom Skill */}
            {isAddingNewSkill && (
              <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
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
                    placeholder="Enter skill name (e.g. Next.js)"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-cyan-500/50 text-white text-xs focus:outline-none"
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

            {/* Search Filter */}
            <input
              type="text"
              value={skillSearchQuery}
              onChange={(e) => setSkillSearchQuery(e.target.value)}
              placeholder="Search active skills..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />

            {/* Active Skill Chips */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400">Your Active Skills</label>
              <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-xl bg-[#070D18] border border-white/10">
                {skills.length === 0 ? (
                  <span className="text-[10px] text-slate-500 italic">No skills added yet. Tap suggestions below.</span>
                ) : (
                  skills
                    .filter(s => !skillSearchQuery || s.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                    .map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#142236] text-cyan-200 border border-cyan-500/30 shadow-xs"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillTag(s)}
                          className="text-slate-400 hover:text-rose-400 ml-0.5 cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                )}
              </div>
            </div>

            {/* Popular Suggestions */}
            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-semibold text-slate-400">Popular Suggestions</label>
              <div className="flex flex-wrap gap-1.5">
                {popularSkills
                  .filter(s => !skills.includes(s))
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkillTag(s)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5 text-cyan-400" />
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
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Projects ({projects.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingProject ? 'Cancel' : 'New Project'}</span>
              </button>
            </div>

            {/* New Project Form Drawer */}
            {isAddingProject && (
              <div className="p-3 rounded-xl bg-[#0E1728] border border-cyan-500/40 space-y-2 shadow-lg">
                <div className="text-[11px] font-bold text-cyan-300">Add New Project</div>
                
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="Project Title"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <textarea
                  rows={2}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Brief description of what you built..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />

                <input
                  type="text"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  placeholder="Tags (e.g. Next.js, Stripe, Tailwind)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="url"
                  value={newProject.link}
                  onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  placeholder="Live URL or GitHub repository"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <button
                  type="button"
                  onClick={handleSaveProject}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            )}

            {/* List of Existing Projects */}
            <div className="space-y-2">
              {projects.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#070D18] border border-white/10 text-center text-slate-400 text-xs">
                  No projects added yet. Click &quot;New Project&quot; above to showcase your work.
                </div>
              ) : (
                projects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[#0E1528] border border-white/10 space-y-1.5 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{p.title}</div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{p.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer shrink-0"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {p.tags?.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 truncate">
                            {t}
                          </span>
                        ))}
                      </div>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-0.5 shrink-0"
                        >
                          <span>Live Link</span>
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

      // 5. WORK EXPERIENCE
      case 'experience':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>Work Experience ({experiences.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingExperience(!isAddingExperience)}
                className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingExperience ? 'Cancel' : 'New Role'}</span>
              </button>
            </div>

            {/* New Experience Form */}
            {isAddingExperience && (
              <div className="p-3 rounded-xl bg-[#0E1728] border border-cyan-500/40 space-y-2 shadow-lg">
                <div className="text-[11px] font-bold text-cyan-300">Add Career Experience</div>

                <input
                  type="text"
                  value={newExperience.role}
                  onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                  placeholder="Job Role (e.g. Lead Frontend Architect)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  placeholder="Company Name (e.g. Acme Corp)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newExperience.period}
                    onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                    placeholder="Period (e.g. 2022 - Present)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={newExperience.location}
                    onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                    placeholder="Location (e.g. Remote)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <textarea
                  rows={2}
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  placeholder="Key responsibilities & accomplishments..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
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

            {/* List of Experiences */}
            <div className="space-y-2">
              {experiences.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#070D18] border border-white/10 text-center text-slate-400 text-xs">
                  No work experience added yet. Tap &quot;New Role&quot; above.
                </div>
              ) : (
                experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl bg-[#0E1528] border border-white/10 space-y-1 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white">{exp.role}</div>
                        <div className="text-[11px] text-cyan-300 font-medium">{exp.company}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      {exp.period && <span>{exp.period}</span>}
                      {exp.location && <span>&middot; {exp.location}</span>}
                    </div>

                    {exp.description && (
                      <p className="text-[11px] text-slate-300 pt-0.5">{exp.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // 6. EDUCATION & DEGREES
      case 'education':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Education ({education.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingEducation(!isAddingEducation)}
                className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingEducation ? 'Cancel' : 'New Degree'}</span>
              </button>
            </div>

            {/* New Education Form */}
            {isAddingEducation && (
              <div className="p-3 rounded-xl bg-[#0E1728] border border-cyan-500/40 space-y-2 shadow-lg">
                <div className="text-[11px] font-bold text-cyan-300">Add Academic Record</div>

                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  placeholder="Degree (e.g. B.S. in Computer Science)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  placeholder="Institution (e.g. University of California)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="text"
                  value={newEducation.period}
                  onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })}
                  placeholder="Graduation Year / Period (e.g. 2018 - 2022)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <textarea
                  rows={2}
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                  placeholder="Honors, relevant coursework, thesis..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
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

            {/* List of Education records */}
            <div className="space-y-2">
              {education.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#070D18] border border-white/10 text-center text-slate-400 text-xs">
                  No education records yet. Tap &quot;New Degree&quot; above.
                </div>
              ) : (
                education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-3 rounded-xl bg-[#0E1528] border border-white/10 space-y-1 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white">{edu.degree}</div>
                        <div className="text-[11px] text-cyan-300">{edu.institution}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {edu.period && <div className="text-[10px] text-slate-400">{edu.period}</div>}
                    {edu.description && <p className="text-[11px] text-slate-300 pt-0.5">{edu.description}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // 7. SOCIAL LINKS & MEDIA
      case 'socialLinks':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Social Profiles &amp; Handles</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Live Badges</span>
            </div>

            {/* Platform URL Inputs */}
            <div className="space-y-2.5">
              {/* LinkedIn */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <LinkedInIcon className="w-3 h-3 text-cyan-400" />
                    <span>LinkedIn Profile</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSocialVisibility('linkedin')}
                    className="text-slate-400 hover:text-cyan-400"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="url"
                  value={getSocialUrl('linkedin')}
                  onChange={(e) => updateSocialUrl('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* GitHub */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <GithubIcon className="w-3 h-3 text-white" />
                    <span>GitHub Profile</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSocialVisibility('github')}
                    className="text-slate-400 hover:text-cyan-400"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="url"
                  value={getSocialUrl('github')}
                  onChange={(e) => updateSocialUrl('github', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Twitter / X */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <TwitterIcon className="w-3 h-3 text-cyan-400" />
                    <span>X (Twitter)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSocialVisibility('twitter')}
                    className="text-slate-400 hover:text-cyan-400"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="url"
                  value={getSocialUrl('twitter')}
                  onChange={(e) => updateSocialUrl('twitter', e.target.value)}
                  placeholder="https://x.com/username"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        );

      // 8. ENHANCE PROFILE & CUSTOM FIELDS
      case 'enhanceProfile':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Custom Fields &amp; Badges ({customFields.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingCustomField(!isAddingCustomField)}
                className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingCustomField ? 'Cancel' : 'Add Field'}</span>
              </button>
            </div>

            {/* New Custom Field Form */}
            {isAddingCustomField && (
              <div className="p-3 rounded-xl bg-[#0E1728] border border-cyan-500/40 space-y-2 shadow-lg">
                <div className="text-[11px] font-bold text-cyan-300">New Custom Metric / Field</div>

                <input
                  type="text"
                  value={newCustomField.label}
                  onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value })}
                  placeholder="Field Title (e.g. Patents, Publications, Rate)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="text"
                  value={newCustomField.value}
                  onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
                  placeholder="Content or Metric Value"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070D18] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
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

            {/* List of Custom Fields */}
            <div className="space-y-2">
              {customFields.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#070D18] border border-white/10 text-center text-slate-400 text-xs">
                  No custom fields added yet. Add key metrics or credentials above.
                </div>
              ) : (
                customFields.map((field) => (
                  <div
                    key={field.id}
                    className="p-2.5 rounded-xl bg-[#0E1528] border border-white/10 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-white">{field.label}</div>
                      <div className="text-[10px] text-cyan-300">{field.value}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomField(field.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // 9. SETTINGS & THEME
      case 'settings':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span>Theme &amp; Card Style</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Instant Switch</span>
            </div>

            <div className="space-y-2">
              {[
                { id: 'editorial', label: 'Editorial Minimal', desc: 'High-contrast typography with crisp borders' },
                { id: 'cyber', label: 'Developer Terminal', desc: 'Monospace code highlights & neon emerald' },
                { id: 'luxe', label: 'Luxe Velvet', desc: 'Royal plum tones & glowing finishes' },
              ].map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => {
                    setActiveTheme(theme.id as ProfileTheme);
                    showToast?.(`Switched to ${theme.label}`);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeTheme === theme.id
                      ? 'bg-[#142338] border-cyan-400 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-[#070D18] border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{theme.label}</div>
                    <div className="text-[10px] text-slate-400">{theme.desc}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeTheme === theme.id ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-slate-600'}`}>
                    {activeTheme === theme.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // DEFAULT FALLBACK (Other sections)
      default:
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-white capitalize">{activeSection}</span>
              <span className="text-[10px] text-slate-400 font-mono">Active</span>
            </div>
            <p className="text-xs text-slate-300">
              Editing section settings for <strong className="text-white capitalize">{activeSection}</strong>. All changes update the synchronized digital pass immediately.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`w-[375px] min-w-[375px] max-w-[375px] h-full flex flex-col select-none overflow-hidden ${className}`}>
      
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
      <div className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] text-slate-300 bg-[#0C1424]/80 backdrop-blur-xl border-b border-white/10 shrink-0">
        <span className="flex items-center gap-1 font-bold text-cyan-400 shrink-0">
          <Smartphone className="w-3.5 h-3.5" />
          <span className="capitalize">{activeSection}</span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 4 View Presets: Form, Split, Drawer, Live Card */}
          <div className="flex items-center gap-0.5 bg-[#070D18]/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'form'
                  ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Sections Drawer"
            >
              <Layers className="w-2.5 h-2.5" />
              <span>Menu</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'card'
                  ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
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
            className="p-1 rounded-md text-slate-300 hover:text-white bg-[#070D18]/80 hover:bg-[#132238] border border-cyan-500/30 transition-colors cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Main Inner Display Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 overflow-hidden bg-[#0A101D] flex flex-col select-text"
      >
        {/* LIVE CARD PREVIEW MODE */}
        {viewMode === 'card' ? (
          <div className="w-full flex-1 overflow-y-auto p-3 bg-[#070D18]">
            <AvtiveDigitalCard
              profile={liveProfile}
              canEdit={true}
              onOpenEdit={() => setViewMode('form')}
              onSaveContact={() => showToast?.('Contact saved!')}
              onOpenShare={() => showToast?.('Share modal opened')}
              onOpenConnect={() => showToast?.('Connection requested!')}
              onOpenQRModal={() => {}}
              onOpenResumeModal={() => {}}
              onSelectProject={() => {}}
              isDark={isDark}
              viewMode="standard"
            />
          </div>
        ) : (
          <>
            {/* Top Interactive Banner Header */}
            <div className="relative h-32 w-full shrink-0 overflow-hidden bg-[#0D1626]">
              <img
                src={coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop'}
                alt="Profile Cover"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#0A101D]/50 to-[#0A101D]" />

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
                  className="relative w-12 h-12 rounded-full border-2 border-cyan-400 overflow-hidden bg-[#131F33] shrink-0 shadow-lg cursor-pointer group"
                  title="Change Profile Photo"
                >
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'}
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
                    {skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="text-[8px] px-1.5 py-0.2 rounded bg-black/50 text-slate-300 border border-white/10 shrink-0">
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
                  className="h-full overflow-y-auto bg-[#0A1322]/85 backdrop-blur-2xl border-l border-[#2B4060]/50 p-2.5 space-y-1.5 scrollbar-none overscroll-contain"
                  style={{ width: viewMode === 'split' ? `${100 - sliderPos}%` : '100%' }}
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
                    Sections &amp; Controls
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
                            ? 'bg-[#152338] border-cyan-400 shadow-md shadow-cyan-500/15 ring-1 ring-cyan-400/40'
                            : 'bg-[#0E1B2D]/60 hover:bg-[#132238] border-[#223754]/60'
                        }`}
                      >
                        {/* Left: Icon & Label */}
                        <div className="flex items-center gap-2 min-w-0">
                          <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`} />
                          <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
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
                                handleToggleSectionVisibility(sec.key);
                              }}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                isVis ? 'text-cyan-400 hover:bg-cyan-500/20' : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/20'
                              }`}
                              title={isVis ? 'Hide section' : 'Show section'}
                            >
                              {isVis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                            </button>
                          )}
                          <ChevronRight className="w-3 h-3 text-slate-500" />
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
                  <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#081120] border border-cyan-400 ring-2 ring-cyan-400/25 flex items-center justify-center shadow-lg">
                    <div className="w-2.5 h-[2px] bg-cyan-300 rounded-full" />
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="relative z-40 w-full bg-[#080E1A]/95 backdrop-blur-md border-t border-[#1F334F] py-2 px-3 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSaveTrigger}
            disabled={isSaving}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:from-cyan-600 active:to-blue-700 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Pass</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const currentIdx = DRAWER_SECTIONS.findIndex(s => s.key === activeSection);
              const nextIdx = (currentIdx + 1) % DRAWER_SECTIONS.length;
              setActiveSection(DRAWER_SECTIONS[nextIdx].key);
              setViewMode('form');
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-[#142338] hover:bg-[#1C3250] text-slate-200 border border-[#274164] transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
            title="Go to next section"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Minimal Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl bg-[#142338] hover:bg-[#1C3250] text-slate-200 border border-[#274164] transition-all flex items-center justify-center cursor-pointer shrink-0"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
