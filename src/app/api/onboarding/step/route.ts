import { NextRequest, NextResponse } from 'next/server';
import { requireSession, AuthenticationError } from '@/lib/auth';
import { saveOnboardingStep, getProfileByUserId, DatabaseUnavailableError } from '@/lib/db';
import { getNextOnboardingRoute } from '@/lib/onboarding';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user from session server-side. Never trust a client-supplied user ID.
    const session = await requireSession();

    const body = await request.json().catch(() => ({}));
    const { step, role, theme, scriptData } = body;

    if (!step || !['role', 'theme', 'script'].includes(step)) {
      return NextResponse.json(
        { error: 'Valid onboarding step ("role", "theme", or "script") is required.' },
        { status: 400 }
      );
    }

    if (step === 'role' && !role) {
      return NextResponse.json(
        { error: 'Role selection is required.' },
        { status: 400 }
      );
    }

    if (step === 'theme' && !theme) {
      return NextResponse.json(
        { error: 'Theme selection is required.' },
        { status: 400 }
      );
    }

    // 2. Server-side persistence: write flag and value to DB for the authenticated session user
    const saveResult = await saveOnboardingStep(session.id, step, { role, theme, scriptData });
    if (!saveResult || !saveResult.success || !saveResult.user) {
      return NextResponse.json(
        { error: `Failed to persist onboarding step "${step}".` },
        { status: 500 }
      );
    }

    // 3. Resolve profile slug for next route calculation if available
    let profileSlug: string | undefined;
    try {
      const profile = await getProfileByUserId(session.id);
      if (profile) {
        profileSlug = profile.slug || profile.id;
      }
    } catch {}

    const nextRoute = getNextOnboardingRoute({
      ...saveResult.user,
      profileSlug
    });

    return NextResponse.json({
      success: true,
      message: `Step "${step}" saved successfully.`,
      user: saveResult.user,
      nextRoute
    });

  } catch (error: any) {
    if (error instanceof AuthenticationError || error?.status === 401) {
      return NextResponse.json(
        { error: error.message || 'Authentication required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    if (error instanceof DatabaseUnavailableError || error?.status === 503) {
      console.error('[Onboarding Step API Error] Database unavailable:', error?.message);
      return NextResponse.json(
        { error: 'Database service is temporarily unavailable. Please try again.', code: 'DATABASE_UNAVAILABLE' },
        { status: 503 }
      );
    }
    console.error('[Onboarding Step API Error]:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred while saving onboarding progress.' },
      { status: 500 }
    );
  }
}
