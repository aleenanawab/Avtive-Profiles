import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfilesByUserId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();

  // 1. Unauthenticated landing: immediately redirect to /register
  if (!session) {
    redirect('/register');
  }

  // 2. Authenticated user: check existing profiles
  const profiles = await getProfilesByUserId(session.id);

  // 3. New user without profiles: start sequential onboarding
  if (!profiles || profiles.length === 0) {
    redirect('/onboarding/theme');
  }

  // 4. Existing user: isolate to user's own dynamic profile
  redirect(`/profile/${profiles[0].slug || profiles[0].id}`);
}
