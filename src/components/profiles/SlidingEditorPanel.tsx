'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  X,
  Camera,
  Pencil,
  Plus,
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
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle2,
  Smartphone,
  Layers,
  Tag,
  Share2,
  Palette,
  Sparkles,
  SlidersHorizontal,
  Building2,
  Phone,
  Mail,
  RotateCcw
} from 'lucide-react';
import {
  ProfileData,
  ProfileTheme,
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

export interface SlidingEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
  onLiveUpdate?: (updatedProfile: ProfileData) => void;
  onSaveSuccess?: (savedProfile: ProfileData) => void;
}

interface DraggableLinkItem {
  id: string;
  platform: 'github' | 'linkedin' | 'website' | 'twitter' | 'whatsapp' | 'other';
  title: string;
  url: string;
  visible: boolean;
}

const SECTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  hero: { label: 'Hero & Identity Header', icon: User, color: 'text-blue-500' },
  about: { label: 'Bio & About Section', icon: FileText, color: 'text-amber-500' },
  contact: { label: 'Contact & Quick Actions', icon: Phone, color: 'text-emerald-500' },
  'custom-fields': { label: 'Custom Fields', icon: Tag, color: 'text-purple-500' },
  services: { label: 'Services & Offerings', icon: Briefcase, color: 'text-indigo-500' },
  skills: { label: 'Skills Badges', icon: Code, color: 'text-cyan-500' },
  projects: { label: 'Projects & Portfolio', icon: FolderGit2, color: 'text-rose-500' },
  experience: { label: 'Work Experience', icon: Briefcase, color: 'text-orange-500' },
  education: { label: 'Education & Credentials', icon: GraduationCap, color: 'text-violet-500' },
  certifications: { label: 'Certifications', icon: CheckCircle2, color: 'text-teal-500' },
  volunteer: { label: 'Volunteer Experience', icon: Sparkles, color: 'text-pink-500' },
  languages: { label: 'Languages Spoken', icon: Globe, color: 'text-blue-400' },
  recommendations: { label: 'Endorsements & Recommendations', icon: Sparkles, color: 'text-yellow-500' },
  'virtual-card': { label: 'Digital Identity Card', icon: Smartphone, color: 'text-sky-500' },
  company: { label: 'Company / Team Overview', icon: Building2, color: 'text-slate-500' }
};

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
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"
          title="Move up"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"
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
        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0 cursor-pointer"
        title="Remove link"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </Reorder.Item>
  );
}

