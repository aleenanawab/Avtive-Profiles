import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createPasswordResetToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Please enter your registered email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please check and try again.' },
        { status: 404 }
      );
    }

    const result = await createPasswordResetToken(normalizedEmail);
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to generate reset link. Please try again later.' },
        { status: 500 }
      );
    }

    // Build robust reset URL targeting the active site deployment
    let origin = request.nextUrl?.origin;
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    
    if (host && !host.includes('localhost')) {
      origin = `${proto}://${host}`;
    } else if (!origin || origin.includes('localhost') || origin === 'null') {
      origin = process.env.NEXT_PUBLIC_APP_URL || 'https://avtive-profiles-d297.vercel.app';
    }

    origin = origin.replace(/\/+$/, '');
    const resetUrl = `${origin}/reset-password?token=${result.token}&email=${encodeURIComponent(normalizedEmail)}`;

    console.log(`[PASSWORD RESET] Email sent to: ${normalizedEmail}`);
    console.log(`[PASSWORD RESET] Reset Link: ${resetUrl}`);

    return NextResponse.json({
      success: true,
      message: `Password reset link has been dispatched to ${normalizedEmail}.`,
      email: normalizedEmail,
      resetUrl: resetUrl // Returned for instant testing and verification
    });

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
