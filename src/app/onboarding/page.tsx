import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUserById, getProfileByUserId } from '@/lib/db';
import { getNextOnboardingRoute } from '@/lib/onboarding';

export const dynamic = 'force-dynamic';

export default async function OnboardingRootPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?returnUrl=/onboarding');
  }

  const [user, profile] = await Promise.all([
    getUserById(session.id),
    getProfileByUserId(session.id).catch(() => null)
  ]);

  const target = getNextOnboardingRoute({
    ...user,
    profileSlug: profile?.slug || profile?.id
  });

  redirect(target);
}
