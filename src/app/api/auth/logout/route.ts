import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    await clearSessionCookie(response);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return response;
  } catch (error) {
    console.error('Logout GET Error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
      redirectTo: '/login'
    });

    await clearSessionCookie(response);

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout.' },
      { status: 500 }
    );
  }
}
