'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ProfileData, 
  ProfileTheme 
} from '@/types/profile';
import { AvtiveDigitalCard } from '@/components/AvtiveDigitalCard';
import { PhonePreview } from '@/components/PhonePreview';
import { DynamicSectionGroups, ALL_PROFILE_SECTIONS } from '@/components/sections/DynamicSectionGroups';

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme === 'default' ? 'editorial' : (initialProfile.theme || 'editorial')
  );
  const [isDark, setIsDark] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(true); // Open by default for Linktree sliding editing experience
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Guard: Active session check on mount, focus, visibilitychange, and pageshow (to prevent stale state after logout)
  useEffect(() => {
    const verifyActiveSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!data.user) {
          window.location.replace('/login');
        }
      } catch {
        window.location.replace('/login');
      }
    };

    verifyActiveSession();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        verifyActiveSession();
      }
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        verifyActiveSession();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

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

  // 4. Projects (Inline editing, zero popups)
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
  const [isInlineProjectOpen, setIsInlineProjectOpen] = useState(false);
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

  // 7. Draggable Social Links (Framer Motion Reorder)
  const [socialLinks, setSocialLinks] = useState<DraggableLinkItem[]>(() =>
    buildSocialLinksFromProfile(initialProfile)
  );

  // 8. In-Page Sharing & Visibility Controls (No Popups)
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>(
    initialProfile.sharingSettings || {
      photo: true,
      nameAndTitle: true,
      bio: true,
      skills: true,
      projects: true,
      experience: true,
      education: true,
      socialLinks: true,
      email: false,
      phone: false
    }
  );

  // 9. Dynamic Section Order for Visible and Hidden Groups
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    if (initialProfile.sectionOrder && Array.isArray(initialProfile.sectionOrder) && initialProfile.sectionOrder.length > 0) {
      return initialProfile.sectionOrder;
    }
    return ALL_PROFILE_SECTIONS.map((s) => s.id);
  });
  const [copySuccess, setCopySuccess] = useState(false);

  // UI / Upload States
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
    socials: true,
    share: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Sync Full Name
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

  // Inline Project Handlers (NO POPUPS)
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: '',
      description: '',
      tags: '',
      link: '',
      image: ''
    });
    setIsInlineProjectOpen(true);
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
    setIsInlineProjectOpen(true);
  };

  const handleSaveInlineProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    const tagsArray = projectForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                title: projectForm.title.trim(),
                description: projectForm.description.trim(),
                tags: tagsArray,
                link: projectForm.link.trim(),
                image: projectForm.image.trim() || p.image,
                coverImage: projectForm.image.trim() || p.coverImage
              }
            : p
        )
      );
    } else {
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

    setIsInlineProjectOpen(false);
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

  // Drag-and-drop Link Handlers
  const handleUpdateLink = (id: string, patch: Partial<DraggableLinkItem>) => {
    setSocialLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const handleDeleteLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= socialLinks.length) return;
    const copy = [...socialLinks];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setSocialLinks(copy);
  };

  const handleAddLinkItem = (platform: DraggableLinkItem['platform']) => {
    const newLink: DraggableLinkItem = {
      id: `link-${Date.now()}`,
      platform,
      title: platform === 'other' ? 'Custom Link' : platform.charAt(0).toUpperCase() + platform.slice(1),
      url: 'https://',
      visible: true
    };
    setSocialLinks((prev) => [...prev, newLink]);
  };

  // Instant Eye Toggle between Visible & Hidden Section Groups
  const handleInstantToggleSection = (sectionId: string, makeVisible: boolean) => {
    const def = ALL_PROFILE_SECTIONS.find((s) => s.id === sectionId);
    if (!def) return;

    // 1. Immediately update sharingSettings for instant Live Preview
    setSharingSettings((prev) => ({
      ...prev,
      [def.key]: makeVisible
    }));

    // 2. Immediately update sectionOrder to place newly visible at the end of visible or vice versa
    setSectionOrder((prev) => {
      const without = prev.filter((id) => id !== sectionId);
      return [...without, sectionId];
    });
  };

  // 1-Click Copy Public URL
  const currentActiveIdentifier = profile.slug || profile.id || initialProfile.slug || initialProfile.id;
  const publicProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${currentActiveIdentifier}`
    : `https://avtive.app/profile/${currentActiveIdentifier}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  // Compute Live Profile State for Instant Reactivity
  const activeSocialsPayload = socialLinks
    .filter((s) => s.visible && s.url.trim())
    .map((s) => ({ platform: s.platform as any, url: s.url, label: s.title }));

  const liveProfile: ProfileData = {
    ...profile,
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
    socials: activeSocialsPayload,
    socialLinks: activeSocialsPayload,
    sharingSettings: sharingSettings,
    sectionOrder: sectionOrder
  };

  // Switch to another profile in-place (ZERO POPUPS / ZERO REDIRECTS)
  const handleSwitchToProfile = (newProf: ProfileData) => {
    setProfile(newProf);
    setActiveTheme(newProf.theme === 'default' ? 'editorial' : (newProf.theme || 'editorial'));
    
    // Basic Info
    const fName = newProf.firstName || (newProf.name ? newProf.name.split(' ')[0] : '');
    const lName = newProf.secondName || newProf.lastName || (newProf.name ? newProf.name.split(' ').slice(1).join(' ') : '');
    setFirstName(fName);
    setSecondName(lName);
    setProfessionalTitle(newProf.professionalTitle || newProf.designation || newProf.profession || '');
    setBio(newProf.bio || newProf.shortBio || '');
    setCompany(newProf.company || '');
    setLocation(newProf.location || '');
    setAvatar(newProf.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop');
    setCoverImage(newProf.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop');
    
    // Skills
    const skillsList = Array.isArray(newProf.skills)
      ? newProf.skills.map((s) => (typeof s === 'string' ? s : s.name))
      : ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'];
    setSkills(skillsList);

    // About
    setAbout(newProf.about || newProf.fullBio || '');

    // Projects
    const projectsList = Array.isArray(newProf.projects) ? newProf.projects : [];
    setProjects(projectsList);

    // Experience
    const expList = Array.isArray(newProf.experiences || newProf.experience)
      ? (newProf.experiences || newProf.experience || [])
      : [];
    setExperiences(expList);

    // Education
    const eduList = Array.isArray(newProf.education) ? newProf.education : [];
    setEducation(eduList);

    // Social Links strictly preserving saved order
    setSocialLinks(buildSocialLinksFromProfile(newProf));

    // Sharing Settings & Section Order
    if (newProf.sharingSettings) {
      setSharingSettings(newProf.sharingSettings);
    }
    if (newProf.sectionOrder && Array.isArray(newProf.sectionOrder) && newProf.sectionOrder.length > 0) {
      setSectionOrder(newProf.sectionOrder);
    } else {
      setSectionOrder(ALL_PROFILE_SECTIONS.map((s) => s.id));
    }

    setStatusMessage({
      type: 'success',
      text: `✓ Switched to profile: ${newProf.profileName || newProf.name}`
    });
    setTimeout(() => {
      setStatusMessage((prev) => (prev?.type === 'success' ? null : prev));
    }, 3500);
  };

  // Save All Changes to Server
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setStatusMessage(null);

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
      socials: activeSocialsPayload,
      socialLinks: activeSocialsPayload,
      sharingSettings: sharingSettings,
      sectionOrder: sectionOrder
    };

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id || initialProfile.id,
          profileSlug: profile.slug || initialProfile.slug,
          slug: profile.slug || initialProfile.slug,
          userId: profile.userId || initialProfile.userId,
          updatedData
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save changes.' });
        setIsSaving(false);
        return;
      }

      const savedSlug = data.updatedProfile?.slug || data.profile?.slug || profile.slug || initialProfile.slug || initialProfile.id;
      const finalProfile: ProfileData = data.updatedProfile || data.profile || { ...profile, ...updatedData, slug: savedSlug };
      setProfile(finalProfile);

      // Cache locally
      try {
        localStorage.setItem(`avtive_profile_${savedSlug}`, JSON.stringify(finalProfile));
        if (initialProfile.slug) {
          localStorage.setItem(`avtive_profile_${initialProfile.slug}`, JSON.stringify(finalProfile));
        }
        localStorage.setItem('avtive_last_saved_profile', JSON.stringify(finalProfile));
      } catch (e) {
        console.error('Failed to cache profile in localStorage:', e);
      }

      // STRICT ZERO REDIRECT: Keep editor and live mobile preview active on the same screen!
      setStatusMessage({ 
        type: 'success', 
        text: '✓ Profile saved successfully! Live mobile preview updated.' 
      });
      setTimeout(() => {
        setStatusMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 4000);
    } catch (err: any) {
      console.error('Save changes error:', err);
      setStatusMessage({ type: 'error', text: 'Network error while saving changes.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      data-theme={activeTheme}
      className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-all duration-300 font-sans ${isEditorOpen ? 'lg:pl-[540px] xl:pl-[580px]' : ''}`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Studio Bar */}
      <header className="sticky top-[53px] z-30 w-full bg-white/85 dark:bg-[#0B0D13]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors py-2 px-2.5 sm:px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Back Link & Device View Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/profile/${identifier}`}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs shrink-0"
              title="Return to Public Profile"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Profile</span>
            </Link>

      {/* Main Responsive Split: Left Original Editor + Right Sticky Live Mobile Preview */}
      <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-8 xl:gap-12">
        
        {/* LEFT SIDE: Original Editor UI */}
        <div className={`w-full lg:flex-1 lg:max-w-[580px] xl:max-w-[620px] transition-all ${
          mobileViewTab === 'editor' ? 'block' : 'hidden lg:block'
        }`}>
          <div className="w-full bg-white dark:bg-[#111319] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl text-slate-900 dark:text-white font-sans transition-all pb-10 relative">
            
            {/* 1. Header / Cover Area */}
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img
                src={coverImage}
                alt="Cover Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#111319] via-transparent to-black/30" />

              {/* Top Status Bar: 9:41 */}
              <div className="absolute top-2 left-0 right-0 z-30 px-5 py-1 flex items-center justify-between text-xs font-semibold text-white/90 font-mono drop-shadow">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
                    <div className="w-full h-full bg-current rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Top Left Navigation Back */}
              <div className="absolute top-8 left-4 z-20">
                <Link
                  href={`/profile/${currentActiveIdentifier}`}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                  title="Back to Public Profile"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>

              {/* Top Right: Persona Switcher & Cover Edit Icon */}
              <div className="absolute top-8 right-4 z-20 flex items-center gap-2">
                <ProfileSwitcher 
                  currentProfileIdOrSlug={profile.slug || profile.id || initialProfile.slug || initialProfile.id} 
                  initialProfiles={userProfiles}
                  onSelectProfile={handleSwitchToProfile}
                />

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

            {/* 2. Profile Avatar & Identity Header (Original Clean Layout, Zero Clutter) */}
            <div className="px-6 relative -mt-12 text-center flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full border-4 border-white dark:border-[#111319] shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
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

              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {fullName || 'Aleena Nawab'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-white/60 font-medium pb-2">
                {professionalTitle || 'Full Stack Engineer'}
              </p>
            </div>

            {/* Status Messages */}
            {statusMessage && (
              <div className="px-5 mb-3">
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              </div>
            )}

            {/* 3. Accordion Form Sections */}
            <div className="px-5 space-y-4">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection('basicInfo')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600 dark:text-white/70" />
                    <span>1. Basic Information</span>
                  </div>
                  {expandedSections.basicInfo ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>

                {expandedSections.basicInfo && (
                  <div className="p-4 pt-1 space-y-3 border-t border-slate-200 dark:border-white/5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                          className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={secondName}
                          onChange={(e) => setSecondName(e.target.value)}
                          placeholder="Last Name"
                          className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        value={professionalTitle}
                        onChange={(e) => setProfessionalTitle(e.target.value)}
                        placeholder="e.g. Full Stack Engineer"
                        className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">
                        Short Bio
                      </label>
                      <textarea
                        rows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="A concise, punchy overview of your focus and skills..."
                        className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Company"
                          className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Location"
                          className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
                        />
                      </div>
                    </div>

                    {/* Card Theme Preset Picker */}
                    <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1.5">
                        Card Theme Preset
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
                                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white shadow-xs font-bold'
                                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30'
                              }`}
                            >
                              <div className="text-xs truncate">{t.name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: SKILLS */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection('skills')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-slate-600 dark:text-white/70" />
                    <span>2. Skills & Badges ({skills.length})</span>
                  </div>
                  {expandedSections.skills ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>

                {expandedSections.skills && (
                  <div className="p-4 pt-1 space-y-3 border-t border-slate-200 dark:border-white/5">
                    <form onSubmit={handleAddSkill} className="flex gap-2">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        placeholder="Add skill (e.g. Docker, GraphQL, Figma)..."
                        className="figma-input flex-1 px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
                      />
                      <button
                        type="submit"
                        className="figma-pill-primary px-3 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 text-xs font-medium text-slate-800 dark:text-white shadow-2xs"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: ABOUT */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection('about')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600 dark:text-white/70" />
                    <span>3. About & Philosophy</span>
                  </div>
                  {expandedSections.about ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>

                {expandedSections.about && (
                  <div className="p-4 pt-1 space-y-2 border-t border-slate-200 dark:border-white/5">
                    <textarea
                      rows={4}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Share your detailed career journey, philosophy, achievements, or project specialties..."
                      className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 leading-relaxed resize-none"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 4: PROJECTS (Inline Editor, Zero Popups) */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <div className="w-full p-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSection('projects')}
                    className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 transition-colors cursor-pointer"
                  >
                    <FolderGit2 className="w-4 h-4 text-slate-600 dark:text-white/70" />
                    <span>4. Projects ({projects.length})</span>
                    {expandedSections.projects ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" />}
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
                  <div className="p-4 pt-0 space-y-3 border-t border-slate-200 dark:border-white/5">
                    
                    {/* Inline Project Add/Edit Form (Zero Popups) */}
                    {isInlineProjectOpen && (
                      <form onSubmit={handleSaveInlineProject} className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/20 space-y-2.5 shadow-sm">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {editingProject ? 'Edit Project' : 'New Project'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsInlineProjectOpen(false)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={projectForm.title}
                            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                            placeholder="Project Title"
                            className="figma-input w-full px-2.5 py-1.5 text-xs font-semibold"
                            required
                          />
                        </div>

                        <div>
                          <textarea
                            rows={2}
                            value={projectForm.description}
                            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                            placeholder="Project Description"
                            className="figma-input w-full px-2.5 py-1.5 text-xs resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="url"
                            value={projectForm.link}
                            onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                            placeholder="Live URL (https://...)"
                            className="figma-input w-full px-2.5 py-1.5 text-xs"
                          />
                          <input
                            type="text"
                            value={projectForm.tags}
                            onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                            placeholder="Tags (comma separated)"
                            className="figma-input w-full px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsInlineProjectOpen(false)}
                            className="px-3 py-1 text-xs text-slate-600 dark:text-white/60 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="figma-pill-primary px-3 py-1 text-xs font-bold"
                          >
                            Save Project
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Projects List */}
                    {projects.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400 dark:text-white/40">
                        No projects added yet. Click &quot;Add Project&quot; above.
                      </div>
                    ) : (
                      projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 hover:bg-slate-100/80 dark:hover:bg-white/[0.08] transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={proj.image || proj.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop'}
                              alt={proj.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-900"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{proj.title}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-white/60 line-clamp-1">{proj.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProject(proj)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white cursor-pointer"
                              title="Edit Project"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-500/15 dark:bg-white/10 dark:hover:bg-rose-500/20 text-slate-700 hover:text-rose-600 dark:text-white/80 dark:hover:text-rose-400 cursor-pointer"
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

              {/* SECTION 5: DRAGGABLE SOCIAL LINKS (Reorder with Framer Motion) */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <div className="w-full p-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSection('socials')}
                    className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 transition-colors cursor-pointer"
                  >
                    <Link2 className="w-4 h-4 text-slate-600 dark:text-white/70" />
                    <span>5. Social Links & Ordering ({socialLinks.length})</span>
                    {expandedSections.socials ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" />}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddLinkItem('twitter')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
                      title="Add Twitter / X"
                    >
                      + X
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLinkItem('whatsapp')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
                      title="Add WhatsApp"
                    >
                      + WhatsApp
                    </button>
                  </div>
                </div>

                {expandedSections.socials && (
                  <div className="p-4 pt-0 space-y-2 border-t border-slate-200 dark:border-white/5">
                    <p className="text-[11px] text-slate-500 dark:text-white/50 mb-2 flex items-center gap-1">
                      <GripVertical className="w-3 h-3" />
                      Drag handles or click arrows to reorder. Live preview updates instantly.
                    </p>

                    <Reorder.Group
                      axis="y"
                      values={socialLinks}
                      onReorder={setSocialLinks}
                      className="space-y-2"
                    >
                      {socialLinks.map((link, idx) => (
                        <DraggableLinkCard
                          key={link.id}
                          link={link}
                          index={idx}
                          total={socialLinks.length}
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

              {/* SECTION 6: SECTION LAYOUT & DYNAMIC VISIBILITY GROUPS */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection('share')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-500" />
                    <span>6. Section Layout &amp; Dynamic Visibility Groups</span>
                  </div>
                  {expandedSections.share ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>

                {expandedSections.share && (
                  <div className="p-4 pt-1 space-y-5 border-t border-slate-200 dark:border-white/5">
                    
                    {/* Share Link Box */}
                    <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-white/40 mb-0.5 font-mono">
                          Public Profile Pass Link
                        </span>
                        <span className="text-xs font-mono text-slate-700 dark:text-white/80 truncate block">
                          {publicProfileUrl}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                          copySuccess
                            ? 'bg-emerald-600 text-white'
                            : 'figma-pill-primary'
                        }`}
                      >
                        {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>

                    {/* Dynamic Section Groups: Visible & Hidden with Dual Drag-and-Drop & Instant Eye-Toggle */}
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

            {/* Save Changes Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 px-5 flex items-center justify-between gap-3">
              <Link
                href={`/profile/${profile.slug || profile.id || initialProfile.slug || initialProfile.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="figma-pill-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shrink-0"
                title="Open public profile view in a new tab"
              >
                <Monitor className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  deviceView === 'mobile'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Right: Studio Status & Toggle Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Interactive Canvas
            </span>

            <button
              type="button"
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs cursor-pointer shrink-0 ${
                isEditorOpen
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                  : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700'
              }`}
              title={isEditorOpen ? 'Collapse Editor Panel' : 'Open Sliding Editor'}
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span>{isEditorOpen ? 'Editor Open' : 'Edit Profile'}</span>
            </button>

            <Link
              href={`/profile/${identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs shrink-0"
              title="Open public profile in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">View Live</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Live Preview Canvas */}
      {deviceView === 'mobile' ? (
        <main className="flex-1 w-full mx-auto px-4 py-6 sm:py-8 flex justify-center items-start transition-all duration-300">
          {/* Smartphone Chassis on Tablet/Desktop */}
          <div className="hidden sm:block">
            <PhonePreview
              profile={{ ...profile, theme: activeTheme }}
              isDark={isDark}
              canEdit={true}
              onOpenEdit={() => setIsEditorOpen(true)}
              onOpenShare={() => showToast('Share settings accessible in editor panel')}
              onOpenConnect={() => showToast('Connected!')}
              onSaveContact={() => showToast('Contact information saved!')}
              onSaveEdits={async (updated) => {
                setProfile(updated);
                showToast('Changes updated!');
              }}
              onSelectTeamMember={(member) => {
                const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                router.push(`/profile/${slug}`);
              }}
              onViewCompany={() => {
                if (profile.companyId) {
                  router.push(`/profile/${profile.companyId}`);
                }
              }}
              hideHeaderLabel={true}
            />
          </div>

          {/* Full-Width Mobile View on Small Screens (< sm) */}
          <div className="sm:hidden w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <AvtiveDigitalCard
              profile={{ ...profile, theme: activeTheme }}
              canEdit={true}
              isEditing={false}
              isConnected={false}
              onOpenEdit={() => setIsEditorOpen(true)}
              onCancelEdit={() => {}}
              onSaveEdits={async (updated) => {
                setProfile(updated);
                showToast('Changes updated!');
              }}
              onSaveContact={() => showToast('Contact information saved!')}
              onOpenShare={() => showToast('Share settings accessible in editor panel')}
              onOpenConnect={() => showToast('Connected!')}
              onOpenQRModal={() => {}}
              onOpenResumeModal={() => {}}
              onSelectProject={() => {}}
              onSelectTeamMember={(member) => {
                const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                router.push(`/profile/${slug}`);
              }}
              onViewCompany={() => {
                if (profile.companyId) {
                  router.push(`/profile/${profile.companyId}`);
                }
              }}
              isDark={isDark}
              viewMode="standard"
            />
          </div>
        </main>
      ) : (
        /* Full Desktop Profile Card Viewport */
        <main className="flex-1 w-full mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 flex justify-center transition-all duration-300 max-w-4xl lg:max-w-5xl">
          <div className="w-full bg-white dark:bg-[#18181B] sm:rounded-3xl sm:border border-slate-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <AvtiveDigitalCard
              profile={{ ...profile, theme: activeTheme }}
              canEdit={true}
              isEditing={false}
              isConnected={false}
              onOpenEdit={() => setIsEditorOpen(true)}
              onCancelEdit={() => {}}
              onSaveEdits={async (updated) => {
                setProfile(updated);
                showToast('Changes updated!');
              }}
              onSaveContact={() => showToast('Contact information saved!')}
              onOpenShare={() => showToast('Share settings accessible in editor panel')}
              onOpenConnect={() => showToast('Connected!')}
              onOpenQRModal={() => {}}
              onOpenResumeModal={() => {}}
              onSelectProject={() => {}}
              onSelectTeamMember={(member) => {
                const slug = member.profileId === 'individual' ? 'syedmesumraza' : member.profileId === 'team-member' ? 'hamza-malik' : member.id;
                router.push(`/profile/${slug}`);
              }}
              onViewCompany={() => {
                if (profile.companyId) {
                  router.push(`/profile/${profile.companyId}`);
                }
              }}
              isDark={isDark}
              viewMode="standard"
            />
          </div>
        </main>
      )}

      {/* Floating Action Pill to Reopen Editor when Collapsed */}
      {!isEditorOpen && (
        <button
          type="button"
          onClick={() => setIsEditorOpen(true)}
          className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 backdrop-blur-md shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-bold border border-white/20 dark:border-slate-300/40 cursor-pointer group"
          title="Open sliding profile editor"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse group-hover:scale-125 transition-transform" />
          <Edit3 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>Edit Profile</span>
        </button>
      )}

      {/* Linktree-inspired Sliding Editing Panel */}
      <SlidingEditorPanel
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialProfile={profile}
        userProfiles={userProfiles}
        onLiveUpdate={(updated) => {
          setProfile(updated);
          if (updated.theme && updated.theme !== activeTheme) {
            setActiveTheme(updated.theme);
          }
        }}
        onSaveSuccess={(saved) => {
          setProfile(saved);
          if (saved.theme) {
            setActiveTheme(saved.theme);
          }
          showToast('✓ Profile saved successfully!');
        }}
      />
    </div>
  );
}
