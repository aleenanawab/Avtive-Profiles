import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { UserSession } from '@/types/profile';

const SESSION_COOKIE_NAME = 'avtive_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'avtive-super-secret-key-prod-2026-secure-session-auth';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Hash plain-text password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify plain-text password against stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a signed session token: base64(payload).signature
 */
export function createSessionToken(user: UserSession): string {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode a signed session token
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!payload || !payload.id || !payload.exp) return null;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email
    };
  } catch {
    return null;
  }
}

/**
 * Server-side helper to read the current authenticated user session
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    return verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Server-side helper to set session cookie on response
 */
export async function setSessionCookie(user: UserSession): Promise<void> {
  const token = createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS
  });
}

/**
 * Server-side helper to clear session cookie on logout
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

export const RETURNING_USER_COOKIE_NAME = 'avtive_returning_user';

/**
 * Valid dummy bcrypt hash used for constant-time comparisons when a user record is not found.
 * Prevents timing attacks for email enumeration during login attempts.
 */
export const DUMMY_BCRYPT_HASH = '$2a$10$wT8vM9hN2sL5qE3yU7kI.OFmC5nN7mE3gA1fJ8lP0kQ5rT2vW4xYa';

/**
 * Server-side helper to record that a user has previously created or logged into an account.
 */
export async function setReturningUserCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(RETURNING_USER_COOKIE_NAME, 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
  } catch {}
}

/**
 * Server-side helper to check if this client is a returning user.
 */
export async function isReturningUser(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const returningCookie = cookieStore.get(RETURNING_USER_COOKIE_NAME);
    if (returningCookie?.value === 'true') {
      return true;
    }
    // Also consider legacy user_cache as indicator of returning user
    const cacheCookie = cookieStore.get('avtive_user_cache');
    if (cacheCookie?.value) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
