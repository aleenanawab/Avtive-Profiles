'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ProfileData, 
  ProfileTheme 
} from '@/types/profile';

export interface ProfileEditorContextValue {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  updateField: <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => void;
  updateProfilePartial: (partial: Partial<ProfileData>) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  activeSectionTarget: { sectionKey: string; fieldKey?: string; timestamp: number } | null;
  setActiveSectionTarget: (target: { sectionKey: string; fieldKey?: string; timestamp: number } | null) => void;
  isSaving: boolean;
  saveProfile: (overrideData?: Partial<ProfileData>) => Promise<boolean>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  activeTheme: ProfileTheme;
  setActiveTheme: (theme: ProfileTheme) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  userProfiles?: ProfileData[];
  currentIdentifier: string;
  handleSwitchPersona: (newProf: ProfileData) => void;
}

const ProfileEditorContext = createContext<ProfileEditorContextValue | null>(null);

export interface ProfileEditorProviderProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
  children: React.ReactNode;
}

export function ProfileEditorProvider({
  initialProfile,
  userProfiles,
  children
}: ProfileEditorProviderProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme === 'default' ? 'editorial' : (initialProfile.theme || 'editorial')
  );
  const [isDark, setIsDark] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [activeSectionTarget, setActiveSectionTarget] = useState<{
    sectionKey: string;
    fieldKey?: string;
    timestamp: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync dark mode from document using MutationObserver subscription
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Update a single field in state
  const updateField = useCallback(<K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update multiple fields at once
  const updateProfilePartial = useCallback((partial: Partial<ProfileData>) => {
    setProfile((prev) => ({
      ...prev,
      ...partial
    }));
    if (partial.theme && partial.theme !== activeTheme) {
      setActiveTheme(partial.theme);
    }
  }, [activeTheme]);

  // Persona switching
  const handleSwitchPersona = useCallback((newProf: ProfileData) => {
    setProfile(newProf);
    if (newProf.theme) {
      setActiveTheme(newProf.theme === 'default' ? 'editorial' : newProf.theme);
    }
    showToast(`✓ Switched to persona: ${newProf.profileName || newProf.name}`);
  }, [showToast]);

  const currentIdentifier = useMemo(() => {
    return profile.slug || profile.id || initialProfile.slug || initialProfile.id || '';
  }, [profile.slug, profile.id, initialProfile.slug, initialProfile.id]);

  // Centralized Save Profile to Backend & LocalStorage
  const saveProfile = useCallback(async (overrideData?: Partial<ProfileData>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const dataToSave = overrideData ? { ...profile, ...overrideData } : profile;
      const res = await fetch('/api/profiles/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: dataToSave.id || initialProfile.id,
          profileSlug: dataToSave.slug || initialProfile.slug,
          slug: dataToSave.slug || initialProfile.slug,
          userId: dataToSave.userId || initialProfile.userId,
          updatedData: dataToSave
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to save changes.');
        setIsSaving(false);
        return false;
      }

      const savedSlug = data.updatedProfile?.slug || data.profile?.slug || dataToSave.slug || initialProfile.slug || initialProfile.id;
      const finalProfile: ProfileData = data.updatedProfile || data.profile || { ...dataToSave, slug: savedSlug };
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

      showToast('✓ Profile saved successfully!');
      return true;
    } catch (err: unknown) {
      console.error('Save profile error:', err);
      showToast('Network error while saving changes.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [profile, initialProfile, showToast]);

  const contextValue = useMemo<ProfileEditorContextValue>(() => ({
    profile,
    setProfile,
    updateField,
    updateProfilePartial,
    activeSection,
    setActiveSection,
    activeSectionTarget,
    setActiveSectionTarget,
    isSaving,
    saveProfile,
    toastMessage,
    showToast,
    activeTheme,
    setActiveTheme,
    isDark,
    setIsDark,
    userProfiles,
    currentIdentifier,
    handleSwitchPersona
  }), [
    profile,
    updateField,
    updateProfilePartial,
    activeSection,
    activeSectionTarget,
    isSaving,
    saveProfile,
    toastMessage,
    showToast,
    activeTheme,
    isDark,
    userProfiles,
    currentIdentifier,
    handleSwitchPersona
  ]);

  return (
    <ProfileEditorContext.Provider value={contextValue}>
      {children}
    </ProfileEditorContext.Provider>
  );
}

export function useProfileEditor(): ProfileEditorContextValue {
  const ctx = useContext(ProfileEditorContext);
  if (!ctx) {
    throw new Error('useProfileEditor must be used within a ProfileEditorProvider');
  }
  return ctx;
}
