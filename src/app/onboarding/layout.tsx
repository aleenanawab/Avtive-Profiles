import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Setup Your Avtive Profile | Onboarding',
  description: 'Sequential onboarding flow to set up your verified Avtive digital identity profile.'
};

export default async function OnboardingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login?returnUrl=/onboarding/role');
  }

  // If user already has an existing profile, redirect directly to dashboard so onboarding is never shown again
  const { getProfileByUserId, getProfilesByUserId } = await import('@/lib/db');
  const profile = await getProfileByUserId(session.id);
  const profiles = profile ? [profile] : await getProfilesByUserId(session.id);
  if (profile || (profiles && profiles.length > 0)) {
    redirect('/dashboard');
  }

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex flex-col">
      {children}
    </div>
  );
}
