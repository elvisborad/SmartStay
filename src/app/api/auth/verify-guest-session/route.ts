import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ active: false, error: 'Session ID required' }, { status: 400 });
    }

    const session = await db.guestSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.active) {
      return NextResponse.json({ active: false, reason: 'Guest session checked out' });
    }

    return NextResponse.json({ active: true, session });
  } catch (error: any) {
    console.error('Session verification error:', error);
    return NextResponse.json({ active: false, error: 'Internal server error' }, { status: 500 });
  }
}
