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

  // Existing authenticated users must not be sent through registration again
  if (session) {
    const profiles = await getProfilesByUserId(session.id);
    if (profiles && profiles.length > 0) {
      redirect(`/profile/${profiles[0].slug || profiles[0].id}`);
    } else {
      redirect('/onboarding/theme');
    }
  }

  return <RegisterClient />;
}
