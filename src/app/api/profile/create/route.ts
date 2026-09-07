import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProfileByUserId, createProfileForUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to create a profile.' },
        { status: 401 }
      );
    }

    // Guardrail: Ensure user does not already have a profile
    const existing = await getProfileByUserId(session.id);
    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: 'Profile already exists for this account.',
          profile: existing
        },
        { status: 200 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const newProfile = await createProfileForUser(session.id, {
      name: body.name || session.name,
      email: session.email,
      designation: body.designation,
      company: body.company,
      location: body.location,
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      shortBio: body.shortBio,
      fullBio: body.fullBio,
      theme: body.theme || 'elegant'
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Profile created successfully.',
        profile: newProfile
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Profile API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating profile.' },
      { status: 500 }
    );
  }
}
