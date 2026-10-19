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

function getMiddlewareSecret(): string {
  const secret = (process.env.SESSION_SECRET || process.env.JWT_SECRET || '').trim();
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      throw new Error('FATAL: SESSION_SECRET must be configured and at least 32 characters in production.');
    }
    return secret;
  }
  if (secret.length >= 32) return secret;
  return 'dev-local-session-secret-key-32chars-minimum-fallback!!';
}

async function verifySessionTokenEdge(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [payloadB64, sigB64] = parts;
    const secret = getMiddlewareSecret();
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
    if (!isValid) return false;

    // Check payload expiry
    const payloadPadded = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payloadPad = payloadPadded.length % 4;
    const payloadStr = atob(payloadPad ? payloadPadded + '='.repeat(4 - payloadPad) : payloadPadded);
    const payload = JSON.parse(payloadStr);

    if (!payload || !payload.id || !payload.exp) return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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
    return NextResponse.next();
  }

  // 3. Allow public profile viewing (/profile/[slug]) but protect editing/sharing routes
  if (pathname.startsWith('/profile/')) {
    const isEditOrShare = pathname.includes('/edit') || pathname.includes('/share');
    if (!isEditOrShare) {
      return NextResponse.next();
    }
  }

  // 3b. Allow public company profile viewing (/api/company/[slug] via GET, excluding /me or /members)
  if (
    pathname.startsWith('/api/company/') && 
    request.method === 'GET' && 
    !pathname.endsWith('/me') && 
    !pathname.includes('/members')
  ) {
    return NextResponse.next();
  }

  // 3c. Allow public profile API viewing (/api/profile/[id] via GET, excluding /list, /share-settings, etc.)
  if (
    pathname.startsWith('/api/profile/') &&
    request.method === 'GET' &&
    !pathname.endsWith('/list') &&
    !pathname.endsWith('/share-settings') &&
    !pathname.endsWith('/create') &&
    !pathname.endsWith('/update') &&
    !pathname.endsWith('/duplicate')
  ) {
    return NextResponse.next();
  }

  // 4. Check for active session cookie with cryptographic signature and expiry verification
  const sessionCookie = request.cookies.get('avtive_session');
  let hasValidSession = false;
  if (sessionCookie?.value) {
    hasValidSession = await verifySessionTokenEdge(sessionCookie.value);
  }

  // 5. Strict gatekeeper: If no valid session, deny access to site and data
  if (!hasValidSession) {
    // For API endpoints: return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to access this resource.' },
        { status: 401 }
      );
    }

    // For all page navigations: redirect to login
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('returnUrl', pathname + search);
    }
    return NextResponse.redirect(loginUrl);
  }

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
