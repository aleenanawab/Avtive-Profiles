'use client';

import React from 'react';
import Link from 'next/link';
import { 
  User, 
  FileText, 
  Code, 
  FolderGit2, 
  GraduationCap, 
  Phone, 
  Link2, 
  Briefcase, 
  Sparkles, 
  EyeOff, 
  UserCheck, 
  Archive, 
  ShieldCheck, 
  Settings,
  ExternalLink,
  Save,
  Loader2
} from 'lucide-react';
import { useProfileEditor } from '@/context/ProfileEditorContext';
import { AvtiveLogoIcon } from '@/components/DesktopWindowPreview';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';

export interface SidebarSectionItem {
  key: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  category?: 'core' | 'advanced' | 'system';
}

export const DESKTOP_SIDEBAR_SECTIONS: SidebarSectionItem[] = [
  // 1-8: Core Profile Sections
  { key: 'profile', label: 'Profile', icon: User, category: 'core' },
  { key: 'personalDetails', label: 'Personal Details', icon: FileText, category: 'core' },
  { key: 'skills', label: 'Skills', icon: Code, category: 'core' },
  { key: 'projects', label: 'Projects', icon: FolderGit2, category: 'core' },
  { key: 'education', label: 'Education', icon: GraduationCap, category: 'core' },
  { key: 'contactInfo', label: 'Contact Info', icon: Phone, category: 'core' },
  { key: 'socialLinks', label: 'Social Links', icon: Link2, category: 'core' },
  { key: 'experience', label: 'Experience', icon: Briefcase, category: 'core' },
  
  // 9-12: Advanced Management
  { key: 'enhanceProfile', label: 'Enhance Profile', icon: Sparkles, category: 'advanced' },
  { key: 'limitations', label: 'Limitations', icon: EyeOff, category: 'advanced' },
  { key: 'accountInfo', label: 'Account Info', icon: UserCheck, category: 'advanced' },
  { key: 'archive', label: 'Archive', icon: Archive, category: 'advanced' },
  
  // 13-14: Security & Settings
  { key: 'security', label: 'Security', icon: ShieldCheck, category: 'system' },
  { key: 'settings', label: 'Settings', icon: Settings, category: 'system' }
];

export function DesktopProfileSidebar() {
  const { 
    profile, 
    activeSection, 
    setActiveSection, 
    isSaving, 
    saveProfile, 
    currentIdentifier,
    userProfiles,
    handleSwitchPersona
  } = useProfileEditor();

  const skillsCount = Array.isArray(profile.skills) ? profile.skills.length : 0;
  const projectsCount = Array.isArray(profile.projects) ? profile.projects.length : 0;
  
  // Count hidden sections for Archive badge
  const hiddenCount = profile.sectionVisibility 
    ? Object.values(profile.sectionVisibility).filter(v => v === false).length 
    : 0;

  const customFieldsCount = Array.isArray(profile.customFields) ? profile.customFields.length : 0;

  const getSectionBadge = (key: string) => {
    switch (key) {
      case 'skills':
        return skillsCount > 0 ? skillsCount : undefined;
      case 'projects':
        return projectsCount > 0 ? projectsCount : undefined;
      case 'archive':
        return hiddenCount > 0 ? `${hiddenCount} hidden` : undefined;
      case 'enhanceProfile':
        return customFieldsCount > 0 ? `${customFieldsCount} fields` : undefined;
      default:
        return undefined;
    }
  };

  return (
    <aside className="w-[280px] xl:w-[310px] shrink-0 h-full bg-[#080D1A] border-r border-white/10 flex flex-col select-none relative z-20">
      
      {/* 1. Header with Avtive Branding */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
        <Link 
          href={`/profile/${currentIdentifier}`} 
          className="flex items-center gap-2.5 group"
          title="Return to Public Profile"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <AvtiveLogoIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-white tracking-tight">avtive</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-400 font-mono font-bold border border-cyan-500/30">
                STUDIO
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Desktop Profile Editor</span>
          </div>
        </Link>
      </div>

      {/* 2. User Profile Summary Card / Persona Switcher */}
      <div className="px-3.5 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full border-2 border-cyan-500/40 overflow-hidden bg-slate-800 shrink-0 shadow-sm">
            <img 
              src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'} 
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080D1A]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-xs font-bold text-white truncate">
                {profile.name || 'Your Profile'}
              </h3>
              {userProfiles && userProfiles.length > 1 && (
                <ProfileSwitcher 
                  currentProfileIdOrSlug={currentIdentifier}
                  initialProfiles={userProfiles}
                  onSelectProfile={handleSwitchPersona}
                />
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {profile.professionalTitle || profile.designation || 'Professional'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Section Navigation List (14 Sections from Figma Design) */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2.5 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        
        {/* Group 1: Core Profile */}
        <div className="px-2 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Core Profile
        </div>
        {DESKTOP_SIDEBAR_SECTIONS.filter(s => s.category === 'core').map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.key;
          const badge = getSectionBadge(sec.key);

          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSection(sec.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {isActive && (
                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
              )}
              
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">{sec.label}</span>
              </div>

              {badge !== undefined && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                  isActive 
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/30' 
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Group 2: Advanced Profile Tools */}
        <div className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Management & Enhancements
        </div>
        {DESKTOP_SIDEBAR_SECTIONS.filter(s => s.category === 'advanced').map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.key;
          const badge = getSectionBadge(sec.key);

          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSection(sec.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {isActive && (
                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
              )}
              
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`} />
                <span className="truncate">{sec.label}</span>
              </div>

              {badge !== undefined && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                  isActive 
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/30' 
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Group 3: System & Security */}
        <div className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          System & Security
        </div>
        {DESKTOP_SIDEBAR_SECTIONS.filter(s => s.category === 'system').map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.key;

          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSection(sec.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {isActive && (
                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
              )}
              
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`} />
                <span className="truncate">{sec.label}</span>
              </div>
            </button>
          );
        })}

      </div>

      {/* 4. Bottom Sticky Action Footer */}
      <div className="p-3.5 border-t border-white/10 bg-[#080D1A]/95 backdrop-blur-md space-y-2">
        <button
          type="button"
          onClick={() => saveProfile()}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>

        <Link
          href={`/profile/${currentIdentifier}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shadow-2xs"
          title="Open Public Card in New Tab"
        >
          <ExternalLink className="w-3 h-3 text-cyan-400" />
          <span>View Public Profile</span>
        </Link>
      </div>

    </aside>
  );
}
