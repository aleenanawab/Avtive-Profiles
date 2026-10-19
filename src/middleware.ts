import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public endpoints that do not require authentication
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/social',
  '/api/auth/callback',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/profile/connect',
  '/company/invite'
];

interface MiddlewareSecretResult {
  secret?: string;
  configError?: string;
}

function getMiddlewareSecret(): MiddlewareSecretResult {
  const secret = (process.env.SESSION_SECRET || process.env.JWT_SECRET || '').trim();
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      return {
        configError: 'FATAL: SESSION_SECRET must be configured and at least 32 characters in production.'
      };
    }
    return { secret };
  }
  if (secret.length >= 32) return { secret };
  return { secret: 'dev-local-session-secret-key-32chars-minimum-fallback!!' };
}

export type EdgeVerifyOutcome =
  | { status: 'valid'; payload: Record<string, unknown> }
  | { status: 'missing' }
  | { status: 'expired' }
  | { status: 'invalid' }
  | { status: 'config_error'; error: string };

async function verifySessionTokenEdge(token: string | undefined): Promise<EdgeVerifyOutcome> {
  if (!token) {
    return { status: 'missing' };
  }

  const { secret, configError } = getMiddlewareSecret();
  if (configError || !secret) {
    return {
      status: 'config_error',
      error: configError || 'SESSION_SECRET configuration missing or invalid'
    };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { status: 'invalid' };

    const [payloadB64, sigB64] = parts;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode base64url signature
    const base64 = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const binStr = atob(padded);
    const sigBin = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      sigBin[i] = binStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBin, encoder.encode(payloadB64));
    if (!isValid) return { status: 'invalid' };

    // Check payload expiry
    const payloadPadded = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payloadPad = payloadPadded.length % 4;
    const payloadStr = atob(payloadPad ? payloadPadded + '='.repeat(4 - payloadPad) : payloadPadded);
    const payload = JSON.parse(payloadStr);

    if (!payload || !payload.id || !payload.exp) return { status: 'invalid' };
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { status: 'expired' };
    }

    return { status: 'valid', payload };
  } catch {
    return { status: 'invalid' };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID().slice(0, 8);

  const logDiagnostic = (outcome: string) => {
    // Safe diagnostic logging: path, method, outcome, requestId
    // Never logs cookies, auth headers, passwords, reset tokens, or secrets
    console.log(`[AUTH] [${requestId}] ${request.method} ${pathname} -> ${outcome}`);
  };

  // 1. Allow public static assets and next internal assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Allow public authentication endpoints
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    logDiagnostic('ALLOWED_PUBLIC');
    return NextResponse.next();
  }

  // 3. Allow public profile viewing (/profile/[slug]) but protect editing/sharing routes
  if (pathname.startsWith('/profile/')) {
    const isEditOrShare = pathname.includes('/edit') || pathname.includes('/share');
    if (!isEditOrShare) {
      logDiagnostic('ALLOWED_PUBLIC_PROFILE');
      return NextResponse.next();
    }
  }

  // 3b. Allow public company profile viewing (/api/company/[slug] via GET, excluding /me or /members)
  const normalizedPath = pathname.replace(/\/+$/, '');
  if (
    normalizedPath.startsWith('/api/company/') && 
    request.method === 'GET' && 
    !normalizedPath.endsWith('/me') && 
    !normalizedPath.includes('/members')
  ) {
    logDiagnostic('ALLOWED_PUBLIC_COMPANY');
    return NextResponse.next();
  }

  // 3c. Allow public profile API viewing (/api/profile/[id] via GET, excluding /list, /share-settings, etc.)
  if (
    normalizedPath.startsWith('/api/profile/') &&
    request.method === 'GET' &&
    !normalizedPath.endsWith('/list') &&
    !normalizedPath.endsWith('/share-settings') &&
    !normalizedPath.endsWith('/create') &&
    !normalizedPath.endsWith('/update') &&
    !normalizedPath.endsWith('/duplicate')
  ) {
    logDiagnostic('ALLOWED_PUBLIC_PROFILE_API');
    return NextResponse.next();
  }

  // 4. Check for active session cookie with cryptographic signature and expiry verification
  const sessionCookie = request.cookies.get('avtive_session');
  const verifyResult = await verifySessionTokenEdge(sessionCookie?.value);

  // 5. Handle Server Configuration Error explicitly as 500 (NOT disguised as 401)
  if (verifyResult.status === 'config_error') {
    logDiagnostic(`SERVER_CONFIG_ERROR: ${verifyResult.error}`);
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Server configuration error: Authentication secret is missing or misconfigured.',
          code: 'SERVER_CONFIGURATION_ERROR'
        },
        { status: 500 }
      );
    }
    return new NextResponse(
      'Server configuration error: Authentication secret is misconfigured in production.',
      { status: 500 }
    );
  }

  // 6. Strict gatekeeper: If no valid session, deny access to site and data
  if (verifyResult.status !== 'valid') {
    const isExpired = verifyResult.status === 'expired';
    const isInvalid = verifyResult.status === 'invalid';
    logDiagnostic(`DENIED_${verifyResult.status.toUpperCase()}`);

    const clearSessionCookieHeader = (res: NextResponse) => {
      if (isExpired || isInvalid) {
        res.cookies.set('avtive_session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 0,
          expires: new Date(0)
        });
      }
    };

    // For API endpoints: return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        {
          error: isExpired
            ? 'Session expired. Please log in again.'
            : 'Authentication required. Please log in to access this resource.',
          code: isExpired ? 'SESSION_EXPIRED' : 'UNAUTHORIZED'
        },
        { status: 401 }
      );
      clearSessionCookieHeader(response);
      return response;
    }

    // For all page navigations: redirect to login
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('returnUrl', pathname + search);
    }
    const response = NextResponse.redirect(loginUrl);
    clearSessionCookieHeader(response);
    return response;
  }

  logDiagnostic('ALLOWED_AUTHENTICATED');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
