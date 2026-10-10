import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey, SUPABASE_AUTH_STORAGE_KEY } from '@/lib/supabase';
import { getUserByEmail, getUserById, createUser, getProfileByUserId, getProfilesByUserId } from '@/lib/db';
import { setSessionCookie, setReturningUserCookie, sanitizeReturnUrl, resolveReturnUrlForExistingUser } from '@/lib/auth';

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
    // 1. Locate the PKCE code verifier cookie set during signInWithOAuth
    const findCodeVerifier = (): string | null => {
      // Direct lookup by expected storage key
      const expectedKey = `${SUPABASE_AUTH_STORAGE_KEY}-code-verifier`;
      const direct = request.cookies.get(expectedKey)?.value;
      if (direct) {
        return direct.includes('%') ? decodeURIComponent(direct) : direct;
      }

      // Search all cookies for code-verifier (excluding 'flows' index list)
      const allCookies = request.cookies.getAll();
      for (const cookie of allCookies) {
        if (
          cookie.name.includes('code-verifier') &&
          !cookie.name.includes('flows') &&
          cookie.value
        ) {
          const val = cookie.value.includes('%') ? decodeURIComponent(cookie.value) : cookie.value;
          if (!val.startsWith('[') && !val.startsWith('%5B')) {
            return val;
          }
        }
      }
      return null;
    };

    const verifierRaw = findCodeVerifier();
    let cleanVerifier = verifierRaw ? verifierRaw.trim() : null;
    if (cleanVerifier && cleanVerifier.startsWith('"') && cleanVerifier.endsWith('"')) {
      try {
        cleanVerifier = JSON.parse(cleanVerifier);
      } catch {}
    }
    const verifierJson = cleanVerifier ? JSON.stringify(cleanVerifier) : null;

    let authUser: any = null;

    if (verifierJson && cleanVerifier) {
      // Server-side storage adapter reading the incoming PKCE code_verifier
      const serverStorage = {
        getItem: (key: string) => {
          if (key.includes('code-verifier') && !key.includes('flows')) {
            return verifierJson;
          }
          const val = request.cookies.get(key)?.value;
          if (!val) return null;
          const decoded = val.includes('%') ? decodeURIComponent(val) : val;
          try {
            JSON.parse(decoded);
            return decoded;
          } catch {
            return JSON.stringify(decoded);
          }
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
          flowType: 'pkce',
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
        } else if (exchangeError) {
          console.error('OAuth exchangeCodeForSession error:', exchangeError);
        }
      } catch (e) {
        console.error('OAuth exchangeCodeForSession exception:', e);
      }

      // Direct token endpoint fallback using cleanVerifier if client method failed
      if (!authUser) {
        try {
          const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
              auth_code: code,
              code_verifier: cleanVerifier,
            }),
          });
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            if (tokenData?.user) {
              authUser = tokenData.user;
            }
          } else {
            const errBody = await tokenRes.text();
            console.error('Direct token endpoint fallback response:', tokenRes.status, errBody);
          }
        } catch (fetchErr) {
          console.error('Direct token fetch error:', fetchErr);
        }
      }
    } else {
      console.error('No PKCE code verifier cookie found in request');
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

    const safeNext = sanitizeReturnUrl(next, null);
    let destinationPath = '/onboarding/role';

    if (hasCompletedOnboarding) {
      // Completed user: redirect directly to their own profile in view mode (or valid returnUrl)
      const targetSlug = profile?.slug || profile?.id || profiles?.[0]?.slug || profiles?.[0]?.id || user.id;
      const userProfileUrl = `/profile/${targetSlug}`;
      destinationPath = resolveReturnUrlForExistingUser(safeNext, userProfileUrl);
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
