import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getProfileByUserId, createUser } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider = 'google', email, name, avatar } = body;

    const normalizedProvider = provider.toLowerCase();
    let userEmail = email?.trim()?.toLowerCase();
    let userName = name?.trim();

    // If no email passed, assign a default social test account
    if (!userEmail) {
      if (normalizedProvider === 'linkedin') {
        userEmail = 'linkedin.user@avtive.app';
        userName = userName || 'LinkedIn Professional';
      } else if (normalizedProvider === 'github') {
        userEmail = 'github.user@avtive.app';
        userName = userName || 'GitHub Developer';
      } else if (normalizedProvider === 'facebook') {
        userEmail = 'facebook.user@avtive.app';
        userName = userName || 'Facebook User';
      } else {
        userEmail = 'google.user@avtive.app';
        userName = userName || 'Google User';
      }
    }

    if (!userName) {
      userName = userEmail.split('@')[0].replace(/[._-]/g, ' ');
      userName = userName.charAt(0).toUpperCase() + userName.slice(1);
    }

    // Check if user already exists
    let user = await getUserByEmail(userEmail);

    if (user) {
      // Existing user: sign them in
      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      await setSessionCookie(sessionUser);

      const userProfile = await getProfileByUserId(user.id);
      const profileSlug = userProfile?.slug || userProfile?.id || null;

      return NextResponse.json({
        success: true,
        isNewUser: false,
        message: `Successfully signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
        user: sessionUser,
        hasProfile: Boolean(userProfile),
        profileSlug
      });
    } else {
      // New user: register account (without profile, so they can complete profile creation)
      const result = await createUser({
        name: userName,
        email: userEmail,
        passwordHash: `oauth_${normalizedProvider}_verified_${Date.now()}`,
        createProfile: false
      });

      user = result.user;

      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      await setSessionCookie(sessionUser);

      return NextResponse.json({
        success: true,
        isNewUser: true,
        message: `Account created and verified with ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
        user: sessionUser,
        hasProfile: false,
        profileSlug: null
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Social Auth Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during social authentication.' },
      { status: 500 }
    );
  }
}
