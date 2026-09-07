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
