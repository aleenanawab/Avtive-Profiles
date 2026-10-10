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

    // Verify email service configuration upfront
    if (!isEmailServiceConfigured()) {
      return NextResponse.json(
        {
          error:
            'Email delivery service is not configured. Please configure SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) or RESEND_API_KEY in environment variables.'
        },
        { status: 503 }
      );
    }

    const user = await getUserByEmail(normalizedEmail);

    // Constant-time behavior / prevent account enumeration
    if (!user) {
      return NextResponse.json(
        {
          success: true,
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
          message: GENERIC_SUCCESS_MESSAGE
        },
        { status: 200 }
      );
    }

    // Build reset URL targeting the configured application URL
    let origin = process.env.NEXT_PUBLIC_APP_URL || '';
    if (!origin) {
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      if (host && !host.includes('localhost')) {
        origin = `${proto}://${host}`;
      } else {
        origin = request.nextUrl?.origin || 'https://avtive-profiles-d297.vercel.app';
      }
    }
    origin = origin.replace(/\/+$/, '');

    const resetUrl = `${origin}/reset-password?token=${result.token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Dispatch email (never log the token or raw link)
    await sendPasswordResetEmail({
      to: normalizedEmail,
      name: user.name,
      resetUrl
    });

    return NextResponse.json(
      {
        success: true,
        message: GENERIC_SUCCESS_MESSAGE
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
