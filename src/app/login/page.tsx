import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfilesByUserId, createProfileForUser } from '@/lib/db';
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

  // Existing authenticated users should not see login form again
  if (session) {
    const profiles = await getProfilesByUserId(session.id);
    if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/register')) {
      redirect(returnUrl);
    } else if (profiles && profiles.length > 0) {
      redirect(`/profile/${profiles[0].slug || profiles[0].id}`);
    } else {
      const newProfile = await createProfileForUser(session.id, {
        name: session.name,
        email: session.email,
        profileName: 'Primary Profile',
        designation: 'Professional',
        type: 'individual',
        theme: 'editorial'
      });
      redirect(`/profile/${newProfile.slug || newProfile.id}`);
    }
  }

  return <LoginClient />;
}
