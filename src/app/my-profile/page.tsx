import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfileByUserId } from '@/lib/db';

export default async function MyProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?returnUrl=/my-profile');
  }

  const profile = await getProfileByUserId(session.id);
  if (!profile) {
    redirect('/create-profile');
  }

  redirect(`/profile/${profile.slug || profile.id}`);
}
