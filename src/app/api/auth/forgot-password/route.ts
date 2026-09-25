import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createPasswordResetToken } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
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
        { error: 'No registered account found with this email address. Please check and try again.' },
        { status: 404 }
      );
    }

    const result = await createPasswordResetToken(normalizedEmail);
    if (!result || !result.token) {
      return NextResponse.json(
        { error: 'Failed to generate password reset token. Please try again later.' },
        { status: 500 }
      );
    }

    // Build reset URL targeting the active host / domain
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

    // ──────────────────────────────────────────────────────────────────────────
    // Send Real Password Reset Email via SMTP / Resend / Supabase
    // ──────────────────────────────────────────────────────────────────────────
    const emailResult = await sendPasswordResetEmail({
      to: normalizedEmail,
      name: user.name,
      resetUrl
    });

    console.log(`[PASSWORD RESET] Target: ${normalizedEmail}`);
    console.log(`[PASSWORD RESET] Link: ${resetUrl}`);
    console.log(`[PASSWORD RESET] Email Dispatch Result:`, emailResult);

    if (!emailResult.success) {
      // In local development or if SMTP is not yet configured in .env.local, provide clear guidance
      return NextResponse.json({
        success: false,
        error: emailResult.error || 'Failed to deliver password reset email. Please ensure SMTP credentials are configured.',
        // Provide dev fallback reset link only in local dev for testing
        devResetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset email has been successfully delivered to ${normalizedEmail}.`,
      email: normalizedEmail,
      provider: emailResult.provider
    }, { status: 200 });

  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred while processing your password reset.' },
      { status: 500 }
    );
  }
}

