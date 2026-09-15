'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Camera, 
  Pencil, 
  Plus, 
  X, 
  Share2, 
  UserPlus, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Trash2, 
  FolderGit2, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FileText, 
  Link2, 
  Globe, 
  Eye, 
  CheckCircle2
} from 'lucide-react';
import { 
  ProfileData, 
  ProfileTheme, 
  ProfileType, 
  ProjectItem, 
  ExperienceItem, 
  EducationItem 
} from '@/types/profile';
import { ShareModal } from '@/components/share/ShareModal';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

const THEME_OPTIONS: { id: ProfileTheme; name: string; thumbnailBg: string; border: string; accent: string }[] = [
  {
    id: 'editorial',
    name: 'Editorial Minimal',
    thumbnailBg: 'bg-[#FAFAF9]',
    border: 'border-stone-200',
    accent: 'text-amber-500'
  },
  {
    id: 'cyber',
    name: 'Developer Terminal',
    thumbnailBg: 'bg-[#09090B]',
    border: 'border-zinc-800',
    accent: 'text-emerald-400'
  },
  {
    id: 'luxe',
    name: 'Luxe Velvet',
    thumbnailBg: 'bg-[#180D15]',
    border: 'border-rose-900/40',
    accent: 'text-rose-400'
  }
];

