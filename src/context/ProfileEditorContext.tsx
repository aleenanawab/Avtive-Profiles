'use client';

/**
 * ProfileEditorContext
 * --------------------
 * Single source of truth for all profile-editing state.
 * Both EditProfileClient (preview side) and SlidingEditorPanel (editor side)
 * consume this context — no duplicated atoms, no stale-prop re-sync bugs.
 *
 * Architecture:
 *   <ProfileEditorProvider initialProfile={...} userProfiles={...}>
 *     <EditProfileClient />   ← reads liveProfile, calls setters
 *     <SlidingEditorPanel />  ← reads same atoms, calls same setters
 *   </ProfileEditorProvider>
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  DEFAULT_SECTION_VISIBILITY,
} from '@/types/profile';
import { ALL_PROFILE_SECTIONS } from '@/components/sections/DynamicSectionGroups';

// ─── DraggableLinkItem ────────────────────────────────────────────────────────

export interface DraggableLinkItem {
  id: string;
  platform: 'github' | 'linkedin' | 'website' | 'twitter' | 'whatsapp' | 'other';
  title: string;
  url: string;
  visible: boolean;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function buildSocialLinksFromProfile(p: ProfileData): DraggableLinkItem[] {
  const safeSocials =
    Array.isArray(p.socials) && p.socials.length > 0
      ? p.socials
      : Array.isArray(p.socialLinks) && p.socialLinks.length > 0
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
        visible: s.visible !== false,
      };
    });
  }

  return [
    { id: 'link-li-0', platform: 'linkedin', title: 'LinkedIn', url: 'https://linkedin.com', visible: true },
    { id: 'link-gh-1', platform: 'github', title: 'GitHub', url: 'https://github.com', visible: true },
    { id: 'link-web-2', platform: 'website', title: 'Website / Portfolio', url: p.website || 'https://avtive.app', visible: true },
  ];
}

function extractSkills(p: ProfileData): string[] {
  if (Array.isArray(p.skills) && p.skills.length > 0) {
    return p.skills.map((s) => (typeof s === 'string' ? s : s.name));
  }
  return ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'];
}

// ─── Context Shape ────────────────────────────────────────────────────────────

export interface ProfileEditorContextValue {
  // Core profile object (DB baseline — updated after save/switch)
  profile: ProfileData;

  // ── Editable field atoms ──────────────────────────────────────────────────
  activeTheme: ProfileTheme;
  setActiveTheme: (t: ProfileTheme) => void;

  firstName: string;
  setFirstName: (v: string) => void;
  secondName: string;
  setSecondName: (v: string) => void;
  username: string;
  setUsername: (v: string) => void;
  professionalTitle: string;
  setProfessionalTitle: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  avatar: string;
  setAvatar: (v: string) => void;
  coverImage: string;
  setCoverImage: (v: string) => void;

  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
  about: string;
  setAbout: (v: string) => void;

  projects: ProjectItem[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
  experiences: ExperienceItem[];
  setExperiences: React.Dispatch<React.SetStateAction<ExperienceItem[]>>;
  education: EducationItem[];
  setEducation: React.Dispatch<React.SetStateAction<EducationItem[]>>;

  socialLinks: DraggableLinkItem[];
  setSocialLinks: React.Dispatch<React.SetStateAction<DraggableLinkItem[]>>;
  customFields: CustomFieldItem[];
  setCustomFields: React.Dispatch<React.SetStateAction<CustomFieldItem[]>>;
  dynamicSections: DynamicSection[];
  setDynamicSections: React.Dispatch<React.SetStateAction<DynamicSection[]>>;

  sectionOrder: string[];
  setSectionOrder: React.Dispatch<React.SetStateAction<string[]>>;
  sectionVisibility: Record<string, boolean>;
  setSectionVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  sharingSettings: SharingSettings;
  setSharingSettings: React.Dispatch<React.SetStateAction<SharingSettings>>;

  // ── Derived ───────────────────────────────────────────────────────────────
  fullName: string;
  liveProfile: ProfileData;          // use this for <AvtiveDigitalCard> / <PhonePreview>
  activeSocialsPayload: { platform: any; url: string; label: string }[];

  // ── Upload / Save status ─────────────────────────────────────────────────
  isUploadingAvatar: boolean;
  isUploadingCover: boolean;
  isSaving: boolean;
  isConfirmed: boolean;
  setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  copySuccess: boolean;

  // ── Handlers ─────────────────────────────────────────────────────────────
  handleAvatarUpload: (file: File) => Promise<void>;
  handleCoverUpload: (file: File) => Promise<void>;
  handleAddLinkItem: (platform: DraggableLinkItem['platform']) => void;
  handleUpdateLink: (id: string, patch: Partial<DraggableLinkItem>) => void;
  handleDeleteLink: (id: string) => void;
  handleMoveLink: (index: number, direction: 'up' | 'down') => void;
  handleAddCustomField: () => void;
  handleUpdateCustomField: (id: string, patch: Partial<CustomFieldItem>) => void;
  handleDeleteCustomField: (id: string) => void;
  handleMoveCustomField: (index: number, direction: 'up' | 'down') => void;
  handleMoveSection: (index: number, direction: 'up' | 'down') => void;
  handleToggleSectionVisibility: (sectionKey: string) => void;
  handleInstantToggleSection: (sectionId: string, makeVisible: boolean) => void;
  toggleVisibilityField: (field: keyof SharingSettings) => void;
  handleCopyLink: () => Promise<void>;
  handleSaveChanges: () => Promise<void>;
  handleSwitchToProfile: (newProf: ProfileData) => void;
  handleProfileSectionLiveUpdate: (updatedFields: Partial<ProfileData>) => void;
  handleProfileSectionSaveSuccess: (savedProfile: ProfileData, isNew?: boolean) => void;

  // Identifier for public URL construction
  currentActiveIdentifier: string;
  publicProfileUrl: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ProfileEditorContext = createContext<ProfileEditorContextValue | undefined>(undefined);

export function useProfileEditor(): ProfileEditorContextValue {
  const ctx = useContext(ProfileEditorContext);
  if (!ctx) {
    throw new Error('useProfileEditor must be used within a <ProfileEditorProvider>');
  }
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export interface ProfileEditorProviderProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
  children: React.ReactNode;
  /** Called after a successful save (optional callback for toast / routing) */
  onSaveSuccess?: (saved: ProfileData) => void;
}

