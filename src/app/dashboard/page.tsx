import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfilesByUserId } from '@/lib/db';
import { ProfileDashboard } from '@/components/profiles/ProfileDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profiles | Avtive Workspaces',
  description: 'Manage your verified digital profiles and professional identities on Avtive.'
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?returnUrl=/dashboard');
  }

  const profiles = await getProfilesByUserId(session.id);
  if (profiles.length === 0) {
    redirect('/create-profile');
  }

  return (
    <ProfileDashboard
      initialProfiles={profiles}
      user={session}
    />
  );
}
