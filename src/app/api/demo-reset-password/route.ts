import { NextRequest, NextResponse } from 'next/server';
import { 
  isDemoResetEnabled, 
  isEmailAllowedForDemoReset, 
  normalizeResetEmail, 
  validateResetPassword, 
  executeDemoPasswordReset, 
  isRateLimited 
} from '@/lib/demo-reset';

export const dynamic = 'force-dynamic';

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    // Non-browser or same-origin direct request without origin header
    return true;
  }

  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const cleanHost = hostHeader.split(':')[0].trim();
    const originHost = originUrl.hostname.trim();

    return originHost === cleanHost || originUrl.host === hostHeader;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // 1. Cross-Origin Defense: Reject cross-origin requests
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { error: 'Cross-origin request forbidden.' },
      { status: 403 }
    );
  }

  // 2. Rate limiting by client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
  if (isRateLimited(`ip:${ip}`)) {
    return NextResponse.json(
      { error: 'Too many reset attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Rule 1: If DEMO_PASSWORD_RESET_ENABLED !== "true", return a generic 403 with no DB access
  if (!isDemoResetEnabled()) {
    return NextResponse.json(
      { error: 'Password reset is forbidden or disabled.' },
      { status: 403 }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request payload.' },
      { status: 400 }
    );
  }

  const { email, newPassword, confirmPassword } = body || {};

  // Rule 2: Normalize email (trim, lowercase). If not in DEMO_RESET_ALLOWED_EMAILS, return same generic rejection with NO DB access
  const normalizedEmail = normalizeResetEmail(email);
  if (!normalizedEmail || !isEmailAllowedForDemoReset(normalizedEmail)) {
    return NextResponse.json(
      { error: 'Password reset is forbidden or disabled.' },
      { status: 403 }
    );
  }

  // Rate limiting by normalized email
  if (isRateLimited(`email:${normalizedEmail}`)) {
    return NextResponse.json(
      { error: 'Too many reset attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Rule 3: Validate the password: minimum length (>= 8), newPassword === confirmPassword, max 72 bytes
  const validation = validateResetPassword(newPassword, confirmPassword);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  // Rule 4, 5, 6, 7:
  // Hash with project bcrypt, run UPDATE restricted to that exact email, require exactly 1 row updated
  const resetResult = await executeDemoPasswordReset(normalizedEmail, newPassword);

  if (!resetResult.success) {
    return NextResponse.json(
      { error: resetResult.error || 'Reset failed, please try again.' },
      { status: 500 }
    );
  }

  // Success: Prepare response and invalidate any existing session cookies
  const response = NextResponse.json(
    {
      success: true,
      message: 'Password has been successfully reset. Please sign in with your new password.',
      redirectTo: '/login?reset=success'
    },
    { status: 200 }
  );

  // Invalidate any active session cookie for the user
  response.cookies.set('avtive_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0)
  });

  return response;
}
