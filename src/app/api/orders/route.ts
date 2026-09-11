import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomNumber = searchParams.get('roomNumber');
    const guestSessionId = searchParams.get('guestSessionId');

    let where: any = {};
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

    const orders = await db.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomNumber, guestName, guestSessionId, items } = body;

    if (!roomNumber || !guestName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing roomNumber, guestName, or order items.' }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItemsData = [];
    const itemDescriptions: string[] = [];

    for (const item of items) {
      const dbItem = await db.serviceItem.findUnique({
        where: { id: item.serviceItemId },
      });
      if (dbItem) {
        const itemTotal = dbItem.price * item.quantity;
        totalAmount += itemTotal;
        orderItemsData.push({
          serviceItemId: dbItem.id,
          itemName: dbItem.name,
          quantity: item.quantity,
          price: dbItem.price,
        });
        itemDescriptions.push(`${item.quantity}x ${dbItem.name}`);
      }
    }

    const orderCount = await db.order.count();
    const orderNumber = `ORD-${2000 + orderCount + 1}`;

    const newOrder = await db.order.create({
      data: {
        orderNumber,
        roomNumber,
        guestName,
        totalAmount,
        guestSessionId: guestSessionId || null,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    const ticketCount = await db.ticket.count();
    const ticketNumber = `TSK-${1000 + ticketCount + 1}`;

    await db.ticket.create({
      data: {
        ticketNumber,
        title: `Room Service Order ${orderNumber}`,
        description: `Items: ${itemDescriptions.join(', ')}. Total: ₹${totalAmount.toFixed(2)}`,
        department: 'KITCHEN',
        category: 'In-Room Dining',
        priority: 'HIGH',
        status: 'PENDING',
        slaMinutes: 30,
        roomNumber,
        guestName,
        guestSessionId: guestSessionId || null,
        logs: {
          create: [
            {
              action: 'CREATED',
              notes: `Order ${orderNumber} placed via Guest Portal (₹${totalAmount.toFixed(2)})`,
              performedBy: guestName,
            },
          ],
        },
      },
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create room service order' }, { status: 500 });
  }
}
