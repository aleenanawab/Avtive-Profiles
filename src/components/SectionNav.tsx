'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  FileText, 
  Phone, 
  SlidersHorizontal, 
  Sparkles, 
  FolderGit2, 
  Briefcase, 
  GraduationCap, 
  Award, 
  HeartHandshake, 
  Languages, 
  Quote, 
  Building2, 
  Users, 
  Tag, 
  Link2, 
  CreditCard 
} from 'lucide-react';
import { ProfileData } from '@/types/profile';
import { ThemeConfig } from '@/components/themeStyles';

export interface SectionNavItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

interface SectionNavProps {
  profile: ProfileData;
  theme: ThemeConfig;
  className?: string;
  onNavigateSection?: (sectionId: string) => void;
}

export function SectionNav({
  profile,
  theme,
  className = '',
  onNavigateSection
}: SectionNavProps) {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 1. Gather all existing non-empty & visible sections following profile's section order
  const availableSections = React.useMemo(() => {
    const visibility = profile.sectionVisibility || {};
    const sharing = profile.sharingSettings || {};

    const isVisible = (key: string): boolean => {
      if (typeof visibility[key] === 'boolean') return visibility[key];
      switch (key) {
        case 'company': return sharing.companySection !== false;
        case 'about': return sharing.bio !== false;
        case 'contact': return true;
        case 'custom-fields': return true;
        case 'skills': return sharing.skills !== false || sharing.services !== false;
        case 'experience': return sharing.experience !== false;
        case 'education': return sharing.education !== false;
        case 'projects': return sharing.projects !== false;
        case 'certifications': return sharing.certifications !== false;
        case 'volunteer': return sharing.volunteer !== false;
        case 'languages': return sharing.languages !== false;
        case 'recommendations': return sharing.recommendations !== false;
        case 'socialLinks': return sharing.socialLinks !== false;
        case 'virtual-card': return sharing.nfcCard !== false;
        default: return true;
      }
    };

    // Dictionary of section definitions with data presence check
    const sectionDefinitions: Record<string, { label: string; shortLabel: string; icon: React.ElementType; hasData: () => boolean }> = {
      hero: {
        label: 'Profile',
        shortLabel: 'Profile',
        icon: User,
        hasData: () => true
      },
      about: {
        label: 'About',
        shortLabel: 'About',
        icon: FileText,
        hasData: () => Boolean(profile.about || profile.fullBio || profile.shortBio || profile.tagline)
      },
      contact: {
        label: 'Contact',
        shortLabel: 'Contact',
        icon: Phone,
        hasData: () => Boolean(
          profile.email || 
          profile.phone || 
          profile.location || 
          profile.website || 
          profile.whatsapp ||
          (profile.socialLinks && profile.socialLinks.length > 0) ||
          ((profile as any).socials && (profile as any).socials.length > 0) ||
          (profile.customContacts && profile.customContacts.length > 0)
        )
      },
      skills: {
        label: 'Skills',
        shortLabel: 'Skills',
        icon: SlidersHorizontal,
        hasData: () => (Array.isArray(profile.skills) && profile.skills.length > 0) || (Array.isArray(profile.services) && profile.services.length > 0)
      },
      projects: {
        label: 'Projects',
        shortLabel: 'Projects',
        icon: FolderGit2,
        hasData: () => Array.isArray(profile.projects) && profile.projects.length > 0
      },
      experience: {
        label: 'Experience',
        shortLabel: 'Exp',
        icon: Briefcase,
        hasData: () => (Array.isArray(profile.experience) && profile.experience.length > 0) || (Array.isArray(profile.experiences) && profile.experiences.length > 0)
      },
      education: {
        label: 'Education',
        shortLabel: 'Edu',
        icon: GraduationCap,
        hasData: () => Array.isArray(profile.education) && profile.education.length > 0
      },
      certifications: {
        label: 'Certifications',
        shortLabel: 'Certs',
        icon: Award,
        hasData: () => Array.isArray(profile.certifications) && profile.certifications.length > 0
      },
      volunteer: {
        label: 'Volunteer',
        shortLabel: 'Vol',
        icon: HeartHandshake,
        hasData: () => Boolean(
          (Array.isArray(profile.volunteerExperiences) && profile.volunteerExperiences.length > 0) ||
          (Array.isArray((profile as any).volunteer) && (profile as any).volunteer.length > 0)
        )
      },
      languages: {
        label: 'Languages',
        shortLabel: 'Lang',
        icon: Languages,
        hasData: () => Array.isArray(profile.languages) && profile.languages.length > 0
      },
      recommendations: {
        label: 'Recommendations',
        shortLabel: 'Reviews',
        icon: Quote,
        hasData: () => Array.isArray(profile.recommendations) && profile.recommendations.length > 0
      },
      company: {
        label: profile.type === 'team' ? 'Team' : 'Company',
        shortLabel: profile.type === 'team' ? 'Team' : 'Company',
        icon: profile.type === 'team' ? Users : Building2,
        hasData: () => Boolean(
          profile.company || 
          profile.companyInfo?.name || 
          (Array.isArray(profile.teamMembers) && profile.teamMembers.length > 0)
        )
      },
      'custom-fields': {
        label: 'Custom Info',
        shortLabel: 'Custom',
        icon: Tag,
        hasData: () => Array.isArray(profile.customFields) && profile.customFields.length > 0
      },
      socialLinks: {
        label: 'Socials',
        shortLabel: 'Socials',
        icon: Link2,
        hasData: () => (Array.isArray(profile.socialLinks) && profile.socialLinks.length > 0) || (Array.isArray(profile.socials) && profile.socials.length > 0)
      },
      'virtual-card': {
        label: 'Virtual Card',
        shortLabel: 'Card',
        icon: CreditCard,
        hasData: () => sharing.nfcCard !== false
      }
    };

    // Default card section order
    const defaultOrder = [
      'hero',
      'company',
      'about',
      'contact',
      'custom-fields',
      'skills',
      'projects',
      'experience',
      'education',
      'certifications',
      'volunteer',
      'languages',
      'recommendations',
      'socialLinks',
      'virtual-card'
    ];

    // Build unified order based on user's custom sectionOrder
    const userOrder = profile.sectionOrder || [];
    const orderedKeys: string[] = ['hero'];

    for (const key of userOrder) {
      const norm = (key === 'services' || key === 'skills') ? 'skills' : (key === 'socials' ? 'socialLinks' : key);
      if (!orderedKeys.includes(norm) && sectionDefinitions[norm]) {
        orderedKeys.push(norm);
      }
    }

    for (const key of defaultOrder) {
      if (!orderedKeys.includes(key) && sectionDefinitions[key]) {
        orderedKeys.push(key);
      }
    }

    // Filter to only sections that are visible and have real data
    const list: SectionNavItem[] = [];
    for (const key of orderedKeys) {
      const def = sectionDefinitions[key];
      if (def && isVisible(key) && def.hasData()) {
        list.push({
          id: key,
          label: def.label,
          shortLabel: def.shortLabel,
          icon: def.icon
        });
      }
    }

    return list;
  }, [profile]);

  // 2. IntersectionObserver to automatically track active section on scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      // Find intersecting sections
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Find the one closest to the top third of viewport
        const best = visible.reduce((prev, curr) => {
          const prevTop = Math.abs(prev.boundingClientRect.top - 100);
          const currTop = Math.abs(curr.boundingClientRect.top - 100);
          return currTop < prevTop ? curr : prev;
        });

        const sectionId = best.target.id.replace('section-', '');
        if (sectionId) {
          setActiveSection(sectionId);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: '-15% 0px -65% 0px',
      threshold: [0, 0.2, 0.5]
    });

    availableSections.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [availableSections]);

  // 3. Smooth navigate on click / tap
  const handleItemClick = (sectionId: string) => {
    setActiveSection(sectionId);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    }

    const targetEl = document.getElementById(`section-${sectionId}`);
    if (targetEl) {
      const headerOffset = 70;
      const elPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (availableSections.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Profile Sections Navigation"
      className={`w-full flex flex-col items-center py-2 px-1 sm:px-1.5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-lg backdrop-blur-md select-none transition-all ${className}`}
    >
      <div className="w-full flex flex-col items-center gap-1 sm:gap-1.5 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-none py-0.5">
        {availableSections.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isHovered = hoveredSection === item.id;

          return (
            <div key={item.id} className="relative w-full flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleItemClick(item.id)}
                onMouseEnter={() => setHoveredSection(item.id)}
                onMouseLeave={() => setHoveredSection(null)}
                aria-label={`Jump to ${item.label}`}
                title={item.label}
                aria-current={isActive ? 'true' : undefined}
                className={`w-full py-1.5 sm:py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer relative group text-center active:scale-90 ${
                  isActive
                    ? `${theme.badgeBg} ${theme.badgeText} border ${theme.cardBorder} shadow-xs font-bold scale-[1.02]`
                    : `${theme.textMuted} hover:${theme.textPrimary} hover:bg-black/5 dark:hover:bg-white/5`
                }`}
              >
                {/* Active Indicator Accent Pip */}
                {isActive && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 sm:w-1 h-3.5 sm:h-4 rounded-r-full ${theme.accentText} bg-current`} />
                )}

                {/* Section Icon */}
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${
                  isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'
                }`} />

                {/* Clean Responsive Short Label (No overflow or horizontal wrap on mobile) */}
                <span className="text-[9px] xs:text-[10px] leading-tight font-medium text-center truncate max-w-full block w-full px-0.5 tracking-tight">
                  {item.shortLabel}
                </span>
              </button>

              {/* Desktop Hover Tooltip (Appears to the left on hover) */}
              {isHovered && (
                <div className="hidden lg:block absolute right-full mr-2 px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold whitespace-nowrap shadow-xl border border-white/10 dark:border-black/10 pointer-events-none z-50 animate-in fade-in duration-100">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
