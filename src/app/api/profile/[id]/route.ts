import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireSession } from '@/lib/auth';
import { getProfileByIdOrSlug, deleteProfile, sanitizeProfileForPublic } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Public profile endpoint: returns fields allowed by visibility/sharing settings.
 * Never returns password_hash, reset fields, recovery hashes, or private unshared fields.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    const { id } = await context.params;
    const profile = await getProfileByIdOrSlug(id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found.' },
        { status: 404 }
      );
    }

    const isOwner = Boolean(session?.id && profile.userId && session.id === profile.userId);
    const sanitized = sanitizeProfileForPublic(profile, isOwner);

    return NextResponse.json({
      success: true,
      profile: sanitized,
      isOwner
    });
  } catch (error) {
    console.error('Get Profile API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching profile.' },
      { status: 500 }
    );
  }
}

/**
 * Private profile delete: requires authenticated session and ownership check.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;

    const profile = await getProfileByIdOrSlug(id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found.' },
        { status: 404 }
      );
    }

    if (profile.userId && profile.userId !== session.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete this profile.' },
        { status: 403 }
      );
    }

    const result = await deleteProfile(id, session.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete profile.' },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully.'
    }, { status: 200 });
  } catch (error: any) {
    if (error?.status === 401 || error?.statusCode === 401) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to delete a profile.' },
        { status: 401 }
      );
    }
    console.error('Delete Profile API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting profile.' },
      { status: 500 }
    );
  }
}
