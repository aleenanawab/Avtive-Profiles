import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateProfile, getProfileByIdOrSlug, getProfileByUserId, setProfileResponseCookies } from '@/lib/db';
import { ProfileData } from '@/types/profile';

async function handleProfileUpdate(request: NextRequest) {
  try {
    // 1. Server-Side Guardrail: Extract caller's session on the server
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { 
          error: 'Unauthorized: You must be logged in to modify a profile.',
          authorized: false 
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const profileId = body.profileId || body.id || body.slug || body.profileSlug;
    const rawUpdatedData = body.updatedData || { ...body };
    if (!body.updatedData) {
      delete rawUpdatedData.profileId;
      delete rawUpdatedData.id;
    }
    const updatedData = rawUpdatedData;

    const identifier = profileId || body.profileSlug || body.slug;
    if (!identifier && !updatedData) {
      return NextResponse.json(
        { error: 'Invalid request: profile identifier and updatedData are required.' },
        { status: 400 }
      );
    }

    // 2. Perform update with automatic upsert fallback for serverless persistence
    const effectiveSlug = body.profileSlug || body.slug || updatedData.slug;
    const result = await updateProfile(
      identifier || `prof-${Date.now()}`,
      {
        ...updatedData,
        ...(effectiveSlug ? { slug: effectiveSlug } : {})
      },
      session.id
    );

    if (!result.success || !result.profile) {
      return NextResponse.json(
        { error: result.error || 'Failed to update profile.' },
        { status: result.status || 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      authorized: true,
      message: 'Profile updated successfully.',
      profile: result.profile,
      updatedProfile: result.profile
    }, { status: 200 });

    // 3. Set cookie for serverless cross-lambda persistence (chunked)
    setProfileResponseCookies(response, result.profile);

    return response;

  } catch (error) {
    console.error('Error updating profile in API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while saving profile.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleProfileUpdate(request);
}

export async function PUT(request: NextRequest) {
  return handleProfileUpdate(request);
}

export async function PATCH(request: NextRequest) {
  return handleProfileUpdate(request);
}
