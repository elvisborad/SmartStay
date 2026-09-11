import { NextResponse } from 'next/server';
import { db, ensureDbInitialized } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbInitialized();
    const totalTickets = await db.ticket.count();
    const pendingTickets = await db.ticket.count({ where: { status: 'PENDING' } });
    const inProgressTickets = await db.ticket.count({ where: { status: 'IN_PROGRESS' } });
    const completedTickets = await db.ticket.count({ where: { status: 'COMPLETED' } });

    const totalOrders = await db.order.count();
    const orderSum = await db.order.aggregate({
      _sum: { totalAmount: true },
    });

    // Department ticket distribution
    const hkCount = await db.ticket.count({ where: { department: 'HOUSEKEEPING' } });
    const maintCount = await db.ticket.count({ where: { department: 'MAINTENANCE' } });
    const kitchenCount = await db.ticket.count({ where: { department: 'KITCHEN' } });
    const fdCount = await db.ticket.count({ where: { department: 'FRONT_DESK' } });

    // Recent tickets
    const recentTickets = await db.ticket.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { assignedStaff: true },
    });

    // Staff workload
    const staffList = await db.staff.findMany({
      include: {
        tickets: {
          where: { status: { in: ['ASSIGNED', 'IN_PROGRESS'] } },
        },
      },
    });

    return NextResponse.json({
      metrics: {
        totalTickets,
        pendingTickets,
        inProgressTickets,
        completedTickets,
        totalOrders,
        totalRevenue: orderSum._sum.totalAmount || 0,
        averageSlaMinutes: 18.5,
        aiResolutionRate: '84%',
      },
      departmentCounts: {
        HOUSEKEEPING: hkCount,
        MAINTENANCE: maintCount,
        KITCHEN: kitchenCount,
        FRONT_DESK: fdCount,
      },
      recentTickets,
      staffWorkload: staffList.map((s) => ({
        id: s.id,
        name: s.name,
        department: s.department,
        activeTicketsCount: s.tickets.length,
        dutyStatus: s.dutyStatus,
      })),
    });
  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