export function ProfileEditorProvider({
  initialProfile,
  userProfiles: _userProfiles,
  children,
  onSaveSuccess,
}: ProfileEditorProviderProps) {
  // ── Core profile baseline ─────────────────────────────────────────────────
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme === 'default' ? 'editorial' : (initialProfile.theme || 'editorial')
  );

  // ── Basic Info ────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState(
    initialProfile.firstName || (initialProfile.name ? initialProfile.name.split(' ')[0] : 'Aleena')
  );
  const [secondName, setSecondName] = useState(
    initialProfile.secondName ||
      initialProfile.lastName ||
      (initialProfile.name ? initialProfile.name.split(' ').slice(1).join(' ') : 'Nawab')
  );
  const [username, setUsername] = useState(
    initialProfile.username || initialProfile.slug || ''
  );
  const [professionalTitle, setProfessionalTitle] = useState(
    initialProfile.professionalTitle || initialProfile.designation || initialProfile.profession || 'Full Stack Engineer'
  );
  const [bio, setBio] = useState(
    initialProfile.bio ||
      initialProfile.shortBio ||
      'Passionate professional delivering intuitive digital experiences with modern technology and clean architecture.'
  );
  const [tagline, setTagline] = useState(
    initialProfile.tagline || ''
  );
  const [company, setCompany] = useState(initialProfile.company || 'Avtive');
  const [location, setLocation] = useState(initialProfile.location || 'Global');

  // ── Images ────────────────────────────────────────────────────────────────
  const [avatar, setAvatar] = useState(
    initialProfile.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
  );
  const [coverImage, setCoverImage] = useState(
    initialProfile.coverImage ||
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'
  );

  // ── Skills / About ────────────────────────────────────────────────────────
  const [skills, setSkills] = useState<string[]>(extractSkills(initialProfile));
  const [about, setAbout] = useState(
    initialProfile.about ||
      initialProfile.fullBio ||
      'Hello! I am a full stack software engineer and product designer specializing in high-performance web applications, responsive user interfaces, and modular design systems. I bridge the gap between design and engineering to build products that delight users and scale seamlessly.'
  );

  // ── Projects / Experience / Education ─────────────────────────────────────
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    if (Array.isArray(initialProfile.projects) && initialProfile.projects.length > 0) {
      return initialProfile.projects;
    }
    return [
      {
        id: 'proj-1',
        title: 'Avtive Profiles Platform',
        description: 'Verified digital identity cards and granular privacy profiles built with Next.js and Tailwind CSS.',
        tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        link: 'https://www.avtive.app',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
        category: 'Web App',
      },
    ];
  });
  const [experiences, setExperiences] = useState<ExperienceItem[]>(
    Array.isArray(initialProfile.experiences || initialProfile.experience)
      ? (initialProfile.experiences || initialProfile.experience || [])
      : []
  );
  const [education, setEducation] = useState<EducationItem[]>(
    Array.isArray(initialProfile.education) ? initialProfile.education : []
  );

  // ── Social Links ──────────────────────────────────────────────────────────
  const [socialLinks, setSocialLinks] = useState<DraggableLinkItem[]>(() =>
    buildSocialLinksFromProfile(initialProfile)
  );

  // ── Custom Fields / Dynamic Sections ─────────────────────────────────────
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>(
    Array.isArray(initialProfile.customFields) ? initialProfile.customFields : []
  );
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>(
    Array.isArray(initialProfile.dynamicSections) ? initialProfile.dynamicSections : []
  );

  // ── Section Order & Visibility ────────────────────────────────────────────
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
      phone: false,
    }
  );

  // ── UI / Status ───────────────────────────────────────────────────────────
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // ── Derived values ────────────────────────────────────────────────────────
  const fullName = `${firstName} ${secondName}`.trim();

  const activeSocialsPayload = useMemo(
    () =>
      socialLinks
        .filter((s) => s.visible && s.url.trim())
        .map((s) => ({ platform: s.platform as any, url: s.url, label: s.title })),
    [socialLinks]
  );

  const liveProfile = useMemo<ProfileData>(
    () => ({
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
      tagline: tagline.trim(),
      company: company.trim(),
      location: location.trim(),
      theme: activeTheme,
      avatar,
      coverImage,
      skills,
      projects,
      experience: experiences,
      experiences,
      education,
      socials: activeSocialsPayload,
      socialLinks: activeSocialsPayload,
      customFields,
      dynamicSections,
      sectionOrder,
      sectionVisibility,
      sharingSettings,
    }),
    [
      profile,
      username, fullName, firstName, secondName,
      professionalTitle, bio, about, tagline, company, location,
      activeTheme, avatar, coverImage,
      skills, projects, experiences, education,
      activeSocialsPayload, customFields, dynamicSections,
      sectionOrder, sectionVisibility, sharingSettings,
    ]
  );

  // ── Public URL ────────────────────────────────────────────────────────────
  const currentActiveIdentifier =
    profile.slug || profile.id || initialProfile.slug || initialProfile.id;
  const publicProfileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/profile/${currentActiveIdentifier}`
      : `https://avtive.app/profile/${currentActiveIdentifier}`;

  // ── Upload Handlers ───────────────────────────────────────────────────────
  const handleCoverUpload = useCallback(async (file: File) => {
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
      if (res.ok && data.url) setCoverImage(data.url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingCover(false);
    }
  }, []);

  const handleAvatarUpload = useCallback(async (file: File) => {
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
      if (res.ok && data.url) setAvatar(data.url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, []);

  // ── Social Link Handlers ──────────────────────────────────────────────────
  const handleUpdateLink = useCallback((id: string, patch: Partial<DraggableLinkItem>) => {
    setSocialLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const handleDeleteLink = useCallback((id: string) => {
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleMoveLink = useCallback((index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setSocialLinks((prev) => {
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  }, []);

  const handleAddLinkItem = useCallback((platform: DraggableLinkItem['platform']) => {
    const newLink: DraggableLinkItem = {
      id: `link-${Date.now()}`,
      platform,
      title:
        platform === 'other'
          ? 'Custom Link'
          : platform.charAt(0).toUpperCase() + platform.slice(1),
      url: 'https://',
      visible: true,
    };
    setSocialLinks((prev) => [...prev, newLink]);
  }, []);

  // ── Custom Field Handlers ─────────────────────────────────────────────────
  const handleAddCustomField = useCallback(() => {
    const newField: CustomFieldItem = {
      id: `cf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: 'New Custom Field',
      value: '',
      type: 'text',
      visible: true,
      order: 0, // will be recomputed on update
    };
    setCustomFields((prev) => [...prev, { ...newField, order: prev.length }]);
  }, []);

  const handleUpdateCustomField = useCallback(
    (id: string, patch: Partial<CustomFieldItem>) => {
      setCustomFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    },
    []
  );

  const handleDeleteCustomField = useCallback((id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleMoveCustomField = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      setCustomFields((prev) => {
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;
        const copy = [...prev];
        const [moved] = copy.splice(index, 1);
        copy.splice(targetIndex, 0, moved);
        return copy.map((f, i) => ({ ...f, order: i }));
      });
    },
    []
  );

  // ── Section Order / Visibility ────────────────────────────────────────────
  const handleMoveSection = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      setSectionOrder((prev) => {
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;
        const copy = [...prev];
        const [moved] = copy.splice(index, 1);
        copy.splice(targetIndex, 0, moved);
        return copy;
      });
    },
    []
  );

  const handleToggleSectionVisibility = useCallback((sectionKey: string) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === false ? true : false,
    }));
  }, []);

  /** Used by DynamicSectionGroups — toggles both sharingSettings key and sectionOrder */
  const handleInstantToggleSection = useCallback(
    (sectionId: string, makeVisible: boolean) => {
      const def = ALL_PROFILE_SECTIONS.find((s) => s.id === sectionId);
      if (!def) return;
      setSharingSettings((prev) => ({ ...prev, [def.key]: makeVisible }));
      setSectionOrder((prev) => {
        const without = prev.filter((id) => id !== sectionId);
        return [...without, sectionId];
      });
    },
    []
  );

  const toggleVisibilityField = useCallback((field: keyof SharingSettings) => {
    setSharingSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // ── Copy Link ─────────────────────────────────────────────────────────────
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
    } catch {
      // ignore — still show success
    }
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  }, [publicProfileUrl]);

  // ── Profile Section Editor callbacks (used by SlidingEditorPanel inline editor) ──
  const handleProfileSectionLiveUpdate = useCallback(
    (updatedFields: Partial<ProfileData>) => {
      if (updatedFields.firstName !== undefined) setFirstName(updatedFields.firstName);
      if (updatedFields.secondName !== undefined) setSecondName(updatedFields.secondName);
      if (updatedFields.username !== undefined) setUsername(updatedFields.username);
      if (updatedFields.profession !== undefined) setProfessionalTitle(updatedFields.profession);
      if (updatedFields.shortBio !== undefined) setBio(updatedFields.shortBio);
      if (updatedFields.fullBio !== undefined) setAbout(updatedFields.fullBio);
      if (updatedFields.tagline !== undefined) setTagline(updatedFields.tagline);
      if (updatedFields.company !== undefined) setCompany(updatedFields.company);
      if (updatedFields.location !== undefined) setLocation(updatedFields.location);
      if (updatedFields.theme !== undefined) setActiveTheme(updatedFields.theme);
      if (updatedFields.avatar !== undefined) setAvatar(updatedFields.avatar);
      if (updatedFields.coverImage !== undefined) setCoverImage(updatedFields.coverImage);
    },
    []
  );

  const handleProfileSectionSaveSuccess = useCallback(
    (savedProfile: ProfileData, isNew?: boolean) => {
      setProfile(savedProfile);
      if (savedProfile.theme) setActiveTheme(savedProfile.theme);
      if (savedProfile.firstName) setFirstName(savedProfile.firstName);
      if (savedProfile.secondName || savedProfile.lastName)
        setSecondName(savedProfile.secondName || savedProfile.lastName || '');
      if (savedProfile.username || savedProfile.slug)
        setUsername(savedProfile.username || savedProfile.slug || '');
      if (savedProfile.profession || savedProfile.designation || savedProfile.professionalTitle)
        setProfessionalTitle(
          savedProfile.profession || savedProfile.designation || savedProfile.professionalTitle || ''
        );
      if (savedProfile.bio || savedProfile.shortBio) setBio(savedProfile.bio || savedProfile.shortBio || '');
      if (savedProfile.about || savedProfile.fullBio) setAbout(savedProfile.about || savedProfile.fullBio || '');
      if (savedProfile.tagline !== undefined) setTagline(savedProfile.tagline || '');
      if (savedProfile.company) setCompany(savedProfile.company);
      if (savedProfile.location) setLocation(savedProfile.location);
      if (savedProfile.avatar) setAvatar(savedProfile.avatar);
      if (savedProfile.coverImage) setCoverImage(savedProfile.coverImage);

      setStatusMessage({
        type: 'success',
        text: isNew
          ? `✓ Created new profile persona "${savedProfile.profileName || savedProfile.name}"!`
          : '✓ Profile updated and synchronized successfully!',
      });
    },
    []
  );

  // ── Switch Profile Persona ────────────────────────────────────────────────
  const handleSwitchToProfile = useCallback((newProf: ProfileData) => {
    setProfile(newProf);
    setActiveTheme(newProf.theme === 'default' ? 'editorial' : (newProf.theme || 'editorial'));

    const fName = newProf.firstName || (newProf.name ? newProf.name.split(' ')[0] : '');
    const lName =
      newProf.secondName ||
      newProf.lastName ||
      (newProf.name ? newProf.name.split(' ').slice(1).join(' ') : '');
    setFirstName(fName);
    setSecondName(lName);
    setUsername(newProf.username || newProf.slug || '');
    setProfessionalTitle(newProf.professionalTitle || newProf.designation || newProf.profession || '');
    setBio(newProf.bio || newProf.shortBio || '');
    setTagline(newProf.tagline || '');
    setCompany(newProf.company || '');
    setLocation(newProf.location || '');
    setAvatar(
      newProf.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
    );
    setCoverImage(
      newProf.coverImage ||
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'
    );
    setSkills(extractSkills(newProf));
    setAbout(newProf.about || newProf.fullBio || '');
    setProjects(Array.isArray(newProf.projects) ? newProf.projects : []);
    setExperiences(
      Array.isArray(newProf.experiences || newProf.experience)
        ? (newProf.experiences || newProf.experience || [])
        : []
    );
    setEducation(Array.isArray(newProf.education) ? newProf.education : []);
    setSocialLinks(buildSocialLinksFromProfile(newProf));
    setCustomFields(Array.isArray(newProf.customFields) ? newProf.customFields : []);
    setDynamicSections(Array.isArray(newProf.dynamicSections) ? newProf.dynamicSections : []);
    if (Array.isArray(newProf.sectionOrder) && newProf.sectionOrder.length > 0) {
      setSectionOrder(newProf.sectionOrder);
    } else {
      setSectionOrder(DEFAULT_SECTION_ORDER);
    }
    if (newProf.sectionVisibility && Object.keys(newProf.sectionVisibility).length > 0) {
      setSectionVisibility(newProf.sectionVisibility);
    } else {
      setSectionVisibility(DEFAULT_SECTION_VISIBILITY);
    }
    if (newProf.sharingSettings) setSharingSettings(newProf.sharingSettings);
    setIsConfirmed(false);

    setStatusMessage({
      type: 'success',
      text: `✓ Switched to profile: ${newProf.profileName || newProf.name}`,
    });
    setTimeout(() => {
      setStatusMessage((prev) => (prev?.type === 'success' ? null : prev));
    }, 3500);
  }, []);

  // ── Save All Changes ──────────────────────────────────────────────────────
  const handleSaveChanges = useCallback(async () => {
    if (!isConfirmed) {
      setStatusMessage({
        type: 'error',
        text: 'Please check the confirmation box to confirm your profile changes before saving.',
      });
      return;
    }

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
      tagline: tagline.trim(),
      company: company.trim(),
      location: location.trim(),
      theme: activeTheme,
      avatar,
      coverImage,
      skills,
      projects,
      experience: experiences,
      experiences,
      education,
      socials: activeSocialsPayload,
      socialLinks: activeSocialsPayload,
      customFields,
      dynamicSections,
      sectionOrder,
      sectionVisibility,
      sharingSettings,
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
          updatedData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save changes.' });
        setIsSaving(false);
        return;
      }

      const savedSlug =
        data.updatedProfile?.slug ||
        data.profile?.slug ||
        profile.slug ||
        initialProfile.slug ||
        initialProfile.id;
      const finalProfile: ProfileData =
        data.updatedProfile || data.profile || { ...profile, ...updatedData, slug: savedSlug };
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
        text: '✓ Profile saved successfully! Live preview updated.',
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
  }, [
    fullName, firstName, secondName, username,
    professionalTitle, bio, about, tagline, company, location,
    activeTheme, avatar, coverImage,
    skills, projects, experiences, education,
    activeSocialsPayload, customFields, dynamicSections,
    sectionOrder, sectionVisibility, sharingSettings,
    isConfirmed,
    profile, initialProfile, onSaveSuccess,
  ]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = useMemo<ProfileEditorContextValue>(
    () => ({
      profile,
      activeTheme, setActiveTheme,
      firstName, setFirstName,
      secondName, setSecondName,
      username, setUsername,
      professionalTitle, setProfessionalTitle,
      bio, setBio,
      tagline, setTagline,
      company, setCompany,
      location, setLocation,
      avatar, setAvatar,
      coverImage, setCoverImage,
      skills, setSkills,
      about, setAbout,
      projects, setProjects,
      experiences, setExperiences,
      education, setEducation,
      socialLinks, setSocialLinks,
      customFields, setCustomFields,
      dynamicSections, setDynamicSections,
      sectionOrder, setSectionOrder,
      sectionVisibility, setSectionVisibility,
      sharingSettings, setSharingSettings,
      fullName,
      liveProfile,
      activeSocialsPayload,
      isUploadingAvatar,
      isUploadingCover,
      isSaving,
      isConfirmed,
      setIsConfirmed,
      statusMessage,
      copySuccess,
      handleAvatarUpload,
      handleCoverUpload,
      handleAddLinkItem,
      handleUpdateLink,
      handleDeleteLink,
      handleMoveLink,
      handleAddCustomField,
      handleUpdateCustomField,
      handleDeleteCustomField,
      handleMoveCustomField,
      handleMoveSection,
      handleToggleSectionVisibility,
      handleInstantToggleSection,
      toggleVisibilityField,
      handleCopyLink,
      handleSaveChanges,
      handleSwitchToProfile,
      handleProfileSectionLiveUpdate,
      handleProfileSectionSaveSuccess,
      currentActiveIdentifier,
      publicProfileUrl,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      profile, activeTheme, firstName, secondName, username,
      professionalTitle, bio, tagline, company, location, avatar, coverImage,
      skills, about, projects, experiences, education,
      socialLinks, customFields, dynamicSections,
      sectionOrder, sectionVisibility, sharingSettings,
      fullName, liveProfile, activeSocialsPayload,
      isUploadingAvatar, isUploadingCover, isSaving, isConfirmed, statusMessage, copySuccess,
    ]
  );

  return (
    <ProfileEditorContext.Provider value={value}>
      {children}
    </ProfileEditorContext.Provider>
  );
}
