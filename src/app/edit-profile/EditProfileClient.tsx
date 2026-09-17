'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Reorder, useDragControls } from 'framer-motion';
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
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Smartphone,
  Layers,
  Tag
} from 'lucide-react';
import { 
  ProfileData, 
  ProfileTheme, 
  ProfileType, 
  ProjectItem, 
  ExperienceItem, 
  EducationItem,
  SharingSettings,
  CustomFieldItem,
  DynamicSection,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY
} from '@/types/profile';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';
import { LinkedInIcon, GithubIcon, TwitterIcon, WhatsAppIcon } from '@/components/BrandIcons';
import { PhonePreview } from '@/components/PhonePreview';

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

interface DraggableLinkItem {
  id: string;
  platform: 'github' | 'linkedin' | 'website' | 'twitter' | 'whatsapp' | 'other';
  title: string;
  url: string;
  visible: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero & Identity Header',
  about: 'Bio & About Section',
  contact: 'Contact & Quick Actions',
  'custom-fields': 'Custom Fields',
  services: 'Services & Offerings',
  skills: 'Skills Badges',
  projects: 'Projects & Portfolio',
  experience: 'Work Experience',
  education: 'Education & Credentials',
  certifications: 'Certifications',
  volunteer: 'Volunteer Experience',
  languages: 'Languages Spoken',
  recommendations: 'Endorsements & Recommendations',
  'virtual-card': 'Digital Identity Card',
  company: 'Company / Team Overview'
};

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