export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Active Profile State
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme === 'default' ? 'editorial' : (initialProfile.theme || 'editorial')
  );

  // 1. Basic Info
  const [firstName, setFirstName] = useState(
    initialProfile.firstName || (initialProfile.name ? initialProfile.name.split(' ')[0] : 'Aleena')
  );
  const [secondName, setSecondName] = useState(
    initialProfile.secondName || initialProfile.lastName || (initialProfile.name ? initialProfile.name.split(' ').slice(1).join(' ') : 'Nawab')
  );
  const [professionalTitle, setProfessionalTitle] = useState(
    initialProfile.professionalTitle || initialProfile.designation || initialProfile.profession || 'Full Stack Engineer'
  );
  const [bio, setBio] = useState(
    initialProfile.bio || initialProfile.shortBio || 'Passionate professional delivering intuitive digital experiences with modern technology and clean architecture.'
  );
  const [company, setCompany] = useState(initialProfile.company || 'Avtive');
  const [location, setLocation] = useState(initialProfile.location || 'Global');

  // Images
  const [avatar, setAvatar] = useState(
    initialProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
  );
  const [coverImage, setCoverImage] = useState(
    initialProfile.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'
  );

  // 2. Skills
  const initialSkillsList: string[] = Array.isArray(initialProfile.skills)
    ? initialProfile.skills.map((s) => (typeof s === 'string' ? s : s.name))
    : ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'];
  const [skills, setSkills] = useState<string[]>(initialSkillsList);
  const [newSkillInput, setNewSkillInput] = useState('');

  // 3. About
  const [about, setAbout] = useState(
    initialProfile.about || initialProfile.fullBio || 'Hello! I am a full stack software engineer and product designer specializing in high-performance web applications, responsive user interfaces, and modular design systems. I bridge the gap between design and engineering to build products that delight users and scale seamlessly.'
  );

  // 4. Projects
  const initialProjectsList: ProjectItem[] = Array.isArray(initialProfile.projects) && initialProfile.projects.length > 0
    ? initialProfile.projects
    : [
        {
          id: 'proj-1',
          title: 'Avtive Profiles Platform',
          description: 'Verified digital identity cards and granular privacy profiles built with Next.js and Tailwind CSS.',
          tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
          link: 'https://www.avtive.app',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
          category: 'Web App'
        }
      ];
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjectsList);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tags: '',
    link: '',
    image: ''
  });

  // 5. Experience
  const initialExpList: ExperienceItem[] = Array.isArray(initialProfile.experiences || initialProfile.experience)
    ? (initialProfile.experiences || initialProfile.experience || [])
    : [];
  const [experiences, setExperiences] = useState<ExperienceItem[]>(initialExpList);

  // 6. Education
  const initialEduList: EducationItem[] = Array.isArray(initialProfile.education)
    ? initialProfile.education
    : [];
  const [education, setEducation] = useState<EducationItem[]>(initialEduList);

  // 7. Social Links
  const safeSocials = Array.isArray(initialProfile.socials) ? initialProfile.socials : [];
  const safeSocialLinks = Array.isArray(initialProfile.socialLinks) ? initialProfile.socialLinks : [];
  const [githubUrl, setGithubUrl] = useState(
    safeSocials.find((s) => s.platform === 'github')?.url || 
    safeSocialLinks.find((s) => s.platform === 'github')?.url || ''
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    safeSocials.find((s) => s.platform === 'linkedin')?.url || 
    safeSocialLinks.find((s) => s.platform === 'linkedin')?.url || ''
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    safeSocials.find((s) => s.platform === 'website')?.url || 
    initialProfile.website || ''
  );

  // Modals & UI States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Accordion Section Toggle State
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    skills: true,
    about: true,
    projects: true,
    experience: false,
    education: false,
    socials: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev [section] }));
  };

  // Sync Name
  const fullName = `${firstName} ${secondName}`.trim();

  // Skills Handlers
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Project Modal Handlers
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: '',
      description: '',
      tags: '',
      link: '',
      image: ''
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (p: ProjectItem) => {
    setEditingProject(p);
    setProjectForm({
      title: p.title,
      description: p.description,
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      link: p.link || p.liveUrl || '',
      image: p.image || p.coverImage || ''
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    const tagsArray = projectForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProject) {
      // Update existing
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                title: projectForm.title.trim(),
                description: projectForm.description.trim(),
                tags: tagsArray,
                link: projectForm.link.trim(),
                image: projectForm.image.trim() || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
                coverImage: projectForm.image.trim()
              }
            : p
        )
      );
    } else {
      // Add new
      const newProj: ProjectItem = {
        id: `proj-${Date.now()}`,
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        tags: tagsArray,
        link: projectForm.link.trim(),
        image: projectForm.image.trim() || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
        coverImage: projectForm.image.trim(),
        category: 'Project'
      };
      setProjects((prev) => [newProj, ...prev]);
    }

    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Upload Cover Image
  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Upload Avatar Image
  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setAvatar(data.url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save All Changes to Server
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const socialsPayload = [
      githubUrl ? { platform: 'github' as const, url: githubUrl, label: 'GitHub' } : null,
      linkedinUrl ? { platform: 'linkedin' as const, url: linkedinUrl, label: 'LinkedIn' } : null,
      websiteUrl ? { platform: 'website' as const, url: websiteUrl, label: 'Website' } : null
    ].filter(Boolean) as any[];

    const updatedData: Partial<ProfileData> = {
      name: fullName,
      firstName: firstName.trim(),
      secondName: secondName.trim(),
      lastName: secondName.trim(),
      professionalTitle: professionalTitle.trim(),
      designation: professionalTitle.trim(),
      profession: professionalTitle.trim(),
      bio: bio.trim(),
      shortBio: bio.trim(),
      about: about.trim(),
      fullBio: about.trim(),
      company: company.trim(),
      location: location.trim(),
      theme: activeTheme,
      avatar,
      coverImage,
      skills,
      projects,
      experience: experiences,
      experiences: experiences,
      education,
      socials: socialsPayload,
      socialLinks: socialsPayload.map((s) => ({ platform: s.platform, url: s.url, label: s.label }))
    };

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: initialProfile.id,
          updatedData
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save changes.' });
        setIsSaving(false);
        return;
      }

      const savedSlug = data.updatedProfile?.slug || profile.slug || initialProfile.slug || initialProfile.id;
      setProfile(data.updatedProfile || { ...profile, ...updatedData });
      setStatusMessage({ type: 'success', text: '✓ Changes saved successfully!' });
      setTimeout(() => {
        router.push(`/profile/${savedSlug}`);
        router.refresh();
      }, 500);
    } catch (err: any) {
      console.error('Save changes error:', err);
      setStatusMessage({ type: 'error', text: 'Network error while saving changes.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto bg-[#111319] border border-white/10 rounded-3xl overflow-hidden shadow-2xl text-white font-sans transition-all pb-12 relative">
      
      {/* 1. Header / Cover Area */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={coverImage}
          alt="Cover Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-black/30 to-black/50" />

        {/* Top Status Bar: 9:41 */}
        <div className="absolute top-2 left-0 right-0 z-30 px-5 py-1 flex items-center justify-between text-xs font-semibold text-white/90 font-mono drop-shadow">
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

        {/* Top Left Navigation Back */}
        <div className="absolute top-8 left-4 z-20">
          <Link
            href={`/profile/${initialProfile.slug || initialProfile.id}`}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            title="Back to Public Profile"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Top Right: Persona Switcher & Cover Edit Icon */}
        <div className="absolute top-8 right-4 z-20 flex items-center gap-2">
          {/* Persona Switcher Dropdown */}
          <ProfileSwitcher 
            currentProfileIdOrSlug={initialProfile.slug || initialProfile.id} 
            initialProfiles={userProfiles}
          />

          {/* Cover Edit Button */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            title="Change Cover Image"
          >
            {isUploadingCover ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

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
      </div>

      {/* 2. Avatar & Direct Action Buttons (Screen 5) */}
      <div className="px-6 relative -mt-12 text-center flex flex-col items-center">
        <div className="relative w-22 h-22 rounded-full border-3 border-[#111319] shadow-xl overflow-hidden bg-slate-800 shrink-0">
          <img
            src={avatar}
            alt={fullName}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Change Profile Photo"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        </div>

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

        <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
          {fullName || 'Aleena Nawab'}
        </h2>
        <p className="text-xs text-white/60 font-medium pb-2">
          {professionalTitle || 'Full Stack Engineer'}
        </p>
      </div>

      {/* Alert / Feedback Toast */}
      {statusMessage && (
        <div className={`mx-6 mt-4 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 3. Collapsible / Stacked Accordion Sections */}
      <div className="p-6 space-y-4">
        
        {/* SECTION 1: BASIC INFO */}
        <div className="rounded-2xl bg-[#1B1E28] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('basicInfo')}
            className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-white/70" />
              <span>1. Basic Info</span>
            </div>
            {expandedSections.basicInfo ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </button>

          {expandedSections.basicInfo && (
            <div className="p-4 pt-1 space-y-3.5 border-t border-white/5">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/70 ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/70 ml-1">
                    Second Name
                  </label>
                  <input
                    type="text"
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    placeholder="Second Name"
                    className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70 ml-1">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder="e.g. Senior MERN Developer"
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/70 ml-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Avtive Inc."
                    className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/70 ml-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco / Remote"
                    className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70 ml-1">
                  Short Bio (Headline Summary)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short elevator pitch for cards"
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40 resize-none"
                />
              </div>

              {/* Theme Picker */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-medium text-white/70 ml-1">
                  Theme Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((t) => {
                    const isSelected = activeTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTheme(t.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/10 border-white ring-1 ring-white/30 text-white'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-white/60'
                        }`}
                      >
                        <div className="text-[10px] font-bold truncate">{t.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: SKILLS (Tag Input with Add/Remove Chips) */}
        <div className="rounded-2xl bg-[#1B1E28] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('skills')}
            className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-white/70" />
              <span>2. Skills ({skills.length})</span>
            </div>
            {expandedSections.skills ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </button>

          {expandedSections.skills && (
            <div className="p-4 pt-1 space-y-3 border-t border-white/5">
              {/* Add Skill Input Form */}
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="e.g. Next.js, Figma, Python"
                  className="figma-input flex-1 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                />
                <button
                  type="submit"
                  className="figma-pill-primary px-3.5 py-2 text-xs font-bold shrink-0 cursor-pointer"
                >
                  + Add
                </button>
              </form>

              {/* Skills Badges / Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/15"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-400 transition-colors cursor-pointer p-0.5"
                      title={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: ABOUT (Rich / Multiline Text) */}
        <div className="rounded-2xl bg-[#1B1E28] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('about')}
            className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-white/70" />
              <span>3. About (Long-form Story)</span>
            </div>
            {expandedSections.about ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </button>

          {expandedSections.about && (
            <div className="p-4 pt-1 space-y-2 border-t border-white/5">
              <textarea
                rows={5}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Share your detailed career journey, philosophy, achievements, or project specialties..."
                className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40 leading-relaxed resize-none"
              />
              <div className="text-right text-[10px] text-white/40">
                {about.length} characters
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: PROJECTS (Card List with Add/Edit Modal) */}
        <div className="rounded-2xl bg-[#1B1E28] border border-white/10 overflow-hidden">
          <div className="w-full p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleSection('projects')}
              className="flex items-center gap-2 font-bold text-sm text-white hover:text-white/80 transition-colors cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 text-white/70" />
              <span>4. Projects ({projects.length})</span>
              {expandedSections.projects ? <ChevronUp className="w-4 h-4 text-white/50 ml-1" /> : <ChevronDown className="w-4 h-4 text-white/50 ml-1" />}
            </button>

            <button
              type="button"
              onClick={handleOpenAddProject}
              className="figma-pill-primary px-3 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Project</span>
            </button>
          </div>

          {expandedSections.projects && (
            <div className="p-4 pt-0 space-y-2.5 border-t border-white/5">
              {projects.length === 0 ? (
                <div className="text-center py-4 text-xs text-white/40">
                  No projects added yet. Click &quot;Add Project&quot; above.
                </div>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:bg-white/[0.08] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={proj.image || proj.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop'}
                        alt={proj.title}
                        className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0 bg-slate-900"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{proj.title}</h4>
                        <p className="text-[11px] text-white/60 line-clamp-1">{proj.description}</p>
                        {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 overflow-hidden">
                            {proj.tags.slice(0, 3).map((t) => (
                              <span key={t} className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/80 font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditProject(proj)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white cursor-pointer"
                        title="Edit Project"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-white/80 hover:text-rose-400 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* SECTION 5: SOCIAL LINKS */}
        <div className="rounded-2xl bg-[#1B1E28] border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('socials')}
            className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-white/70" />
              <span>5. Social Links</span>
            </div>
            {expandedSections.socials ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </button>

          {expandedSections.socials && (
            <div className="p-4 pt-1 space-y-2.5 border-t border-white/5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70 ml-1">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70 ml-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70 ml-1">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 4. Sticky Bottom Save Changes Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-[#0B0F17]/90 backdrop-blur-lg border-t border-white/10 flex items-center justify-center">
        <div className="w-full max-w-[430px] flex items-center gap-3">
          <Link
            href={`/profile/${initialProfile.slug || initialProfile.id}`}
            className="figma-pill-secondary py-3 px-5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="figma-pill-primary flex-1 py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5. ADD / EDIT PROJECT MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#181B24] border border-white/10 p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g. AI Portfolio Dashboard"
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="What problem did it solve? Key technical achievements..."
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70">Technologies / Tags (comma separated)</label>
                <input
                  type="text"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                  placeholder="React, Next.js, Node.js"
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70">Project URL / Link</label>
                <input
                  type="url"
                  value={projectForm.link}
                  onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                  placeholder="https://myproject.com"
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/70">Image / Screenshot URL</label>
                <input
                  type="url"
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="figma-input w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="figma-pill-secondary flex-1 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="figma-pill-primary flex-1 py-2.5 text-xs font-bold cursor-pointer shadow-md"
                >
                  {editingProject ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MULTI-STEP SHARE MODAL (Triggered by Share button below avatar) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        userProfiles={userProfiles}
        onUpdateProfile={(updated) => setProfile(updated)}
      />

    </div>
  );
}
