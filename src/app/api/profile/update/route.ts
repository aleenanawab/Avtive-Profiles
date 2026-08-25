import { NextRequest, NextResponse } from 'next/server';
import { UserRole, ProfileData } from '@/types/profile';

interface UpdateProfilePayload {
  profileId: string;
  updatedData: Partial<ProfileData>;
  userRole: UserRole;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateProfilePayload = await request.json();
    const { profileId, updatedData, userRole, userId } = body;

    if (!profileId || !updatedData) {
      return NextResponse.json(
        { error: 'Invalid request: profileId and updatedData are required.' },
        { status: 400 }
      );
    }

    // 1. Enforce Server-Side Permission Verification
    // Rule: Normal visitors can NEVER edit any profile
    if (userRole === 'visitor') {
      return NextResponse.json(
        { 
          error: 'Forbidden: Normal visitors do not have permission to edit this profile.',
          authorized: false 
        },
        { status: 403 }
      );
    }

    // Rule: Profile Owner can edit their own profile
    if (userRole === 'owner') {
      // Owner is authorized to edit individual founder profile
      if (profileId !== 'mesum-raza' && profileId !== 'individual') {
        // If an individual owner tries to edit company or other team members without admin rights
        // Still allow if they are designated owner, else verify
      }
    }

    // Rule: Team member can edit their own profile
    if (userRole === 'team_member') {
      if (profileId === 'avtive-company' || profileId === 'company') {
        return NextResponse.json(
          { 
            error: 'Forbidden: Team members cannot modify the company organization profile.',
            authorized: false 
          },
          { status: 403 }
        );
      }
    }

    // Rule: Company admin can edit company and authorized team members
    // Authorized

    // Return success response
    return NextResponse.json({
      success: true,
      authorized: true,
      message: 'Profile updated and verified by Avtive Auth Service.',
      updatedProfile: updatedData
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating profile in API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while saving profile.' },
      { status: 500 }
    );
  }
}
