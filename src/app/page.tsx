import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfilesByUserId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();

  if (session) {
    const userProfiles = await getProfilesByUserId(session.id);
    if (userProfiles && userProfiles.length > 0) {
      const primaryProfile = userProfiles[0];
      const targetId = primaryProfile.slug || primaryProfile.id;
      redirect(`/profile/${targetId}/edit`);
    } else {
      redirect('/onboarding/theme');
    }
  }

  // New visitors default to the registration flow
  redirect('/register');
}


