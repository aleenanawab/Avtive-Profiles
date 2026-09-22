import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfilesByUserId } from '@/lib/db';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Login | Avtive',
  description: 'Sign in to your Avtive digital profile account.'
};

interface LoginPageProps {
  searchParams: Promise<{ returnUrl?: string; registered?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  const { returnUrl } = await searchParams;

  // Authenticated session check
  if (session) {
    const profiles = await getProfilesByUserId(session.id);
    if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/register')) {
      redirect(returnUrl);
    } else if (profiles && profiles.length > 0) {
      // Returning user with profile: redirect directly to profile without asking theme again
      redirect(`/profile/${profiles[0].slug || profiles[0].id}`);
    } else {
      // First-time logged in user without profile: ask theme for the first time
      redirect('/onboarding/theme');
    }
  }

  return <LoginClient />;
}
