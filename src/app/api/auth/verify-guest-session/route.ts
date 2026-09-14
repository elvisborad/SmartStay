import { NextResponse } from 'next/server';
import { db, ensureDbInitialized } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { sessionId, roomNumber } = body;

    if (!sessionId && !roomNumber) {
      return NextResponse.json({ active: false, error: 'Session ID or Room Number required' }, { status: 400 });
    }

    let session = sessionId
      ? await db.guestSession.findUnique({
          where: { id: sessionId },
        })
      : null;

    if (!session && roomNumber) {
      session = await db.guestSession.findFirst({
        where: { roomNumber: String(roomNumber).trim(), active: true },
      });
    }

    if (session) {
      if (!session.active) {
        return NextResponse.json({ active: false, reason: 'explicit_checkout' });
      }
      return NextResponse.json({ active: true, session });
    }

    if (roomNumber) {
      const inactiveSession = await db.guestSession.findFirst({
        where: { roomNumber: String(roomNumber).trim(), active: false },
      });
      if (inactiveSession) {
        return NextResponse.json({ active: false, reason: 'explicit_checkout' });
      }
    }

    return NextResponse.json({ active: true, session: { id: sessionId, roomNumber } });
  } catch (error: any) {
    console.error('Session verification error:', error);
    return NextResponse.json({ active: true, error: 'Internal server error' }, { status: 200 });
  }
}

