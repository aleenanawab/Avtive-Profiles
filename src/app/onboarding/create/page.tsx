'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Camera, 
  Loader2, 
  AlertCircle, 
  Plus, 
  X, 
  Globe, 
  Mail, 
  Phone, 
  MessageSquare,
  FolderGit2, 
  Trash2,
  Check
} from 'lucide-react';
import { ProfileType, ProfileTheme, ProjectItem, normalizeProfileType } from '@/types/profile';
import { GithubIcon, LinkedInIcon, TwitterXIcon } from '@/components/BrandIcons';
import { getThemeConfig } from '@/components/themeStyles';
import { motion } from 'framer-motion';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop'
];

function CreateProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = (searchParams.get('theme') as ProfileTheme) || 'editorial';
  const role = normalizeProfileType(searchParams.get('role') || 'individual');

  const themeConfig = getThemeConfig(theme);
  const themeIconColor = themeConfig.accentText || 'text-slate-800 dark:text-zinc-200';

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Identity state
  const [profileName, setProfileName] = useState(
    role === 'team' ? 'Team Profile' : 'Personal Profile'
  );
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [about, setAbout] = useState('');

  // Media
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);

  // Skills chips
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'proj-1',
      title: 'Portfolio Design System',
      description: 'Clean, modern digital profile UI architecture with responsive cards.',
      link: 'https://github.com',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop'
    }
  ]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectLink, setNewProjectLink] = useState('');

  // Socials
  const [whatsapp, setWhatsapp] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [portfolio, setPortfolio] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prepopulate from session if available
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const names = data.user.name?.split(' ') || [];
          if (!firstName) setFirstName(names[0] || 'My');
          if (!secondName) setSecondName(names.slice(1).join(' ') || 'Profile');
          if (!professionalTitle) {
            setProfessionalTitle(role === 'team' ? 'Team / Organization' : 'Full Stack Developer');
          }
          if (!company) {
            setCompany(role === 'team' ? data.user.name : 'Avtive');
          }
        }
      })
      .catch(() => {});
  }, [role]);

  // Handle local avatar file upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local cover banner file upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCoverImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle skill tag add
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  // Handle skill tag remove
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Handle project add
  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return;
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim() || 'Featured project showcase',
      link: newProjectLink.trim() || 'https://www.avtive.app',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop'
    };
    setProjects([...projects, newProj]);
    setNewProjectTitle('');
    setNewProjectDesc('');
    setNewProjectLink('');
    setIsAddingProject(false);
  };

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const fullName = `${firstName.trim()} ${secondName.trim()}`.trim() || 'My Profile';

    const socialsPayload = [
      ...(whatsapp ? [{ platform: 'whatsapp', url: whatsapp.trim(), label: 'WhatsApp' }] : []),
      ...(linkedin ? [{ platform: 'linkedin', url: linkedin.trim(), label: 'LinkedIn' }] : []),
      ...(github ? [{ platform: 'github', url: github.trim(), label: 'GitHub' }] : []),
      ...(twitter ? [{ platform: 'twitter', url: twitter.trim(), label: 'Twitter' }] : []),
      ...(portfolio ? [{ platform: 'website', url: portfolio.trim(), label: 'Website' }] : [])
    ];

    try {
      const res = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          firstName: firstName.trim(),
          secondName: secondName.trim(),
          lastName: secondName.trim(),
          profileName: profileName.trim(),
          professionalTitle: professionalTitle.trim(),
          designation: professionalTitle.trim(),
          company: company.trim(),
          bio: bio.trim(),
          shortBio: bio.trim(),
          about: about.trim(),
          fullBio: about.trim(),
          avatar,
          coverImage,
          theme,
          type: role,
          skills,
          projects,
          whatsapp: whatsapp.trim(),
          email: '',
          socials: socialsPayload,
          socialLinks: socialsPayload
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create profile. Please try again.');
        setIsLoading(false);
        return;
      }

      // Direct immediately to the editing profile page
      const targetSlug = data.profile?.slug || data.profile?.id;
      if (targetSlug) {
        router.push(`/profile/${targetSlug}/edit`);
      } else {
        router.push('/profile/edit');
      }
      router.refresh();
    } catch (err) {
      console.error('Profile creation error:', err);
      setErrorMessage('Network error while saving profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="figma-phone-frame w-full max-w-[430px] p-5 sm:p-6 flex flex-col justify-between relative text-left bg-white text-slate-900 border border-slate-200 shadow-xl dark:bg-[#111319] dark:text-white dark:border-white/10 rounded-3xl pb-8 transition-colors"
    >
      {/* Mobile Top Status Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-zinc-500 mb-3 px-1 font-mono">
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

      {/* Header & Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
        <button
          type="button"
          onClick={() => router.push(`/onboarding/role?theme=${theme}&role=${role}`)}
          className="p-1 -ml-1 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
          title="Back to role selection"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 font-mono">Step 3 of 3</span>
      </div>

      {/* Title */}
      <div className="space-y-1 mb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Create Full Profile</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Personalize your identity, skills, projects, and contact channels.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cover Photo with Top-Right Camera Icon */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
            Cover Banner
          </label>
          <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 group">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
              title="Change cover banner"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        </div>

        {/* Profile Picture Overlapping */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-zinc-800 shrink-0 shadow-xs">
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              title="Upload avatar"
            >
              <Camera className="w-3 h-3" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="space-y-1 flex-1">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              Persona Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. MERN Developer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/50 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* First & Second Name */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/50 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-all shadow-2xs"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Second Name</label>
            <input
              type="text"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
              placeholder="Last name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/50 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Professional Title & Company */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Title</label>
            <input
              type="text"
              required
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              placeholder="e.g. Lead Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/50 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-all shadow-2xs"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/50 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Short Bio</label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Headline bio..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/50 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-all shadow-2xs resize-none"
          />
        </div>

        {/* About Story */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">About Story</label>
          <textarea
            rows={3}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Detailed background and summary..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/50 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-all shadow-2xs resize-none"
          />
        </div>

        {/* Interactive Skills Chip Manager */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
            Skills Badges
          </label>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/10 shadow-2xs"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Type skill & press Enter"
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/50 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              Projects ({projects.length})
            </label>
            <button
              type="button"
              onClick={() => setIsAddingProject(!isAddingProject)}
              className="text-xs font-bold text-slate-900 dark:text-white hover:underline cursor-pointer"
            >
              {isAddingProject ? 'Cancel' : '+ Add Project'}
            </button>
          </div>

          {isAddingProject && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181A22] border border-slate-200 dark:border-white/15 space-y-2.5">
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Project title *"
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/40"
              />
              <input
                type="text"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Short description"
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/40"
              />
              <input
                type="url"
                value={newProjectLink}
                onChange={(e) => setNewProjectLink(e.target.value)}
                placeholder="Project URL (e.g. https://...)"
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-900 dark:focus:border-white/40"
              />
              <button
                type="button"
                onClick={handleAddProject}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity shadow-2xs cursor-pointer"
              >
                Save Project
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#181A22] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{proj.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{proj.description}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(proj.id)}
                  className="text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 p-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links: clean icon with theme color, no colored labels */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
            Social & Contact Links
          </label>
          <div className="space-y-2">
            {/* WhatsApp */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 focus-within:border-slate-900 dark:focus-within:border-white/50 focus-within:ring-1 focus-within:ring-slate-900/10 dark:focus-within:ring-white/20 transition-all shadow-2xs">
              <MessageSquare className={`w-4 h-4 shrink-0 ${themeIconColor}`} />
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="https://..."
                title="WhatsApp Link or Number"
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            {/* LinkedIn */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 focus-within:border-slate-900 dark:focus-within:border-white/50 focus-within:ring-1 focus-within:ring-slate-900/10 dark:focus-within:ring-white/20 transition-all shadow-2xs">
              <LinkedInIcon className={`w-4 h-4 shrink-0 ${themeIconColor}`} />
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://..."
                title="LinkedIn Profile URL"
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            {/* GitHub */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 focus-within:border-slate-900 dark:focus-within:border-white/50 focus-within:ring-1 focus-within:ring-slate-900/10 dark:focus-within:ring-white/20 transition-all shadow-2xs">
              <GithubIcon className={`w-4 h-4 shrink-0 ${themeIconColor}`} />
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://..."
                title="GitHub Profile URL"
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            {/* Twitter / X */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 focus-within:border-slate-900 dark:focus-within:border-white/50 focus-within:ring-1 focus-within:ring-slate-900/10 dark:focus-within:ring-white/20 transition-all shadow-2xs">
              <TwitterXIcon className={`w-4 h-4 shrink-0 ${themeIconColor}`} />
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://..."
                title="Twitter / X Profile URL"
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            {/* Portfolio / Website */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181A22] border border-slate-300 dark:border-white/15 focus-within:border-slate-900 dark:focus-within:border-white/50 focus-within:ring-1 focus-within:ring-slate-900/10 dark:focus-within:ring-white/20 transition-all shadow-2xs">
              <Globe className={`w-4 h-4 shrink-0 ${themeIconColor}`} />
              <input
                type="text"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://..."
                title="Portfolio or Website URL"
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button: Create Profile -> /dashboard */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <span>Create Profile & Continue to My Profiles &rarr;</span>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default function CreateProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold text-slate-500 dark:text-zinc-400">Loading profile setup...</div>}>
      <CreateProfileContent />
    </Suspense>
  );
}
