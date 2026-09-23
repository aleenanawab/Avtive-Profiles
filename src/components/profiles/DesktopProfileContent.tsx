'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Check, 
  Loader2, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Palette, 
  Lock, 
  Shield, 
  Tag, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { useProfileEditor } from '@/context/ProfileEditorContext';
import { PhonePreview } from '@/components/PhonePreview';
import { 
  ProfileTheme, 
  ProjectItem, 
  ExperienceItem, 
  EducationItem, 
  CustomFieldItem,
  SocialLink
} from '@/types/profile';
import { LinkedInIcon, GithubIcon, TwitterIcon, WhatsAppIcon } from '@/components/BrandIcons';

export interface DesktopProfileContentProps {
  hideRightPreview?: boolean;
}

export function DesktopProfileContent({ hideRightPreview = false }: DesktopProfileContentProps) {
  const { 
    profile, 
    liveProfile,
    setProfile, 
    updateField, 
    activeSection, 
    setActiveSection,
    isSaving, 
    saveProfile,
    showToast,
    activeTheme,
    setActiveTheme,
    isDark
  } = useProfileEditor();

  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSection = async () => {
    try {
      await saveProfile();
      setIsSaved(true);
    } catch {
      // toast shown by saveProfile
    }
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Skills input state
  const [newSkillText, setNewSkillText] = useState('');

  // Projects input state
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', tags: '', link: '', image: '' });

  // Education input state
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', period: '', description: '' });

  // Experience input state
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({ role: '', company: '', period: '', location: '', description: '' });

  // Custom Field input state
  const [newCustomFieldLabel, setNewCustomFieldLabel] = useState('');
  const [newCustomFieldValue, setNewCustomFieldValue] = useState('');
  const [newCustomFieldType, setNewCustomFieldType] = useState<'text' | 'markdown' | 'link'>('text');

  // Image Upload Handlers
  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        updateField('avatar', data.url);
        showToast('✓ Avatar photo updated!');
      } else {
        showToast(data.error || 'Avatar upload failed.');
      }
    } catch {
      showToast('Network error while uploading avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        updateField('coverImage', data.url);
        showToast('✓ Cover banner updated!');
      } else {
        showToast(data.error || 'Cover upload failed.');
      }
    } catch {
      showToast('Network error while uploading cover.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Toggle Section Visibility
  const toggleSectionVisibility = (key: string) => {
    const current = profile.sectionVisibility || {};
    const updated = {
      ...current,
      [key]: current[key] === false ? true : false
    };
    updateField('sectionVisibility', updated);
    showToast(`Section "${key}" is now ${updated[key] ? 'Visible' : 'Hidden'}`);
  };

  // Skill Handlers
  const handleAddSkill = (skillToAdd?: string) => {
    const text = (skillToAdd || newSkillText).trim();
    if (!text) return;
    const currentSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const skillStrings = currentSkills.map(s => typeof s === 'string' ? s : s.name);
    if (!skillStrings.includes(text)) {
      updateField('skills', [...currentSkills, text]);
      showToast(`Added skill: ${text}`);
    }
    setNewSkillText('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const filtered = currentSkills.filter(s => {
      const name = typeof s === 'string' ? s : s.name;
      return name !== skillToRemove;
    });
    updateField('skills', filtered);
  };

  // Project Handlers
  const handleSaveNewProject = () => {
    if (!newProject.title.trim()) {
      showToast('Please provide a project title.');
      return;
    }
    const tagsArray = newProject.tags ? newProject.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const projectItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      tags: tagsArray,
      technology: tagsArray.join(', '),
      link: newProject.link.trim() || undefined,
      liveUrl: newProject.link.trim() || undefined,
      image: newProject.image.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
      coverImage: newProject.image.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop'
    };
    const current = Array.isArray(profile.projects) ? profile.projects : [];
    updateField('projects', [projectItem, ...current]);
    setNewProject({ title: '', description: '', tags: '', link: '', image: '' });
    setIsAddingProject(false);
    showToast('✓ Project added!');
  };

  const handleDeleteProject = (id: string) => {
    const current = Array.isArray(profile.projects) ? profile.projects : [];
    updateField('projects', current.filter(p => p.id !== id));
    showToast('Project removed.');
  };

  // Education Handlers
  const handleSaveNewEducation = () => {
    if (!newEducation.institution.trim() || !newEducation.degree.trim()) {
      showToast('Institution and degree are required.');
      return;
    }
    const eduItem: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: newEducation.degree.trim(),
      institution: newEducation.institution.trim(),
      period: newEducation.period.trim() || undefined,
      description: newEducation.description.trim() || undefined
    };
    const current = Array.isArray(profile.education) ? profile.education : [];
    updateField('education', [eduItem, ...current]);
    setNewEducation({ degree: '', institution: '', period: '', description: '' });
    setIsAddingEducation(false);
    showToast('✓ Education added!');
  };

  const handleDeleteEducation = (id: string) => {
    const current = Array.isArray(profile.education) ? profile.education : [];
    updateField('education', current.filter(e => e.id !== id));
    showToast('Education record removed.');
  };

  // Experience Handlers
  const handleSaveNewExperience = () => {
    if (!newExperience.company.trim() || !newExperience.role.trim()) {
      showToast('Company and role are required.');
      return;
    }
    const expItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: newExperience.company.trim(),
      role: newExperience.role.trim(),
      period: newExperience.period.trim() || undefined,
      location: newExperience.location.trim() || undefined,
      description: newExperience.description.trim() || undefined
    };
    const current = Array.isArray(profile.experiences) ? profile.experiences : [];
    updateField('experiences', [expItem, ...current]);
    setNewExperience({ role: '', company: '', period: '', location: '', description: '' });
    setIsAddingExperience(false);
    showToast('✓ Experience record added!');
  };

  const handleDeleteExperience = (id: string) => {
    const current = Array.isArray(profile.experiences) ? profile.experiences : [];
    updateField('experiences', current.filter(e => e.id !== id));
    showToast('Experience record removed.');
  };

  // Custom Field Handlers
  const handleAddCustomField = () => {
    if (!newCustomFieldLabel.trim() || !newCustomFieldValue.trim()) {
      showToast('Field title and content are both required.');
      return;
    }
    const newField: CustomFieldItem = {
      id: `cf-${Date.now()}`,
      label: newCustomFieldLabel.trim(),
      value: newCustomFieldValue.trim(),
      type: newCustomFieldType,
      visible: true
    };
    const current = Array.isArray(profile.customFields) ? profile.customFields : [];
    updateField('customFields', [...current, newField]);
    setNewCustomFieldLabel('');
    setNewCustomFieldValue('');
    showToast('✓ Custom field added!');
  };

  const handleToggleCustomField = (id: string) => {
    const current = Array.isArray(profile.customFields) ? profile.customFields : [];
    const updated = current.map(f => f.id === id ? { ...f, visible: f.visible === false ? true : false } : f);
    updateField('customFields', updated);
  };

  const handleDeleteCustomField = (id: string) => {
    const current = Array.isArray(profile.customFields) ? profile.customFields : [];
    updateField('customFields', current.filter(f => f.id !== id));
    showToast('Custom field removed.');
  };

  // Social Links Handlers
  const updateSocialUrl = (platform: string, url: string) => {
    const currentLinks = Array.isArray(profile.socialLinks) ? profile.socialLinks : [];
    const existingIndex = currentLinks.findIndex(l => l.platform === platform);
    if (existingIndex >= 0) {
      const copy = [...currentLinks];
      copy[existingIndex] = { ...copy[existingIndex], url };
      updateField('socialLinks', copy);
    } else {
      updateField('socialLinks', [...currentLinks, { platform: platform as SocialLink['platform'], url }]);
    }
  };

  const getSocialUrl = (platform: string) => {
    const currentLinks = Array.isArray(profile.socialLinks) ? profile.socialLinks : [];
    const found = currentLinks.find(l => l.platform === platform);
    return found ? found.url : '';
  };

  const isSocialVisible = (platform: string) => {
    const currentLinks = Array.isArray(profile.socialLinks) ? profile.socialLinks : [];
    const found = currentLinks.find(l => l.platform === platform) as any;
    return found ? found.visible !== false : true;
  };

  const toggleSocialVisibility = (platform: string) => {
    const currentLinks = Array.isArray(profile.socialLinks) ? profile.socialLinks : [];
    const existingIndex = currentLinks.findIndex(l => l.platform === platform);
    if (existingIndex >= 0) {
      const copy = [...currentLinks];
      const curVis = (copy[existingIndex] as any).visible !== false;
      copy[existingIndex] = { ...copy[existingIndex], visible: !curVis };
      updateField('socialLinks', copy);
      showToast(`${platform} link is now ${!curVis ? 'Visible' : 'Hidden'}`);
    } else {
      updateField('socialLinks', [...currentLinks, { platform: platform as SocialLink['platform'], url: '', visible: false }]);
      showToast(`${platform} link is now Hidden`);
    }
  };

  // Sharing Settings Handlers
  const toggleSharingSetting = (key: keyof NonNullable<typeof profile.sharingSettings>) => {
    const current = profile.sharingSettings || {};
    const updated = {
      ...current,
      [key]: current[key] === false ? true : false
    };
    updateField('sharingSettings', updated);
  };

  return (
    <div className="flex-1 h-full min-h-0 flex overflow-hidden bg-slate-50 dark:bg-[#080D1A] transition-colors">
      
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* LEFT / CENTER: Active Section Edit Panel (Scrolls independently)           */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 h-full min-h-0 overflow-y-auto overflow-x-hidden p-5 sm:p-7 xl:p-8 scrollbar-thin scrollbar-thumb-white/10 space-y-6">
        
        {/* Top Section Header with Title, Visibility Toggle & Quick Save */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight capitalize">
              {activeSection === 'profile' && 'Profile & Identity'}
              {activeSection === 'personalDetails' && 'Personal Details'}
              {activeSection === 'skills' && 'Skills & Expertise'}
              {activeSection === 'projects' && 'Projects & Portfolio'}
              {activeSection === 'education' && 'Education & Degrees'}
              {activeSection === 'contactInfo' && 'Contact Information'}
              {activeSection === 'socialLinks' && 'Social Media & Links'}
              {activeSection === 'experience' && 'Work Experience'}
              {activeSection === 'enhanceProfile' && 'Enhance Profile'}
              {activeSection === 'limitations' && 'Privacy & Visibility'}
              {activeSection === 'accountInfo' && 'Account Information'}
              {activeSection === 'archive' && 'Archive'}
              {activeSection === 'security' && 'Security'}
              {activeSection === 'settings' && 'Settings'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Section Visibility Toggle for Active Section */}
            {['profile', 'personalDetails', 'skills', 'projects', 'education', 'contactInfo', 'socialLinks', 'experience', 'enhanceProfile'].includes(activeSection) && (
              <button
                type="button"
                onClick={() => toggleSectionVisibility(activeSection)}
                title={(profile.sectionVisibility?.[activeSection] !== false) ? "Visible on card (Click to hide)" : "Hidden from card (Click to show)"}
                aria-label={(profile.sectionVisibility?.[activeSection] !== false) ? "Section visible" : "Section hidden"}
                className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  (profile.sectionVisibility?.[activeSection] !== false)
                    ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
              >
                {(profile.sectionVisibility?.[activeSection] !== false) ? (
                  <Eye className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                ) : (
                  <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveSection}
              disabled={isSaving}
              aria-label="Save section"
              title="Save Section"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>

            {isSaved && (
              <button
                type="button"
                onClick={() => router.push(`/profile/${profile.slug || profile.id}`)}
                aria-label="Next: View Profile"
                title="Next: View Profile"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer animate-in fade-in"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 1. PROFILE & IDENTITY SECTION                                              */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            
            {/* Cover Banner & Avatar Upload Card */}
            <div className="rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs transition-colors">
              <div className="relative h-36 sm:h-44 w-full bg-slate-800">
                <img 
                  src={profile.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-md cursor-pointer transition-all"
                  title="Change Cover Image"
                >
                  {isUploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  <span>Cover</span>
                </button>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                }} />
              </div>

              <div className="p-4 sm:p-5 relative -mt-12 flex items-end justify-between gap-4">
                <div className="flex items-end gap-3.5">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-[#0E1526] overflow-hidden bg-slate-800 shadow-xl shrink-0 group transition-colors">
                    <img 
                      src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Upload Avatar"
                    >
                      {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-5 h-5" />}
                      <span className="text-[9px] font-bold mt-0.5">Upload</span>
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }} />
                  </div>

                  <div className="pb-1">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{profile.name}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">@{profile.username || profile.slug}</p>
                  </div>
                </div>

                <div className="pb-1">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1.5"
                    title="Change Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Core Identity Inputs Form */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 space-y-4 shadow-xs transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Basic Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Display Name</label>
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username / Custom URL Handle</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-400">@</span>
                    <input
                      type="text"
                      value={profile.username || profile.slug || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^@/, '');
                        updateField('username', val);
                        updateField('slug', val);
                      }}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Professional Title / Headline</label>
                <input
                  type="text"
                  value={profile.professionalTitle || profile.designation || ''}
                  onChange={(e) => {
                    updateField('professionalTitle', e.target.value);
                    updateField('designation', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  placeholder="e.g. Senior Full-Stack Engineer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Short Bio / Pitch</label>
                <textarea
                  rows={3}
                  value={profile.bio || profile.shortBio || ''}
                  onChange={(e) => {
                    updateField('bio', e.target.value);
                    updateField('shortBio', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors resize-none"
                  placeholder="Tell people who you are and what you build..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full About Summary</label>
                <textarea
                  rows={4}
                  value={profile.about || profile.fullBio || ''}
                  onChange={(e) => {
                    updateField('about', e.target.value);
                    updateField('fullBio', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors resize-none"
                  placeholder="Comprehensive background, achievements, and technical philosophy..."
                />
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 2. PERSONAL DETAILS                                                        */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'personalDetails' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Personal Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={profile.firstName || ''}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  placeholder="e.g. Syed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Last Name / Surname</label>
                <input
                  type="text"
                  value={profile.secondName || profile.lastName || ''}
                  onChange={(e) => {
                    updateField('secondName', e.target.value);
                    updateField('lastName', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  placeholder="e.g. Raza"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pronouns</label>
                <input
                  type="text"
                  value={profile.pronouns || ''}
                  onChange={(e) => updateField('pronouns', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  placeholder="e.g. He/Him, They/Them"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Birthdate</label>
                <input
                  type="text"
                  value={profile.birthday || ''}
                  onChange={(e) => updateField('birthday', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  placeholder="e.g. September 18"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Direct Email</label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Direct Phone</label>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Company / Organization</label>
                <input
                  type="text"
                  value={profile.company || ''}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  placeholder="Avtive Inc."
                />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 3. SKILLS & EXPERTISE                                                      */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'skills' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Skills & Expertise</h3>
              <button
                type="button"
                onClick={() => toggleSectionVisibility('skills')}
                aria-label={profile.sectionVisibility?.skills !== false ? 'Hide section' : 'Show section'}
                title={profile.sectionVisibility?.skills !== false ? 'Visible on card' : 'Hidden'}
                className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  profile.sectionVisibility?.skills !== false
                    ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}
              >
                {profile.sectionVisibility?.skills !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                placeholder="Skill name (e.g. React, Next.js, Node.js)"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                aria-label="Add Skill"
                title="Add Skill"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['TypeScript', 'React.js', 'Next.js', 'Node.js', 'Tailwind CSS', 'GraphQL', 'PostgreSQL', 'Figma', 'UI/UX'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  + {s}
                </button>
              ))}
            </div>

            {/* Active Skills Cloud */}
            <div className="pt-2">
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(profile.skills) ? profile.skills : []).map((skill, idx) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name;
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-medium shadow-2xs group transition-colors"
                    >
                      <span>{skillName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skillName)}
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-full p-0.5 transition-colors cursor-pointer"
                        title="Remove skill"
                        aria-label={`Remove ${skillName}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 4. PROJECTS & PORTFOLIO                                                    */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Featured Projects</h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSectionVisibility('projects')}
                  aria-label={profile.sectionVisibility?.projects !== false ? 'Hide section' : 'Show section'}
                  title={profile.sectionVisibility?.projects !== false ? 'Visible on card' : 'Hidden'}
                  className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    profile.sectionVisibility?.projects !== false
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {profile.sectionVisibility?.projects !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingProject(!isAddingProject)}
                  aria-label={isAddingProject ? 'Cancel' : 'New Project'}
                  title={isAddingProject ? 'Cancel' : 'New Project'}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingProject ? 'Cancel' : 'New Project'}</span>
                </button>
              </div>
            </div>

            {/* Add Project Form */}
            {isAddingProject && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-3 animate-in fade-in transition-colors">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add New Project</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="e.g. AI Workflow Canvas"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Live URL / Demo Link</label>
                    <input
                      type="url"
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 resize-none"
                      placeholder="Overview of features, architecture, and impact..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={newProject.tags}
                      onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="React, TypeScript, Tailwind"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Cover Image URL (optional)</label>
                    <input
                      type="text"
                      value={newProject.image}
                      onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingProject(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewProject}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-3">
              {(Array.isArray(profile.projects) ? profile.projects : []).map((proj) => (
                <div key={proj.id} className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs flex items-start justify-between gap-4 transition-colors">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img 
                      src={proj.image || proj.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop'} 
                      alt={proj.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{proj.title}</h4>
                        {(proj.link || proj.liveUrl) && (
                          <a href={proj.link || proj.liveUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">{proj.description}</p>
                      {proj.tags && proj.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proj.tags.map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Project"
                    aria-label="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {(!profile.projects || profile.projects.length === 0) && (
                <div className="p-8 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs text-center text-xs text-slate-500">
                  No projects added yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 5. EDUCATION & DEGREES                                                     */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Education & Degrees</h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSectionVisibility('education')}
                  aria-label={profile.sectionVisibility?.education !== false ? 'Hide section' : 'Show section'}
                  title={profile.sectionVisibility?.education !== false ? 'Visible on card' : 'Hidden'}
                  className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    profile.sectionVisibility?.education !== false
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {profile.sectionVisibility?.education !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingEducation(!isAddingEducation)}
                  aria-label={isAddingEducation ? 'Cancel' : 'Add Education'}
                  title={isAddingEducation ? 'Cancel' : 'Add Education'}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingEducation ? 'Cancel' : 'Add'}</span>
                </button>
              </div>
            </div>

            {isAddingEducation && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-3 animate-in fade-in transition-colors">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add Education</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Degree / Certificate</label>
                    <input
                      type="text"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="e.g. BS in Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Institution / University</label>
                    <input
                      type="text"
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="e.g. Stanford University"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Period / Dates</label>
                    <input
                      type="text"
                      value={newEducation.period}
                      onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="e.g. 2020 - 2024"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingEducation(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewEducation}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(Array.isArray(profile.education) ? profile.education : []).map((edu) => (
                <div key={edu.id} className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs flex items-center justify-between gap-4 transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{edu.institution}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{edu.degree} {edu.period ? `· ${edu.period}` : ''}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete"
                    aria-label="Delete Education"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 6. CONTACT INFO                                                            */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'contactInfo' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Contact Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Business Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Direct Telephone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                    placeholder="+1 555 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">WhatsApp Number</label>
                <div className="relative">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.whatsapp || ''}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                    placeholder="+15551234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                    placeholder="New York, NY"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 7. SOCIAL LINKS                                                            */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'socialLinks' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Social & Online Profiles</h3>
            
            <div className="space-y-3">
              {[
                { platform: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon, placeholder: 'https://linkedin.com/in/username' },
                { platform: 'github', label: 'GitHub', icon: GithubIcon, placeholder: 'https://github.com/username' },
                { platform: 'twitter', label: 'Twitter / X', icon: TwitterIcon, placeholder: 'https://x.com/username' },
                { platform: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' }
              ].map((item) => {
                const Icon = item.icon;
                const isVisible = isSocialVisible(item.platform);
                return (
                  <div key={item.platform} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center gap-3 transition-colors">
                    <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-24 shrink-0">{item.label}</span>
                    <input
                      type="url"
                      value={getSocialUrl(item.platform)}
                      onChange={(e) => updateSocialUrl(item.platform, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder={item.placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => toggleSocialVisibility(item.platform)}
                      title={isVisible ? "Link visible (Click to hide)" : "Link hidden (Click to show)"}
                      aria-label={isVisible ? `Hide ${item.label}` : `Show ${item.label}`}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                        isVisible
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                          : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 8. WORK EXPERIENCE                                                         */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Work Experience</h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSectionVisibility('experience')}
                  aria-label={profile.sectionVisibility?.experience !== false ? 'Hide section' : 'Show section'}
                  title={profile.sectionVisibility?.experience !== false ? 'Visible on card' : 'Hidden'}
                  className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    profile.sectionVisibility?.experience !== false
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {profile.sectionVisibility?.experience !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingExperience(!isAddingExperience)}
                  aria-label={isAddingExperience ? 'Cancel' : 'Add Experience'}
                  title={isAddingExperience ? 'Cancel' : 'Add Experience'}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingExperience ? 'Cancel' : 'Add'}</span>
                </button>
              </div>
            </div>

            {isAddingExperience && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-3 animate-in fade-in transition-colors">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add Work Experience</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={newExperience.company}
                      onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="e.g. Google, Meta, Startup"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Job Title</label>
                    <input
                      type="text"
                      value={newExperience.role}
                      onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="e.g. Lead Frontend Architect"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Period / Dates</label>
                    <input
                      type="text"
                      value={newExperience.period}
                      onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="e.g. 2022 - Present"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Location (optional)</label>
                    <input
                      type="text"
                      value={newExperience.location}
                      onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="e.g. Remote / London"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Responsibilities & Impact</label>
                    <textarea
                      rows={2}
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 resize-none"
                      placeholder="Key achievements, technologies used, leadership..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingExperience(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewExperience}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Save Experience
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(Array.isArray(profile.experiences) ? profile.experiences : []).map((exp) => (
                <div key={exp.id} className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs flex items-center justify-between gap-4 transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{exp.role || 'Role'}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{exp.company} {exp.period ? `· ${exp.period}` : ''}</p>
                    {exp.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400/80 mt-1 line-clamp-2">{exp.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete"
                    aria-label="Delete Experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 9. ENHANCE PROFILE & CUSTOM FIELDS                                         */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'enhanceProfile' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Custom Fields</h3>
              </div>

              {/* Add Custom Field Form */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Field Title</label>
                    <input
                      type="text"
                      value={newCustomFieldLabel}
                      onChange={(e) => setNewCustomFieldLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      placeholder="e.g. Publications, Tech Stack"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Content Type</label>
                    <select
                      value={newCustomFieldType}
                      onChange={(e) => setNewCustomFieldType(e.target.value as 'text' | 'markdown' | 'link')}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                    >
                      <option value="text">Plain Text</option>
                      <option value="markdown">Markdown / Rich</option>
                      <option value="link">Hyperlink</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Field Content</label>
                    <textarea
                      rows={2}
                      value={newCustomFieldValue}
                      onChange={(e) => setNewCustomFieldValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 resize-none"
                      placeholder="Enter custom content..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    aria-label="Add Field"
                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* List of Custom Fields */}
              <div className="space-y-2 pt-2">
                {(Array.isArray(profile.customFields) ? profile.customFields : []).map((cf) => (
                  <div key={cf.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{cf.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-mono uppercase">{cf.type || 'text'}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{cf.value}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCustomField(cf.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 cursor-pointer transition-colors ${
                          cf.visible !== false ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {cf.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-amber-500" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomField(cf.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Delete"
                        aria-label="Delete Custom Field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 10. PRIVACY & LIMITATIONS                                                  */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'limitations' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Visitor Privacy & Visibility</h3>
            
            <div className="space-y-3">
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
                  <div key={item.key} className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleSharingSetting(item.key)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isEnabled
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isEnabled ? 'Enabled' : 'Restricted'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 11. ACCOUNT INFO                                                           */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'accountInfo' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Account Overview</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs transition-colors">
                <span className="text-slate-600 dark:text-slate-400">Profile Identifier</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">{profile.slug || profile.id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs transition-colors">
                <span className="text-slate-600 dark:text-slate-400">User ID</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{profile.userId || 'Primary Account'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs transition-colors">
                <span className="text-slate-600 dark:text-slate-400">Profile Type</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{profile.type || 'Individual'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs transition-colors">
                <span className="text-slate-600 dark:text-slate-400">Verification</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 12. ARCHIVE & HIDDEN SECTIONS                                              */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'archive' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Archived Sections</h3>

            <div className="space-y-2">
              {Object.entries(profile.sectionVisibility || {})
                .filter(([, isVis]) => isVis === false)
                .map(([secKey]) => (
                  <div key={secKey} className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{secKey}</span>
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(secKey)}
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))}

              {(!profile.sectionVisibility || Object.values(profile.sectionVisibility).every(v => v !== false)) && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No hidden sections.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 13. SECURITY                                                               */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'security' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Security</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-start gap-3 transition-colors">
                <Shield className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">SSL Encrypted Profile</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">Your public profile card is delivered through an encrypted HTTPS connection with anti-tamper protections.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 flex items-start gap-3 transition-colors">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Public Visitor Sanitization</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">Restricted details (such as masked telephone or private notes) are stripped server-side before delivery to non-connected visitors.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* 14. SETTINGS                                                               */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {activeSection === 'settings' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">General Card Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Profile Identifier / Slug</label>
                <input
                  type="text"
                  value={profile.slug || ''}
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 font-mono"
                  placeholder="custom-slug"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <h4 className="text-xs font-bold text-rose-500 mb-2">Danger Zone</h4>
                <button
                  type="button"
                  onClick={() => showToast('Profile reset is disabled on production accounts.')}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Profile to Default
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* RIGHT: Live Interactive Phone Preview Column (Sticky Alongside Content)    */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {!hideRightPreview && (
        <aside className="w-[360px] xl:w-[390px] shrink-0 h-full border-l border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-[#060A14] flex flex-col items-center p-4 overflow-y-auto select-none scrollbar-thin transition-colors">
          <div className="w-full max-w-[340px] flex items-center justify-between px-3 py-1.5 mb-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-2xs">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Live Card Preview</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Synchronized
            </span>
          </div>

          <PhonePreview
            profile={liveProfile}
            isDark={isDark}
            canEdit={false}
            onOpenEdit={() => {}}
            onOpenShare={() => showToast('Share settings accessible in sidebar')}
            onOpenConnect={() => showToast('Connected!')}
            onSaveContact={() => showToast('Contact information saved!')}
            onSaveEdits={async (updated) => {
              setProfile(updated);
              showToast('Card updated!');
            }}
            hideHeaderLabel={true}
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
            }}
          />
        </aside>
      )}

    </div>
  );
}
