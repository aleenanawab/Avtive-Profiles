import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProfileByUserId, getProfilesByUserId } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null, profile: null, profiles: [] });
    }

    const [profile, profiles] = await Promise.all([
      getProfileByUserId(session.id),
      getProfilesByUserId(session.id)
    ]);

    return NextResponse.json({
      user: session,
      profile: profile || null,
      profiles
    });

  } catch (error) {
    console.error('Auth Me API Error:', error);
    return NextResponse.json(
      { user: null, profile: null },
      { status: 200 }
    );
  }
}