function DraggableSectionItem({
  sectionKey,
  label,
  icon: Icon,
  iconColor,
  isVisible,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: {
  sectionKey: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={sectionKey}
      id={sectionKey}
      dragListener={false}
      dragControls={dragControls}
      layout
      layoutId={`section-item-${sectionKey}`}
      className={`group px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 transition-all select-none cursor-default ${
        isVisible
          ? 'bg-white dark:bg-white/5 border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-slate-300 dark:hover:border-white/20'
          : 'bg-slate-100/50 dark:bg-black/25 border-dashed border-slate-200/60 dark:border-white/5 opacity-70'
      }`}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        zIndex: 50,
        background: isVisible ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.4)'
      }}
    >
      {/* Left: Drag Handle + Section Icon + Section Name */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Drag Handle – clearly styled so users know it's draggable */}
        <button
          type="button"
          onPointerDown={(e) => dragControls.start(e)}
          className="p-1 -ml-1 rounded-md text-slate-300 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-grab active:cursor-grabbing shrink-0 transition-all group/handle"
          title="Drag to rearrange section order"
          aria-label="Drag handle"
        >
          <GripVertical className="w-4 h-4 group-hover/handle:text-indigo-500 dark:group-hover/handle:text-indigo-400 transition-colors" />
        </button>

        {/* Small Section Icon */}
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            isVisible
              ? 'bg-slate-100 dark:bg-white/10'
              : 'bg-slate-200/50 dark:bg-white/5'
          }`}
        >
          <Icon className={`w-3.5 h-3.5 ${isVisible ? iconColor : 'text-slate-400 dark:text-zinc-500'}`} />
        </div>

        {/* Section Name */}
        <span
          className={`text-xs font-medium truncate transition-colors ${
            isVisible
              ? 'text-slate-900 dark:text-zinc-100 font-semibold'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
        >
          {label}
        </span>
      </div>

      {/* Right Controls: Micro Up/Down Arrows + Eye Visibility Control */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Subtle Up/Down arrows for non-mouse or keyboard accessibility */}
        <div className="hidden sm:flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
            title="Move up"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
            title="Move down"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>

        {/* Eye Visibility Control */}
        <button
          type="button"
          onClick={onToggleVisibility}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            isVisible
              ? 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5'
          }`}
          title={isVisible ? 'Visible – click to hide' : 'Hidden – click to show'}
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
        >
          {isVisible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
      </div>
    </Reorder.Item>
  );
}

function DraggableCustomFieldItem({
  field,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: {
  field: CustomFieldItem;
  index: number;
  total: number;
  onUpdate: (patch: Partial<CustomFieldItem>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const dragControls = useDragControls();
  const isVisible = field.visible !== false;
  const isMultiLine = field.type === 'markdown' || (field.value && field.value.includes('\n'));

  return (
    <Reorder.Item
      value={field}
      id={field.id}
      dragListener={false}
      dragControls={dragControls}
      layout
      layoutId={`custom-field-item-${field.id}`}
      className={`p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-white/5 border transition-all flex flex-col gap-2.5 shadow-2xs ${
        isVisible
          ? 'border-slate-200 dark:border-white/10'
          : 'border-slate-200/50 dark:border-white/5 opacity-60 bg-slate-50/50 dark:bg-black/20'
      }`}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        zIndex: 50,
        background: isVisible ? 'rgba(255,255,255,0.98)' : 'rgba(0,0,0,0.5)'
      }}
    >
      {/* Top row: Drag Handle + Move Arrows + Field # + Eye Toggle + Delete */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Drag Handle */}
          <button
            type="button"
            onPointerDown={(e) => dragControls.start(e)}
            className="p-1 -ml-1 rounded-md text-slate-300 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-grab active:cursor-grabbing shrink-0 transition-all group/handle"
            title="Drag to rearrange custom field order"
            aria-label="Drag handle"
          >
            <GripVertical className="w-4 h-4 group-hover/handle:text-purple-500 transition-colors" />
          </button>

          {/* Micro Up/Down Arrows */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"
              title="Move Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"
              title="Move Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 font-mono">
            #{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Eye Visibility Control */}
          <button
            type="button"
            onClick={() => onUpdate({ visible: !isVisible })}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isVisible
                ? 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5'
            }`}
            title={isVisible ? 'Visible on profile (click to hide)' : 'Hidden from profile (click to show)'}
            aria-label={isVisible ? 'Hide custom field' : 'Show custom field'}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Delete custom field"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inputs: Field Title & Format */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
            Field Title
          </label>
          <input
            type="text"
            value={field.label || (field as any).title || ''}
            onChange={(e) => onUpdate({ label: e.target.value, title: e.target.value } as any)}
            placeholder="e.g. Publications, Office Hours, Discord"
            className="figma-input w-full px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-purple-400 dark:focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
            Format / Type
          </label>
          <select
            value={field.type || 'text'}
            onChange={(e) => onUpdate({ type: e.target.value as any })}
            className="figma-input w-full px-2 py-1.5 text-[11px] bg-slate-50 dark:bg-[#191c25] focus:outline-hidden cursor-pointer"
            title="Field Format"
          >
            <option value="text">Text</option>
            <option value="markdown">Paragraph / Note</option>
            <option value="link">Link (URL)</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>

      {/* Field Content */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
          Field Content
        </label>
        {field.type === 'markdown' || isMultiLine ? (
          <textarea
            rows={3}
            value={field.value || (field as any).content || ''}
            onChange={(e) => onUpdate({ value: e.target.value, content: e.target.value } as any)}
            placeholder="Enter field content, description, details, or multiline text..."
            className="figma-input w-full px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-400 dark:focus:ring-purple-400 resize-y leading-relaxed"
          />
        ) : (
          <input
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            value={field.value || (field as any).content || ''}
            onChange={(e) => onUpdate({ value: e.target.value, content: e.target.value } as any)}
            placeholder={
              field.type === 'link'
                ? 'https://...'
                : field.type === 'email'
                ? 'contact@domain.com'
                : field.type === 'phone'
                ? '+1 (555) 000-0000'
                : 'Enter field content, value, or link...'
            }
            className="figma-input w-full px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-400 dark:focus:ring-purple-400"
          />
        )}
      </div>
    </Reorder.Item>
  );
}

