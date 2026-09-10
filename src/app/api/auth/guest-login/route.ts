import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { roomNumber, pin } = await request.json();

    if (!roomNumber) {
      return NextResponse.json({ error: 'Room number is required.' }, { status: 400 });
    }

    const cleanRoom = String(roomNumber).trim();
    const cleanPin = pin ? String(pin).trim() : '';

    // 1. Try to find active session matching roomNumber and pin
    let session = cleanPin
      ? await db.guestSession.findFirst({
          where: {
            roomNumber: cleanRoom,
            pin: cleanPin,
            active: true,
          },
        })
      : null;

    // 2. Fallback: Find current active session for this room
    if (!session) {
      session = await db.guestSession.findFirst({
        where: {
          roomNumber: cleanRoom,
          active: true,
        },
      });
    }

    if (!session) {
      // Check if there was an inactive (checked-out) session for this room
      const inactiveSession = await db.guestSession.findFirst({
        where: {
          roomNumber: cleanRoom,
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
