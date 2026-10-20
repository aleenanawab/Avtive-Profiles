import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getProfileByUserId, DatabaseUnavailableError } from '@/lib/db';
import { verifyPassword, setSessionCookie, DUMMY_BCRYPT_HASH, setReturningUserCookie, clearLegacyCacheCookie } from '@/lib/auth';
import { getNextOnboardingRoute } from '@/lib/onboarding';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user;
    try {
      user = await getUserByEmail(normalizedEmail);
    } catch (dbErr: any) {
      const isDbUnavailable =
        dbErr instanceof DatabaseUnavailableError ||
        dbErr?.code === 'DATABASE_UNAVAILABLE' ||
        dbErr?.status === 503;

      if (isDbUnavailable) {
        console.error(`[Login API Error] Database/configuration unavailable: [code=${dbErr?.code || 'DATABASE_UNAVAILABLE'}] ${dbErr?.message || 'Database error'}`);
        return NextResponse.json(
          {
            error: 'Authentication service is temporarily unavailable. Please try again in a few moments.',
            code: 'DATABASE_UNAVAILABLE'
          },
          { status: 503 }
        );
      }
      throw dbErr;
    }

    // ANTI-ENUMERATION TIMING DEFENSE:
    // If user does not exist, run verifyPassword against constant dummy hash
    // so response time is identical to the path where user exists
    if (!user) {
      await verifyPassword(password, DUMMY_BCRYPT_HASH);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (!user.passwordHash || user.passwordHash.startsWith('oauth_google_')) {
      // If oauth account without password or missing password hash, run dummy verify
      await verifyPassword(password, DUMMY_BCRYPT_HASH);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Login succeeds ONLY for a persisted user with a bcrypt-verified hash
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    let userProfile = null;
    try {
      userProfile = await getProfileByUserId(user.id);
    } catch (profErr: any) {
      console.warn('[Login API Warning] Profile fetch error for authenticated user:', profErr?.message || 'Profile lookup failed');
    }

    const redirectUrl = getNextOnboardingRoute({
      id: user.id,
      roleCompleted: user.roleCompleted,
      themeCompleted: user.themeCompleted,
      scriptCompleted: user.scriptCompleted,
      onboardingCompleted: user.onboardingCompleted,
      role: user.role || userProfile?.type,
      preferredTheme: user.preferredTheme || userProfile?.theme,
      profileSlug: userProfile?.slug || userProfile?.id || null
    });

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      roleCompleted: Boolean(user.roleCompleted),
      themeCompleted: Boolean(user.themeCompleted),
      scriptCompleted: Boolean(user.scriptCompleted),
      onboardingCompleted: Boolean(user.onboardingCompleted),
      role: user.role || userProfile?.type || 'individual',
      preferredTheme: user.preferredTheme || userProfile?.theme || 'editorial'
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: sessionUser,
      hasProfile: Boolean(userProfile),
      profileSlug: userProfile?.slug || userProfile?.id || null,
      profileType: userProfile?.type || user.role || 'individual',
      type: userProfile?.type || user.role || 'individual',
      roleCompleted: Boolean(user.roleCompleted),
      themeCompleted: Boolean(user.themeCompleted),
      scriptCompleted: Boolean(user.scriptCompleted),
      onboardingCompleted: Boolean(user.onboardingCompleted),
      role: userProfile?.type || user.role || null,
      redirectTo: redirectUrl
    });

    response.headers.set('Cache-Control', 'no-store, max-age=0');
    await setSessionCookie(sessionUser, response);
    setReturningUserCookie(response);
    clearLegacyCacheCookie(response);

    return response;
  } catch (error: any) {
    if (error instanceof DatabaseUnavailableError || error?.code === 'DATABASE_UNAVAILABLE' || error?.status === 503) {
      console.error('[Login API Error] Database unavailable in login handler:', error?.message);
      return NextResponse.json(
        {
          error: 'Authentication service is temporarily unavailable. Please try again in a few moments.',
          code: 'DATABASE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }
    console.error('Login API Error:', error?.message || error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
