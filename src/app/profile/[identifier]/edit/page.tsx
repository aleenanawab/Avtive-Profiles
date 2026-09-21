import React, { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfileByIdOrSlug, getProfilesByUserId, createProfileForUser } from '@/lib/db';
import { EditProfileClient } from '@/app/edit-profile/EditProfileClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Profile | Avtive',
  description: 'Update your verified professional profile on Avtive.'
};

interface ProfileIdentifierEditProps {
  params: Promise<{ identifier: string }>;
}

export default async function ProfileIdentifierEditPage({ params }: ProfileIdentifierEditProps) {
  const session = await getSession();
  const { identifier } = await params;

  if (!session) {
    redirect(`/login?returnUrl=/profile/${identifier}/edit`);
  }

  // Attempt lookup by identifier (slug, profileId, or userId)
  let targetProfile = await getProfileByIdOrSlug(identifier);

  // If identifier is userId, fallback to user's profile
  if (!targetProfile) {
    const userProfiles = await getProfilesByUserId(identifier);
    if (userProfiles.length > 0) {
      targetProfile = userProfiles[0];
    }
  }

  // If still not found or belongs to another user, restrict to current user's profile
  if (!targetProfile || targetProfile.userId !== session.id) {
    const sessionProfiles = await getProfilesByUserId(session.id);
    if (sessionProfiles.length > 0) {
      targetProfile = sessionProfiles[0];
    } else if (targetProfile) {
      // Associate matched profile with current user session
      targetProfile.userId = session.id;
    } else {
      // Graceful creation fallback: ensure user always lands on the editing page
      targetProfile = await createProfileForUser(session.id, {
        name: session.name,
        email: session.email,
        profileName: 'Primary Profile',
        designation: 'Professional',
        type: 'individual'
      });
    }
  }

  const allUserProfiles = await getProfilesByUserId(session.id);

  return (
    <main className="min-h-screen w-full bg-[#080D1A] text-slate-100 font-sans">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold text-slate-400">Loading profile editor...</div>}>
        <EditProfileClient 
          initialProfile={targetProfile} 
          userProfiles={allUserProfiles}
        />
      </Suspense>
    </main>
  );
}
