import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfileByUserId } from '@/lib/db';
import { CreateProfileClient } from './CreateProfileClient';

export const metadata = {
  title: 'Create Your Profile | Avtive',
  description: 'Create your digital identity profile and pass card on Avtive.'
};

export default async function CreateProfilePage() {
  const session = await getSession();

  // 1. If not authenticated, redirect to Login
  if (!session) {
    redirect('/login?returnUrl=/create-profile');
  }

  // 2. If profile already exists, do NOT send user back to creation or duplicate
  const existingProfile = await getProfileByUserId(session.id);
  if (existingProfile) {
    redirect(`/profile/${existingProfile.slug || existingProfile.id}`);
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-white transition-colors">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading profile setup...</div>}>
        <CreateProfileClient user={session} />
      </Suspense>
    </main>
  );
}
