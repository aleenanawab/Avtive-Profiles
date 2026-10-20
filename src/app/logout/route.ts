import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);
  await clearSessionCookie(response);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  return response;
}
