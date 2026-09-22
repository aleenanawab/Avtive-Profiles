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
      // Returning user with profile: redirect directly to profile without asking theme again
      redirect(`/profile/${targetId}`);
    } else {
      // First time logged-in user without profile: ask theme for the first time
      redirect('/onboarding/theme');
    }
  }

  // Whenever a user meets our app, they log in through the website
  redirect('/login');
}
