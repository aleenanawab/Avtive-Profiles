import { ProfileType, ProfileTheme } from '@/types/profile';

export interface OnboardingUser {
  id?: string;
  roleCompleted?: boolean;
  themeCompleted?: boolean;
  scriptCompleted?: boolean;
  onboardingCompleted?: boolean;
  role?: ProfileType | string | null;
  preferredTheme?: ProfileTheme | string | null;
  profileSlug?: string | null;
  slug?: string | null;
}

export const ONBOARDING_ROUTES = {
  ROLE: '/onboarding/role',
  THEME: '/onboarding/theme',
  SCRIPT: '/onboarding/create',
  EDITOR: '/edit-profile',
} as const;

/**
 * Single routing helper for onboarding flow across Avtive-Profiles.
 * Evaluates persisted boolean flags:
 * - !roleCompleted -> Role page (/onboarding/role)
 * - !themeCompleted -> Theme page (/onboarding/theme)
 * - !scriptCompleted -> Script page (/onboarding/create)
 * - !onboardingCompleted -> Profile Editor (/edit-profile)
 * - otherwise -> saved Profile Review page (/profile/[slug] or /profile/[id] or /profile)
 */
export function getNextOnboardingRoute(user?: OnboardingUser | null): string {
  if (!user) {
    return ONBOARDING_ROUTES.ROLE;
  }

  // 1. Direct completed users to Profile Review FIRST before individual step checks.
  // Never send completed users back to Role, Theme, or Script even if an old step flag is false or null.
  if (user.onboardingCompleted) {
    const identifier = user.profileSlug || user.slug || user.id;
    return identifier ? `/profile/${encodeURIComponent(identifier)}` : '/profile';
  }

  // 2. Sequential incomplete user progression: Role -> Theme -> Script -> Profile Editor
  if (!user.roleCompleted) {
    return ONBOARDING_ROUTES.ROLE;
  }

  if (!user.themeCompleted) {
    return ONBOARDING_ROUTES.THEME;
  }

  if (!user.scriptCompleted) {
    return ONBOARDING_ROUTES.SCRIPT;
  }

  return ONBOARDING_ROUTES.EDITOR;
}
