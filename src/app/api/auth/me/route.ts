import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProfileByUserId, getProfilesByUserId, getUserById } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null, profile: null, profiles: [], onboardingCompleted: false });
    }

    const [dbUser, profile, profiles] = await Promise.all([
      getUserById(session.id),
      getProfileByUserId(session.id),
      getProfilesByUserId(session.id)
    ]);

    const userProfile = profile || (profiles && profiles.length > 0 ? profiles[0] : null);
    const isOnboardingComplete = Boolean(dbUser?.onboardingCompleted || userProfile);

    return NextResponse.json({
      user: {
        ...session,
        onboardingCompleted: isOnboardingComplete,
        preferredTheme: dbUser?.preferredTheme || userProfile?.theme || 'editorial',
        role: dbUser?.role || userProfile?.type || 'individual'
      },
      profile: userProfile || null,
      profiles,
      hasProfile: Boolean(userProfile),
      onboardingCompleted: isOnboardingComplete,
      role: userProfile?.type || dbUser?.role || null,
      profileSlug: userProfile?.slug || userProfile?.id || null
    });

  } catch (error) {
    console.error('Auth Me API Error:', error);
    return NextResponse.json(
      { user: null, profile: null, onboardingCompleted: false },
      { status: 200 }
    );
  }
}
