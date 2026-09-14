import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateProfile, getProfileByIdOrSlug } from '@/lib/db';
import { ProfileData } from '@/types/profile';

interface UpdateProfileBody {
  profileId: string;
  updatedData: Partial<ProfileData>;
}

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

    const body = await request.json();
    const profileId = body.profileId;
    const rawUpdatedData = body.updatedData || { ...body };
    if (!body.updatedData) {
      delete rawUpdatedData.profileId;
    }
    const updatedData = rawUpdatedData;

    if (!profileId || !updatedData) {
      return NextResponse.json(
        { error: 'Invalid request: profileId and updatedData are required.' },
        { status: 400 }
      );
    }

    // 2. Fetch target profile
    const targetProfile = await getProfileByIdOrSlug(profileId);
    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Profile not found.' },
        { status: 404 }
      );
    }

    // 3. Strict Ownership Verification: session.userId === targetProfile.userId
    // NEVER trust user IDs provided solely in client payloads or query parameters.
    if (!targetProfile.userId || targetProfile.userId !== session.id) {
      return NextResponse.json(
        { 
          error: 'Forbidden: You do not own this profile. Only the verified profile owner can perform edits.',
          authorized: false 
        },
        { status: 403 }
      );
    }

    // 4. Perform update
    const result = await updateProfile(profileId, updatedData, session.id);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update profile.' },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      authorized: true,
      message: 'Profile updated successfully.',
      updatedProfile: result.profile
    }, { status: 200 });

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
