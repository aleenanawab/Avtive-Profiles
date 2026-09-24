import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail, setUserPasswordResetToken } from '@/lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(normalizedEmail);

    // Secure token generation: 32 bytes hex = 64 characters
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour validity

    // Determine host origin for absolute reset URL
    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const origin = `${proto}://${host}`;
    const resetUrl = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    if (user) {
      await setUserPasswordResetToken(normalizedEmail, token, expires);

      console.log(`[PASSWORD RESET] Generated reset link for ${normalizedEmail}:`);
      console.log(`[PASSWORD RESET URL] ${resetUrl}`);
    } else {
      // Timing consistency for anti-enumeration
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    // Check for optional Supabase Auth integration if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const modName = '@supabase/supabase-js';
        const { createClient } = await import(/* webpackIgnore: true */ modName);
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${origin}/reset-password`
        });
      } catch (sbErr) {
        console.warn('[Supabase Password Reset Warning]:', sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been generated.',
      // Provided for seamless testing/development experience
      resetUrl: process.env.NODE_ENV !== 'production' || host.startsWith('localhost') ? resetUrl : undefined
    });
  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again later.' },
      { status: 500 }
    );
  }
}
