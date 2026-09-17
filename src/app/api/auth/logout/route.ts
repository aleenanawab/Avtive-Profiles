import { NextResponse } from 'next/server';
import { clearSessionCookie, RETURNING_USER_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    await clearSessionCookie();
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.'
    });

    // Ensure returning user flag persists so subsequent visits go to /login
    response.cookies.set(RETURNING_USER_COOKIE_NAME, 'true', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365
    });

    return response;
  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout.' },
      { status: 500 }
    );
  }
}
