import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { UserSession } from '@/types/profile';

export const SESSION_COOKIE_NAME = 'avtive_session';
export const RETURNING_USER_COOKIE_NAME = 'avtive_returning_user';
export const DUMMY_BCRYPT_HASH = '$2a$10$wN1Q/X8Oa6xG/G9x0.GzOuq8Z9y2j4yJz/uVl3IqNfO1.tJ5bI5Ki';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export class ServerConfigError extends Error {
  statusCode: number = 500;
  status: number = 500;
  code: string = 'SERVER_CONFIGURATION_ERROR';

  constructor(message: string = 'Server configuration error: Authentication secret is missing or misconfigured.') {
    super(message);
    this.name = 'ServerConfigError';
  }
}

export class AuthenticationError extends Error {
  statusCode: number = 401;
  status: number = 401;
  code: string = 'UNAUTHORIZED';

  constructor(message: string = 'Authentication required. Please log in to access this resource.', code: string = 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
  }
}

/**
 * Safe diagnostic logging helper: logs request path, method, outcome, and request ID.
 * NEVER logs cookies, authorization headers, passwords, reset tokens, or secrets.
 */
export function logAuthDiagnostic(requestId: string, method: string, path: string, outcome: string): void {
  console.log(`[AUTH-API] [${requestId}] ${method} ${path} -> ${outcome}`);
}

/**
 * Validates and retrieves SESSION_SECRET.
 * In production, fails closed (throws ServerConfigError) if SESSION_SECRET is missing or < 32 characters.
 */
export function getSessionSecret(): string {
  const secret = (process.env.SESSION_SECRET || process.env.JWT_SECRET || '').trim();
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      throw new ServerConfigError('FATAL: SESSION_SECRET must be configured and at least 32 characters long in production.');
    }
    return secret;
  }
  // In development/test environments: require 32 chars or provide dev fallback
  if (secret.length >= 32) {
    return secret;
  }
  return 'dev-local-session-secret-key-32chars-minimum-fallback!!';
}

export function setReturningUserCookie(response?: any): void {
  if (response && response.cookies) {
    try {
      response.cookies.set(RETURNING_USER_COOKIE_NAME, 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365
      });
    } catch {}
  }
}

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
  const secret = getSessionSecret();
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode a signed session token using timing-safe comparison.
 * Propagates ServerConfigError if secret is misconfigured.
 */
export function verifySessionToken(token: string): UserSession | null {
  // Never swallow ServerConfigError: let it propagate
  const secret = getSessionSecret();

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
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
      email: payload.email,
      avatar: payload.avatar
    };
  } catch (err) {
    if (err instanceof ServerConfigError) throw err;
    return null;
  }
}

/**
 * Server-side helper to read the current authenticated user session.
 * Propagates ServerConfigError when configuration is invalid.
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  const session = verifySessionToken(sessionCookie.value);
  if (!session) {
    // Cookie is expired or invalid: clear it from cookieStore so browser/subsequent calls don't retain it
    try {
      cookieStore.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      cookieStore.delete(SESSION_COOKIE_NAME);
    } catch {}
  }
  return session;
}

/**
 * Shared server-side helper that enforces an authenticated session.
 * Throws AuthenticationError (401) if no valid session is present.
 * Throws ServerConfigError (500) if session secret is misconfigured.
 */
export async function requireSession(): Promise<UserSession> {
  const session = await getSession();
  if (!session || !session.id) {
    throw new AuthenticationError('Authentication required. Please log in to access this resource.');
  }
  return session;
}

/**
 * Server-side helper to set session cookie on response
 */
export async function setSessionCookie(user: UserSession, response?: any): Promise<string> {
  const token = createSessionToken(user);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_SECONDS
  };

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, cookieOptions);
  } catch {}

  if (response && response.cookies) {
    try {
      response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);
    } catch {}
  }

  return token;
}

/**
 * Clears legacy user cache cookie unconditionally with expired date
 */
export function clearLegacyCacheCookie(response?: any): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
    expires: new Date(0)
  };

  if (response && response.cookies) {
    try {
      response.cookies.set('avtive_user_cache', '', cookieOptions);
      response.cookies.delete('avtive_user_cache');
    } catch {}
  }
}

/**
 * Server-side helper to clear session cookie and all legacy cache cookies on logout
 */
export async function clearSessionCookie(response?: any): Promise<void> {
  const cookiesToClear = [
    SESSION_COOKIE_NAME,
    'avtive_user_cache',
    'avtive_last_profile',
    'avtive_prof_count'
  ];

  for (let i = 0; i <= 20; i++) {
    cookiesToClear.push(`avtive_prof_${i}`);
  }

  try {
    const cookieStore = await cookies();
    for (const cookieName of cookiesToClear) {
      cookieStore.set(cookieName, '', {
        httpOnly: cookieName === SESSION_COOKIE_NAME || cookieName === 'avtive_user_cache',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      cookieStore.delete(cookieName);
    }
  } catch {}

  if (response && response.cookies) {
    try {
      for (const cookieName of cookiesToClear) {
        response.cookies.set(cookieName, '', {
          httpOnly: cookieName === SESSION_COOKIE_NAME || cookieName === 'avtive_user_cache',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 0,
          expires: new Date(0)
        });
        response.cookies.delete(cookieName);
      }
    } catch {}
  }
}

export { sanitizeReturnUrl, resolveReturnUrlForExistingUser } from './utils';
