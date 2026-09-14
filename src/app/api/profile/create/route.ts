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

    const body = await request.json().catch(() => ({}));
    const profileName = (body.profileName || body.designation || 'Professional Profile').trim();
    const name = (body.name || session.name || 'Professional').trim();

    const newProfile = await createProfileForUser(session.id, {
      name,
      type: body.type || 'owner',
      profileName,
      profession: body.profession?.trim() || body.designation?.trim() || 'Professional',
      email: session.email,
      designation: body.designation?.trim() || body.profession?.trim() || 'Professional',
      company: body.company?.trim() || 'Avtive',
      location: body.location?.trim() || 'Global',
      avatar: body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      coverImage: body.coverImage,
      phone: body.phone?.trim() || '',
      whatsapp: body.whatsapp?.trim() || body.phone?.trim() || '',
      shortBio: body.shortBio?.trim() || 'Welcome to my digital profile on Avtive.',
      fullBio: body.fullBio?.trim() || 'Connect with me directly via phone, WhatsApp, or email.',
      theme: body.theme || 'editorial',
      skills: body.skills || [],
      experiences: body.experiences || [],
      projects: body.projects || [],
      services: body.services || [],
      certifications: body.certifications || [],
      socials: body.socials || [],
      sharingSettings: body.sharingSettings,
      sectionOrder: body.sectionOrder
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
