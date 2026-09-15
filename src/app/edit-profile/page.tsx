import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfileByIdOrSlug, getProfilesByUserId, createProfileForUser } from '@/lib/db';
import { EditProfileClient } from './EditProfileClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Profile | Avtive',
  description: 'Update your professional digital profile and identity on Avtive.'
};

interface EditProfilePageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EditProfilePage({ searchParams }: EditProfilePageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/login?returnUrl=/edit-profile');
  }

  const { id } = await searchParams;

  let targetProfile = null;
  if (id) {
    targetProfile = await getProfileByIdOrSlug(id);
  }

  // Fallback to user's first profile if no id specified or not found
  if (!targetProfile || targetProfile.userId !== session.id) {
    const userProfiles = await getProfilesByUserId(session.id);
    if (userProfiles.length > 0) {
      targetProfile = userProfiles[0];
    } else if (targetProfile) {
      targetProfile.userId = session.id;
    } else {
      targetProfile = await createProfileForUser(session.id, {
        name: session.name,
        email: session.email,
        profileName: 'Primary Profile',
        designation: 'Professional',
        type: 'owner'
      });
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#FAFAF9] dark:bg-[#09090B] text-slate-900 dark:text-white transition-colors font-sans">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading profile editor...</div>}>
        <EditProfileClient initialProfile={targetProfile} />
      </Suspense>
    </main>
  );
}