export function SlidingEditorPanel({
  isOpen,
  onClose,
  initialProfile,
  userProfiles,
  onLiveUpdate,
  onSaveSuccess
}: SlidingEditorPanelProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    initialProfile.about || initialProfile.fullBio || 'Hello! I am a full stack software engineer and product designer specializing in high-performance web applications, responsive user interfaces, and modular design systems.'
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
  const [isInlineProjectOpen, setIsInlineProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tags: '',
    link: '',
    image: ''
  });

  // 5. Experience & Education
  const initialExpList: ExperienceItem[] = Array.isArray(initialProfile.experiences || initialProfile.experience)
    ? (initialProfile.experiences || initialProfile.experience || [])
    : [];
  const [experiences, setExperiences] = useState<ExperienceItem[]>(initialExpList);

  const initialEduList: EducationItem[] = Array.isArray(initialProfile.education)
    ? initialProfile.education
    : [];
  const [education, setEducation] = useState<EducationItem[]>(initialEduList);

  // 6. Draggable Social Links
  const [socialLinks, setSocialLinks] = useState<DraggableLinkItem[]>(() =>
    buildSocialLinksFromProfile(initialProfile)
  );

  // 7. Dynamic Custom Fields
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>(() =>
    Array.isArray(initialProfile.customFields) ? initialProfile.customFields : []
  );

  // 8. Dynamic Sections
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>(() =>
    Array.isArray(initialProfile.dynamicSections) ? initialProfile.dynamicSections : []
  );

  // 9. Section Ordering & Independent Section Visibility
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

  // 10. Sharing & Visibility Controls
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
    socials: true,
    customFields: true,
    sectionsLayout: false,
    share: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (sectionKey: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: true }));
    const el = document.getElementById(`section-${sectionKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Full Name
  const fullName = `${firstName} ${secondName}`.trim();

  // Compute Live Profile & notify parent in real-time
  const activeSocialsPayload = socialLinks
    .filter((s) => s.visible && s.url.trim())
    .map((s) => ({ platform: s.platform as any, url: s.url, label: s.title }));

  const currentLiveProfile: ProfileData = {
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

  // Trigger onLiveUpdate on any field change
  useEffect(() => {
    onLiveUpdate?.(currentLiveProfile);
  }, [
    firstName,
    secondName,
    username,
    professionalTitle,
    bio,
    about,
    company,
    location,
    activeTheme,
    avatar,
    coverImage,
    skills,
    projects,
    socialLinks,
    customFields,
    sectionOrder,
    sectionVisibility,
    sharingSettings
  ]);

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

  // Inline Project Handlers
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

  // Upload Handlers
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

  // Custom Fields Handlers
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

    // Ensure 'custom-fields' is in sectionOrder and visible so changes immediately reflect in the preview
    setSectionOrder((prev) => {
      if (!prev.includes('custom-fields')) {
        return [...prev, 'custom-fields'];
      }
      return prev;
    });
    setSectionVisibility((prev) => ({
      ...prev,
      'custom-fields': true
    }));
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

  // Section Ordering & Visibility Handlers
  // Sections are split into visible/hidden groups for independent DnD
  const visibleSections = sectionOrder.filter((k) => sectionVisibility[k] !== false);
  const hiddenSections = sectionOrder.filter((k) => sectionVisibility[k] === false);

  // Called when user reorders items within the Visible group
  const handleReorderVisible = (newVisible: string[]) => {
    // Merge: visible items (new order) + hidden items (appended after)
    setSectionOrder([...newVisible, ...hiddenSections]);
  };

  // Called when user reorders items within the Hidden group
  const handleReorderHidden = (newHidden: string[]) => {
    setSectionOrder([...visibleSections, ...newHidden]);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down', group: 'visible' | 'hidden') => {
    const list = group === 'visible' ? visibleSections : hiddenSections;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const copy = [...list];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    if (group === 'visible') {
      setSectionOrder([...copy, ...hiddenSections]);
    } else {
      setSectionOrder([...visibleSections, ...copy]);
    }
  };

  const handleToggleSectionVisibility = (sectionKey: string) => {
    const isCurrentlyVisible = sectionVisibility[sectionKey] !== false;
    setSectionVisibility((prev) => ({
      ...prev,
      [sectionKey]: !isCurrentlyVisible
    }));
    // Move the section to end of target group in the order array
    setSectionOrder((prev) => {
      const without = prev.filter((k) => k !== sectionKey);
      if (isCurrentlyVisible) {
        // Moving to hidden: append after last hidden item (= end of array)
        return [...without, sectionKey];
      } else {
        // Moving to visible: insert before the first hidden item
        const firstHiddenIdx = without.findIndex((k) => {
          // after removing sectionKey, check current visibility of each
          // Use latest sectionVisibility (prev state snapshot may lag)
          return sectionVisibility[k] === false && k !== sectionKey;
        });
        if (firstHiddenIdx === -1) {
          return [...without, sectionKey];
        }
        const result = [...without];
        result.splice(firstHiddenIdx, 0, sectionKey);
        return result;
      }
    });
  };



  // Toggle Visibility in Share Section
  const toggleVisibilityField = (field: keyof SharingSettings) => {
    setSharingSettings((prev) => ({
      ...prev,
      [field]: prev[field] === false ? true : false
    }));
  };

  // Copy Profile Link
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

  // Switch persona in-place
  const handleSwitchToProfile = (newProf: ProfileData) => {
    setProfile(newProf);
    setActiveTheme(newProf.theme === 'default' ? 'editorial' : (newProf.theme || 'editorial'));
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
    
    const skillsList = Array.isArray(newProf.skills)
      ? newProf.skills.map((s) => (typeof s === 'string' ? s : s.name))
      : ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'];
    setSkills(skillsList);
    setAbout(newProf.about || newProf.fullBio || '');
    setProjects(Array.isArray(newProf.projects) ? newProf.projects : []);
    setExperiences(Array.isArray(newProf.experiences || newProf.experience) ? (newProf.experiences || newProf.experience || []) : []);
    setEducation(Array.isArray(newProf.education) ? newProf.education : []);
    setSocialLinks(buildSocialLinksFromProfile(newProf));
    setCustomFields(Array.isArray(newProf.customFields) ? newProf.customFields : []);
    setDynamicSections(Array.isArray(newProf.dynamicSections) ? newProf.dynamicSections : []);
    if (Array.isArray(newProf.sectionOrder) && newProf.sectionOrder.length > 0) {
      setSectionOrder(newProf.sectionOrder);
    }
    if (newProf.sectionVisibility && Object.keys(newProf.sectionVisibility).length > 0) {
      setSectionVisibility(newProf.sectionVisibility);
    }
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

      setStatusMessage({
        type: 'success',
        text: '✓ Profile saved successfully! Real-time canvas synced.'
      });

      onSaveSuccess?.(finalProfile);

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
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="sliding-editor-panel"
          initial={{ x: '-100%', opacity: 0.7 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0.7 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed top-0 bottom-0 left-0 z-40 h-full w-full sm:w-[500px] md:w-[540px] lg:w-[580px] xl:w-[620px] backdrop-blur-2xl bg-white/90 dark:bg-[#111319]/90 border-r border-slate-200/80 dark:border-white/10 shadow-2xl flex flex-col font-sans overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          {/* Top Panel Navigation Bar */}
          <div className="shrink-0 px-4 py-3 border-b border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#111319]/60 backdrop-blur-md flex items-center justify-between gap-3 z-20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                    Avtive Studio
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">
                    Live Sync
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-white/50 truncate">
                  Realtime updates to the profile preview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Persona Switcher */}
              <ProfileSwitcher
                currentProfileIdOrSlug={profile.slug || profile.id || initialProfile.slug || initialProfile.id}
                initialProfiles={userProfiles}
                onSelectProfile={handleSwitchToProfile}
              />

              {/* Collapse Button */}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white/90 transition-colors cursor-pointer"
                title="Collapse editor panel"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Collapse</span>
              </button>
            </div>
          </div>

          {/* Quick Section Jump Pills */}
          <div className="shrink-0 px-3 py-2 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/70 dark:bg-black/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { key: 'basicInfo' as const, label: 'Identity & Theme', icon: User },
              { key: 'skills' as const, label: 'Skills', icon: Code },
              { key: 'about' as const, label: 'About', icon: FileText },
              { key: 'projects' as const, label: 'Projects', icon: FolderGit2 },
              { key: 'socials' as const, label: 'Socials', icon: Link2 },
              { key: 'customFields' as const, label: 'Custom Fields', icon: Tag },
              { key: 'sectionsLayout' as const, label: 'Section Editor', icon: Layers },
              { key: 'share' as const, label: 'Share & Privacy', icon: Share2 }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => scrollToSection(item.key)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-white/80 border border-slate-200/70 dark:border-white/10 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Icon className="w-3 h-3 text-slate-400 dark:text-white/50" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Form Content */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overscroll-contain space-y-4 p-4 sm:p-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700"
          >
            {/* 1. Header Banner & Profile Photo Area */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={coverImage}
                  alt="Cover Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* Cover Change Button */}
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
                  title="Change Cover Banner"
                >
                  {isUploadingCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
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
              </div>

              {/* Avatar & Realtime Title */}
              <div className="px-4 pb-4 pt-0 relative -mt-10 flex items-end justify-between gap-3">
                <div className="flex items-end gap-3 min-w-0">
                  <div className="relative w-20 h-20 rounded-full border-3 border-white dark:border-[#111319] shadow-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
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

                  <div className="min-w-0 pb-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {fullName || 'Your Name'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-white/60 truncate">
                      {professionalTitle || 'Professional Title'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-white/70">
                    @{username || 'handle'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {statusMessage && (
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
            )}

            {/* SECTION 1: BASIC INFO & THEME */}
            <div id="section-basicInfo" className="rounded-2xl bg-white/70 dark:bg-[#1B1E28]/70 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs backdrop-blur-sm">
              <button
                type="button"
                onClick={() => toggleSection('basicInfo')}
                className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-600 dark:text-white/70" />
                  <span>1. Identity & Card Theme</span>
                </div>
                {expandedSections.basicInfo ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
              </button>

              {expandedSections.basicInfo && (
                <div className="p-4 pt-1 space-y-3 border-t border-slate-200/60 dark:border-white/5">
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
                      Public card URL: <span className="font-mono text-slate-600 dark:text-white/60">avtive.app/profile/{username || 'username'}</span>
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
                      placeholder="A concise overview of your focus..."
                      className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1">
                        Company / Organization
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
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-white/70 mb-1.5 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-500" />
                      <span>Card Theme Preset</span>
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
            <div id="section-skills" className="rounded-2xl bg-white/70 dark:bg-[#1B1E28]/70 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs backdrop-blur-sm">
              <button
                type="button"
                onClick={() => toggleSection('skills')}
                className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-slate-600 dark:text-white/70" />
                  <span>2. Skills & Badges ({skills.length})</span>
                </div>
                {expandedSections.skills ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
              </button>

              {expandedSections.skills && (
                <div className="p-4 pt-1 space-y-3 border-t border-slate-200/60 dark:border-white/5">
                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="Add skill (e.g. Next.js, GraphQL, Figma)..."
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
                          className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
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
            <div id="section-about" className="rounded-2xl bg-white/70 dark:bg-[#1B1E28]/70 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs backdrop-blur-sm">
              <button
                type="button"
                onClick={() => toggleSection('about')}
                className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600 dark:text-white/70" />
                  <span>3. About & Philosophy</span>
                </div>
                {expandedSections.about ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
              </button>

              {expandedSections.about && (
                <div className="p-4 pt-1 space-y-2 border-t border-slate-200/60 dark:border-white/5">
                  <textarea
                    rows={4}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Share your detailed career journey, achievements, or project specialties..."
                    className="figma-input w-full px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 leading-relaxed resize-none"
                  />
                </div>
              )}
            </div>

            {/* SECTION 4: PROJECTS */}
            <div id="section-projects" className="rounded-2xl bg-white/70 dark:bg-[#1B1E28]/70 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs backdrop-blur-sm">
              <div className="w-full p-3.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleSection('projects')}
                  className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 transition-colors cursor-pointer"
                >
                  <FolderGit2 className="w-4 h-4 text-slate-600 dark:text-white/70" />
                  <span>4. Projects ({projects.length})</span>
                  {expandedSections.projects ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" />}
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddProject}
                  className="figma-pill-primary px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Project</span>
                </button>
              </div>

              {expandedSections.projects && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-200/60 dark:border-white/5">
                  {/* Inline Project Add/Edit Form */}
                  {isInlineProjectOpen && (
                    <form onSubmit={handleSaveInlineProject} className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/20 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {editingProject ? 'Edit Project' : 'New Project'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsInlineProjectOpen(false)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
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
                          className="px-3 py-1 text-xs text-slate-600 dark:text-white/60 hover:text-slate-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="figma-pill-primary px-3 py-1 text-xs font-bold cursor-pointer"
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

            {/* SECTION 5: DRAGGABLE SOCIAL LINKS */}
            <div id="section-socials" className="rounded-2xl bg-white/70 dark:bg-[#1B1E28]/70 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs backdrop-blur-sm">
              <div className="w-full p-3.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleSection('socials')}
                  className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 transition-colors cursor-pointer"
                >
                  <Link2 className="w-4 h-4 text-slate-600 dark:text-white/70" />
                  <span>5. Social Links & Ordering ({socialLinks.length})</span>
                  {expandedSections.socials ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50 ml-1" />}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAddLinkItem('twitter')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
                    title="Add Twitter / X"
                  >
                    + X
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLinkItem('whatsapp')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
                    title="Add WhatsApp"
                  >
                    + WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLinkItem('other')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
                    title="Add Custom Link"
                  >
                    + Link
                  </button>
                </div>
              </div>

              {expandedSections.socials && (
                <div className="p-4 pt-0 space-y-2 border-t border-slate-200/60 dark:border-white/5">
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

            {/* SECTION 6: CUSTOM FIELDS */}
            <div id="section-customFields" className="rounded-2xl bg-white/70 dark:bg-[#1B1E28]/70 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs backdrop-blur-sm">
              <div className="w-full p-3.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleSection('customFields')}
                  className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 transition-colors cursor-pointer"
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
                <div className="p-4 pt-0 space-y-3.5 border-t border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <GripVertical className="w-3 h-3 text-purple-400" />
                      Editable · Draggable · Eye icon toggles preview
                    </p>
                    {customFields.length > 0 && (
                      <span className="text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-full">
                        {customFields.filter(f => f.visible !== false).length} visible
                      </span>
                    )}
                  </div>

                  {customFields.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02]">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-2">
                        <Tag className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200 mb-1">No custom fields added yet</p>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-xs mx-auto mb-3">
                        Create custom fields for publications, office hours, calendar links, or public identifiers.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Your First Field</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Reorder.Group
                        axis="y"
                        values={customFields}
                        onReorder={setCustomFields}
                        className="space-y-2.5"
                      >
                        {customFields.map((field, idx) => (
                          <DraggableCustomFieldItem
                            key={field.id}
                            field={field}
                            index={idx}
                            total={customFields.length}
                            onUpdate={(patch) => handleUpdateCustomField(field.id, patch)}
                            onDelete={() => handleDeleteCustomField(field.id)}
                            onMoveUp={() => handleMoveCustomField(idx, 'up')}
                            onMoveDown={() => handleMoveCustomField(idx, 'down')}
                          />
                        ))}
                      </Reorder.Group>

                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="w-full py-2.5 rounded-xl border border-dashed border-purple-300 dark:border-purple-500/30 hover:border-purple-500 dark:hover:border-purple-400 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Another Custom Field</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 7: SECTION EDITOR & REORDERING (Based on Figma Screen #8) */}
            <div id="section-sectionsLayout" className="rounded-2xl bg-white/70 dark:bg-[#1B1E28]/70 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs backdrop-blur-sm">
              <button
                type="button"
                onClick={() => toggleSection('sectionsLayout')}
                className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>7. Section Editor ({sectionOrder.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono">
                    {visibleSections.length} visible
                  </span>
                  {hiddenSections.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50 font-mono">
                      {hiddenSections.length} hidden
                    </span>
                  )}
                  {expandedSections.sectionsLayout ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
                </div>
              </button>

              {expandedSections.sectionsLayout && (
                <div className="p-3.5 pt-0 space-y-3 border-t border-slate-200/60 dark:border-white/5">
                  {/* Compact Header Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 pb-0.5">
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <GripVertical className="w-3 h-3 text-indigo-400" />
                      Drag to reorder · Eye icon to show/hide
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hiddenSections.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const allShown: Record<string, boolean> = {};
                            sectionOrder.forEach((k) => { allShown[k] = true; });
                            setSectionVisibility(allShown);
                          }}
                          className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Show All
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSectionOrder(DEFAULT_SECTION_ORDER);
                          setSectionVisibility(DEFAULT_SECTION_VISIBILITY);
                        }}
                        className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-0.5"
                        title="Reset to default order and visibility"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* ── VISIBLE SECTIONS GROUP ── */}
                  {(() => {
                    const getSectionLayoutConfig = (sectionKey: string) => {
                      if (sectionKey === 'custom-fields') {
                        return {
                          label: `Custom Fields (${customFields.length})`,
                          icon: Tag,
                          color: 'text-purple-500'
                        };
                      }
                      if (sectionKey.startsWith('custom-field-')) {
                        const fieldId = sectionKey.replace('custom-field-', '');
                        const cf = customFields.find((f) => f.id === fieldId || `custom-field-${f.id}` === sectionKey);
                        return {
                          label: cf ? `Field: ${cf.label || (cf as any).title || 'Custom Field'}` : 'Custom Field',
                          icon: Tag,
                          color: 'text-purple-500'
                        };
                      }
                      return (
                        SECTION_CONFIG[sectionKey] || {
                          label: SECTION_LABELS[sectionKey] || (sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)),
                          icon: Layers,
                          color: 'text-slate-500'
                        }
                      );
                    };

                    return (
                      <>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 px-0.5">
                            <Eye className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Visible ({visibleSections.length})
                            </span>
                          </div>

                          {visibleSections.length === 0 ? (
                            <div className="py-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-1">
                              <EyeOff className="w-4 h-4 text-slate-300 dark:text-zinc-600" />
                              <p className="text-[11px] text-slate-400 dark:text-zinc-500">All sections are hidden</p>
                            </div>
                          ) : (
                            <Reorder.Group
                              axis="y"
                              values={visibleSections}
                              onReorder={handleReorderVisible}
                              className="space-y-1.5"
                            >
                              {visibleSections.map((sectionKey, idx) => {
                                const cfg = getSectionLayoutConfig(sectionKey);

                                return (
                                  <DraggableSectionItem
                                    key={sectionKey}
                                    sectionKey={sectionKey}
                                    label={cfg.label}
                                    icon={cfg.icon}
                                    iconColor={cfg.color}
                                    isVisible={true}
                                    onToggleVisibility={() => handleToggleSectionVisibility(sectionKey)}
                                    onMoveUp={() => handleMoveSection(idx, 'up', 'visible')}
                                    onMoveDown={() => handleMoveSection(idx, 'down', 'visible')}
                                    isFirst={idx === 0}
                                    isLast={idx === visibleSections.length - 1}
                                  />
                                );
                              })}
                            </Reorder.Group>
                          )}
                        </div>

                        {/* ── HIDDEN SECTIONS GROUP ── */}
                        {hiddenSections.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 px-0.5 pt-1">
                              <EyeOff className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Hidden ({hiddenSections.length})
                              </span>
                            </div>

                            <Reorder.Group
                              axis="y"
                              values={hiddenSections}
                              onReorder={handleReorderHidden}
                              className="space-y-1.5"
                            >
                              {hiddenSections.map((sectionKey, idx) => {
                                const cfg = getSectionLayoutConfig(sectionKey);

                                return (
                                  <DraggableSectionItem
                                    key={sectionKey}
                                    sectionKey={sectionKey}
                                    label={cfg.label}
                                    icon={cfg.icon}
                                    iconColor={cfg.color}
                                    isVisible={false}
                                    onToggleVisibility={() => handleToggleSectionVisibility(sectionKey)}
                                    onMoveUp={() => handleMoveSection(idx, 'up', 'hidden')}
                                    onMoveDown={() => handleMoveSection(idx, 'down', 'hidden')}
                                    isFirst={idx === 0}
                                    isLast={idx === hiddenSections.length - 1}
                                  />
                                );
                              })}
                            </Reorder.Group>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* SECTION 8: SHARE PROFILE & VISIBILITY CONTROLS */}
            <div id="section-share" className="rounded-2xl bg-white/70 dark:bg-[#1B1E28]/70 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs backdrop-blur-sm">
              <button
                type="button"
                onClick={() => toggleSection('share')}
                className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-amber-500" />
                  <span>8. Share Profile & Privacy Controls</span>
                </div>
                {expandedSections.share ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-white/50" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/50" />}
              </button>

              {expandedSections.share && (
                <div className="p-4 pt-1 space-y-4 border-t border-slate-200/60 dark:border-white/5">
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
                      <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Granular Field Visibility Controls */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
                      Toggle What To Show Publicly
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

          {/* Sticky Action Footer */}
          <div className="shrink-0 p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111319]/70 backdrop-blur-md flex items-center justify-between gap-3 z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Collapse
            </button>

            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${profile.slug || profile.id || initialProfile.slug || initialProfile.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="figma-pill-secondary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1 shrink-0"
                title="Open live public profile in a new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open Live</span>
              </Link>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="figma-pill-primary py-2 px-5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
