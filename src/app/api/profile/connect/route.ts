import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createConnection, checkIsConnected, getUserConnections } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce authentication on the server
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { 
          error: 'Unauthorized: Please sign in to connect with other profiles.',
          authenticated: false 
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const targetProfileId = body.targetProfileId || body.profileId;
    const note = body.note || (body.contactInfo ? `Exchanged contact: ${body.contactInfo.name || ''} - ${body.contactInfo.email || ''}` : undefined);

    if (!targetProfileId) {
      return NextResponse.json(
        { error: 'targetProfileId or profileId is required.' },
        { status: 400 }
      );
    }

    // 2. Perform connection
    const result = await createConnection({
      fromUserId: session.id,
      fromUserName: session.name,
      fromUserEmail: session.email,
      toProfileId: targetProfileId,
      note
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to establish connection.' },
        { status: result.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        connected: true,
        message: 'Connection established successfully.',
        connection: result.connection
      },
      { status: result.status }
    );
  } catch (error) {
    console.error('Connection API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while connecting.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ connected: false, authenticated: false }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      // Return all connections for the caller
      const connections = await getUserConnections(session.id);
      return NextResponse.json({ connections }, { status: 200 });
    }

    const isConnected = await checkIsConnected(session.id, profileId);
    return NextResponse.json({ connected: isConnected, authenticated: true }, { status: 200 });
  } catch (error) {
    console.error('Connection GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve connection status.' }, { status: 500 });
  }
}
