import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, supabase, supabaseUrl, supabaseAnonKey, SUPABASE_AUTH_STORAGE_KEY } from '@/lib/supabase';
import { getUserByEmail, getUserById, createUser, getProfileByUserId, getProfilesByUserId } from '@/lib/db';
import { setSessionCookie, setReturningUserCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('returnUrl');

  if (error) {
    console.error('OAuth Callback Error:', error, errorDescription);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Exchange the auth code for a Supabase session
    let authUser: any = null;

    // Server-side storage adapter reading the incoming PKCE code_verifier cookie
    const serverStorage = {
      getItem: (key: string) => {
        const direct = request.cookies.get(key)?.value;
        if (direct) return direct.includes('%') ? decodeURIComponent(direct) : direct;
        if (key.includes('code-verifier')) {
          const allCookies = request.cookies.getAll();
          const match = allCookies.find(c => c.name.includes('code-verifier'));
          if (match?.value) return match.value.includes('%') ? decodeURIComponent(match.value) : match.value;
        }
        return null;
      },
      setItem: () => {},
      removeItem: () => {},
    };

    const serverAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: SUPABASE_AUTH_STORAGE_KEY,
        storage: serverStorage,
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    try {
      const flowId = requestUrl.searchParams.get('sb_flow_id');
      const { data: sessionData, error: exchangeError } = await serverAuthClient.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined
      );
      if (!exchangeError && sessionData?.user) {
        authUser = sessionData.user;
      }
    } catch (e) {
      console.error('Server client code exchange error:', e);
    }

    if (!authUser) {
      try {
        const { data: sessionData, error: exchangeError } = await supabaseAdmin.auth.exchangeCodeForSession(code);
        if (!exchangeError && sessionData?.user) {
          authUser = sessionData.user;
        }
      } catch (e) {
        console.error('Admin client code exchange error:', e);
      }
    }

    if (!authUser) {
      try {
        const { data: publicSessionData, error: publicErr } = await supabase.auth.exchangeCodeForSession(code);
        if (!publicErr && publicSessionData?.user) {
          authUser = publicSessionData.user;
        }
      } catch (e) {
        console.error('Public client code exchange error:', e);
      }
    }

    if (!authUser) {
      console.error('Unable to retrieve user from auth code');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'Google authentication failed. Please try signing in again.');
      return NextResponse.redirect(loginUrl);
    }

    const userId = authUser.id;
    const userEmail = (authUser.email || '').toLowerCase().trim();
    const userMetadata = authUser.user_metadata || {};
    const fullName = userMetadata.full_name || userMetadata.name || userMetadata.user_name || (userEmail ? userEmail.split('@')[0] : 'Google User');
    const avatarUrl = userMetadata.avatar_url || userMetadata.picture || '';

    // Check if user already exists in DB
    let user = await getUserById(userId);
    if (!user && userEmail) {
      user = await getUserByEmail(userEmail);
    }

    if (!user) {
      // New Google user: create user account using auth.users.id reference without profile
      const createRes = await createUser({
        id: userId,
        name: fullName,
        email: userEmail,
        passwordHash: `oauth_google_verified_${Date.now()}`,
        avatar: avatarUrl,
        createProfile: false // Must complete onboarding first
      });
      user = createRes.user;
    } else {
      // Sync Google avatar and name if missing
      if (!user.name && fullName) user.name = fullName;
      if (avatarUrl && !user.avatar) user.avatar = avatarUrl;
    }

    // Check onboarding completion status: does the user have an existing profile?
    const [profile, profiles] = await Promise.all([
      getProfileByUserId(user.id),
      getProfilesByUserId(user.id)
    ]);
    const hasCompletedOnboarding = Boolean(profile || (profiles && profiles.length > 0));

    const sessionUser = {
      id: user.id,
      name: user.name || fullName,
      email: user.email || userEmail,
      avatar: avatarUrl || user.avatar
    };

    let destinationPath = '/onboarding/role';

    if (hasCompletedOnboarding) {
      // Completed user: redirect directly to their own profile in view mode (or valid returnUrl)
      if (next && !next.includes('/login') && !next.includes('/register') && !next.includes('/onboarding')) {
        destinationPath = next;
      } else {
        const targetSlug = profile?.slug || profile?.id || profiles?.[0]?.slug || profiles?.[0]?.id || user.id;
        destinationPath = `/profile/${targetSlug}`;
      }
    } else {
      // New user or incomplete onboarding: redirect to role onboarding step
      destinationPath = '/onboarding/role';
    }

    const redirectUrl = new URL(destinationPath, request.url);
    const response = NextResponse.redirect(redirectUrl);

    response.headers.set('Cache-Control', 'no-store, max-age=0');
    await setSessionCookie(sessionUser, response);
    setReturningUserCookie(response);

    // Clean up transient code-verifier cookie once exchanged
    request.cookies.getAll().forEach(c => {
      if (c.name.includes('code-verifier')) {
        response.cookies.delete(c.name);
      }
    });

    return response;

  } catch (err: any) {
    console.error('OAuth callback error:', err);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'An error occurred during Google sign in.');
    return NextResponse.redirect(loginUrl);
  }
}
