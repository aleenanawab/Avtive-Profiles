import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfilesByUserId } from '@/lib/db';
import RegisterClient from './RegisterClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Register | Avtive',
  description: 'Create your digital identity profile on Avtive.'
};

export default async function RegisterPage() {
  const session = await getSession();

  // Existing authenticated users should not see register form again
  if (session) {
    const profiles = await getProfilesByUserId(session.id);
    if (profiles && profiles.length > 0) {
      // Returning user with profile: redirect directly to profile without asking theme again
      redirect(`/profile/${profiles[0].slug || profiles[0].id}`);
    } else {
      // First-time user without profile: route to theme selection
      redirect('/onboarding/theme');
    }
  }

  return <RegisterClient />;
}
