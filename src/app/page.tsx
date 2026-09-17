import { redirect } from 'next/navigation';
import { getSession, isReturningUser } from '@/lib/auth';
import { getProfilesByUserId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();

  // 1. Existing authenticated user: Never send through registration again!
  if (session) {
    const profiles = await getProfilesByUserId(session.id);
    if (profiles && profiles.length > 0) {
      redirect(`/profile/${profiles[0].slug || profiles[0].id}`);
    } else {
      redirect('/onboarding/theme');
    }
  }

  // 2. Unauthenticated user: Check if returning user vs new visitor
  const returning = await isReturningUser();
  if (returning) {
    redirect('/login');
  }

  // 3. New visitor without prior account history: enter registration
  redirect('/register');
}

