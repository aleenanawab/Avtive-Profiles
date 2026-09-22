import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getProfilesByUserId, createProfileForUser } from '@/lib/db';

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
      const newProfile = await createProfileForUser(session.id, {
        name: session.name,
        email: session.email,
        profileName: 'Primary Profile',
        designation: 'Professional',
        type: 'individual',
        theme: 'editorial'
      });
      redirect(`/profile/${newProfile.slug || newProfile.id}/edit`);
    }
  }

  // New visitors default to the registration flow
  redirect('/register');
}


