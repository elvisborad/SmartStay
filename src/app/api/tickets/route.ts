import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const roomNumber = searchParams.get('roomNumber');
    const status = searchParams.get('status');
    const guestSessionId = searchParams.get('guestSessionId');

    const where: any = {};
    if (department && department !== 'ALL') {
      where.department = department;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (guestSessionId) {
      where.guestSessionId = guestSessionId;
    } else if (roomNumber) {
      const activeSession = await db.guestSession.findFirst({
        where: { roomNumber, active: true },
        orderBy: { createdAt: 'desc' },
      });

      if (activeSession) {
        where.guestSessionId = activeSession.id;
      } else {
        where.guestSessionId = 'no_active_session';
      }
    }

    const tickets = await db.ticket.findMany({
      where,
      include: {
        assignedStaff: true,
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, department, category, priority, roomNumber, guestName, guestSessionId } = body;

    if (!title || !department || !roomNumber || !guestName) {
      return NextResponse.json({ error: 'Missing required fields (title, department, roomNumber, guestName).' }, { status: 400 });
    }

    const count = await db.ticket.count();
    const ticketNumber = `TSK-${1000 + count + 1}`;

    const newTicket = await db.ticket.create({
      data: {
        ticketNumber,
        title,
        description: description || title,
        department: department || 'HOUSEKEEPING',
        category: category || 'General',
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        slaMinutes: priority === 'URGENT' ? 10 : priority === 'HIGH' ? 20 : 30,
        roomNumber,
        guestName,
        guestSessionId: guestSessionId || null,
        logs: {
          create: [
            {
              action: 'CREATED',
              notes: `Ticket created for Room ${roomNumber}`,
              performedBy: guestName,
            },
          ],
        },
      },
      include: {
        assignedStaff: true,
        logs: true,
      },
    });

    return NextResponse.json({ success: true, ticket: newTicket }, { status: 201 });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
