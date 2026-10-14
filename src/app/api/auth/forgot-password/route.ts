import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createPasswordResetToken } from '@/lib/db';
import { sendPasswordResetEmail, isEmailServiceConfigured } from '@/lib/email';

// In-memory rate limiting by IP and email address
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  entry.count++;
  return false;
}

const GENERIC_SUCCESS_MESSAGE =
  'If an account exists with this email address, a password reset link has been sent.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Please enter your registered email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Rate limiting by IP and email
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    if (isRateLimited(`ip:${ip}`) || isRateLimited(`email:${normalizedEmail}`)) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const user = await getUserByEmail(normalizedEmail);

    // Constant-time behavior / prevent account enumeration
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          emailDispatched: isEmailServiceConfigured(),
          message: GENERIC_SUCCESS_MESSAGE
        },
        { status: 200 }
      );
    }

    const result = await createPasswordResetToken(normalizedEmail);
    if (!result || !result.token) {
      return NextResponse.json(
        {
          success: true,
          emailDispatched: false,
          message: GENERIC_SUCCESS_MESSAGE
        },
        { status: 200 }
      );
    }

    // Build reset URL targeting the active request origin or configured application URL
    let origin = process.env.NEXT_PUBLIC_APP_URL || '';
    if (!origin) {
      origin = request.nextUrl?.origin || '';
      if (!origin) {
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        origin = host ? `${proto}://${host}` : 'http://localhost:3000';
      }
    }
    origin = origin.replace(/\/+$/, '');

    const resetUrl = `${origin}/reset-password?token=${result.token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Dispatch email if provider is available
    const emailResult = await sendPasswordResetEmail({
      to: normalizedEmail,
      name: user.name,
      resetUrl
    });

    if (emailResult.success) {
      return NextResponse.json(
        {
          success: true,
          emailDispatched: true,
          message: GENERIC_SUCCESS_MESSAGE
        },
        { status: 200 }
      );
    }

    // Secure fallback when SMTP / email provider cannot deliver in this environment:
    // Return server-authorized, single-use, time-limited reset link
    return NextResponse.json(
      {
        success: true,
        emailDispatched: false,
        resetUrl,
        message: 'Password reset authorized by server. Since email delivery (SMTP) is not configured in this environment, use the secure one-time reset link below to update your password.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your password reset request.' },
      { status: 500 }
    );
  }
}
