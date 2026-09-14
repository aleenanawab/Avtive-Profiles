import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfileByIdOrSlug, getProfilesByUserId } from '@/lib/db';
import { EditProfileClient } from '@/app/edit-profile/EditProfileClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Profile | Avtive',
  description: 'Update your verified professional profile on Avtive.'
};

interface EditProfilePageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ProfileEditPage({ searchParams }: EditProfilePageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/login?returnUrl=/profile/edit');
  }

  const { id } = await searchParams;

  let targetProfile = null;
  if (id) {
    targetProfile = await getProfileByIdOrSlug(id);
  }

  // Fallback to user's first profile if not found or unauthorized
  if (!targetProfile || targetProfile.userId !== session.id) {
    const userProfiles = await getProfilesByUserId(session.id);
    if (userProfiles.length === 0) {
      redirect('/onboarding/theme');
    }
    targetProfile = userProfiles[0];
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#FAFAF9] dark:bg-[#09090B] text-slate-900 dark:text-white transition-colors font-sans">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading profile editor...</div>}>
        <EditProfileClient initialProfile={targetProfile} />
      </Suspense>
    </main>
  );
}
