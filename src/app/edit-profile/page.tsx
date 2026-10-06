import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfileByIdOrSlug, getProfilesByUserId, createProfileForUser, updateProfile } from '@/lib/db';
import { normalizeProfileType, ProfileTheme } from '@/types/profile';
import { EditProfileClient } from './EditProfileClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Edit Profile | Avtive',
  description: 'Update your professional digital profile and identity on Avtive.'
};

interface EditProfilePageProps {
  searchParams: Promise<{ id?: string; role?: string; theme?: string }>;
}

export default async function EditProfilePage({ searchParams }: EditProfilePageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/login?returnUrl=/edit-profile');
  }

  const { id, role, theme } = await searchParams;

  let targetProfile = null;
  if (id) {
    targetProfile = await getProfileByIdOrSlug(id);
  }

  // Fallback to user's first profile if no id specified or not found
  if (!targetProfile || targetProfile.userId !== session.id) {
    const userProfiles = await getProfilesByUserId(session.id);
    if (userProfiles.length > 0) {
      targetProfile = userProfiles[0];
      if (role || theme) {
        const updateRes = await updateProfile(
          targetProfile.id,
          {
            ...(role ? { type: normalizeProfileType(role) } : {}),
            ...(theme ? { theme: theme as ProfileTheme } : {})
          },
          session.id
        );
        if (updateRes.profile) {
          targetProfile = updateRes.profile;
        }
      }
    } else if (targetProfile) {
      targetProfile.userId = session.id;
    } else {
      const selectedRole = normalizeProfileType(role || 'individual');
      const selectedTheme = (theme && theme !== 'default' ? theme : 'editorial') as ProfileTheme;
      targetProfile = await createProfileForUser(session.id, {
        name: session.name,
        email: session.email,
        profileName: selectedRole === 'team' ? 'Company Profile' : 'Primary Profile',
        designation: 'Professional',
        type: selectedRole,
        theme: selectedTheme
      });
    }
  }

  const targetSlug = targetProfile.slug || targetProfile.id;
  redirect(`/profile/${encodeURIComponent(targetSlug)}?edit=true`);
}
