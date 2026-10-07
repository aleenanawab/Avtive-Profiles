import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { 
  getCompanyById, 
  getCompanyBySlug, 
  getCompanyMembers, 
  getCompanyMemberByUser, 
  addCompanyMember 
} from '@/lib/db';
import { ensureSupabaseAssetUrl } from '@/lib/supabase';
import { AddCompanyMemberInput } from '@/types/company';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/company/[id]/members
 * List company members (members only)
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Session required.' }, { status: 401 });
    }

    const { id: identifier } = await params;
    const company = (await getCompanyById(identifier)) || (await getCompanyBySlug(identifier));
    if (!company) {
      return NextResponse.json({ error: 'Company not found.' }, { status: 404 });
    }

    // Verify caller is a member of this company
    const callerMember = await getCompanyMemberByUser(company.id, session.id);
    if (!callerMember) {
      return NextResponse.json(
        { error: 'Forbidden: You must be a member of this company to view member list.' },
        { status: 403 }
      );
    }

    const members = await getCompanyMembers(company.id, false);

    // Sanitize member list to prevent exposing hashed tokens
    const sanitized = members.map((m) => ({
      id: m.id,
      companyId: m.companyId,
      userId: m.userId,
      email: m.email,
      name: m.name,
      title: m.title,
      department: m.department,
      bio: m.bio,
      avatarUrl: m.avatarUrl,
      role: m.role,
      status: m.status,
      inviteExpiresAt: m.inviteExpiresAt,
      invitedByUserId: m.invitedByUserId,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));

    return NextResponse.json({
      success: true,
      members: sanitized
    });
  } catch (error: any) {
    console.error('Error in GET /api/company/[id]/members:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while listing members.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company/[id]/members
 * Add / invite team member by email (OWNER or ADMIN only)
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Session required.' }, { status: 401 });
    }

    const { id: identifier } = await params;
    const company = (await getCompanyById(identifier)) || (await getCompanyBySlug(identifier));
    if (!company) {
      return NextResponse.json({ error: 'Company not found.' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';

    if (!email) {
      return NextResponse.json({ error: 'Validation error: Email is required.' }, { status: 400 });
    }

    const input: AddCompanyMemberInput = {
      email,
      name: typeof body.name === 'string' ? body.name.trim() : email.split('@')[0],
      title: typeof body.title === 'string' ? body.title.trim() : 'Team Member',
      department: typeof body.department === 'string' ? body.department.trim() : 'General',
      bio: typeof body.bio === 'string' ? body.bio.trim() : '',
      role: body.role || 'MEMBER'
    };

    if (body.avatarUrl) {
      input.avatarUrl = await ensureSupabaseAssetUrl(body.avatarUrl, 'avatars');
    }

    const result = await addCompanyMember(company.id, input, session.id);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to add member.' },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Member invitation created successfully.',
        member: result.member,
        inviteLink: result.inviteLink,
        rawToken: result.rawToken
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/company/[id]/members:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while adding company member.' },
      { status: 500 }
    );
  }
}
