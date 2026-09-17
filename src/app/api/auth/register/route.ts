import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    // 2. Reject duplicate email with a clean error message
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    // 3. Securely hash password before saving
    const passwordHash = await hashPassword(password);

    // 4. Save account (profile will be created in profile-creation step)
    const { user } = await createUser({
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      createProfile: false
    });

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    const response = NextResponse.json(
      {
        success: true,
        autoLogin: true,
        message: 'Account created successfully.',
        user: sessionUser
      },
      { status: 201 }
    );

    // Auto-login: set session cookie immediately upon registration
    await setSessionCookie(sessionUser, response);

    // Set backup user cache cookie for resilient cross-lambda authentication
    try {
      response.cookies.set(
        'avtive_user_cache',
        encodeURIComponent(JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash
        })),
        {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30
        }
      );
    } catch {}

    return response;
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