function buildSocialLinksFromProfile(p: ProfileData): DraggableLinkItem[] {
  const safeSocials = (Array.isArray(p.socials) && p.socials.length > 0)
    ? p.socials
    : (Array.isArray(p.socialLinks) && p.socialLinks.length > 0)
    ? p.socialLinks
    : null;

  if (safeSocials && safeSocials.length > 0) {
    return safeSocials.map((s: any, idx: number) => {
      const platform = (s.platform || 'website') as DraggableLinkItem['platform'];
      return {
        id: `link-${platform}-${idx}`,
        platform,
        title: s.label || (platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Link'),
        url: s.url || '',
        visible: s.visible !== false
      };
    });
  }

  return [
    {
      id: 'link-li-0',
      platform: 'linkedin',
      title: 'LinkedIn',
      url: 'https://linkedin.com',
      visible: true
    },
    {
      id: 'link-gh-1',
      platform: 'github',
      title: 'GitHub',
      url: 'https://github.com',
      visible: true
    },
    {
      id: 'link-web-2',
      platform: 'website',
      title: 'Website / Portfolio',
      url: p.website || 'https://avtive.app',
      visible: true
    }
  ];
}

function DraggableLinkCard({
  link,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: {
  link: DraggableLinkItem;
  index: number;
  total: number;
  onUpdate: (updated: Partial<DraggableLinkItem>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const dragControls = useDragControls();

  const renderIcon = () => {
    switch (link.platform) {
      case 'github':
        return <GithubIcon className="w-4 h-4 text-zinc-900 dark:text-white" />;
      case 'linkedin':
        return <LinkedInIcon className="w-4 h-4 text-blue-500" />;
      case 'twitter':
        return <TwitterIcon className="w-4 h-4 text-sky-500" />;
      case 'whatsapp':
        return <WhatsAppIcon className="w-4 h-4 text-emerald-500" />;
      case 'website':
      default:
        return <Globe className="w-4 h-4 text-slate-500 dark:text-white/60" />;
    }
  };

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
      {/* Drag Handle */}
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-grab active:cursor-grabbing shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Accessible Move Arrows */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20"
          title="Move up"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20"
          title="Move down"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>

      {/* Platform Icon */}
      <div className="shrink-0 w-6 flex items-center justify-center">
        {renderIcon()}
      </div>

      {/* URL Input */}
      <div className="flex-1 min-w-0">
        <input
          type="url"
          value={link.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder={`https://${link.platform}.com/...`}
          className="figma-input w-full px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
        />
      </div>

      {/* Visibility Toggle */}
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

      {/* Delete button */}
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
        title="Remove link"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </Reorder.Item>
  );
}

export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Active Profile State
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme === 'default' ? 'editorial' : (initialProfile.theme || 'editorial')
  );
  const [isDark, setIsDark] = useState(false);
  const [mobileViewTab, setMobileViewTab] = useState<'editor' | 'preview'>('editor');

  // 1. Basic Info
  const [firstName, setFirstName] = useState(
    initialProfile.firstName || (initialProfile.name ? initialProfile.name.split(' ')[0] : 'Aleena')
  );
  const [secondName, setSecondName] = useState(
    initialProfile.secondName || initialProfile.lastName || (initialProfile.name ? initialProfile.name.split(' ').slice(1).join(' ') : 'Nawab')
  );
  const [username, setUsername] = useState(
    initialProfile.username || initialProfile.slug || ''
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

  // 8. Dynamic Custom Fields (Unlimited, completely dynamic)
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>(() =>
    Array.isArray(initialProfile.customFields) ? initialProfile.customFields : []
  );

  // 9. Dynamic Sections
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>(() =>
    Array.isArray(initialProfile.dynamicSections) ? initialProfile.dynamicSections : []
  );

  // 10. Section Ordering & Independent Section Visibility (Stored Separately!)
  const [sectionOrder, setSectionOrder] = useState<string[]>(() =>
    Array.isArray(initialProfile.sectionOrder) && initialProfile.sectionOrder.length > 0
      ? initialProfile.sectionOrder
      : DEFAULT_SECTION_ORDER
  );

  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>(() =>
    initialProfile.sectionVisibility && Object.keys(initialProfile.sectionVisibility).length > 0
      ? initialProfile.sectionVisibility
      : DEFAULT_SECTION_VISIBILITY
  );

  // 11. In-Page Sharing & Visibility Controls (No Popups)
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
    customFields: true,
    sectionsLayout: true,
    share: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Custom Fields Handlers (Completely dynamic, unlimited fields)
  const handleAddCustomField = () => {
    const newField: CustomFieldItem = {
      id: `cf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: 'New Custom Field',
      value: '',
      type: 'text',
      visible: true,
      order: customFields.length
    };
    setCustomFields((prev) => [...prev, newField]);
  };

  const handleUpdateCustomField = (id: string, patch: Partial<CustomFieldItem>) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMoveCustomField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= customFields.length) return;
    const copy = [...customFields];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setCustomFields(copy);
  };

  // Section Reorder and Independent Visibility Handlers
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;
    const copy = [...sectionOrder];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setSectionOrder(copy);
  };

  const handleToggleSectionVisibility = (sectionKey: string) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === false ? true : false
    }));
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

  // Toggle Visibility in Share Section
  const toggleVisibilityField = (field: keyof SharingSettings) => {
    setSharingSettings((prev) => ({
      ...prev,
      [field]: prev[field] === false ? true : false
    }));
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
    username: username.trim(),
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
    customFields,
    dynamicSections,
    sectionOrder,
    sectionVisibility,
    sharingSettings: sharingSettings
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
    setUsername(newProf.username || newProf.slug || '');
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

    // Custom Fields
    setCustomFields(Array.isArray(newProf.customFields) ? newProf.customFields : []);

    // Dynamic Sections
    setDynamicSections(Array.isArray(newProf.dynamicSections) ? newProf.dynamicSections : []);

    // Section Order & Visibility
    if (Array.isArray(newProf.sectionOrder) && newProf.sectionOrder.length > 0) {
      setSectionOrder(newProf.sectionOrder);
    }
    if (newProf.sectionVisibility && Object.keys(newProf.sectionVisibility).length > 0) {
      setSectionVisibility(newProf.sectionVisibility);
    }

    // Sharing Settings
    if (newProf.sharingSettings) {
      setSharingSettings(newProf.sharingSettings);
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
      username: username.trim().replace(/^@/, ''),
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
      customFields,
      dynamicSections,
      sectionOrder,
      sectionVisibility,
      sharingSettings: sharingSettings
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
    <div className="w-full max-w-7xl mx-auto flex flex-col font-sans">
      
      {/* Mobile Mode Switcher (< lg screens) */}
      <div className="lg:hidden flex items-center justify-between pb-4 px-2">
        <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-zinc-800 border border-slate-300/50 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setMobileViewTab('editor')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mobileViewTab === 'editor'
                ? 'bg-white dark:bg-[#111319] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            ✏️ Edit Profile
          </button>
          <button
            type="button"
            onClick={() => setMobileViewTab('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mobileViewTab === 'preview'
                ? 'bg-white dark:bg-[#111319] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            📱 Live Preview
          </button>
        </div>

        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Realtime
        </span>
      </div>

      {/* Main Responsive Split: Left Original Editor + Right Sticky Live Mobile Preview */}
      <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-8 xl:gap-12 px-2 sm:px-4">
        
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                        Username / URL Handle
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-semibold text-slate-400 dark:text-white/40 select-none">
                          @
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                          placeholder="username"
                          className="figma-input w-full pl-7 pr-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-white/40 mt-1">
                        Your direct card URL: <span className="font-mono text-slate-600 dark:text-white/60">avtive.app/profile/{username || 'username'}</span>
                      </p>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

              {/* SECTION 6: CUSTOM FIELDS (Unlimited & Dynamic) */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <div className="w-full p-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSection('customFields')}
                    className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 transition-colors cursor-pointer"
                  >
                    <Tag className="w-4 h-4 text-purple-500" />
                    <span>6. Custom Fields ({customFields.length})</span>
                    {expandedSections.customFields ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                </div>

                {expandedSections.customFields && (
                  <div className="p-4 pt-0 space-y-3 border-t border-slate-200 dark:border-white/5">
                    <p className="text-[11px] text-slate-500 dark:text-white/50 mb-2">
                      Add any custom data, contact channels, IDs, or portfolio links to your card. No fixed limit.
                    </p>

                    {customFields.length === 0 ? (
                      <div className="text-center py-5 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                        <Tag className="w-6 h-6 text-slate-400 dark:text-white/30 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-500 dark:text-white/50 mb-2">No custom fields yet</p>
                        <button
                          type="button"
                          onClick={handleAddCustomField}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
                        >
                          + Create First Field
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {customFields.map((field, idx) => (
                          <div
                            key={field.id}
                            className={`p-3 rounded-xl bg-white dark:bg-white/5 border transition-all flex flex-col gap-2 shadow-2xs ${
                              field.visible !== false
                                ? 'border-slate-200 dark:border-white/10'
                                : 'border-slate-200/50 dark:border-white/5 opacity-60 bg-slate-50/50 dark:bg-black/20'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveCustomField(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveCustomField(idx, 'down')}
                                  disabled={idx === customFields.length - 1}
                                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => handleUpdateCustomField(field.id, { label: e.target.value })}
                                  placeholder="Field Label (e.g. Discord, Calendly)"
                                  className="figma-input w-full px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
                                />
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                                    value={field.value}
                                    onChange={(e) => handleUpdateCustomField(field.id, { value: e.target.value })}
                                    placeholder="Value or Link..."
                                    className="figma-input flex-1 px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40"
                                  />
                                  <select
                                    value={field.type || 'text'}
                                    onChange={(e) => handleUpdateCustomField(field.id, { type: e.target.value as any })}
                                    className="figma-input px-2 py-1.5 text-[11px] bg-slate-50 dark:bg-[#191c25] focus:outline-hidden"
                                    title="Field Type"
                                  >
                                    <option value="text">Text</option>
                                    <option value="link">Link</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCustomField(field.id, { visible: field.visible === false ? true : false })}
                                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                                    field.visible !== false
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                      : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/40'
                                  }`}
                                  title={field.visible !== false ? 'Visible on profile' : 'Hidden from profile'}
                                >
                                  {field.visible !== false ? 'ON' : 'OFF'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomField(field.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                                  title="Delete Field"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 7: SECTIONS ORDERING & LAYOUT (Order and Visibility Stored Separately!) */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection('sectionsLayout')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>7. Sections & Drag/Drop Layout ({sectionOrder.length})</span>
                  </div>
                  {expandedSections.sectionsLayout ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>

                {expandedSections.sectionsLayout && (
                  <div className="p-4 pt-0 space-y-2 border-t border-slate-200 dark:border-white/5">
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-[11px] text-indigo-900 dark:text-indigo-300">
                      <strong>Independent Persistence:</strong> Section ordering and visibility are saved separately. Reordering sections will not alter their visibility, and toggling visibility preserves the custom order after reload.
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {sectionOrder.map((sectionKey, idx) => {
                        const isVisible = sectionVisibility[sectionKey] !== false;
                        const label = SECTION_LABELS[sectionKey] || (sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1));

                        return (
                          <div
                            key={sectionKey}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                              isVisible
                                ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-2xs'
                                : 'bg-slate-100/50 dark:bg-black/20 border-slate-200/50 dark:border-white/5 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-white/40 w-4 text-center">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Reorder Up / Down */}
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                                  title="Move section up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(idx, 'down')}
                                  disabled={idx === sectionOrder.length - 1}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                                  title="Move section down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Visibility Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleSectionVisibility(sectionKey)}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                  isVisible
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/40'
                                }`}
                                title={isVisible ? 'Visible on profile' : 'Hidden from profile'}
                              >
                                {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                <span>{isVisible ? 'SHOWN' : 'HIDDEN'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 8: IN-PAGE SHARE & VISIBILITY CONTROLS (NO POPUPS) */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#1B1E28] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection('share')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-500" />
                    <span>8. Share Profile & Visibility Controls</span>
                  </div>
                  {expandedSections.share ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </button>

                {expandedSections.share && (
                  <div className="p-4 pt-1 space-y-4 border-t border-slate-200 dark:border-white/5">
                    
                    {/* Share Link Box */}
                    <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-slate-700 dark:text-white/80 truncate">
                        {publicProfileUrl}
                      </span>
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

                    {/* What do you want to show? */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
                        What do you want to show on your public profile?
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { key: 'photo' as const, label: 'Profile Photo' },
                          { key: 'nameAndTitle' as const, label: 'Name & Title' },
                          { key: 'bio' as const, label: 'Bio & About' },
                          { key: 'skills' as const, label: 'Skills Badges' },
                          { key: 'projects' as const, label: 'Projects' },
                          { key: 'socialLinks' as const, label: 'Social Links' },
                          { key: 'experience' as const, label: 'Experience' },
                          { key: 'education' as const, label: 'Education' },
                          { key: 'email' as const, label: 'Direct Email' },
                          { key: 'phone' as const, label: 'Phone Number' }
                        ].map((field) => {
                          const isChecked = sharingSettings[field.key] !== false;
                          return (
                            <button
                              key={field.key}
                              type="button"
                              onClick={() => toggleVisibilityField(field.key)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all text-left cursor-pointer ${
                                isChecked
                                  ? 'bg-white dark:bg-white/10 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white shadow-2xs'
                                  : 'bg-slate-100/50 dark:bg-black/20 border-slate-200/60 dark:border-white/5 text-slate-400 dark:text-white/40 opacity-70'
                              }`}
                            >
                              <span>{field.label}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isChecked
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                              }`}>
                                {isChecked ? 'ON' : 'OFF'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Save Changes Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 px-4 sm:px-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <Link
                href={`/profile/${profile.slug || profile.id || initialProfile.slug || initialProfile.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="figma-pill-secondary py-2 px-4 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
                title="Open public profile view in a new tab"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Profile</span>
              </Link>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="figma-pill-primary py-2.5 px-6 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: Persistent Live Mobile Preview */}
        <aside className={`w-full lg:w-[370px] xl:w-[390px] shrink-0 lg:sticky lg:top-8 flex flex-col items-center justify-center transition-all ${
          mobileViewTab === 'preview' ? 'block' : 'hidden lg:flex'
        }`}>
          <PhonePreview profile={liveProfile} isDark={isDark} />
        </aside>

      </div>
    </div>
  );
}
