import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProfileByUserId, getProfilesByUserId, getUserById } from '@/lib/db';
import { getNextOnboardingRoute } from '@/lib/onboarding';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({
        user: null,
        profile: null,
        profiles: [],
        roleCompleted: false,
        themeCompleted: false,
        scriptCompleted: false,
        onboardingCompleted: false,
        nextRoute: '/onboarding/role'
      });
    }

    const [dbUser, profile, profiles] = await Promise.all([
      getUserById(session.id),
      getProfileByUserId(session.id).catch(() => null),
      getProfilesByUserId(session.id).catch(() => [])
    ]);

    const userProfile = profile || (profiles && profiles.length > 0 ? profiles[0] : null);
    const profileSlug = userProfile?.slug || userProfile?.id || null;

    const roleCompleted = Boolean(dbUser?.roleCompleted);
    const themeCompleted = Boolean(dbUser?.themeCompleted);
    const scriptCompleted = Boolean(dbUser?.scriptCompleted);
    const onboardingCompleted = Boolean(dbUser?.onboardingCompleted);

    const nextRoute = getNextOnboardingRoute({
      id: dbUser?.id || session.id,
      roleCompleted,
      themeCompleted,
      scriptCompleted,
      onboardingCompleted,
      role: dbUser?.role || userProfile?.type,
      preferredTheme: dbUser?.preferredTheme || userProfile?.theme,
      profileSlug
    });

    const userObj = {
      ...session,
      roleCompleted,
      themeCompleted,
      scriptCompleted,
      onboardingCompleted,
      preferredTheme: dbUser?.preferredTheme || userProfile?.theme || 'editorial',
      role: dbUser?.role || userProfile?.type || 'individual'
    };

    return NextResponse.json({
      user: userObj,
      profile: userProfile || null,
      profiles: profiles || [],
      hasProfile: Boolean(userProfile),
      roleCompleted,
      themeCompleted,
      scriptCompleted,
      onboardingCompleted,
      role: userProfile?.type || dbUser?.role || null,
      profileSlug,
      nextRoute
    });

  } catch (error) {
    console.error('Auth Me API Error:', error);
    return NextResponse.json(
      { user: null, profile: null, onboardingCompleted: false },
      { status: 200 }
    );
  }
}
