import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken, resetUserPassword, getProfileByUserId } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email;
    const token = body.token;
    const password = body.password || body.newPassword;

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: 'Email, reset token, and new password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify token validity and expiration
    const verification = await verifyPasswordResetToken(normalizedEmail, token);
    if (!verification.valid || !verification.user) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired password reset link.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const newHash = await hashPassword(password);

    // Update user record in database
    const updatedUser = await resetUserPassword(normalizedEmail, token, newHash);
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update password. Please request a new reset link.' },
        { status: 500 }
      );
    }

    // Automatically authenticate the user upon successful reset
    const sessionUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email
    };

    const userProfile = await getProfileByUserId(updatedUser.id);

    const response = NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You are now logged in.',
      user: sessionUser,
      hasProfile: Boolean(userProfile),
      profileSlug: userProfile?.slug || userProfile?.id || null
    });

    await setSessionCookie(sessionUser, response);

    return response;

  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
