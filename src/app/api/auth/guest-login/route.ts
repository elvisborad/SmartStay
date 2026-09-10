import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { roomNumber, pin } = await request.json();

    if (!roomNumber || !pin) {
      return NextResponse.json({ error: 'Room number and PIN are required.' }, { status: 400 });
    }

    const cleanRoom = String(roomNumber).trim();
    const cleanPin = String(pin).trim();

    // First check for active guest session
    const session = await db.guestSession.findFirst({
      where: {
        roomNumber: cleanRoom,
        pin: cleanPin,
        active: true,
      },
    });

    if (!session) {
      // Check if there was an inactive (checked-out) session for this room/PIN
      const inactiveSession = await db.guestSession.findFirst({
        where: {
          roomNumber: cleanRoom,
          pin: cleanPin,
          active: false,
        },
      });

      if (inactiveSession) {
        return NextResponse.json(
          { error: 'Access Denied: This guest session has been checked out by hotel staff. Please contact Front Desk for new room access.' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid room number or PIN. Please check credentials or contact Front Desk.' },
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
