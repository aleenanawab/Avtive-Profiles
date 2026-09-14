import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function MyProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?returnUrl=/my-profile');
  }

  redirect('/dashboard');
}
