import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProfileByUserId, getProfilesByUserId } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null, profile: null, profiles: [] });
    }

    const [profile, profiles] = await Promise.all([
      getProfileByUserId(session.id),
      getProfilesByUserId(session.id)
    ]);

    const userProfile = profile || (profiles && profiles.length > 0 ? profiles[0] : null);

    return NextResponse.json({
      user: session,
      profile: userProfile || null,
      profiles,
      hasProfile: Boolean(userProfile),
      role: userProfile?.type || null,
      profileSlug: userProfile?.slug || userProfile?.id || null
    });

  } catch (error) {
    console.error('Auth Me API Error:', error);
    return NextResponse.json(
      { user: null, profile: null },
      { status: 200 }
    );
  }
}
