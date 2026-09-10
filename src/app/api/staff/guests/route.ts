import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const guests = await db.guestSession.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, guests });
  } catch (error: any) {
    console.error('Error fetching guest sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestName, roomNumber, pin, checkOutDate } = body;

    if (!guestName || !roomNumber) {
      return NextResponse.json(
        { error: 'Guest name and room number are required.' },
        { status: 400 }
      );
    }

    const cleanRoom = String(roomNumber).trim();
    const cleanPin = pin ? String(pin).trim() : '1234';

    // Remove any existing sessions in this room prior to new check-in
    const existingSessions = await db.guestSession.findMany({
      where: { roomNumber: cleanRoom },
    });

    for (const oldSess of existingSessions) {
      await db.ticket.updateMany({
        where: { guestSessionId: oldSess.id },
        data: { guestSessionId: null },
      });
      await db.order.updateMany({
        where: { guestSessionId: oldSess.id },
        data: { guestSessionId: null },
      });
      await db.guestSession.delete({
        where: { id: oldSess.id },
      });
    }

    // Default checkout date 3 days from now if not specified
    const checkout = checkOutDate ? new Date(checkOutDate) : new Date(Date.now() + 86400000 * 3);

    const newGuest = await db.guestSession.create({
      data: {
        guestName: String(guestName).trim(),
        roomNumber: cleanRoom,
        pin: cleanPin,
        checkOutDate: checkout,
        active: true,
      },
    });

    return NextResponse.json({ success: true, guest: newGuest });
  } catch (error: any) {
    console.error('Error creating guest session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Guest session ID is required.' }, { status: 400 });
    }

    // Unlink tickets & orders before permanently deleting guest session
    await db.ticket.updateMany({
      where: { guestSessionId: id },
      data: { guestSessionId: null },
    });

    await db.order.updateMany({
      where: { guestSessionId: id },
      data: { guestSessionId: null },
    });

    await db.guestSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Guest session deleted successfully.' });
  } catch (error: any) {
    console.error('Error removing guest session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
