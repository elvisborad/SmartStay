import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { roomNumber, pin } = await request.json();

    if (!roomNumber || !pin) {
      return NextResponse.json({ error: 'Room number and PIN are required.' }, { status: 400 });
    }

    const session = await db.guestSession.findFirst({
      where: {
        roomNumber: String(roomNumber).trim(),
        pin: String(pin).trim(),
        active: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid room number or PIN. Try Room 201 with PIN 2010, or Room 301 with PIN 3010.' },
        { status: 401 }
      );
    }

    const hotel = await db.hotel.findFirst();

    return NextResponse.json({
      success: true,
      session,
      hotel,
    });
  } catch (error: any) {
    console.error('Guest login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
