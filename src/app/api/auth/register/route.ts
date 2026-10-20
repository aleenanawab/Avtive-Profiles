import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail, createUser, DatabaseUnavailableError } from '@/lib/db';
import { hashPassword, setSessionCookie, setReturningUserCookie, clearLegacyCacheCookie } from '@/lib/auth';
import { getNextOnboardingRoute } from '@/lib/onboarding';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password, confirmPassword } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide your full name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match. Please verify both passwords.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check duplicate accounts on server & DB
    let existingUser;
    try {
      existingUser = await getUserByEmail(normalizedEmail);
    } catch (err: any) {
      if (err instanceof DatabaseUnavailableError || err?.code === 'DATABASE_UNAVAILABLE' || err?.status === 503) {
        console.error('[Register API Error] Database unavailable during duplicate check:', err?.message || 'Database error');
        return NextResponse.json(
          { error: 'Registration service is temporarily unavailable. Please try again later.', code: 'DATABASE_UNAVAILABLE' },
          { status: 503 }
        );
      }
      throw err;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in or use another email.' },
        { status: 409 }
      );
    }

    // 3. Compute password hash
    const passwordHash = await hashPassword(password);

    // 4. Generate one-time recovery code (format: RC-XXXX-XXXX) and store only its SHA-256 hash
    const rawCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const recoveryCode = `RC-${rawCode.slice(0, 4)}-${rawCode.slice(4)}`;
    const recoveryCodeHash = crypto.createHash('sha256').update(recoveryCode.trim().toUpperCase()).digest('hex');

    // 5. Save account with recovery code hash. Must check error before issuing session!
    let createResult;
    try {
      createResult = await createUser({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        recoveryCodeHash,
        onboardingCompleted: false,
        createProfile: false
      });
    } catch (err: any) {
      if (err instanceof DatabaseUnavailableError || err?.code === 'DATABASE_UNAVAILABLE' || err?.status === 503) {
        console.error('[Register API Error] Database unavailable during user creation:', err?.message || 'Database error');
        return NextResponse.json(
          { error: 'Registration service is temporarily unavailable. Please try again later.', code: 'DATABASE_UNAVAILABLE' },
          { status: 503 }
        );
      }
      throw err;
    }

    const user = createResult?.user;
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      );
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully.',
        recoveryCode, // Sent once to display with copy button and warning
        email: user.email,
        user: sessionUser,
        roleCompleted: Boolean(user.roleCompleted),
        themeCompleted: Boolean(user.themeCompleted),
        scriptCompleted: Boolean(user.scriptCompleted),
        onboardingCompleted: Boolean(user.onboardingCompleted),
        redirectTo: getNextOnboardingRoute(user)
      },
      { status: 201 }
    );

    response.headers.set('Cache-Control', 'no-store, max-age=0');
    await setSessionCookie(sessionUser, response);
    setReturningUserCookie(response);
    clearLegacyCacheCookie(response);

    return response;
  } catch (error: any) {
    if (error instanceof DatabaseUnavailableError || error?.code === 'DATABASE_UNAVAILABLE' || error?.status === 503) {
      console.error('[Register API Error] Database unavailable:', error?.message);
      return NextResponse.json(
        { error: 'Registration service is temporarily unavailable. Please try again later.', code: 'DATABASE_UNAVAILABLE' },
        { status: 503 }
      );
    }
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
