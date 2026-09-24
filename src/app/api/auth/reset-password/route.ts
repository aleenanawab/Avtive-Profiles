import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken, updateUserPassword, getUserByEmail } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, newPassword } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Password reset token is missing or invalid.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'New password is required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Verify token validity against database records
    const isValidToken = await verifyPasswordResetToken(normalizedEmail, token.trim());
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has expired. Please request a new link.' },
        { status: 400 }
      );
    }

    // Hash the new password securely using bcrypt
    const passwordHash = await hashPassword(newPassword);

    const updated = await updateUserPassword(normalizedEmail, passwordHash);
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`[PASSWORD RESET] Successfully updated password for user: ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated. You can now sign in.'
    });
  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
